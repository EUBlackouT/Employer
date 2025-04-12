// Recruiter Applicant View Component
// This component allows recruiters to view applicants from the applicant portal

import React, { useState, useEffect } from 'react';
import { 
  Card, Button, Alert, Spinner, 
  Modal, Badge, Row, Col, Tabs, Tab,
  ListGroup, ProgressBar, Dropdown
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faBriefcase, faGraduationCap, faCheckCircle,
  faExclamationTriangle, faFilePdf, faEnvelope, faPhone,
  faMapMarkerAlt, faStar, faCalendarAlt, faComments,
  faFileAlt, faChartBar, faCheck, faTimes
} from '@fortawesome/free-solid-svg-icons';

// Import integration service
import IntegrationService from '../services/IntegrationService';

/**
 * Recruiter Applicant View Component
 * Allows recruiters to view applicant details and manage applications
 */
const RecruiterApplicantView = ({ applicantId, jobId, onStatusChange }) => {
  // State variables
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewType, setInterviewType] = useState('video');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Fetch applicant data on component mount
  useEffect(() => {
    if (applicantId) {
      fetchApplicantData();
    }
  }, [applicantId, jobId]);
  
  /**
   * Fetch applicant data
   */
  const fetchApplicantData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get applicant details from integration service
      const applicantData = await IntegrationService.getApplicantDetailsForRecruiter(applicantId);
      
      // If jobId is provided, filter for that specific application
      if (jobId) {
        const application = applicantData.applications.find(app => app.jobId === jobId);
        if (application) {
          applicantData.currentApplication = application;
          setNotes(application.notes || '');
          setInterviewDate(application.interviewDate || '');
          setInterviewType(application.interviewType || 'video');
        }
      } else if (applicantData.applications.length > 0) {
        // Use the most recent application
        applicantData.currentApplication = applicantData.applications.sort(
          (a, b) => new Date(b.applicationDate) - new Date(a.applicationDate)
        )[0];
        setNotes(applicantData.currentApplication.notes || '');
        setInterviewDate(applicantData.currentApplication.interviewDate || '');
        setInterviewType(applicantData.currentApplication.interviewType || 'video');
      }
      
      setApplicant(applicantData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching applicant data:', error);
      setError('Error loading applicant data. Please try again.');
      setLoading(false);
    }
  };
  
  /**
   * Update application status
   */
  const handleUpdateStatus = async (status) => {
    if (!applicant.currentApplication) return;
    
    try {
      setUpdatingStatus(true);
      
      // Prepare status data
      const statusData = {
        status,
        notes
      };
      
      // Add interview data if status is 'interview'
      if (status === 'interview') {
        statusData.interviewDate = interviewDate;
        statusData.interviewType = interviewType;
      }
      
      // Update application status
      await IntegrationService.updateApplicationStatus(
        applicant.currentApplication.id,
        status,
        statusData
      );
      
      // Sync status to applicant portal
      await IntegrationService.syncApplicationStatusToApplicant(
        applicant.currentApplication.id
      );
      
      // Refresh applicant data
      await fetchApplicantData();
      
      // Notify parent component
      if (onStatusChange) {
        onStatusChange(status, applicant.currentApplication.id);
      }
      
      setUpdatingStatus(false);
    } catch (error) {
      console.error('Error updating application status:', error);
      setError('Error updating application status. Please try again.');
      setUpdatingStatus(false);
    }
  };
  
  /**
   * Save notes
   */
  const handleSaveNotes = async () => {
    if (!applicant.currentApplication) return;
    
    try {
      setUpdatingStatus(true);
      
      // Update application notes
      await IntegrationService.updateApplicationStatus(
        applicant.currentApplication.id,
        applicant.currentApplication.status,
        { notes }
      );
      
      // Refresh applicant data
      await fetchApplicantData();
      
      setShowNotesModal(false);
      setUpdatingStatus(false);
    } catch (error) {
      console.error('Error saving notes:', error);
      setError('Error saving notes. Please try again.');
      setUpdatingStatus(false);
    }
  };
  
  /**
   * Schedule interview
   */
  const handleScheduleInterview = async () => {
    if (!applicant.currentApplication) return;
    
    try {
      setUpdatingStatus(true);
      
      // Update application status to interview
      await IntegrationService.updateApplicationStatus(
        applicant.currentApplication.id,
        'interview',
        {
          interviewDate,
          interviewType,
          notes
        }
      );
      
      // Sync status to applicant portal
      await IntegrationService.syncApplicationStatusToApplicant(
        applicant.currentApplication.id
      );
      
      // Refresh applicant data
      await fetchApplicantData();
      
      // Notify parent component
      if (onStatusChange) {
        onStatusChange('interview', applicant.currentApplication.id);
      }
      
      setShowNotesModal(false);
      setUpdatingStatus(false);
    } catch (error) {
      console.error('Error scheduling interview:', error);
      setError('Error scheduling interview. Please try again.');
      setUpdatingStatus(false);
    }
  };
  
  /**
   * Render profile tab
   */
  const renderProfileTab = () => {
    if (!applicant) return null;
    
    return (
      <div className="applicant-profile">
        {/* Basic information */}
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Basic Information</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6} className="mb-3">
                <div className="text-muted">Name</div>
                <div className="fw-bold">
                  {applicant.firstName} {applicant.lastName}
                </div>
              </Col>
              <Col md={6} className="mb-3">
                <div className="text-muted">Email</div>
                <div className="fw-bold">
                  <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                  <a href={`mailto:${applicant.email}`}>{applicant.email}</a>
                </div>
              </Col>
              <Col md={6} className="mb-3">
                <div className="text-muted">Phone</div>
                <div className="fw-bold">
                  <FontAwesomeIcon icon={faPhone} className="me-2" />
                  <a href={`tel:${applicant.phone}`}>{applicant.phone || 'Not provided'}</a>
                </div>
              </Col>
              <Col md={6} className="mb-3">
                <div className="text-muted">Location</div>
                <div className="fw-bold">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                  {applicant.location || 'Not provided'}
                </div>
              </Col>
              {applicant.headline && (
                <Col xs={12} className="mb-3">
                  <div className="text-muted">Headline</div>
                  <div className="fw-bold">{applicant.headline}</div>
                </Col>
              )}
              {applicant.summary && (
                <Col xs={12}>
                  <div className="text-muted">Summary</div>
                  <div>{applicant.summary}</div>
                </Col>
              )}
            </Row>
            <div className="mt-3">
              <Badge bg="secondary" className="me-2">
                Source: {applicant.source}
              </Badge>
              {applicant.resumeUrl && (
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setShowResumeModal(true)}
                >
                  <FontAwesomeIcon icon={faFilePdf} className="me-2" />
                  View Resume
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
        
        {/* Work experience */}
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">
              <FontAwesomeIcon icon={faBriefcase} className="me-2" />
              Work Experience
            </h5>
          </Card.Header>
          <ListGroup variant="flush">
            {applicant.experience?.length === 0 ? (
              <ListGroup.Item className="text-center py-4">
                <div className="text-muted">No work experience provided</div>
              </ListGroup.Item>
            ) : (
              applicant.experience?.map((job, index) => (
                <ListGroup.Item key={index}>
                  <div className="d-flex justify-content-between">
                    <div>
                      <div className="fw-bold">{job.title}</div>
                      <div>{job.company}</div>
                      <div className="text-muted">
                        {job.startDate} - {job.isCurrent ? 'Present' : job.endDate}
                        {job.location && ` • ${job.location}`}
                      </div>
                      {job.description && <div className="mt-2">{job.description}</div>}
                    </div>
                  </div>
                </ListGroup.Item>
              ))
            )}
          </ListGroup>
        </Card>
        
        {/* Education */}
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">
              <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
              Education
            </h5>
          </Card.Header>
          <ListGroup variant="flush">
            {applicant.education?.length === 0 ? (
              <ListGroup.Item className="text-center py-4">
                <div className="text-muted">No education provided</div>
              </ListGroup.Item>
            ) : (
              applicant.education?.map((edu, index) => (
                <ListGroup.Item key={index}>
                  <div className="fw-bold">{edu.institution}</div>
                  <div>{edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}</div>
                  <div className="text-muted">
                    {edu.startDate} - {edu.isCurrent ? 'Present' : edu.endDate}
                  </div>
                </ListGroup.Item>
              ))
            )}
          </ListGroup>
        </Card>
        
        {/* Skills */}
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Skills</h5>
          </Card.Header>
          <Card.Body>
            {applicant.skills?.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-muted">No skills provided</div>
              </div>
            ) : (
              <div className="d-flex flex-wrap">
                {applicant.skills?.map((skill, index) => (
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
            )}
          </Card.Body>
        </Card>
        
        {/* Certifications */}
        {applicant.certifications?.length > 0 && (
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Certifications</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-wrap">
                {applicant.certifications.map((cert, index) => (
                  <Badge 
                    bg="light" 
                    text="dark" 
                    className="me-2 mb-2 p-2" 
                    key={index}
                  >
                    {cert}
                  </Badge>
                ))}
              </div>
            </Card.Body>
          </Card>
        )}
        
        {/* Job preferences */}
        <Card>
          <Card.Header>
            <h5 className="mb-0">Job Preferences</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6} className="mb-3">
                <div className="text-muted">Job Types</div>
                <div>
                  {applicant.preferences?.jobTypes?.length > 0 
                    ? applicant.preferences.jobTypes.join(', ') 
                    : 'Not specified'}
                </div>
              </Col>
              <Col md={6} className="mb-3">
                <div className="text-muted">Preferred Locations</div>
                <div>
                  {applicant.preferences?.locations?.length > 0 
                    ? applicant.preferences.locations.join(', ') 
                    : 'Not specified'}
                </div>
              </Col>
              <Col md={6} className="mb-3">
                <div className="text-muted">Remote Work</div>
                <div>
                  {applicant.preferences?.remoteWork 
                    ? 'Yes' 
                    : 'No'}
                </div>
              </Col>
              <Col md={6} className="mb-3">
                <div className="text-muted">Willing to Relocate</div>
                <div>
                  {applicant.preferences?.willingToRelocate 
                    ? 'Yes' 
                    : 'No'}
                </div>
              </Col>
              <Col md={6} className="mb-3">
                <div className="text-muted">Salary Expectation</div>
                <div>
                  {applicant.preferences?.salaryExpectation || 'Not specified'}
                </div>
              </Col>
              <Col md={6}>
                <div className="text-muted">Availability</div>
                <div>
                  {applicant.preferences?.availability || 'Not specified'}
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
    );
  };
  
  /**
   * Render application tab
   */
  const renderApplicationTab = () => {
    if (!applicant) return null;
    
    const application = applicant.currentApplication;
    
    if (!application) {
      return (
        <Alert variant="info">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          No application found for this applicant.
        </Alert>
      );
    }
    
    return (
      <div className="application-details">
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Application Details</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6} className="mb-3">
                <div className="text-muted">Application Date</div>
                <div className="fw-bold">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                  {new Date(application.applicationDate).toLocaleDateString()}
                </div>
              </Col>
              <Col md={6} className="mb-3">
                <div className="text-muted">Status</div>
                <div>
                  <Badge 
                    bg={
                      application.status === 'applied' ? 'secondary' :
                      application.status === 'reviewing' ? 'primary' :
                      application.status === 'interview' ? 'info' :
                      application.status === 'offered' ? 'warning' :
                      application.status === 'hired' ? 'success' :
                      application.status === 'rejected' ? 'danger' :
                      'secondary'
                    }
                    className="p-2"
                  >
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </Badge>
                </div>
              </Col>
              <Col md={6} className="mb-3">
                <div className="text-muted">Match Score</div>
                <div>
                  <ProgressBar 
                    now={application.matchScore} 
                    variant={
                      application.matchScore >= 70 ? 'success' :
                      application.matchScore >= 50 ? 'warning' :
                      'danger'
                    }
                    className="mt-1"
                    style={{ height: '10px' }}
                  />
                  <div className="text-end mt-1">{application.matchScore}%</div>
                </div>
              </Col>
              {application.status === 'interview' && (
                <Col md={6} className="mb-3">
                  <div className="text-muted">Interview</div>
                  <div>
                    {application.interviewDate ? (
                      <div>
                        <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                        {new Date(application.interviewDate).toLocaleString()}
                        <Badge bg="info" className="ms-2">
                          {application.interviewType || 'Not specified'}
                        </Badge>
                      </div>
                    ) : (
                      'Not scheduled'
                    )}
                  </div>
                </Col>
              )}
            </Row>
            
            {application.coverLetter && (
              <div className="mt-3">
                <div className="text-muted mb-2">Cover Letter</div>
                <Card className="bg-light">
                  <Card.Body>
                    <div style={{ whiteSpace: 'pre-line' }}>
                      {application.coverLetter}
                    </div>
                  </Card.Body>
                </Card>
              </div>
            )}
            
            {application.additionalInfo && (
              <div className="mt-3">
                <div className="text-muted mb-2">Additional Information</div>
                <Card className="bg-light">
                  <Card.Body>
                    <div style={{ whiteSpace: 'pre-line' }}>
                      {application.additionalInfo}
                    </div>
                  </Card.Body>
                </Card>
              </div>
            )}
            
            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center">
                <div className="text-muted mb-2">Recruiter Notes</div>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setShowNotesModal(true)}
                >
                  <FontAwesomeIcon icon={faComments} className="me-2" />
                  {application.notes ? 'Edit Notes' : 'Add Notes'}
                </Button>
              </div>
              {application.notes ? (
                <Card className="bg-light">
                  <Card.Body>
                    <div style={{ whiteSpace: 'pre-line' }}>
                      {application.notes}
                    </div>
                  </Card.Body>
                </Card>
              ) : (
                <div className="text-muted fst-italic">No notes added yet</div>
              )}
            </div>
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Header>
            <h5 className="mb-0">Actions</h5>
          </Card.Header>
          <Card.Body>
            <div className="d-flex flex-wrap gap-2">
              {application.status === 'applied' && (
                <Button 
                  variant="primary"
                  onClick={() => handleUpdateStatus('reviewing')}
                  disabled={updatingStatus}
                >
                  {updatingStatus ? (
                    <Spinner animation="border" size="sm" className="me-2" />
                  ) : (
                    <FontAwesomeIcon icon={faFileAlt} className="me-2" />
                  )}
                  Mark as Reviewing
                </Button>
              )}
              
              {(application.status === 'applied' || application.status === 'reviewing') && (
                <Button 
                  variant="info"
                  onClick={() => setShowNotesModal(true)}
                  disabled={updatingStatus}
                >
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                  Schedule Interview
                </Button>
              )}
              
              {application.status === 'interview' && (
                <Button 
                  variant="warning"
                  onClick={() => handleUpdateStatus('offered')}
                  disabled={updatingStatus}
                >
                  <FontAwesomeIcon icon={faStar} className="me-2" />
                  Extend Offer
                </Button>
              )}
              
              {application.status === 'offered' && (
                <Button 
                  variant="success"
                  onClick={() => handleUpdateStatus('hired')}
                  disabled={updatingStatus}
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  Mark as Hired
                </Button>
              )}
              
              {application.status !== 'rejected' && application.status !== 'hired' && (
                <Button 
                  variant="danger"
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={updatingStatus}
                >
                  <FontAwesomeIcon icon={faTimes} className="me-2" />
                  Reject Application
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  };
  
  /**
   * Render match analysis tab
   */
  const renderMatchAnalysisTab = () => {
    if (!applicant || !applicant.currentApplication) return null;
    
    // This would typically come from the job matching service
    // For now, we'll use mock data based on the match score
    const matchScore = applicant.currentApplication.matchScore || 0;
    
    // Mock match analysis data
    const matchAnalysis = {
      score: matchScore,
      components: {
        skills: { 
          score: Math.round(matchScore * 0.4), 
          maxScore: 40,
          details: [
            { skill: 'JavaScript', type: 'required', matched: true },
            { skill: 'React', type: 'required', matched: matchScore > 50 },
            { skill: 'Node.js', type: 'required', matched: matchScore > 60 },
            { skill: 'SQL', type: 'preferred', matched: matchScore > 70 },
            { skill: 'AWS', type: 'preferred', matched: matchScore > 80 }
          ]
        },
        experience: {
          score: Math.round(matchScore * 0.25),
          maxScore: 25,
          details: [
            { 
              required: 3, 
              actual: matchScore > 50 ? 4 : 2, 
              matched: matchScore > 50 
            }
          ]
        },
        education: {
          score: Math.round(matchScore * 0.2),
          maxScore: 20,
          details: [
            {
              requiredDegree: "Bachelor's",
              requiredField: "Computer Science",
              degreeMatch: matchScore > 40,
              fieldMatch: matchScore > 60
            }
          ]
        },
        location: {
          score: Math.round(matchScore * 0.1),
          maxScore: 10,
          details: [
            {
              jobLocation: "New York",
              remote: true,
              matched: matchScore > 30,
              reason: matchScore > 30 ? 'Remote job match' : 'No location match'
            }
          ]
        },
        jobType: {
          score: Math.round(matchScore * 0.05),
          maxScore: 5,
          details: [
            {
              jobType: "Full-time",
              matched: matchScore > 20,
              reason: matchScore > 20 ? 'Job type match' : 'Job type mismatch'
            }
          ]
        }
      }
    };
    
    return (
      <div className="match-analysis">
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">
              <FontAwesomeIcon icon={faChartBar} className="me-2" />
              Match Analysis
            </h5>
          </Card.Header>
          <Card.Body>
            <div className="text-center mb-4">
              <h2 className="display-4 text-primary">{matchAnalysis.score}%</h2>
              <p className="lead">Overall Match</p>
            </div>
            
            <h5>Skills Match</h5>
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span>Match Score: {matchAnalysis.components.skills.score} / {matchAnalysis.components.skills.maxScore}</span>
                <span>{Math.round((matchAnalysis.components.skills.score / matchAnalysis.components.skills.maxScore) * 100)}%</span>
              </div>
              <div className="mb-3">
                <strong>Matched Skills:</strong>
                <div className="d-flex flex-wrap mt-2">
                  {matchAnalysis.components.skills.details
                    .filter(detail => detail.matched)
                    .map((detail, index) => (
                      <Badge 
                        bg={detail.type === 'required' ? 'success' : 'primary'} 
                        className="me-2 mb-2 p-2" 
                        key={index}
                      >
                        {detail.skill}
                        {detail.type === 'required' && (
                          <span className="ms-1">(Required)</span>
                        )}
                      </Badge>
                    ))
                  }
                </div>
              </div>
              <div>
                <strong>Missing Skills:</strong>
                <div className="d-flex flex-wrap mt-2">
                  {matchAnalysis.components.skills.details
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
                          <span className="ms-1">(Required)</span>
                        )}
                      </Badge>
                    ))
                  }
                </div>
              </div>
            </div>
            
            <h5>Experience Match</h5>
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span>Match Score: {matchAnalysis.components.experience.score} / {matchAnalysis.components.experience.maxScore}</span>
                <span>{Math.round((matchAnalysis.components.experience.score / matchAnalysis.components.experience.maxScore) * 100)}%</span>
              </div>
              {matchAnalysis.components.experience.details.map((detail, index) => (
                <div key={index} className={`p-3 rounded mb-2 ${detail.matched ? 'bg-success-light' : 'bg-warning-light'}`}>
                  <div className="d-flex justify-content-between">
                    <span>
                      <strong>Required:</strong> {detail.required} years
                    </span>
                    <span>
                      <strong>Applicant:</strong> {detail.actual} years
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <h5>Education Match</h5>
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span>Match Score: {matchAnalysis.components.education.score} / {matchAnalysis.components.education.maxScore}</span>
                <span>{Math.round((matchAnalysis.components.education.score / matchAnalysis.components.education.maxScore) * 100)}%</span>
              </div>
              {matchAnalysis.components.education.details.map((detail, index) => (
                <div key={index} className="p-3 rounded mb-2 bg-light">
                  <Row>
                    <Col md={6}>
                      <div className="mb-2">
                        <strong>Required Degree:</strong> {detail.requiredDegree}
                      </div>
                      <div>
                        <Badge bg={detail.degreeMatch ? 'success' : 'danger'}>
                          {detail.degreeMatch ? 'Match' : 'No Match'}
                        </Badge>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-2">
                        <strong>Required Field:</strong> {detail.requiredField}
                      </div>
                      <div>
                        <Badge bg={detail.fieldMatch ? 'success' : 'danger'}>
                          {detail.fieldMatch ? 'Match' : 'No Match'}
                        </Badge>
                      </div>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
            
            <h5>Location Match</h5>
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-2">
                <span>Match Score: {matchAnalysis.components.location.score} / {matchAnalysis.components.location.maxScore}</span>
                <span>{Math.round((matchAnalysis.components.location.score / matchAnalysis.components.location.maxScore) * 100)}%</span>
              </div>
              {matchAnalysis.components.location.details.map((detail, index) => (
                <div key={index} className={`p-3 rounded mb-2 ${detail.matched ? 'bg-success-light' : 'bg-warning-light'}`}>
                  <div className="mb-2">
                    <strong>Job Location:</strong> {detail.jobLocation}
                    {detail.remote && (
                      <Badge bg="info" className="ms-2">Remote</Badge>
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
            
            <h5>Job Type Match</h5>
            <div>
              <div className="d-flex justify-content-between mb-2">
                <span>Match Score: {matchAnalysis.components.jobType.score} / {matchAnalysis.components.jobType.maxScore}</span>
                <span>{Math.round((matchAnalysis.components.jobType.score / matchAnalysis.components.jobType.maxScore) * 100)}%</span>
              </div>
              {matchAnalysis.components.jobType.details.map((detail, index) => (
                <div key={index} className={`p-3 rounded mb-2 ${detail.matched ? 'bg-success-light' : 'bg-warning-light'}`}>
                  <div className="mb-2">
                    <strong>Job Type:</strong> {detail.jobType}
                  </div>
                  <div>
                    <Badge bg={detail.matched ? 'success' : 'warning'} text={detail.matched ? 'white' : 'dark'}>
                      {detail.matched ? 'Match' : detail.reason}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  };
  
  /**
   * Render resume modal
   */
  const renderResumeModal = () => {
    if (!applicant || !applicant.resumeUrl) return null;
    
    return (
      <Modal 
        show={showResumeModal} 
        onHide={() => setShowResumeModal(false)}
        size="lg"
        fullscreen
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faFilePdf} className="me-2" />
            {applicant.firstName} {applicant.lastName}'s Resume
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <iframe 
            src={applicant.resumeUrl} 
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Resume"
          />
        </Modal.Body>
      </Modal>
    );
  };
  
  /**
   * Render notes modal
   */
  const renderNotesModal = () => {
    if (!applicant) return null;
    
    const isInterview = applicant.currentApplication?.status === 'interview' || 
                        (applicant.currentApplication?.status !== 'offered' && 
                         applicant.currentApplication?.status !== 'hired' && 
                         applicant.currentApplication?.status !== 'rejected');
    
    return (
      <Modal 
        show={showNotesModal} 
        onHide={() => setShowNotesModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faComments} className="me-2" />
            {isInterview ? 'Schedule Interview & Add Notes' : 'Recruiter Notes'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isInterview && (
            <div className="mb-4">
              <h5>Interview Details</h5>
              <Row className="mb-3">
                <Col md={6}>
                  <label className="form-label">Interview Date</label>
                  <input 
                    type="datetime-local" 
                    className="form-control"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                  />
                </Col>
                <Col md={6}>
                  <label className="form-label">Interview Type</label>
                  <select 
                    className="form-select"
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                  >
                    <option value="video">Video Interview</option>
                    <option value="phone">Phone Interview</option>
                    <option value="in-person">In-Person Interview</option>
                    <option value="technical">Technical Interview</option>
                    <option value="panel">Panel Interview</option>
                  </select>
                </Col>
              </Row>
            </div>
          )}
          
          <div>
            <label className="form-label">Notes</label>
            <textarea 
              className="form-control" 
              rows={6}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes about this applicant..."
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNotesModal(false)}>
            Cancel
          </Button>
          {isInterview ? (
            <Button 
              variant="primary"
              onClick={handleScheduleInterview}
              disabled={updatingStatus || !interviewDate}
            >
              {updatingStatus ? (
                <Spinner animation="border" size="sm" className="me-2" />
              ) : (
                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
              )}
              Schedule Interview
            </Button>
          ) : (
            <Button 
              variant="primary"
              onClick={handleSaveNotes}
              disabled={updatingStatus}
            >
              {updatingStatus ? (
                <Spinner animation="border" size="sm" className="me-2" />
              ) : (
                <FontAwesomeIcon icon={faCheck} className="me-2" />
              )}
              Save Notes
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    );
  };
  
  // Render loading state
  if (loading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <div className="mt-3">Loading applicant data...</div>
        </Card.Body>
      </Card>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Card>
        <Card.Body>
          <Alert variant="danger">
            <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
            {error}
          </Alert>
          <div className="text-center mt-3">
            <Button 
              variant="primary"
              onClick={fetchApplicantData}
            >
              Try Again
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }
  
  return (
    <div className="recruiter-applicant-view">
      {/* Applicant header */}
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <div className="applicant-avatar me-3">
                <div className="avatar-placeholder bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', fontSize: '24px' }}>
                  {applicant.firstName?.charAt(0)}{applicant.lastName?.charAt(0)}
                </div>
              </div>
              <div>
                <h4 className="mb-1">{applicant.firstName} {applicant.lastName}</h4>
                <div className="text-muted">
                  {applicant.headline || (applicant.experience?.length > 0 ? applicant.experience[0].title : 'Applicant')}
                </div>
              </div>
            </div>
            <div>
              {applicant.currentApplication && (
                <Badge 
                  bg={
                    applicant.currentApplication.status === 'applied' ? 'secondary' :
                    applicant.currentApplication.status === 'reviewing' ? 'primary' :
                    applicant.currentApplication.status === 'interview' ? 'info' :
                    applicant.currentApplication.status === 'offered' ? 'warning' :
                    applicant.currentApplication.status === 'hired' ? 'success' :
                    applicant.currentApplication.status === 'rejected' ? 'danger' :
                    'secondary'
                  }
                  className="p-2 me-2"
                >
                  {applicant.currentApplication.status.charAt(0).toUpperCase() + applicant.currentApplication.status.slice(1)}
                </Badge>
              )}
              <Dropdown className="d-inline-block">
                <Dropdown.Toggle variant="outline-secondary" id="dropdown-actions">
                  Actions
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setShowNotesModal(true)}>
                    <FontAwesomeIcon icon={faComments} className="me-2" />
                    Add Notes
                  </Dropdown.Item>
                  {applicant.resumeUrl && (
                    <Dropdown.Item onClick={() => setShowResumeModal(true)}>
                      <FontAwesomeIcon icon={faFilePdf} className="me-2" />
                      View Resume
                    </Dropdown.Item>
                  )}
                  <Dropdown.Divider />
                  <Dropdown.Item href={`mailto:${applicant.email}`}>
                    <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                    Send Email
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </Card.Body>
      </Card>
      
      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={setActiveTab}
        className="mb-4"
      >
        <Tab eventKey="profile" title="Profile">
          {renderProfileTab()}
        </Tab>
        <Tab eventKey="application" title="Application">
          {renderApplicationTab()}
        </Tab>
        <Tab eventKey="match" title="Match Analysis">
          {renderMatchAnalysisTab()}
        </Tab>
      </Tabs>
      
      {/* Modals */}
      {renderResumeModal()}
      {renderNotesModal()}
    </div>
  );
};

export default RecruiterApplicantView;
