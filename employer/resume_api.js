// Backend API for Resume Parsing
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const textract = require('textract');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

// Set up router
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = path.join(__dirname, '../uploads/resumes', req.params.userId || 'temp');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    // Use timestamp to ensure unique filenames
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `resume_${timestamp}${ext}`);
  }
});

// File filter for resume uploads
const fileFilter = (req, file, cb) => {
  // Accept only specific file types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, and RTF files are allowed.'), false);
  }
};

// Configure upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * Parse resume text to extract structured information
 * @param {string} text - Resume text content
 * @returns {Object} - Structured resume data
 */
const parseResumeText = (text) => {
  // Initialize result object
  const result = {
    name: {},
    email: '',
    phone: '',
    headline: '',
    summary: '',
    location: '',
    website: '',
    workExperience: [],
    education: [],
    skills: [],
    certifications: []
  };
  
  // Extract email
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emails = text.match(emailRegex);
  if (emails && emails.length > 0) {
    result.email = emails[0];
  }
  
  // Extract phone number
  const phoneRegex = /\b(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g;
  const phones = text.match(phoneRegex);
  if (phones && phones.length > 0) {
    result.phone = phones[0];
  }
  
  // Extract website
  const websiteRegex = /\b(https?:\/\/)?([a-zA-Z0-9][-a-zA-Z0-9]*\.)+[a-zA-Z]{2,}(\/[-a-zA-Z0-9%_.~#?&=]*)*\b/g;
  const websites = text.match(websiteRegex);
  if (websites && websites.length > 0) {
    // Filter out email addresses
    const filteredWebsites = websites.filter(site => !site.includes('@'));
    if (filteredWebsites.length > 0) {
      result.website = filteredWebsites[0];
    }
  }
  
  // Extract name (simple approach - first line or first capitalized words)
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  if (lines.length > 0) {
    const nameLine = lines[0].trim();
    const nameWords = nameLine.split(' ');
    
    if (nameWords.length >= 2) {
      result.name.first = nameWords[0];
      result.name.last = nameWords[nameWords.length - 1];
    }
  }
  
  // Extract skills
  const skillKeywords = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Swift',
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask',
    'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Oracle', 'Firebase',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
    'HTML', 'CSS', 'SASS', 'LESS', 'Bootstrap', 'Tailwind',
    'Git', 'GitHub', 'GitLab', 'Bitbucket', 'CI/CD',
    'Agile', 'Scrum', 'Kanban', 'Jira', 'Confluence',
    'Project Management', 'Team Leadership', 'Communication',
    'Data Analysis', 'Machine Learning', 'AI', 'Deep Learning',
    'UI/UX', 'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator',
    'Microsoft Office', 'Excel', 'PowerPoint', 'Word',
    'Marketing', 'SEO', 'SEM', 'Content Writing', 'Copywriting',
    'Sales', 'Customer Service', 'CRM', 'Salesforce', 'HubSpot',
    'Accounting', 'Finance', 'Budgeting', 'Financial Analysis',
    'HR', 'Recruiting', 'Talent Acquisition', 'Employee Relations'
  ];
  
  const tokens = tokenizer.tokenize(text);
  const foundSkills = new Set();
  
  // Look for exact matches
  skillKeywords.forEach(skill => {
    if (text.includes(skill)) {
      foundSkills.add(skill);
    }
  });
  
  // Convert to array of objects
  result.skills = Array.from(foundSkills).map(skill => ({
    name: skill,
    proficiency: 'Intermediate'
  }));
  
  // Extract work experience (simple approach - look for sections)
  const experienceHeaders = [
    'EXPERIENCE', 'WORK EXPERIENCE', 'EMPLOYMENT HISTORY', 'PROFESSIONAL EXPERIENCE',
    'WORK HISTORY', 'CAREER HISTORY', 'PROFESSIONAL BACKGROUND'
  ];
  
  const educationHeaders = [
    'EDUCATION', 'ACADEMIC BACKGROUND', 'EDUCATIONAL BACKGROUND', 'ACADEMIC HISTORY',
    'QUALIFICATIONS', 'ACADEMIC QUALIFICATIONS', 'EDUCATIONAL QUALIFICATIONS'
  ];
  
  // Simple section extraction (very basic approach)
  let currentSection = '';
  let sectionContent = '';
  
  lines.forEach(line => {
    const upperLine = line.toUpperCase().trim();
    
    // Check if line is a section header
    if (experienceHeaders.includes(upperLine)) {
      currentSection = 'experience';
      sectionContent = '';
    } else if (educationHeaders.includes(upperLine)) {
      // Process previous section
      if (currentSection === 'experience' && sectionContent) {
        // Very simple parsing - just add as one entry
        result.workExperience.push({
          company: 'Extracted from resume',
          title: 'Position extracted from resume',
          description: sectionContent.trim(),
          startDate: '',
          endDate: '',
          isCurrent: false
        });
      }
      
      currentSection = 'education';
      sectionContent = '';
    } else if (upperLine.includes('SKILLS') || upperLine === 'SKILLS') {
      // Process previous section
      if (currentSection === 'experience' && sectionContent) {
        result.workExperience.push({
          company: 'Extracted from resume',
          title: 'Position extracted from resume',
          description: sectionContent.trim(),
          startDate: '',
          endDate: '',
          isCurrent: false
        });
      } else if (currentSection === 'education' && sectionContent) {
        result.education.push({
          institution: 'Extracted from resume',
          degree: 'Degree extracted from resume',
          fieldOfStudy: '',
          description: sectionContent.trim(),
          startDate: '',
          endDate: '',
          isCurrent: false
        });
      }
      
      currentSection = 'skills';
      sectionContent = '';
    } else {
      // Add line to current section
      sectionContent += line + '\n';
    }
  });
  
  // Process final section
  if (currentSection === 'experience' && sectionContent) {
    result.workExperience.push({
      company: 'Extracted from resume',
      title: 'Position extracted from resume',
      description: sectionContent.trim(),
      startDate: '',
      endDate: '',
      isCurrent: false
    });
  } else if (currentSection === 'education' && sectionContent) {
    result.education.push({
      institution: 'Extracted from resume',
      degree: 'Degree extracted from resume',
      fieldOfStudy: '',
      description: sectionContent.trim(),
      startDate: '',
      endDate: '',
      isCurrent: false
    });
  }
  
  // Extract summary (first few paragraphs, if not already captured as name)
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
  if (paragraphs.length > 1) {
    // Skip the first paragraph (likely name/contact)
    result.summary = paragraphs[1].trim();
  }
  
  return result;
};

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
};

/**
 * Extract text from DOCX file
 * @param {string} filePath - Path to DOCX file
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromDOCX = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw error;
  }
};

/**
 * Extract text from other file types (DOC, TXT, RTF)
 * @param {string} filePath - Path to file
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromOther = (filePath) => {
  return new Promise((resolve, reject) => {
    textract.fromFileWithPath(filePath, (error, text) => {
      if (error) {
        console.error('Error extracting text:', error);
        reject(error);
      } else {
        resolve(text);
      }
    });
  });
};

/**
 * Parse resume file
 * @param {string} filePath - Path to resume file
 * @param {string} mimeType - File MIME type
 * @returns {Promise<Object>} - Parsed resume data
 */
const parseResumeFile = async (filePath, mimeType) => {
  try {
    let text = '';
    
    // Extract text based on file type
    switch (mimeType) {
      case 'application/pdf':
        text = await extractTextFromPDF(filePath);
        break;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        text = await extractTextFromDOCX(filePath);
        break;
      case 'text/plain':
        text = fs.readFileSync(filePath, 'utf8');
        break;
      default:
        text = await extractTextFromOther(filePath);
    }
    
    // Parse text to extract structured information
    const parsedData = parseResumeText(text);
    
    return parsedData;
  } catch (error) {
    console.error('Error parsing resume file:', error);
    throw error;
  }
};

// API Routes

/**
 * Upload and parse resume
 * POST /api/resume/parse
 */
router.post('/parse', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Parse resume file
    const parsedData = await parseResumeFile(req.file.path, req.file.mimetype);
    
    // Return parsed data
    res.json(parsedData);
  } catch (error) {
    console.error('Error parsing resume:', error);
    res.status(500).json({ error: 'Error parsing resume' });
  }
});

