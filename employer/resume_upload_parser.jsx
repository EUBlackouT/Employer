import React, { useState, useRef } from 'react';
import { 
  Card, Button, Form, Alert, ProgressBar, 
  Spinner, Badge, Modal, ListGroup
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, faFile, faFilePdf, 
  faFileWord, faFileAlt, faCheck,
  faExclamationTriangle, faTrash, faEye
} from '@fortawesome/free-solid-svg-icons';

// Import resume parser service
import ResumeParserService from '../services/ResumeParserService';

// Import translation function
import { useTranslation } from 'react-i18next';

/**
 * Resume Upload and Parsing Component
 * Allows applicants to upload their resume for automatic profile creation
 */
const ResumeUploadParser = ({ userId, onResumeProcessed }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  
  // State variables
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [existingResumeUrl, setExistingResumeUrl] = useState(null);
  
  // Check for existing resume on component mount
  React.useEffect(() => {
    if (userId) {
      checkExistingResume();
    }
  }, [userId]);
  
  /**
   * Check if user has an existing resume
   */
  const checkExistingResume = async () => {
    try {
      const resumeUrl = await ResumeParserService.getResumeFileUrl(userId);
      if (resumeUrl) {
        setExistingResumeUrl(resumeUrl);
      }
    } catch (error) {
      console.error('Error checking existing resume:', error);
      // Don't show error to user, just assume no resume exists
    }
  };
  
  /**
   * Handle file selection
   */
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      // Validate file
      if (!ResumeParserService.isValidResumeFile(file)) {
        setError(t('invalidResumeFile'));
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };
  
  /**
   * Trigger file input click
   */
  const handleSelectFileClick = () => {
    fileInputRef.current.click();
  };
  
  /**
   * Get file icon based on file type
   */
  const getFileIcon = (file) => {
    if (!file) return faFile;
    
    switch (file.type) {
      case 'application/pdf':
        return faFilePdf;
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return faFileWord;
      default:
        return faFileAlt;
    }
  };
  
  /**
   * Upload and parse resume
   */
  const handleUploadAndParse = async () => {
    if (!selectedFile) {
      setError(t('pleaseSelectFile'));
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setUploadProgress(10);
      
      // Parse resume
      const parsedResume = await ResumeParserService.parseResume(selectedFile);
      setUploadProgress(50);
      
      // Map to profile format
      const profileData = ResumeParserService.mapResumeDataToProfile(parsedResume);
      setParsedData(profileData);
      setUploadProgress(70);
      
      // Save resume file
      await ResumeParserService.saveResumeFile(userId, selectedFile);
      setUploadProgress(90);
      
      // Update existing resume URL
      await checkExistingResume();
      setUploadProgress(100);
      
      setLoading(false);
      setSuccess(t('resumeProcessedSuccessfully'));
      
      // Show preview modal
      setShowPreviewModal(true);
      
    } catch (error) {
      console.error('Error processing resume:', error);
      setError(t('errorProcessingResume'));
      setLoading(false);
      setUploadProgress(0);
    }
  };
  
  /**
   * Apply parsed data to profile
   */
  const handleApplyData = () => {
    setShowPreviewModal(false);
    
    // Notify parent component
    if (onResumeProcessed && parsedData) {
      onResumeProcessed(parsedData);
    }
  };
  
  /**
   * Delete existing resume
   */
  const handleDeleteResume = async () => {
    try {
      setLoading(true);
      
      // Call API to delete resume
      await ResumeParserService.deleteResume(userId);
      
      setExistingResumeUrl(null);
      setSelectedFile(null);
      setSuccess(t('resumeDeletedSuccessfully'));
      setLoading(false);
    } catch (error) {
      console.error('Error deleting resume:', error);
      setError(t('errorDeletingResume'));
      setLoading(false);
    }
  };
  
  /**
   * View existing resume
   */
  const handleViewResume = () => {
    if (existingResumeUrl) {
      window.open(existingResumeUrl, '_blank');
    }
  };
  
  /**
   * Render preview modal
   */
  const renderPreviewModal = () => {
    if (!parsedData) return null;
    
    return (
      <Modal 
        show={showPreviewModal} 
        onHide={() => setShowPreviewModal(false)}
        size="lg"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('extractedInformation')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            {t('resumeParsingNotPerfect')}
          </Alert>
          
          <h5 className="mt-4">{t('basicInformation')}</h5>
          <ListGroup className="mb-4">
            <ListGroup.Item>
              <strong>{t('name')}:</strong> {parsedData.basicProfile.firstName} {parsedData.basicProfile.lastName}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>{t('email')}:</strong> {parsedData.basicProfile.email || t('notFound')}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>{t('phone')}:</strong> {parsedData.basicProfile.phone || t('notFound')}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>{t('location')}:</strong> {parsedData.basicProfile.location || t('notFound')}
            </ListGroup.Item>
            {parsedData.basicProfile.headline && (
              <ListGroup.Item>
                <strong>{t('headline')}:</strong> {parsedData.basicProfile.headline}
              </ListGroup.Item>
            )}
            {parsedData.basicProfile.summary && (
              <ListGroup.Item>
                <strong>{t('summary')}:</strong> {parsedData.basicProfile.summary}
              </ListGroup.Item>
            )}
          </ListGroup>
          
          <h5>{t('workExperience')}</h5>
          {parsedData.workExperience.length === 0 ? (
            <Alert variant="warning">{t('noWorkExperienceFound')}</Alert>
          ) : (
            <ListGroup className="mb-4">
              {parsedData.workExperience.map((job, index) => (
                <ListGroup.Item key={index}>
                  <div className="d-flex justify-content-between">
                    <strong>{job.title}</strong>
                    <span className="text-muted">
                      {job.startDate} - {job.isCurrent ? t('present') : job.endDate}
                    </span>
                  </div>
                  <div>{job.company}</div>
                  {job.location && <div className="text-muted">{job.location}</div>}
                  {job.description && <div className="mt-2 small">{job.description}</div>}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
          
          <h5>{t('education')}</h5>
          {parsedData.education.length === 0 ? (
            <Alert variant="warning">{t('noEducationFound')}</Alert>
          ) : (
            <ListGroup className="mb-4">
              {parsedData.education.map((edu, index) => (
                <ListGroup.Item key={index}>
                  <div className="d-flex justify-content-between">
                    <strong>{edu.institution}</strong>
                    <span className="text-muted">
                      {edu.startDate} - {edu.isCurrent ? t('present') : edu.endDate}
                    </span>
                  </div>
                  {edu.degree && <div>{edu.degree}</div>}
                  {edu.fieldOfStudy && <div>{edu.fieldOfStudy}</div>}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
          
          <h5>{t('skills')}</h5>
          {parsedData.skills.length === 0 ? (
            <Alert variant="warning">{t('noSkillsFound')}</Alert>
          ) : (
            <div className="d-flex flex-wrap mb-4">
              {parsedData.skills.map((skill, index) => (
                <Badge 
                  bg="light" 
                  text="dark" 
                  className="me-2 mb-2 p-2" 
                  key={index}
                >
                  {skill.name}
                </Badge>
              ))}
            </div>
          )}
          
          <h5>{t('certifications')}</h5>
          {parsedData.certifications.length === 0 ? (
            <Alert variant="warning">{t('noCertificationsFound')}</Alert>
          ) : (
            <ListGroup className="mb-4">
              {parsedData.certifications.map((cert, index) => (
                <ListGroup.Item key={index}>
                  <strong>{cert.name}</strong>
                  {cert.issuingOrganization && <div>{cert.issuingOrganization}</div>}
                  {cert.issueDate && (
                    <div className="text-muted">
                      {cert.issueDate}
                      {cert.expirationDate && ` - ${cert.expirationDate}`}
                    </div>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
            {t('cancel')}
          </Button>
          <Button variant="primary" onClick={handleApplyData}>
            <FontAwesomeIcon icon={faCheck} className="me-2" />
            {t('useThisInformation')}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };
  
  return (
    <Card className="resume-upload-parser">
      <Card.Header>
        <h5 className="mb-0">
          <FontAwesomeIcon icon={faUpload} className="me-2" />
          {t('uploadResume')}
        </h5>
      </Card.Header>
      <Card.Body>
        {/* Success/error messages */}
        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
            {success}
          </Alert>
        )}
        
        {/* Existing resume */}
        {existingResumeUrl && (
          <Alert variant="info" className="d-flex justify-content-between align-items-center">
            <div>
              <FontAwesomeIcon icon={faFilePdf} className="me-2" />
              {t('youHaveUploadedResume')}
            </div>
            <div>
              <Button 
                variant="outline-primary" 
                size="sm" 
                className="me-2"
                onClick={handleViewResume}
              >
                <FontAwesomeIcon icon={faEye} className="me-1" />
                {t('view')}
              </Button>
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={handleDeleteResume}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faTrash} className="me-1" />
                {t('delete')}
              </Button>
            </div>
          </Alert>
        )}
        
        <p className="text-muted">
          {t('uploadResumeDescription')}
        </p>
        
        {/* File input (hidden) */}
        <Form.Control
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt,.rtf"
          className="d-none"
        />
        
        {/* File selection area */}
        <div 
          className="resume-drop-area p-4 text-center border rounded mb-3"
          onClick={handleSelectFileClick}
        >
          {selectedFile ? (
            <div className="selected-file">
              <FontAwesomeIcon 
                icon={getFileIcon(selectedFile)} 
                className="display-4 mb-3 text-primary" 
              />
              <p className="mb-1">{selectedFile.name}</p>
              <p className="text-muted small">
                {(selectedFile.size / 1024).toFixed(1)} KB | 
                {ResumeParserService.getFileTypeDescription(selectedFile.type)}
              </p>
            </div>
          ) : (
            <div className="no-file-selected">
              <FontAwesomeIcon 
                icon={faUpload} 
                className="display-4 mb-3 text-muted" 
              />
              <p className="mb-1">{t('dragOrClickToSelectFile')}</p>
              <p className="text-muted small">{t('supportedFormats')}: PDF, DOC, DOCX, TXT, RTF</p>
            </div>
          )}
        </div>
        
        {/* Upload progress */}
        {loading && uploadProgress > 0 && (
          <ProgressBar 
            animated 
            now={uploadProgress} 
            className="mb-3" 
          />
        )}
        
        {/* Action buttons */}
        <div className="d-flex justify-content-end">
          <Button 
            variant="primary" 
            onClick={handleUploadAndParse}
            disabled={!selectedFile || loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {t('processing')}
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faUpload} className="me-2" />
                {t('uploadAndParse')}
              </>
            )}
          </Button>
        </div>
        
        {/* Preview modal */}
        {renderPreviewModal()}
      </Card.Body>
    </Card>
  );
};

export default ResumeUploadParser;
