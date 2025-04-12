// Job Application Component
// This component allows applicants to apply for jobs and track their applications

import React, { useState, useEffect } from 'react';
import { 
  Card, Button, Form, Alert, Spinner, 
  Modal, Badge, Row, Col
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPaperPlane, faCheckCircle, faExclamationTriangle,
  faFileAlt, faInfoCircle
} from '@fortawesome/free-solid-svg-icons';

// Import job matching service
import JobMatchingService from '../services/JobMatchingService';

// Import translation function
import { useTranslation } from 'react-i18next';

/**
 * Job Application Component
 * Allows applicants to apply for jobs with their profile
 */
const JobApplication = ({ userId, jobId, onComplete }) => {
  const { t } = useTranslation();
  
  // State variables
  const [job, setJob] = useState(null);
  const [profile, setProfile] = useState(null);
  const [matchDetails, setMatchDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showMatchDetailsModal, setShowMatchDetailsModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [availableStartDate, setAvailableStartDate] = useState('');
  const [salaryExpectation, setSalaryExpectation] = useState('');
  
  // Fetch job and profile data on component mount
  useEffect(() => {
    if (userId && jobId) {
      fetchData();
    }
  }, [userId, jobId]);
  
  /**
   * Fetch job and profile data
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch job details
      const jobData = await JobMatchingService.getJobDetails(jobId);
      setJob(jobData);
      
      // Fetch profile data
      const profileResponse = await fetch(`/api/applicants/${userId}/profile`);
      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile data');
      }
      const profileData = await profileResponse.json();
      setProfile(profileData);
      
      // Calculate match score
      const matchResult = JobMatchingService.calculateMatchScore(profileData, jobData);
      setMatchDetails(matchResult);
      
      // Pre-fill salary expectation if available in profile
      if (profileData.preferences?.salaryExpectation) {
        setSalaryExpectation(profileData.preferences.salaryExpectation);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error loading job and profile data. Please try again.');
      setLoading(false);
    }
  };
  
  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Prepare application data
      const applicationData = {
        coverLetter,
        additionalInfo,
        availableStartDate,
        salaryExpectation,
        matchScore: matchDetails?.score || 0
      };
      
      // Submit application
      await JobMatchingService.applyForJob(userId, jobId, applicationData);
      
      setSubmitting(false);
      setSuccess(true);
      
      // Notify parent component
      if (onComplete) {
        onComplete(true);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Error submitting application. Please try again.');
      setSubmitting(false);
    }
  };
  
  /**
   * Render match details modal
   */
  const renderMatchDetailsModal = () => {
    if (!matchDetails) return null;
    
    return (
      <Modal 
        show={showMatchDetailsModal} 
        onHide={() => setShowMatchDetailsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('matchDetails')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <h2 className="display-4 text-primary">{matchDetails.score}%</h2>
            <p className="lead">{t('overallMatch')}</p>
          </div>
          
          <h5>{t('skillsMatch')}</h5>
          <div className="mb-4">
            <div className="d-flex justify-content-between mb-2">
              <span>{t('matchScore')}: {Math.round(matchDetails.components.skills.score)} / {matchDetails.components.skills.maxScore}</span>
              <span>{Math.round((matchDetails.components.skills.score / matchDetails.components.skills.maxScore) * 100)}%</span>
            </div>
            <div className="mb-3">
              <strong>{t('matchedSkills')}:</strong>
              <div className="d-flex flex-wrap mt-2">
                {matchDetails.components.skills.details
                  .filter(detail => detail.matched)
                  .map((detail, index) => (
                    <Badge 
                      bg={detail.type === 'required' ? 'success' : 'primary'} 
                      className="me-2 mb-2 p-2" 
                      key={index}
                    >
                      {detail.skill}
                      {detail.type === 'required' && (
                        <span className="ms-1">({t('required')})</span>
                      )}
                    </Badge>
                  ))
                }
              </div>
            </div>
            <div>
              <strong>{t('missingSkills')}:</strong>
              <div className="d-flex flex-wrap mt-2">
                {matchDetails.components.skills.details
                  .filter(detail => !detail.matched)
                  .map((detail, index) => (
                    <Badge 
                      bg={detail.type === 'required' ? 'danger' : 'warning'} 
                      text={detail.type === 'required' ? 'white' : 'dark'}
                      className="me-2 mb-2 p-2" 
                      key={index}
                    >
                      {detail.skill}
                      {detail.type === 'required' && (
                        <span className="ms-1">({t('required')})</span>
                      )}
                    </Badge>
                  ))
                }
              </div>
            </div>
          </div>
          
          <h5>{t('experienceMatch')}</h5>
          <div className="mb-4">
            <div className="d-flex justify-content-between mb-2">
              <span>{t('matchScore')}: {Math.round(matchDetails.components.experience.score)} / {matchDetails.components.experience.maxScore}</span>
              <span>{Math.round((matchDetails.components.experience.score / matchDetails.components.experience.maxScore) * 100)}%</span>
            </div>
            {matchDetails.components.experience.details.map((detail, index) => (
              <div key={index} className={`p-3 rounded mb-2 ${detail.matched ? 'bg-success-light' : 'bg-warning-light'}`}>
                <div className="d-flex justify-content-between">
                  <span>
                    <strong>{t('required')}:</strong> {detail.required} {t('years')}
                  </span>
                  <span>
                    <strong>{t('yours')}:</strong> {detail.actual} {t('years')}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <h5>{t('educationMatch')}</h5>
          <div className="mb-4">
            <div className="d-flex justify-content-between mb-2">
              <span>{t('matchScore')}: {Math.round(matchDetails.components.education.score)} / {matchDetails.components.education.maxScore}</span>
              <span>{Math.round((matchDetails.components.education.score / matchDetails.components.education.maxScore) * 100)}%</span>
            </div>
            {matchDetails.components.education.details.map((detail, index) => (
              <div key={index} className="p-3 rounded mb-2 bg-light">
                <Row>
                  <Col md={6}>
                    <div className="mb-2">
                      <strong>{t('requiredDegree')}:</strong> {detail.requiredDegree}
                    </div>
                    <div>
                      <Badge bg={detail.degreeMatch ? 'success' : 'danger'}>
                        {detail.degreeMatch ? t('match') : t('noMatch')}
                      </Badge>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-2">
                      <strong>{t('requiredField')}:</strong> {detail.requiredField}
                    </div>
                    <div>
                      <Badge bg={detail.fieldMatch ? 'success' : 'danger'}>
                        {detail.fieldMatch ? t('match') : t('noMatch')}
                      </Badge>
                    </div>
                  </Col>
                </Row>
              </div>
            ))}
          </div>
          
          <h5>{t('locationMatch')}</h5>
          <div className="mb-4">
            <div className="d-flex justify-content-between mb-2">
              <span>{t('matchScore')}: {Math.round(matchDetails.components.location.score)} / {matchDetails.components.location.maxScore}</span>
              <span>{Math.round((matchDetails.components.location.score / matchDetails.components.location.maxScore) * 100)}%</span>
            </div>
            {matchDetails.components.location.details.map((detail, index) => (
              <div key={index} className={`p-3 rounded mb-2 ${detail.matched ? 'bg-success-light' : 'bg-warning-light'}`}>
                <div className="mb-2">
                  <strong>{t('jobLocation')}:</strong> {detail.jobLocation}
                  {detail.remote && (
                    <Badge bg="info" className="ms-2">{t('remote')}</Badge>
                  )}
                </div>
                <div>
                  <Badge bg={detail.matched ? 'success' : 'warning'} text={detail.matched ? 'white' : 'dark'}>
                    {detail.reason}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          <h5>{t('jobTypeMatch')}</h5>
          <div>
            <div className="d-flex justify-content-between mb-2">
              <span>{t('matchScore')}: {Math.round(matchDetails.components.jobType.score)} / {matchDetails.components.jobType.maxScore}</span>
              <span>{Math.round((matchDetails.components.jobType.score / matchDetails.components.jobType.maxScore) * 100)}%</span>
            </div>
            {matchDetails.components.jobType.details.map((detail, index) => (
              <div key={index} className={`p-3 rounded mb-2 ${detail.matched ? 'bg-success-light' : 'bg-warning-light'}`}>
                <div className="mb-2">
                  <strong>{t('jobType')}:</strong> {detail.jobType}
                </div>
                <div>
                  <Badge bg={detail.matched ? 'success' : 'warning'} text={detail.matched ? 'white' : 'dark'}>
                    {detail.matched ? t('match') : detail.reason}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMatchDetailsModal(false)}>
            {t('close')}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };
  
  // Render loading state
  if (loading) {
    return (
      <Card className="job-application">
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <div className="mt-3">{t('loadingJobDetails')}</div>
        </Card.Body>
      </Card>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Card className="job-application">
        <Card.Body>
          <Alert variant="danger">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            {error}
          </Alert>
          <div className="text-center mt-3">
            <Button 
              variant="primary"
              onClick={fetchData}
            >
              {t('tryAgain')}
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }
  
  // Render success state
  if (success) {
    return (
      <Card className="job-application">
        <Card.Body className="text-center py-5">
          <div className="mb-4">
            <FontAwesomeIcon icon={faCheckCircle} className="text-success display-1" />
          </div>
          <h4>{t('applicationSubmitted')}</h4>
          <p className="mb-4">{t('applicationSubmittedDescription')}</p>
          <Button 
            variant="primary"
            onClick={() => onComplete && onComplete(true)}
          >
            {t('viewApplications')}
          </Button>
        </Card.Body>
      </Card>
    );
  }
  
  return (
    <Card className="job-application">
      <Card.Header>
        <h5 className="mb-0">{t('applyForJob')}</h5>
      </Card.Header>
      <Card.Body>
        {/* Job details */}
        <div className="job-details mb-4">
          <h4>{job.title}</h4>
          <div className="mb-2">{job.company}</div>
          <div className="text-muted mb-3">
            {job.location} • {job.jobType}
            {job.remote && (
              <Badge bg="info" className="ms-2">{t('remote')}</Badge>
            )}
          </div>
          <div className="d-flex align-items-center mb-3">
            <div className="me-3">
              <strong>{t('matchScore')}:</strong>
            </div>
            <div className="match-score-badge">
              <Badge 
                bg={matchDetails.score >= 70 ? 'success' : matchDetails.score >= 50 ? 'warning' : 'danger'}
                className="p-2"
              >
                {matchDetails.score}%
              </Badge>
            </div>
            <Button 
              variant="link" 
              className="ms-2 p-0"
              onClick={() => setShowMatchDetailsModal(true)}
            >
              {t('viewDetails')}
            </Button>
          </div>
          <div className="mb-3">
            <strong>{t('matchingSkills')}:</strong>
            <div className="d-flex flex-wrap mt-2">
              {matchDetails.matchingSkills.map((skill, index) => (
                <Badge 
                  bg="light" 
                  text="dark" 
                  className="me-2 mb-2 p-2" 
                  key={index}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
          <div className="job-description mb-3">
            <strong>{t('jobDescription')}:</strong>
            <div className="mt-2">{job.description}</div>
          </div>
        </div>
        
        {/* Application form */}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>{t('coverLetter')}</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={6}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder={t('coverLetterPlaceholder')}
            />
            <Form.Text className="text-muted">
              {t('coverLetterHelp')}
            </Form.Text>
          </Form.Group>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('availableStartDate')}</Form.Label>
                <Form.Control 
                  type="date" 
                  value={availableStartDate}
                  onChange={(e) => setAvailableStartDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('salaryExpectation')}</Form.Label>
                <Form.Control 
                  type="text" 
                  value={salaryExpectation}
                  onChange={(e) => setSalaryExpectation(e.target.value)}
                  placeholder={t('salaryExpectationPlaceholder')}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-4">
            <Form.Label>{t('additionalInformation')}</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3}
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder={t('additionalInformationPlaceholder')}
            />
          </Form.Group>
          
          <Alert variant="info">
            <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
            {t('applicationInfoAlert')}
          </Alert>
          
          <div className="d-flex justify-content-between align-items-center mt-4">
            <div>
              <FontAwesomeIcon icon={faFileAlt} className="me-2" />
              {t('resumeWillBeIncluded')}
            </div>
            <Button 
              type="submit" 
              variant="primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {t('submitting')}
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                  {t('submitApplication')}
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card.Body>
      
      {/* Match details modal */}
      {renderMatchDetailsModal()}
    </Card>
  );
};

export default JobApplication;
