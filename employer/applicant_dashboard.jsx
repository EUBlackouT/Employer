import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Nav, Tab, Badge, 
  Button, Alert, ProgressBar, ListGroup, Spinner
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTachometerAlt, faUser, faBriefcase, faSearch,
  faBell, faStar, faCheckCircle, faTimesCircle,
  faExclamationTriangle, faChartBar, faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';

// Import translation function
import { useTranslation } from 'react-i18next';

/**
 * Applicant Dashboard Component
 * Main dashboard for applicants to view their profile, job matches, and applications
 */
const ApplicantDashboard = ({ userId }) => {
  const { t } = useTranslation();
  
  // State variables
  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState(null);
  const [matchingJobs, setMatchingJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [notifications, setNotifications] = useState([]);
  
  // Fetch data on component mount
  useEffect(() => {
    if (userId) {
      fetchDashboardData();
    }
  }, [userId]);
  
  /**
   * Fetch all dashboard data
   */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch profile data
      const profileResponse = await fetch(`/api/applicants/${userId}/profile`);
      if (!profileResponse.ok) {
        throw new Error('Failed to fetch profile data');
      }
      const profileData = await profileResponse.json();
      setProfileData(profileData);
      
      // Calculate profile completeness
      calculateProfileCompleteness(profileData);
      
      // Fetch matching jobs
      const jobsResponse = await fetch(`/api/applicants/${userId}/matching-jobs`);
      if (!jobsResponse.ok) {
        throw new Error('Failed to fetch matching jobs');
      }
      const jobsData = await jobsResponse.json();
      setMatchingJobs(jobsData);
      
      // Fetch applications
      const applicationsResponse = await fetch(`/api/applicants/${userId}/applications`);
      if (!applicationsResponse.ok) {
        throw new Error('Failed to fetch applications');
      }
      const applicationsData = await applicationsResponse.json();
      setApplications(applicationsData);
      
      // Fetch notifications
      const notificationsResponse = await fetch(`/api/applicants/${userId}/notifications`);
      if (!notificationsResponse.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const notificationsData = await notificationsResponse.json();
      setNotifications(notificationsData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Error loading dashboard data. Please try again.');
      setLoading(false);
    }
  };
  
  /**
   * Calculate profile completeness percentage
   */
  const calculateProfileCompleteness = (profile) => {
    if (!profile) {
      setProfileCompleteness(0);
      return;
    }
    
    const sections = [
      // Basic profile (30%)
      {
        weight: 30,
        fields: [
          profile.basicProfile?.firstName,
          profile.basicProfile?.lastName,
          profile.basicProfile?.email,
          profile.basicProfile?.phone,
          profile.basicProfile?.headline,
          profile.basicProfile?.summary,
          profile.basicProfile?.location
        ]
      },
      // Work experience (25%)
      {
        weight: 25,
        array: profile.workExperience,
        required: 1
      },
      // Education (20%)
      {
        weight: 20,
        array: profile.education,
        required: 1
      },
      // Skills (15%)
      {
        weight: 15,
        array: profile.skills,
        required: 3
      },
      // Preferences (10%)
      {
        weight: 10,
        fields: [
          profile.preferences?.jobTypes?.length > 0,
          profile.preferences?.locations?.length > 0,
          profile.preferences?.salaryExpectation
        ]
      }
    ];
    
    let totalScore = 0;
    
    sections.forEach(section => {
      if (section.fields) {
        // Calculate percentage of filled fields
        const filledFields = section.fields.filter(field => field).length;
        const totalFields = section.fields.length;
        const sectionScore = (filledFields / totalFields) * section.weight;
        totalScore += sectionScore;
      } else if (section.array) {
        // Check if array has required number of items
        const itemCount = section.array?.length || 0;
        const sectionScore = Math.min(itemCount / section.required, 1) * section.weight;
        totalScore += sectionScore;
      }
    });
    
    setProfileCompleteness(Math.round(totalScore));
  };
  
  /**
   * Get color for profile completeness
   */
  const getProfileCompletenessColor = () => {
    if (profileCompleteness < 40) return 'danger';
    if (profileCompleteness < 70) return 'warning';
    return 'success';
  };
  
  /**
   * Get text for profile completeness
   */
  const getProfileCompletenessText = () => {
    if (profileCompleteness < 40) return t('profileIncompleteTip');
    if (profileCompleteness < 70) return t('profilePartialTip');
    return t('profileCompleteTip');
  };
  
  /**
   * Apply for a job
   */
  const handleApplyForJob = async (jobId) => {
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicantId: userId,
          jobId: jobId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to apply for job');
      }
      
      // Refresh applications
      const applicationsResponse = await fetch(`/api/applicants/${userId}/applications`);
      const applicationsData = await applicationsResponse.json();
      setApplications(applicationsData);
      
      // Update matching jobs to reflect applied status
      setMatchingJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? { ...job, applied: true } : job
        )
      );
    } catch (error) {
      console.error('Error applying for job:', error);
      setError('Error applying for job. Please try again.');
    }
  };
  
  /**
   * Mark notification as read
   */
  const handleMarkNotificationRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      // Update notifications
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  /**
   * Render overview tab
   */
  const renderOverviewTab = () => {
    return (
      <div className="dashboard-overview">
        {/* Profile completeness */}
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">
              <FontAwesomeIcon icon={faUser} className="me-2" />
              {t('profileCompleteness')}
            </h5>
          </Card.Header>
          <Card.Body>
            <ProgressBar 
              now={profileCompleteness} 
              variant={getProfileCompletenessColor()} 
              className="mb-3" 
            />
            <div className="d-flex justify-content-between">
              <span>{profileCompleteness}% {t('complete')}</span>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => setActiveTab('profile')}
              >
                {t('completeProfile')}
              </Button>
            </div>
            <Alert variant="info" className="mt-3 mb-0">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              {getProfileCompletenessText()}
            </Alert>
          </Card.Body>
        </Card>
        
        {/* Job match summary */}
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">
              <FontAwesomeIcon icon={faChartBar} className="me-2" />
              {t('jobMatchSummary')}
            </h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4} className="text-center mb-3 mb-md-0">
                <h2 className="text-primary">{matchingJobs.length}</h2>
                <div className="text-muted">{t('matchingJobs')}</div>
              </Col>
              <Col md={4} className="text-center mb-3 mb-md-0">
                <h2 className="text-success">
                  {applications.filter(app => app.status === 'active').length}
                </h2>
                <div className="text-muted">{t('activeApplications')}</div>
              </Col>
              <Col md={4} className="text-center">
                <h2 className="text-info">
                  {applications.filter(app => app.status === 'interview').length}
                </h2>
                <div className="text-muted">{t('interviewInvitations')}</div>
              </Col>
            </Row>
            <div className="text-center mt-4">
              <Button 
                variant="primary" 
                onClick={() => setActiveTab('jobs')}
              >
                <FontAwesomeIcon icon={faSearch} className="me-2" />
                {t('viewMatchingJobs')}
              </Button>
            </div>
          </Card.Body>
        </Card>
        
        {/* Recent notifications */}
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <FontAwesomeIcon icon={faBell} className="me-2" />
              {t('recentNotifications')}
            </h5>
            <Badge bg="danger" pill>
              {notifications.filter(n => !n.read).length}
            </Badge>
          </Card.Header>
          <ListGroup variant="flush">
            {notifications.length === 0 ? (
              <ListGroup.Item className="text-center py-4">
                <div className="text-muted">{t('noNotifications')}</div>
              </ListGroup.Item>
            ) : (
              notifications.slice(0, 5).map(notification => (
                <ListGroup.Item 
                  key={notification.id}
                  className={notification.read ? '' : 'bg-light'}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-bold">{notification.title}</div>
                      <div>{notification.message}</div>
                      <small className="text-muted">
                        {new Date(notification.date).toLocaleDateString()}
                      </small>
                    </div>
                    {!notification.read && (
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => handleMarkNotificationRead(notification.id)}
                      >
                        {t('markAsRead')}
                      </Button>
                    )}
                  </div>
                </ListGroup.Item>
              ))
            )}
          </ListGroup>
          {notifications.length > 5 && (
            <Card.Footer className="text-center">
              <Button 
                variant="link" 
                onClick={() => setActiveTab('notifications')}
              >
                {t('viewAllNotifications')}
              </Button>
            </Card.Footer>
          )}
        </Card>
        
        {/* Upcoming interviews */}
        <Card>
          <Card.Header>
            <h5 className="mb-0">
              <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
              {t('upcomingInterviews')}
            </h5>
          </Card.Header>
          <ListGroup variant="flush">
            {applications.filter(app => app.status === 'interview' && app.interviewDate).length === 0 ? (
              <ListGroup.Item className="text-center py-4">
                <div className="text-muted">{t('noUpcomingInterviews')}</div>
              </ListGroup.Item>
            ) : (
              applications
                .filter(app => app.status === 'interview' && app.interviewDate)
                .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate))
                .slice(0, 3)
                .map(application => (
                  <ListGroup.Item key={application.id}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fw-bold">{application.jobTitle}</div>
                        <div>{application.companyName}</div>
                        <div className="text-primary">
                          {new Date(application.interviewDate).toLocaleString()}
                        </div>
                      </div>
                      <Badge bg="info" pill>
                        {application.interviewType}
                      </Badge>
                    </div>
                  </ListGroup.Item>
                ))
            )}
          </ListGroup>
        </Card>
      </div>
    );
  };
  
  /**
   * Render profile tab
   */
  const renderProfileTab = () => {
    if (!profileData) {
      return (
        <Alert variant="info">
          {t('profileNotFound')}
        </Alert>
      );
    }
    
    return (
      <div className="profile-view">
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">{t('basicInformation')}</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6} className="mb-3">
                <div className="text-muted">{t('name')}</div>
                <div className="fw-bold">
                  {profileData.basicProfile.firstName} {profileData.basicProfile.lastName}
                </div>
              </Col>
              <Col md={6} className="mb-3">
                <div className="text-muted">{t('email')}</div>
                <div className="fw-bold">{profileData.basicProfile.email}</div>
              </Col>
              <Col md={6} className="mb-3">
                <div className="text-muted">{t('phone')}</div>
                <div className="fw-bold">{profileData.basicProfile.phone || t('notProvided')}</div>
              </Col>
              <Col md={6} className="mb-3">
                <div className="text-muted">{t('location')}</div>
                <div className="fw-bold">{profileData.basicProfile.location || t('notProvided')}</div>
              </Col>
              {profileData.basicProfile.headline && (
                <Col xs={12} className="mb-3">
                  <div className="text-muted">{t('headline')}</div>
                  <div className="fw-bold">{profileData.basicProfile.headline}</div>
                </Col>
              )}
              {profileData.basicProfile.summary && (
                <Col xs={12}>
                  <div className="text-muted">{t('summary')}</div>
                  <div>{profileData.basicProfile.summary}</div>
                </Col>
              )}
            </Row>
            <div className="text-end mt-3">
              <Button variant="outline-primary" size="sm">
                {t('editBasicInfo')}
              </Button>
            </div>
          </Card.Body>
        </Card>
        
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">{t('workExperience')}</h5>
            <Button variant="outline-primary" size="sm">
              {t('addExperience')}
            </Button>
          </Card.Header>
          <ListGroup variant="flush">
            {profileData.workExperience.length === 0 ? (
              <ListGroup.Item className="text-center py-4">
                <div className="text-muted">{t('noWorkExperienceAdded')}</div>
              </ListGroup.Item>
            ) : (
              profileData.workExperience.map((job, index) => (
                <ListGroup.Item key={index}>
                  <div className="d-flex justify-content-between">
                    <div>
                      <div className="fw-bold">{job.title}</div>
                      <div>{job.company}</div>
                      <div className="text-muted">
                        {job.startDate} - {job.isCurrent ? t('present') : job.endDate}
                        {job.location && ` • ${job.location}`}
                      </div>
                      {job.description && <div className="mt-2">{job.description}</div>}
                    </div>
                    <div>
                      <Badge bg="secondary" className="me-1">
                        {job.source}
                      </Badge>
                      <Button variant="link" size="sm" className="p-0 ms-2">
                        {t('edit')}
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))
            )}
          </ListGroup>
        </Card>
        
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">{t('education')}</h5>
            <Button variant="outline-primary" size="sm">
              {t('addEducation')}
            </Button>
          </Card.Header>
          <ListGroup variant="flush">
            {profileData.education.length === 0 ? (
              <ListGroup.Item className="text-center py-4">
                <div className="text-muted">{t('noEducationAdded')}</div>
              </ListGroup.Item>
            ) : (
              profileData.education.map((edu, index) => (
                <ListGroup.Item key={index}>
                  <div className="d-flex justify-content-between">
                    <div>
                      <div className="fw-bold">{edu.institution}</div>
                      <div>{edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}</div>
                      <div className="text-muted">
                        {edu.startDate} - {edu.isCurrent ? t('present') : edu.endDate}
                      </div>
                    </div>
                    <div>
                      <Badge bg="secondary" className="me-1">
                        {edu.source}
                      </Badge>
                      <Button variant="link" size="sm" className="p-0 ms-2">
                        {t('edit')}
                      </Button>
                    </div>
                  </div>
                </ListGroup.Item>
              ))
            )}
          </ListGroup>
        </Card>
        
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">{t('skills')}</h5>
            <Button variant="outline-primary" size="sm">
              {t('addSkills')}
            </Button>
          </Card.Header>
          <Card.Body>
            {profileData.skills.length === 0 ? (
              <div className="text-center py-4">
                <div className="text-muted">{t('noSkillsAdded')}</div>
              </div>
            ) : (
              <div className="d-flex flex-wrap">
                {profileData.skills.map((skill, index) => (
                  <Badge 
                    bg="light" 
                    text="dark" 
                    className="me-2 mb-2 p-2" 
                    key={index}
                  >
                    {skill.name}
                    <span className="ms-1 text-muted">({skill.proficiency})</span>
                  </Badge>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">{t('jobPreferences')}</h5>
            <Button variant="outline-primary" size="sm">
              {t('editPreferences')}
            </Button>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6} className="mb-3">
                <div className="text-muted">{t('jobTypes')}</div>
                <div>
                  {profileData.preferences.jobTypes?.length > 0 
                    ? profileData.preferences.jobTypes.join(', ') 
                    : t('notSpecified')}
                </div>
              </Col>
              <Col md={6} className="mb-3">
                <div className="text-muted">{t('preferredLocations')}</div>
                <div>
                  {profileData.preferences.locations?.length > 0 
                    ? profileData.preferences.locations.join(', ') 
                    : t('notSpecified')}
                </div>
              </Col>
              <Col md={6} className="mb-3">
                <div className="text-muted">{t('remoteWork')}</div>
                <div>
                  {profileData.preferences.remoteWork 
                    ? t('yes') 
                    : t('no')}
                </div>
              </Col>
              <Col md={6} className="mb-3">
                <div className="text-muted">{t('willingToRelocate')}</div>
                <div>
                  {profileData.preferences.willingToRelocate 
                    ? t('yes') 
                    : t('no')}
                </div>
              </Col>
              <Col md={6} className="mb-3">
                <div className="text-muted">{t('salaryExpectation')}</div>
                <div>
                  {profileData.preferences.salaryExpectation || t('notSpecified')}
                </div>
              </Col>
              <Col md={6}>
                <div className="text-muted">{t('availability')}</div>
                <div>
                  {profileData.preferences.availability || t('notSpecified')}
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>
    );
  };
  
  /**
   * Render matching jobs tab
   */
  const renderJobsTab = () => {
    return (
      <div className="matching-jobs">
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">
              <FontAwesomeIcon icon={faStar} className="me-2" />
              {t('matchingJobs')}
            </h5>
          </Card.Header>
          <Card.Body>
            <Alert variant="info">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              {t('jobMatchExplanation')}
            </Alert>
          </Card.Body>
          <ListGroup variant="flush">
            {matchingJobs.length === 0 ? (
              <ListGroup.Item className="text-center py-4">
                <div className="text-muted">{t('noMatchingJobs')}</div>
              </ListGroup.Item>
            ) : (
              matchingJobs.map(job => (
                <ListGroup.Item key={job.id}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-bold">{job.title}</div>
                      <div>{job.company}</div>
                      <div className="text-muted">
                        {job.location} • {job.jobType}
                      </div>
                      <div className="mt-2">
                        <Badge bg="primary" className="me-2">
                          {job.matchScore}% {t('match')}
                        </Badge>
                        {job.salary && (
                          <Badge bg="secondary" className="me-2">
                            {job.salary}
                          </Badge>
                        )}
                        {job.remote && (
                          <Badge bg="info" className="me-2">
                            {t('remote')}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2">
                        <strong>{t('matchingSkills')}:</strong> {job.matchingSkills.join(', ')}
                      </div>
                    </div>
                    <div>
                      {job.applied ? (
                        <Button variant="outline-success" disabled>
                          <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                          {t('applied')}
                        </Button>
                      ) : (
                        <Button 
                          variant="primary"
                          onClick={() => handleApplyForJob(job.id)}
                        >
                          {t('apply')}
                        </Button>
                      )}
                    </div>
                  </div>
                </ListGroup.Item>
              ))
            )}
          </ListGroup>
        </Card>
      </div>
    );
  };
  
  /**
   * Render applications tab
   */
  const renderApplicationsTab = () => {
    // Group applications by status
    const activeApplications = applications.filter(app => app.status === 'active');
    const interviewApplications = applications.filter(app => app.status === 'interview');
    const rejectedApplications = applications.filter(app => app.status === 'rejected');
    const withdrawnApplications = applications.filter(app => app.status === 'withdrawn');
    
    return (
      <div className="applications">
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">
              <FontAwesomeIcon icon={faBriefcase} className="me-2" />
              {t('activeApplications')}
            </h5>
          </Card.Header>
          <ListGroup variant="flush">
            {activeApplications.length === 0 ? (
              <ListGroup.Item className="text-center py-4">
                <div className="text-muted">{t('noActiveApplications')}</div>
              </ListGroup.Item>
            ) : (
              activeApplications.map(application => (
                <ListGroup.Item key={application.id}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-bold">{application.jobTitle}</div>
                      <div>{application.companyName}</div>
                      <div className="text-muted">
                        {t('appliedOn')}: {new Date(application.applicationDate).toLocaleDateString()}
                      </div>
                    </div>
                    <Button variant="outline-secondary" size="sm">
                      {t('viewDetails')}
                    </Button>
                  </div>
                </ListGroup.Item>
              ))
            )}
          </ListGroup>
        </Card>
        
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">
              <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
              {t('interviewInvitations')}
            </h5>
          </Card.Header>
          <ListGroup variant="flush">
            {interviewApplications.length === 0 ? (
              <ListGroup.Item className="text-center py-4">
                <div className="text-muted">{t('noInterviewInvitations')}</div>
              </ListGroup.Item>
            ) : (
              interviewApplications.map(application => (
                <ListGroup.Item key={application.id}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-bold">{application.jobTitle}</div>
                      <div>{application.companyName}</div>
                      <div className="text-primary">
                        {application.interviewDate 
                          ? new Date(application.interviewDate).toLocaleString()
                          : t('toBeScheduled')}
                      </div>
                      <div className="text-muted">
                        {t('appliedOn')}: {new Date(application.applicationDate).toLocaleDateString()}
                      </div>
                    </div>
                    <Button variant="outline-primary" size="sm">
                      {application.interviewDate ? t('viewDetails') : t('scheduleInterview')}
                    </Button>
                  </div>
                </ListGroup.Item>
              ))
            )}
          </ListGroup>
        </Card>
        
        <Card>
          <Card.Header>
            <h5 className="mb-0">
              <FontAwesomeIcon icon={faTimesCircle} className="me-2" />
              {t('pastApplications')}
            </h5>
          </Card.Header>
          <ListGroup variant="flush">
            {rejectedApplications.length === 0 && withdrawnApplications.length === 0 ? (
              <ListGroup.Item className="text-center py-4">
                <div className="text-muted">{t('noPastApplications')}</div>
              </ListGroup.Item>
            ) : (
              [...rejectedApplications, ...withdrawnApplications].map(application => (
                <ListGroup.Item key={application.id}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-bold">{application.jobTitle}</div>
                      <div>{application.companyName}</div>
                      <div className="text-muted">
                        {t('appliedOn')}: {new Date(application.applicationDate).toLocaleDateString()}
                      </div>
                      <Badge 
                        bg={application.status === 'rejected' ? 'danger' : 'secondary'}
                        className="mt-2"
                      >
                        {application.status === 'rejected' ? t('rejected') : t('withdrawn')}
                      </Badge>
                    </div>
                    <Button variant="outline-secondary" size="sm">
                      {t('viewDetails')}
                    </Button>
                  </div>
                </ListGroup.Item>
              ))
            )}
          </ListGroup>
        </Card>
      </div>
    );
  };
  
  /**
   * Render notifications tab
   */
  const renderNotificationsTab = () => {
    return (
      <div className="notifications">
        <Card>
          <Card.Header>
            <h5 className="mb-0">
              <FontAwesomeIcon icon={faBell} className="me-2" />
              {t('allNotifications')}
            </h5>
          </Card.Header>
          <ListGroup variant="flush">
            {notifications.length === 0 ? (
              <ListGroup.Item className="text-center py-4">
                <div className="text-muted">{t('noNotifications')}</div>
              </ListGroup.Item>
            ) : (
              notifications.map(notification => (
                <ListGroup.Item 
                  key={notification.id}
                  className={notification.read ? '' : 'bg-light'}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-bold">{notification.title}</div>
                      <div>{notification.message}</div>
                      <small className="text-muted">
                        {new Date(notification.date).toLocaleString()}
                      </small>
                    </div>
                    {!notification.read && (
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        onClick={() => handleMarkNotificationRead(notification.id)}
                      >
                        {t('markAsRead')}
                      </Button>
                    )}
                  </div>
                </ListGroup.Item>
              ))
            )}
          </ListGroup>
        </Card>
      </div>
    );
  };
  
  // Render loading state
  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <div className="mt-3">{t('loadingDashboard')}</div>
        </div>
      </Container>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          {error}
        </Alert>
        <div className="text-center mt-3">
          <Button 
            variant="primary"
            onClick={fetchDashboardData}
          >
            {t('tryAgain')}
          </Button>
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Row>
          <Col lg={3} className="mb-4">
            <Card>
              <Card.Header>
                <h5 className="mb-0">{t('dashboard')}</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="overview" className="rounded-0">
                      <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
                      {t('overview')}
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="profile" className="rounded-0">
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      {t('profile')}
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="jobs" className="rounded-0">
                      <FontAwesomeIcon icon={faSearch} className="me-2" />
                      {t('matchingJobs')}
                      {matchingJobs.length > 0 && (
                        <Badge bg="primary" pill className="ms-2">
                          {matchingJobs.length}
                        </Badge>
                      )}
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="applications" className="rounded-0">
                      <FontAwesomeIcon icon={faBriefcase} className="me-2" />
                      {t('applications')}
                      {applications.filter(app => app.status === 'interview').length > 0 && (
                        <Badge bg="danger" pill className="ms-2">
                          {applications.filter(app => app.status === 'interview').length}
                        </Badge>
                      )}
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="notifications" className="rounded-0">
                      <FontAwesomeIcon icon={faBell} className="me-2" />
                      {t('notifications')}
                      {notifications.filter(n => !n.read).length > 0 && (
                        <Badge bg="danger" pill className="ms-2">
                          {notifications.filter(n => !n.read).length}
                        </Badge>
                      )}
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={9}>
            <Tab.Content>
              <Tab.Pane eventKey="overview">
                {renderOverviewTab()}
              </Tab.Pane>
              <Tab.Pane eventKey="profile">
                {renderProfileTab()}
              </Tab.Pane>
              <Tab.Pane eventKey="jobs">
                {renderJobsTab()}
              </Tab.Pane>
              <Tab.Pane eventKey="applications">
                {renderApplicationsTab()}
              </Tab.Pane>
              <Tab.Pane eventKey="notifications">
                {renderNotificationsTab()}
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default ApplicantDashboard;
