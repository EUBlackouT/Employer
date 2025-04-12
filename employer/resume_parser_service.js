// Resume Parser Service

import axios from 'axios';

/**
 * Service for handling resume parsing and extraction
 */
class ResumeParserService {
  /**
   * Initialize the service with API base URL
   * @param {string} baseUrl - API base URL
   */
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
    this.axios = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Set authentication token for API requests
   * @param {string} token - Authentication token
   */
  setAuthToken(token) {
    if (token) {
      this.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.axios.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Upload resume file for parsing
   * @param {File} file - Resume file (PDF, DOCX, etc.)
   * @returns {Promise<Object>} - Parsed resume data
   */
  async parseResume(file) {
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('resume', file);

      // Set proper headers for multipart form data
      const headers = {
        'Content-Type': 'multipart/form-data'
      };

      // Upload and parse resume
      const response = await this.axios.post('/resume/parse', formData, { headers });
      return response.data;
    } catch (error) {
      console.error('Error parsing resume:', error);
      throw error;
    }
  }

  /**
   * Map parsed resume data to application schema
   * @param {Object} resumeData - Parsed resume data
   * @returns {Object} - Mapped profile data
   */
  mapResumeDataToProfile(resumeData) {
    // Create basic profile from resume data
    const basicProfile = {
      firstName: resumeData.name?.first || '',
      lastName: resumeData.name?.last || '',
      email: resumeData.email || '',
      phone: resumeData.phone || '',
      headline: resumeData.headline || resumeData.title || '',
      summary: resumeData.summary || '',
      location: resumeData.location || '',
      website: resumeData.website || '',
      profilePictureUrl: ''
    };

    // Map work experience
    const workExperience = (resumeData.workExperience || []).map(job => ({
      company: job.company || '',
      title: job.title || '',
      location: job.location || '',
      startDate: this.formatDate(job.startDate),
      endDate: this.formatDate(job.endDate),
      isCurrent: job.isCurrent || false,
      description: job.description || '',
      source: 'resume'
    }));

    // Map education
    const education = (resumeData.education || []).map(edu => ({
      institution: edu.institution || edu.school || '',
      degree: edu.degree || '',
      fieldOfStudy: edu.fieldOfStudy || edu.major || '',
      startDate: this.formatDate(edu.startDate),
      endDate: this.formatDate(edu.endDate),
      isCurrent: edu.isCurrent || false,
      description: edu.description || '',
      source: 'resume'
    }));

    // Map skills
    const skills = (resumeData.skills || []).map(skill => ({
      name: typeof skill === 'string' ? skill : skill.name || '',
      proficiency: skill.proficiency || 'Intermediate',
      source: 'resume'
    }));

    // Map certifications
    const certifications = (resumeData.certifications || []).map(cert => ({
      name: cert.name || '',
      issuingOrganization: cert.issuer || cert.issuingOrganization || '',
      issueDate: this.formatDate(cert.issueDate),
      expirationDate: this.formatDate(cert.expirationDate),
      credentialId: cert.credentialId || '',
      source: 'resume'
    }));

    // Return mapped profile data
    return {
      basicProfile,
      workExperience,
      education,
      skills,
      certifications,
      preferences: {
        jobTypes: [],
        locations: [],
        remoteWork: false,
        salaryExpectation: '',
        availability: '',
        willingToRelocate: false
      },
      source: 'resume',
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Format date from various formats to YYYY-MM
   * @param {string|Object} date - Date in various formats
   * @returns {string} - Formatted date string (YYYY-MM)
   */
  formatDate(date) {
    if (!date) return '';

    try {
      // Handle string dates
      if (typeof date === 'string') {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) return '';
        
        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
      }
      
      // Handle object dates (year, month)
      if (typeof date === 'object') {
        if (date.year) {
          const month = date.month ? String(date.month).padStart(2, '0') : '01';
          return `${date.year}-${month}`;
        }
      }
      
      return '';
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  /**
   * Save resume file to user profile
   * @param {number} userId - User ID
   * @param {File} file - Resume file
   * @returns {Promise<Object>} - Save result
   */
  async saveResumeFile(userId, file) {
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('userId', userId);

      // Set proper headers for multipart form data
      const headers = {
        'Content-Type': 'multipart/form-data'
      };

      // Upload resume file
      const response = await this.axios.post(`/resume/upload/${userId}`, formData, { headers });
      return response.data;
    } catch (error) {
      console.error('Error saving resume file:', error);
      throw error;
    }
  }

  /**
   * Get resume file URL for a user
   * @param {number} userId - User ID
   * @returns {Promise<string>} - Resume file URL
   */
  async getResumeFileUrl(userId) {
    try {
      const response = await this.axios.get(`/resume/${userId}`);
      return response.data.fileUrl;
    } catch (error) {
      console.error('Error getting resume file URL:', error);
      throw error;
    }
  }

  /**
   * Check if file is a valid resume format
   * @param {File} file - File to check
   * @returns {boolean} - Whether file is valid
   */
  isValidResumeFile(file) {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return false;
    }

    // Check file type
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf'
    ];

    return validTypes.includes(file.type);
  }

  /**
   * Get file type description
   * @param {string} mimeType - MIME type
   * @returns {string} - File type description
   */
  getFileTypeDescription(mimeType) {
    const typeMap = {
      'application/pdf': 'PDF',
      'application/msword': 'DOC',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
      'text/plain': 'TXT',
      'application/rtf': 'RTF'
    };

    return typeMap[mimeType] || 'Unknown';
  }
}

export default new ResumeParserService();