/**
 * Upload resume file for a user
 * POST /api/resume/upload/:userId
 */
router.post('/upload/:userId', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    if (!req.params.userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Return file information
    res.json({
      fileUrl: `/api/resume/${req.params.userId}`,
      fileName: req.file.filename,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ error: 'Error uploading resume' });
  }
});

/**
 * Get resume file for a user
 * GET /api/resume/:userId
 */
router.get('/:userId', (req, res) => {
  try {
    if (!req.params.userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const userDir = path.join(__dirname, '../uploads/resumes', req.params.userId);
    
    // Check if directory exists
    if (!fs.existsSync(userDir)) {
      return res.status(404).json({ error: 'No resume found for this user' });
    }
    
    // Get list of files in directory
    const files = fs.readdirSync(userDir);
    
    // Find most recent resume file
    if (files.length === 0) {
      return res.status(404).json({ error: 'No resume found for this user' });
    }
    
    // Sort files by creation time (newest first)
    const sortedFiles = files.map(file => {
      const filePath = path.join(userDir, file);
      const stats = fs.statSync(filePath);
      return { file, stats };
    }).sort((a, b) => b.stats.ctime.getTime() - a.stats.ctime.getTime());
    
    const latestFile = sortedFiles[0].file;
    const filePath = path.join(userDir, latestFile);
    
    // Return file URL
    res.json({
      fileUrl: `/api/resume/download/${req.params.userId}/${latestFile}`,
      fileName: latestFile,
      fileSize: sortedFiles[0].stats.size,
      uploadDate: sortedFiles[0].stats.ctime
    });
  } catch (error) {
    console.error('Error getting resume:', error);
    res.status(500).json({ error: 'Error getting resume' });
  }
});

/**
 * Download resume file
 * GET /api/resume/download/:userId/:fileName
 */
router.get('/download/:userId/:fileName', (req, res) => {
  try {
    if (!req.params.userId || !req.params.fileName) {
      return res.status(400).json({ error: 'User ID and file name are required' });
    }
    
    const filePath = path.join(__dirname, '../uploads/resumes', req.params.userId, req.params.fileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Send file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error downloading resume:', error);
    res.status(500).json({ error: 'Error downloading resume' });
  }
});

/**
 * Delete resume file
 * DELETE /api/resume/:userId
 */
router.delete('/:userId', (req, res) => {
  try {
    if (!req.params.userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const userDir = path.join(__dirname, '../uploads/resumes', req.params.userId);
    
    // Check if directory exists
    if (!fs.existsSync(userDir)) {
      return res.status(404).json({ error: 'No resume found for this user' });
    }
    
    // Delete all files in directory
    const files = fs.readdirSync(userDir);
    files.forEach(file => {
      fs.unlinkSync(path.join(userDir, file));
    });
    
    // Delete directory
    fs.rmdirSync(userDir);
    
    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ error: 'Error deleting resume' });
  }
});

module.exports = router;
