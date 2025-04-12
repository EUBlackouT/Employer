// Profile Import and Synchronization Component

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Button, Alert, 
  ProgressBar, Badge, Spinner, Form, Modal
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLinkedin, faLinkedinIn, 
  faGoogle, faFacebook 
} from '@fortawesome/free-brands-svg-icons';
import { 
  faSync, faCheck, faTimes, faInfoCircle,
  faUser, faBriefcase, faGraduationCap, 
  faCertificate, faTools
} from '@fortawesome/free-solid-svg-icons';

// Import LinkedIn API integration functions
import { 
  getLinkedInAuthUrl, 
  handleLinkedInCallback,
  synchronizeLinkedInData,
  isTokenValid
} from '../services/linkedin_api_integration';

// Import API service for backend communication
import { 
  getLinkedInStatus, 
  disconnectLinkedIn,
  syncLinkedInData,
  saveProfileData
} from '../services/api';

// Import translation function
import { useTranslation } from 'react-i18next';

/**
 * LinkedIn Profile Import Component
 * Handles the LinkedIn authentication, data import, and synchronization
 */
const LinkedInProfileImport = ({ userId, onProfileImported }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State variables
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [linkedInStatus, setLinkedInStatus] = useState({
    connected: false,
    lastSyncDate: null,
    expiresAt: null,
    profileUrl: null
  });
  const [importOptions, setImportOptions] = useState({
    basicProfile: true,
    workExperience: true,
    education: true,
    skills: true,
    certifications: true
  });
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [importedData, setImportedData] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  
  // Fetch LinkedIn connection status on component mount
  useEffect(() => {
    fetchLinkedInStatus();
  }, [userId]);
  
  // Check for LinkedIn callback on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      handleCallback(code, state);
    }
  }, []);
  
  /**
   * Fetch LinkedIn connection status from backend
   */
  const fetchLinkedInStatus = async () => {
    try {
      const status = await getLinkedInStatus(userId);
      setLinkedInStatus(status);
    } catch (error) {
      console.error('Error fetching LinkedIn status:', error);
      setError(t('errorFetchingLinkedInStatus'));
    }
  };
  
  /**
   * Initiate LinkedIn authentication
   */
  const connectLinkedIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get LinkedIn authorization URL
      const authUrl = await getLinkedInAuthUrl();
      
      // Redirect to LinkedIn for authentication
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting to LinkedIn:', error);
      setError(t('errorConnectingLinkedIn'));
      setLoading(false);
    }
  };
  
  /**
   * Handle LinkedIn callback after authentication
   */
  const handleCallback = async (code, state) => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear URL parameters
      navigate(window.location.pathname, { replace: true });
      
      // Process LinkedIn callback
      setImportProgress(20);
      const profileData = await handleLinkedInCallback(code);
      setImportProgress(60);
      
      // Store imported data for preview
      setImportedData(profileData);
      
      // Show import options modal
      setShowOptionsModal(true);
      setImportProgress(100);
      
      // Update LinkedIn status
      await fetchLinkedInStatus();
      
      setLoading(false);
      setSuccess(t('linkedInConnectedSuccessfully'));
    } catch (error) {
      console.error('Error handling LinkedIn callback:', error);
      setError(t('errorImportingLinkedInProfile'));
      setLoading(false);
      setImportProgress(0);
    }
  };
  
  /**
   * Synchronize LinkedIn data
   */
  const syncLinkedIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Synchronize LinkedIn data
      setImportProgress(20);
      const result = await syncLinkedInData(userId);
      setImportProgress(100);
      
      // Update LinkedIn status
      await fetchLinkedInStatus();
      
      setLoading(false);
      setSuccess(t('linkedInDataSynchronized'));
      
      // Notify parent component
      if (onProfileImported) {
        onProfileImported();
      }
    } catch (error) {
      console.error('Error synchronizing LinkedIn data:', error);
      setError(t('errorSynchronizingLinkedIn'));
      setLoading(false);
      setImportProgress(0);
    }
  };
  
  /**
   * Disconnect LinkedIn integration
   */
  const disconnect = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Disconnect LinkedIn
      await disconnectLinkedIn(userId);
      
      // Update LinkedIn status
      await fetchLinkedInStatus();
      
      setLoading(false);
      setSuccess(t('linkedInDisconnectedSuccessfully'));
    } catch (error) {
      console.error('Error disconnecting LinkedIn:', error);
      setError(t('errorDisconnectingLinkedIn'));
      setLoading(false);
    }
  };
  
  /**
   * Import selected LinkedIn data
   */
  const importSelectedData = async () => {
    try {
      setLoading(true);
      setError(null);
      setShowOptionsModal(false);
      
      // Filter data based on selected options
      const filteredData = {
        ...importedData,
        workExperience: importOptions.workExperience ? importedData.workExperience : [],
        education: importOptions.education ? importedData.education : [],
        skills: importOptions.skills ? importedData.skills : [],
        certifications: importOptions.certifications ? importedData.certifications : []
      };
      
      // Save filtered data to backend
      setImportProgress(20);
      await saveProfileData(userId, filteredData);
      setImportProgress(100);
      
      setLoading(false);
      setSuccess(t('profileDataImportedSuccessfully'));
      
      // Notify parent component
      if (onProfileImported) {
        onProfileImported();
      }
    } catch (error) {
      console.error('Error importing selected data:', error);
      setError(t('errorImportingProfileData'));
      setLoading(false);
      setImportProgress(0);
    }
  };
  
  /**
   * Preview imported data
   */
  const previewData = () => {
    setShowOptionsModal(false);
    setShowPreviewModal(true);
  };
  
  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  /**
   * Render LinkedIn connection status
   */
  const renderConnectionStatus = () => {
    if (linkedInStatus.connected) {
      return (
        <Card className="mb-4 linkedin-status-card">
          <Card.Body>
            <div className="d-flex align-items-center mb-3">
              <FontAwesomeIcon icon={faLinkedinIn} className="linkedin-icon me-2" />
              <h5 className="mb-0">{t('linkedInConnected')}</h5>
              <Badge bg="success" className="ms-2">{t('active')}</Badge>
            </div>
            
            <p>
              <strong>{t('linkedInProfile')}:</strong>{' '}
              {linkedInStatus.profileUrl ? (
                <a href={linkedInStatus.profileUrl} target="_blank" rel="noopener noreferrer">
                  {linkedInStatus.profileUrl}
                </a>
              ) : t('notAvailable')}
            </p>
            
            <p>
              <strong>{t('lastSynchronized')}:</strong>{' '}
              {linkedInStatus.lastSyncDate ? formatDate(linkedInStatus.lastSyncDate) : t('never')}
            </p>
            
            <div className="d-flex mt-3">
              <Button 
                variant="primary" 
                onClick={syncLinkedIn} 
                disabled={loading}
                className="me-2"
              >
                {loading ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <FontAwesomeIcon icon={faSync} className="me-1" />
                )}
                {t('synchronizeNow')}
              </Button>
              
              <Button 
                variant="outline-danger" 
                onClick={disconnect} 
                disabled={loading}
              >
                <FontAwesomeIcon icon={faTimes} className="me-1" />
                {t('disconnect')}
              </Button>
            </div>
          </Card.Body>
        </Card>
      );
    } else {
      return (
        <Card className="mb-4 linkedin-connect-card">
          <Card.Body className="text-center py-4">
            <FontAwesomeIcon icon={faLinkedin} className="linkedin-large-icon mb-3" />
            <h5>{t('connectWithLinkedIn')}</h5>
            <p className="text-muted">
              {t('importYourProfessionalProfile')}
            </p>
            
            <Button 
              variant="linkedin" 
              size="lg" 
              onClick={connectLinkedIn} 
              disabled={loading}
              className="mt-2"
            >
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <FontAwesomeIcon icon={faLinkedin} className="me-2" />
              )}
              {t('signInWithLinkedIn')}
            </Button>
            
            <div className="mt-3 small text-muted">
              <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
              {t('weWillNeverPostWithoutPermission')}
            </div>
          </Card.Body>
        </Card>
      );
    }
  };
  
  /**
   * Render import options modal
   */
  const renderOptionsModal = () => {
    return (
      <Modal 
        show={showOptionsModal} 
        onHide={() => setShowOptionsModal(false)}
        backdrop="static"
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('customizeDataImport')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{t('selectDataToImport')}</p>
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                id="import-basic-profile"
                label={t('basicProfileInformation')}
                checked={importOptions.basicProfile}
                onChange={() => setImportOptions({
                  ...importOptions,
                  basicProfile: !importOptions.basicProfile
                })}
                disabled={true} // Basic profile is always required
              />
              <small className="text-muted d-block ms-4">
                {t('includesNameEmailLocation')}
              </small>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                id="import-work-experience"
                label={t('workExperience')}
                checked={importOptions.workExperience}
                onChange={() => setImportOptions({
                  ...importOptions,
                  workExperience: !importOptions.workExperience
                })}
              />
              <small className="text-muted d-block ms-4">
                {importedData?.workExperience?.length || 0} {t('entries')}
              </small>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                id="import-education"
                label={t('education')}
                checked={importOptions.education}
                onChange={() => setImportOptions({
                  ...importOptions,
                  education: !importOptions.education
                })}
              />
              <small className="text-muted d-block ms-4">
                {importedData?.education?.length || 0} {t('entries')}
              </small>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                id="import-skills"
                label={t('skills')}
                checked={importOptions.skills}
                onChange={() => setImportOptions({
                  ...importOptions,
                  skills: !importOptions.skills
                })}
              />
              <small className="text-muted d-block ms-4">
                {importedData?.skills?.length || 0} {t('entries')}
              </small>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                id="import-certifications"
                label={t('certifications')}
                checked={importOptions.certifications}
                onChange={() => setImportOptions({
                  ...importOptions,
                  certifications: !importOptions.certifications
                })}
              />
              <small className="text-muted d-block ms-4">
                {importedData?.certifications?.length || 0} {t('entries')}
              </small>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOptionsModal(false)}>
            {t('cancel')}
          </Button>
          <Button variant="info" onClick={previewData}>
            {t('previewData')}
          </Button>
          <Button variant="primary" onClick={importSelectedData}>
            {t('importSelected')}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };
  
  /**
   * Render data preview modal
   */
  const renderPreviewModal = () => {
    if (!importedData) return null;
    
    return (
      <Modal 
        show={showPreviewModal} 
        onHide={() => setShowPreviewModal(false)}
        backdrop="static"
        size="lg"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('dataPreview')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Basic Profile */}
          <Card className="mb-4">
            <Card.Header className="d-flex align-items-center">
              <FontAwesomeIcon icon={faUser} className="me-2" />
              {t('basicProfile')}
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p><strong>{t('name')}:</strong> {importedData.basicProfile.firstName} {importedData.basicProfile.lastName}</p>
                  <p><strong>{t('email')}:</strong> {importedData.basicProfile.email}</p>
                </Col>
                <Col md={6}>
                  <p><strong>{t('headline')}:</strong> {importedData.basicProfile.headline || t('notAvailable')}</p>
                  <p><strong>{t('location')}:</strong> {importedData.basicProfile.location || t('notAvailable')}</p>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          {/* Work Experience */}
          {importOptions.workExperience && importedData.workExperience.length > 0 && (
            <Card className="mb-4">
              <Card.Header className="d-flex align-items-center">
                <FontAwesomeIcon icon={faBriefcase} className="me-2" />
                {t('workExperience')}
              </Card.Header>
              <Card.Body>
                {importedData.workExperience.map((job, index) => (
                  <div key={index} className={index > 0 ? "mt-4 pt-3 border-top" : ""}>
                    <h6>{job.title}</h6>
                    <p className="mb-1">{job.company}</p>
                    <p className="text-muted small mb-1">
                      {job.startDate && formatDate(job.startDate)} - {job.current ? t('present') : (job.endDate && formatDate(job.endDate))}
                    </p>
                    <p className="text-muted small mb-1">{job.location}</p>
                    <p className="small">{job.description}</p>
                  </div>
                ))}
              </Card.Body>
            </Card>
          )}
          
          {/* Education */}
          {importOptions.education && importedData.education.length > 0 && (
            <Card className="mb-4">
              <Card.Header className="d-flex align-items-center">
                <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
                {t('education')}
              </Card.Header>
              <Card.Body>
                {importedData.education.map((edu, index) => (
                  <div key={index} className={index > 0 ? "mt-4 pt-3 border-top" : ""}>
                    <h6>{edu.institution}</h6>
                    <p className="mb-1">{edu.degree} {edu.fieldOfStudy && `- ${edu.fieldOfStudy}`}</p>
                    <p className="text-muted small mb-1">
                      {edu.startDate && formatDate(edu.startDate)} - {edu.current ? t('present') : (edu.endDate && formatDate(edu.endDate))}
                    </p>
                  </div>
                ))}
              </Card.Body>
            </Card>
          )}
          
          {/* Skills */}
          {importOptions.skills && importedData.skills.length > 0 && (
            <Card className="mb-4">
              <Card.Header className="d-flex align-items-center">
                <FontAwesomeIcon icon={faTools} className="me-2" />
                {t('skills')}
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap">
                  {importedData.skills.map((skill, index) => (
                    <Badge 
                      bg="light" 
                      text="dark" 
                      className="me-2 mb-2 p-2" 
                      key={index}
                    >
                      {skill.name}
                      {skill.proficiency && (
                        <span className="ms-1 text-muted">({skill.proficiency})</span>
                      )}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}
          
          {/* Certifications */}
          {importOptions.certifications && importedData.certifications.length > 0 && (
            <Card className="mb-4">
              <Card.Header className="d-flex align-items-center">
                <FontAwesomeIcon icon={faCertificate} className="me-2" />
                {t('certifications')}
              </Card.Header>
              <Card.Body>
                {importedData.certifications.map((cert, index) => (
                  <div key={index} className={index > 0 ? "mt-4 pt-3 border-top" : ""}>
                    <h6>{cert.name}</h6>
                    <p className="mb-1">{cert.issuingOrganization}</p>
                    <p className="text-muted small mb-1">
                      {cert.issueDate && formatDate(cert.issueDate)}
                      {cert.expirationDate && ` - ${formatDate(cert.expirationDate)}`}
                    </p>
                    {cert.credentialId && (
                      <p className="text-muted small mb-1">
                        {t('credentialId')}: {cert.credentialId}
                      </p>
                    )}
                  </div>
                ))}
              </Card.Body>
            </Card>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowPreviewModal(false);
            setShowOptionsModal(true);
          }}>
            {t('back')}
          </Button>
          <Button variant="primary" onClick={() => {
            setShowPreviewModal(false);
            importSelectedData();
          }}>
            {t('importData')}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };
  
  return (
    <div className="linkedin-profile-import">
      {/* Progress bar for import/sync operations */}
      {loading && importProgress > 0 && (
        <ProgressBar 
          animated 
          now={importProgress} 
          className="mb-4" 
          variant="linkedin"
        />
      )}
      
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
      
      {/* LinkedIn connection status/button */}
      {renderConnectionStatus()}
      
      {/* Import options modal */}
      {renderOptionsModal()}
      
      {/* Data preview modal */}
      {renderPreviewModal()}
    </div>
  );
};

export default LinkedInProfileImport;
