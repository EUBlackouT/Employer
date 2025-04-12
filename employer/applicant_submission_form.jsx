import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Tabs, Tab, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { 
  faUser, faBriefcase, faGraduationCap, faTools, 
  faCertificate, faMapMarkerAlt, faEnvelope, faPhone,
  faUpload, faSave, faSpinner, faCheck, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

// Import LinkedIn profile import component
import LinkedInProfileImport from './LinkedInProfileImport';

// Import profile synchronization service
import ProfileSyncService from '../services/ProfileSyncService';

// Import API service
import ApiService from '../services/ApiService';

// Import translation function
import { useTranslation } from 'react-i18next';

/**
 * Applicant Submission Form Component
 * Allows applicants to submit their information either via LinkedIn or manual entry
 */
const ApplicantSubmissionForm = ({ userId }) => {
  const { t } = useTranslation();
  
  // Form state
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    basicProfile: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      headline: '',
      summary: '',
      location: '',
      website: '',
      profilePictureUrl: ''
    },
    workExperience: [],
    education: [],
    skills: [],
    certifications: [],
    preferences: {
      jobTypes: [],
      locations: [],
      remoteWork: false,
      salaryExpectation: '',
      availability: '',
      willingToRelocate: false
    }
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [profileSource, setProfileSource] = useState('manual');
  const [showLinkedInSection, setShowLinkedInSection] = useState(true);
  
  // Load existing profile data if available
  useEffect(() => {
    if (userId) {
      loadProfileData();
    }
  }, [userId]);
  
  // Calculate profile completion percentage
  useEffect(() => {
    const completion = ProfileSyncService.calculateProfileCompletion(formData);
    setProfileCompletion(completion);
  }, [formData]);
  
  /**
   * Load profile data from backend
   */
  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      const profileData = await ProfileSyncService.getProfileData(userId);
      
      if (profileData) {
        setFormData(profileData);
        setProfileSource(profileData.source || 'manual');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading profile data:', error);
      setError(t('errorLoadingProfile'));
      setLoading(false);
    }
  };
  
  /**
   * Handle LinkedIn profile import
   */
  const handleProfileImported = async () => {
    await loadProfileData();
    setShowLinkedInSection(false);
    setSuccess(t('profileImportedSuccessfully'));
  };
  
  /**
   * Handle form field changes
   */
  const handleInputChange = (section, field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [field]: value
      }
    }));
    
    // Clear field error if exists
    if (formErrors[`${section}.${field}`]) {
      setFormErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  };
  
  /**
   * Add a new work experience entry
   */
  const addWorkExperience = () => {
    setFormData(prevData => ({
      ...prevData,
      workExperience: [
        ...prevData.workExperience,
        {
          company: '',
          title: '',
          location: '',
          startDate: '',
          endDate: '',
          isCurrent: false,
          description: '',
          source: 'manual'
        }
      ]
    }));
  };
  
  /**
   * Update work experience entry
   */
  const updateWorkExperience = (index, field, value) => {
    setFormData(prevData => {
      const updatedExperience = [...prevData.workExperience];
      updatedExperience[index] = {
        ...updatedExperience[index],
        [field]: value
      };
      
      // If setting current job, clear end date
      if (field === 'isCurrent' && value === true) {
        updatedExperience[index].endDate = '';
      }
      
      return {
        ...prevData,
        workExperience: updatedExperience
      };
    });
    
    // Clear field error if exists
    if (formErrors[`workExperience.${index}.${field}`]) {
      setFormErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[`workExperience.${index}.${field}`];
        return newErrors;
      });
    }
  };
  
  /**
   * Remove work experience entry
   */
  const removeWorkExperience = (index) => {
    setFormData(prevData => {
      const updatedExperience = [...prevData.workExperience];
      updatedExperience.splice(index, 1);
      return {
        ...prevData,
        workExperience: updatedExperience
      };
    });
    
    // Remove any errors for this entry
    setFormErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`workExperience.${index}.`)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };
  
  /**
   * Add a new education entry
   */
  const addEducation = () => {
    setFormData(prevData => ({
      ...prevData,
      education: [
        ...prevData.education,
        {
          institution: '',
          degree: '',
          fieldOfStudy: '',
          startDate: '',
          endDate: '',
          isCurrent: false,
          description: '',
          source: 'manual'
        }
      ]
    }));
  };
  
  /**
   * Update education entry
   */
  const updateEducation = (index, field, value) => {
    setFormData(prevData => {
      const updatedEducation = [...prevData.education];
      updatedEducation[index] = {
        ...updatedEducation[index],
        [field]: value
      };
      
      // If setting current education, clear end date
      if (field === 'isCurrent' && value === true) {
        updatedEducation[index].endDate = '';
      }
      
      return {
        ...prevData,
        education: updatedEducation
      };
    });
    
    // Clear field error if exists
    if (formErrors[`education.${index}.${field}`]) {
      setFormErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[`education.${index}.${field}`];
        return newErrors;
      });
    }
  };
  
  /**
   * Remove education entry
   */
  const removeEducation = (index) => {
    setFormData(prevData => {
      const updatedEducation = [...prevData.education];
      updatedEducation.splice(index, 1);
      return {
        ...prevData,
        education: updatedEducation
      };
    });
    
    // Remove any errors for this entry
    setFormErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`education.${index}.`)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };
  
  /**
   * Add a new skill
   */
  const addSkill = (skillName, proficiency = 'Intermediate') => {
    // Check if skill already exists
    const skillExists = formData.skills.some(
      skill => skill.name.toLowerCase() === skillName.toLowerCase()
    );
    
    if (skillExists || !skillName.trim()) {
      return;
    }
    
    setFormData(prevData => ({
      ...prevData,
      skills: [
        ...prevData.skills,
        {
          name: skillName.trim(),
          proficiency,
          source: 'manual'
        }
      ]
    }));
  };
  
  /**
   * Remove skill
   */
  const removeSkill = (index) => {
    setFormData(prevData => {
      const updatedSkills = [...prevData.skills];
      updatedSkills.splice(index, 1);
      return {
        ...prevData,
        skills: updatedSkills
      };
    });
  };
  
  /**
   * Add a new certification
   */
  const addCertification = () => {
    setFormData(prevData => ({
      ...prevData,
      certifications: [
        ...prevData.certifications,
        {
          name: '',
          issuingOrganization: '',
          issueDate: '',
          expirationDate: '',
          credentialId: '',
          source: 'manual'
        }
      ]
    }));
  };
  
  /**
   * Update certification entry
   */
  const updateCertification = (index, field, value) => {
    setFormData(prevData => {
      const updatedCertifications = [...prevData.certifications];
      updatedCertifications[index] = {
        ...updatedCertifications[index],
        [field]: value
      };
      
      return {
        ...prevData,
        certifications: updatedCertifications
      };
    });
    
    // Clear field error if exists
    if (formErrors[`certifications.${index}.${field}`]) {
      setFormErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[`certifications.${index}.${field}`];
        return newErrors;
      });
    }
  };
  
  /**
   * Remove certification entry
   */
  const removeCertification = (index) => {
    setFormData(prevData => {
      const updatedCertifications = [...prevData.certifications];
      updatedCertifications.splice(index, 1);
      return {
        ...prevData,
        certifications: updatedCertifications
      };
    });
    
    // Remove any errors for this entry
    setFormErrors(prevErrors => {
      const newErrors = { ...prevErrors };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`certifications.${index}.`)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };
  
  /**
   * Update job preferences
   */
  const updatePreference = (field, value) => {
    setFormData(prevData => ({
      ...prevData,
      preferences: {
        ...prevData.preferences,
        [field]: value
      }
    }));
  };
  
  /**
   * Validate form data
   */
  const validateForm = () => {
    const errors = {};
    
    // Validate basic profile
    if (!formData.basicProfile.firstName) {
      errors['basicProfile.firstName'] = t('firstNameRequired');
    }
    
    if (!formData.basicProfile.lastName) {
      errors['basicProfile.lastName'] = t('lastNameRequired');
    }
    
    if (!formData.basicProfile.email) {
      errors['basicProfile.email'] = t('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.basicProfile.email)) {
      errors['basicProfile.email'] = t('invalidEmail');
    }
    
    if (formData.basicProfile.phone && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(formData.basicProfile.phone)) {
      errors['basicProfile.phone'] = t('invalidPhone');
    }
    
    // Validate work experience
    formData.workExperience.forEach((exp, index) => {
      if (!exp.company) {
        errors[`workExperience.${index}.company`] = t('companyRequired');
      }
      
      if (!exp.title) {
        errors[`workExperience.${index}.title`] = t('titleRequired');
      }
      
      if (!exp.startDate) {
        errors[`workExperience.${index}.startDate`] = t('startDateRequired');
      }
      
      if (!exp.isCurrent && !exp.endDate) {
        errors[`workExperience.${index}.endDate`] = t('endDateRequired');
      }
    });
    
    // Validate education
    formData.education.forEach((edu, index) => {
      if (!edu.institution) {
        errors[`education.${index}.institution`] = t('institutionRequired');
      }
      
      if (!edu.startDate) {
        errors[`education.${index}.startDate`] = t('startDateRequired');
      }
      
      if (!edu.isCurrent && !edu.endDate) {
        errors[`education.${index}.endDate`] = t('endDateRequired');
      }
    });
    
    // Validate certifications
    formData.certifications.forEach((cert, index) => {
      if (!cert.name) {
        errors[`certifications.${index}.name`] = t('certificationNameRequired');
      }
      
      if (!cert.issuingOrganization) {
        errors[`certifications.${index}.issuingOrganization`] = t('issuingOrganizationRequired');
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  /**
   * Submit form data
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError(t('pleaseFixFormErrors'));
      
      // Find the first tab with errors and switch to it
      const errorKeys = Object.keys(formErrors);
      if (errorKeys.length > 0) {
        const firstError = errorKeys[0];
        
        if (firstError.startsWith('basicProfile.')) {
          setActiveTab('basic');
        } else if (firstError.startsWith('workExperience.')) {
          setActiveTab('experience');
        } else if (firstError.startsWith('education.')) {
          setActiveTab('education');
        } else if (firstError.startsWith('skills.')) {
          setActiveTab('skills');
        } else if (firstError.startsWith('certifications.')) {
          setActiveTab('certifications');
        } else if (firstError.startsWith('preferences.')) {
          setActiveTab('preferences');
        }
      }
      
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Save profile data
      await ProfileSyncService.saveProfileData(userId, formData);
      
      setLoading(false);
      setSuccess(t('profileSavedSuccessfully'));
      
      // Scroll to top to show success message
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError(t('errorSavingProfile'));
      setLoading(false);
    }
  };
  
  /**
   * Render LinkedIn import section
   */
  const renderLinkedInSection = () => {
    if (!showLinkedInSection) return null;
    
    return (
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faLinkedin} className="me-2" />
            {t('importFromLinkedIn')}
          </h5>
        </Card.Header>
        <Card.Body>
          <p>{t('quicklyCreateProfileWithLinkedIn')}</p>
          
          <LinkedInProfileImport 
            userId={userId} 
            onProfileImported={handleProfileImported} 
          />
          
          <div className="mt-3 text-center">
            <Button 
              variant="link" 
              onClick={() => setShowLinkedInSection(false)}
            >
              {t('preferToEnterManually')}
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };
  
  /**
   * Render profile completion indicator
   */
  const renderProfileCompletion = () => {
    let variant = 'danger';
    
    if (profileCompletion >= 70) {
      variant = 'success';
    } else if (profileCompletion >= 40) {
      variant = 'warning';
    }
    
    return (
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">{t('profileCompletion')}</h5>
        </Card.Header>
        <Card.Body>
          <div className="d-flex align-items-center">
            <div className="progress flex-grow-1 me-3" style={{ height: '25px' }}>
              <div 
                className={`progress-bar bg-${variant}`} 
                role="progressbar" 
                style={{ width: `${profileCompletion}%` }}
                aria-valuenow={profileCompletion} 
                aria-valuemin="0" 
                aria-valuemax="100"
              >
                {profileCompletion}%
              </div>
            </div>
            {profileCompletion === 100 && (
              <FontAwesomeIcon icon={faCheck} className="text-success fs-4" />
            )}
          </div>
          
          <div className="mt-3 small">
            {profileCompletion < 40 && (
              <Alert variant="danger">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                {t('profileIncomplete')}
              </Alert>
            )}
            
            {profileCompletion >= 40 && profileCompletion < 70 && (
              <Alert variant="warning">
                {t('profilePartiallyComplete')}
              </Alert>
            )}
            
            {profileCompletion >= 70 && profileCompletion < 100 && (
              <Alert variant="info">
                {t('profileMostlyComplete')}
              </Alert>
            )}
            
            {profileCompletion === 100 && (
              <Alert variant="success">
                <FontAwesomeIcon icon={faCheck} className="me-2" />
                {t('profileComplete')}
              </Alert>
            )}
          </div>
        </Card.Body>
      </Card>
    );
  };
  
  /**
   * Render basic profile form
   */
  const renderBasicProfileForm = () => {
    return (
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faUser} className="me-2" />
            {t('basicInformation')}
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('firstName')} *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.basicProfile.firstName}
                  onChange={(e) => handleInputChange('basicProfile', 'firstName', e.target.value)}
                  isInvalid={!!formErrors['basicProfile.firstName']}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors['basicProfile.firstName']}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('lastName')} *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.basicProfile.lastName}
                  onChange={(e) => handleInputChange('basicProfile', 'lastName', e.target.value)}
                  isInvalid={!!formErrors['basicProfile.lastName']}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors['basicProfile.lastName']}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('email')} *</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.basicProfile.email}
                  onChange={(e) => handleInputChange('basicProfile', 'email', e.target.value)}
                  isInvalid={!!formErrors['basicProfile.email']}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors['basicProfile.email']}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('phone')}</Form.Label>
                <Form.Control
                  type="tel"
                  value={formData.basicProfile.phone}
                  onChange={(e) => handleInputChange('basicProfile', 'phone', e.target.value)}
                  isInvalid={!!formErrors['basicProfile.phone']}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors['basicProfile.phone']}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>{t('professionalHeadline')}</Form.Label>
            <Form.Control
              type="text"
              value={formData.basicProfile.headline}
              onChange={(e) => handleInputChange('basicProfile', 'headline', e.target.value)}
              placeholder={t('headlinePlaceholder')}
            />
            <Form.Text className="text-muted">
              {t('headlineHelp')}
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>{t('location')}</Form.Label>
            <Form.Control
              type="text"
              value={formData.basicProfile.location}
              onChange={(e) => handleInputChange('basicProfile', 'location', e.target.value)}
              placeholder={t('locationPlaceholder')}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>{t('website')}</Form.Label>
            <Form.Control
              type="url"
              value={formData.basicProfile.website}
              onChange={(e) => handleInputChange('basicProfile', 'website', e.target.value)}
              placeholder={t('websitePlaceholder')}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>{t('professionalSummary')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={formData.basicProfile.summary}
              onChange={(e) => handleInputChange('basicProfile', 'summary', e.target.value)}
              placeholder={t('summaryPlaceholder')}
            />
            <Form.Text className="text-muted">
              {t('summaryHelp')}
            </Form.Text>
          </Form.Group>
        </Card.Body>
      </Card>
    );
  };
  
  /**
   * Render work experience form
   */
  const renderWorkExperienceForm = () => {
    return (
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faBriefcase} className="me-2" />
            {t('workExperience')}
          </h5>
        </Card.Header>
        <Card.Body>
          {formData.workExperience.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">{t('noWorkExperienceAdded')}</p>
            </div>
          ) : (
            formData.workExperience.map((experience, index) => (
              <div 
                key={index} 
                className={index > 0 ? "mt-4 pt-4 border-top" : ""}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">{t('experienceEntry')} #{index + 1}</h6>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => removeWorkExperience(index)}
                  >
                    {t('remove')}
                  </Button>
                </div>
                
                {experience.source === 'linkedin' && (
                  <Badge bg="linkedin" className="mb-3">
                    <FontAwesomeIcon icon={faLinkedin} className="me-1" />
                    {t('importedFromLinkedIn')}
                  </Badge>
                )}
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('company')} *</Form.Label>
                      <Form.Control
                        type="text"
                        value={experience.company}
                        onChange={(e) => updateWorkExperience(index, 'company', e.target.value)}
                        isInvalid={!!formErrors[`workExperience.${index}.company`]}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors[`workExperience.${index}.company`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('jobTitle')} *</Form.Label>
                      <Form.Control
                        type="text"
                        value={experience.title}
                        onChange={(e) => updateWorkExperience(index, 'title', e.target.value)}
                        isInvalid={!!formErrors[`workExperience.${index}.title`]}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors[`workExperience.${index}.title`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>{t('location')}</Form.Label>
                  <Form.Control
                    type="text"
                    value={experience.location}
                    onChange={(e) => updateWorkExperience(index, 'location', e.target.value)}
                  />
                </Form.Group>
                
                <Row>
                  <Col md={5}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('startDate')} *</Form.Label>
                      <Form.Control
                        type="month"
                        value={experience.startDate}
                        onChange={(e) => updateWorkExperience(index, 'startDate', e.target.value)}
                        isInvalid={!!formErrors[`workExperience.${index}.startDate`]}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors[`workExperience.${index}.startDate`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={5}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('endDate')} *</Form.Label>
                      <Form.Control
                        type="month"
                        value={experience.endDate}
                        onChange={(e) => updateWorkExperience(index, 'endDate', e.target.value)}
                        disabled={experience.isCurrent}
                        isInvalid={!!formErrors[`workExperience.${index}.endDate`]}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors[`workExperience.${index}.endDate`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group className="mb-3 d-flex align-items-end h-100">
                      <Form.Check
                        type="checkbox"
                        id={`current-job-${index}`}
                        label={t('currentJob')}
                        checked={experience.isCurrent}
                        onChange={(e) => updateWorkExperience(index, 'isCurrent', e.target.checked)}
                        className="mb-2"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>{t('description')}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={experience.description}
                    onChange={(e) => updateWorkExperience(index, 'description', e.target.value)}
                    placeholder={t('jobDescriptionPlaceholder')}
                  />
                </Form.Group>
              </div>
            ))
          )}
          
          <div className="mt-3">
            <Button 
              variant="outline-primary" 
              onClick={addWorkExperience}
            >
              {t('addWorkExperience')}
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };
  
  /**
   * Render education form
   */
  const renderEducationForm = () => {
    return (
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
            {t('education')}
          </h5>
        </Card.Header>
        <Card.Body>
          {formData.education.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">{t('noEducationAdded')}</p>
            </div>
          ) : (
            formData.education.map((education, index) => (
              <div 
                key={index} 
                className={index > 0 ? "mt-4 pt-4 border-top" : ""}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">{t('educationEntry')} #{index + 1}</h6>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => removeEducation(index)}
                  >
                    {t('remove')}
                  </Button>
                </div>
                
                {education.source === 'linkedin' && (
                  <Badge bg="linkedin" className="mb-3">
                    <FontAwesomeIcon icon={faLinkedin} className="me-1" />
                    {t('importedFromLinkedIn')}
                  </Badge>
                )}
                
                <Form.Group className="mb-3">
                  <Form.Label>{t('institution')} *</Form.Label>
                  <Form.Control
                    type="text"
                    value={education.institution}
                    onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    isInvalid={!!formErrors[`education.${index}.institution`]}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors[`education.${index}.institution`]}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('degree')}</Form.Label>
                      <Form.Control
                        type="text"
                        value={education.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('fieldOfStudy')}</Form.Label>
                      <Form.Control
                        type="text"
                        value={education.fieldOfStudy}
                        onChange={(e) => updateEducation(index, 'fieldOfStudy', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={5}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('startDate')} *</Form.Label>
                      <Form.Control
                        type="month"
                        value={education.startDate}
                        onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                        isInvalid={!!formErrors[`education.${index}.startDate`]}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors[`education.${index}.startDate`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={5}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('endDate')} *</Form.Label>
                      <Form.Control
                        type="month"
                        value={education.endDate}
                        onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                        disabled={education.isCurrent}
                        isInvalid={!!formErrors[`education.${index}.endDate`]}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors[`education.${index}.endDate`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group className="mb-3 d-flex align-items-end h-100">
                      <Form.Check
                        type="checkbox"
                        id={`current-education-${index}`}
                        label={t('current')}
                        checked={education.isCurrent}
                        onChange={(e) => updateEducation(index, 'isCurrent', e.target.checked)}
                        className="mb-2"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>{t('description')}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={education.description}
                    onChange={(e) => updateEducation(index, 'description', e.target.value)}
                    placeholder={t('educationDescriptionPlaceholder')}
                  />
                </Form.Group>
              </div>
            ))
          )}
          
          <div className="mt-3">
            <Button 
              variant="outline-primary" 
              onClick={addEducation}
            >
              {t('addEducation')}
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };
  
  /**
   * Render skills form
   */
  const renderSkillsForm = () => {
    const [newSkill, setNewSkill] = useState('');
    const [skillProficiency, setSkillProficiency] = useState('Intermediate');
    
    const handleAddSkill = () => {
      if (newSkill.trim()) {
        addSkill(newSkill, skillProficiency);
        setNewSkill('');
      }
    };
    
    return (
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faTools} className="me-2" />
            {t('skills')}
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="mb-4">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('addSkill')}</Form.Label>
                  <Form.Control
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder={t('skillPlaceholder')}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('proficiency')}</Form.Label>
                  <Form.Select
                    value={skillProficiency}
                    onChange={(e) => setSkillProficiency(e.target.value)}
                  >
                    <option value="Beginner">{t('beginner')}</option>
                    <option value="Intermediate">{t('intermediate')}</option>
                    <option value="Advanced">{t('advanced')}</option>
                    <option value="Expert">{t('expert')}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button 
                  variant="outline-primary" 
                  className="mb-3 w-100"
                  onClick={handleAddSkill}
                >
                  {t('add')}
                </Button>
              </Col>
            </Row>
          </div>
          
          <div>
            <h6>{t('yourSkills')}</h6>
            
            {formData.skills.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">{t('noSkillsAdded')}</p>
              </div>
            ) : (
              <div className="d-flex flex-wrap">
                {formData.skills.map((skill, index) => (
                  <Badge 
                    bg={skill.source === 'linkedin' ? 'linkedin' : 'light'} 
                    text={skill.source === 'linkedin' ? 'white' : 'dark'} 
                    className="me-2 mb-2 p-2 skill-badge" 
                    key={index}
                  >
                    {skill.name}
                    {skill.proficiency && (
                      <span className="ms-1 text-muted">({skill.proficiency})</span>
                    )}
                    <Button 
                      variant="link" 
                      className="p-0 ms-2 text-danger" 
                      onClick={() => removeSkill(index)}
                    >
                      &times;
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    );
  };
  
  /**
   * Render certifications form
   */
  const renderCertificationsForm = () => {
    return (
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faCertificate} className="me-2" />
            {t('certifications')}
          </h5>
        </Card.Header>
        <Card.Body>
          {formData.certifications.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">{t('noCertificationsAdded')}</p>
            </div>
          ) : (
            formData.certifications.map((certification, index) => (
              <div 
                key={index} 
                className={index > 0 ? "mt-4 pt-4 border-top" : ""}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">{t('certificationEntry')} #{index + 1}</h6>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => removeCertification(index)}
                  >
                    {t('remove')}
                  </Button>
                </div>
                
                {certification.source === 'linkedin' && (
                  <Badge bg="linkedin" className="mb-3">
                    <FontAwesomeIcon icon={faLinkedin} className="me-1" />
                    {t('importedFromLinkedIn')}
                  </Badge>
                )}
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('certificationName')} *</Form.Label>
                      <Form.Control
                        type="text"
                        value={certification.name}
                        onChange={(e) => updateCertification(index, 'name', e.target.value)}
                        isInvalid={!!formErrors[`certifications.${index}.name`]}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors[`certifications.${index}.name`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('issuingOrganization')} *</Form.Label>
                      <Form.Control
                        type="text"
                        value={certification.issuingOrganization}
                        onChange={(e) => updateCertification(index, 'issuingOrganization', e.target.value)}
                        isInvalid={!!formErrors[`certifications.${index}.issuingOrganization`]}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors[`certifications.${index}.issuingOrganization`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('issueDate')}</Form.Label>
                      <Form.Control
                        type="month"
                        value={certification.issueDate}
                        onChange={(e) => updateCertification(index, 'issueDate', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('expirationDate')}</Form.Label>
                      <Form.Control
                        type="month"
                        value={certification.expirationDate}
                        onChange={(e) => updateCertification(index, 'expirationDate', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>{t('credentialId')}</Form.Label>
                  <Form.Control
                    type="text"
                    value={certification.credentialId}
                    onChange={(e) => updateCertification(index, 'credentialId', e.target.value)}
                  />
                </Form.Group>
              </div>
            ))
          )}
          
          <div className="mt-3">
            <Button 
              variant="outline-primary" 
              onClick={addCertification}
            >
              {t('addCertification')}
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };
  
  /**
   * Render job preferences form
   */
  const renderPreferencesForm = () => {
    return (
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            {t('jobPreferences')}
          </h5>
        </Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>{t('jobTypes')}</Form.Label>
            <div>
              {['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'].map((type) => (
                <Form.Check
                  key={type}
                  inline
                  type="checkbox"
                  id={`job-type-${type}`}
                  label={t(type.toLowerCase().replace('-', ''))}
                  checked={formData.preferences.jobTypes.includes(type)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updatePreference('jobTypes', [...formData.preferences.jobTypes, type]);
                    } else {
                      updatePreference('jobTypes', formData.preferences.jobTypes.filter(t => t !== type));
                    }
                  }}
                />
              ))}
            </div>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>{t('preferredLocations')}</Form.Label>
            <Form.Control
              type="text"
              value={formData.preferences.locations.join(', ')}
              onChange={(e) => updatePreference('locations', e.target.value.split(',').map(loc => loc.trim()).filter(loc => loc))}
              placeholder={t('locationsPlaceholder')}
            />
            <Form.Text className="text-muted">
              {t('separateLocationsWithCommas')}
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="remote-work"
              label={t('openToRemoteWork')}
              checked={formData.preferences.remoteWork}
              onChange={(e) => updatePreference('remoteWork', e.target.checked)}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="willing-to-relocate"
              label={t('willingToRelocate')}
              checked={formData.preferences.willingToRelocate}
              onChange={(e) => updatePreference('willingToRelocate', e.target.checked)}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>{t('salaryExpectation')}</Form.Label>
            <Form.Control
              type="text"
              value={formData.preferences.salaryExpectation}
              onChange={(e) => updatePreference('salaryExpectation', e.target.value)}
              placeholder={t('salaryPlaceholder')}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>{t('availability')}</Form.Label>
            <Form.Select
              value={formData.preferences.availability}
              onChange={(e) => updatePreference('availability', e.target.value)}
            >
              <option value="">{t('selectAvailability')}</option>
              <option value="immediately">{t('immediately')}</option>
              <option value="2weeks">{t('twoWeeks')}</option>
              <option value="1month">{t('oneMonth')}</option>
              <option value="3months">{t('threeMonths')}</option>
            </Form.Select>
          </Form.Group>
        </Card.Body>
      </Card>
    );
  };
  
  return (
    <Container className="py-4">
      <h2 className="mb-4">{t('applicantProfile')}</h2>
      
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
      
      <Row>
        <Col lg={8}>
          {/* LinkedIn import section */}
          {renderLinkedInSection()}
          
          {/* Form tabs */}
          <Form onSubmit={handleSubmit}>
            <Tabs
              activeKey={activeTab}
              onSelect={(key) => setActiveTab(key)}
              className="mb-4"
            >
              <Tab eventKey="basic" title={<span><FontAwesomeIcon icon={faUser} className="me-2" />{t('basic')}</span>}>
                {renderBasicProfileForm()}
              </Tab>
              <Tab eventKey="experience" title={<span><FontAwesomeIcon icon={faBriefcase} className="me-2" />{t('experience')}</span>}>
                {renderWorkExperienceForm()}
              </Tab>
              <Tab eventKey="education" title={<span><FontAwesomeIcon icon={faGraduationCap} className="me-2" />{t('education')}</span>}>
                {renderEducationForm()}
              </Tab>
              <Tab eventKey="skills" title={<span><FontAwesomeIcon icon={faTools} className="me-2" />{t('skills')}</span>}>
                {renderSkillsForm()}
              </Tab>
              <Tab eventKey="certifications" title={<span><FontAwesomeIcon icon={faCertificate} className="me-2" />{t('certifications')}</span>}>
                {renderCertificationsForm()}
              </Tab>
              <Tab eventKey="preferences" title={<span>{t('preferences')}</span>}>
                {renderPreferencesForm()}
              </Tab>
            </Tabs>
            
            <div className="d-flex justify-content-end mt-4">
              <Button 
                variant="primary" 
                type="submit" 
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                    {t('saving')}
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faSave} className="me-2" />
                    {t('saveProfile')}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Col>
        
        <Col lg={4}>
          {/* Profile completion */}
          {renderProfileCompletion()}
          
          {/* Data source info */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">{t('dataSource')}</h5>
            </Card.Header>
            <Card.Body>
              <p>
                {profileSource === 'linkedin' ? (
                  <>
                    <FontAwesomeIcon icon={faLinkedin} className="me-2 text-linkedin" />
                    {t('profileImportedFromLinkedIn')}
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    {t('manuallyEnteredProfile')}
                  </>
                )}
              </p>
              
              {profileSource === 'linkedin' && (
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setShowLinkedInSection(true)}
                >
                  <FontAwesomeIcon icon={faSync} className="me-2" />
                  {t('updateFromLinkedIn')}
                </Button>
              )}
              
              {profileSource === 'manual' && (
                <Button 
                  variant="outline-linkedin" 
                  size="sm"
                  onClick={() => setShowLinkedInSection(true)}
                >
                  <FontAwesomeIcon icon={faLinkedin} className="me-2" />
                  {t('importFromLinkedIn')}
                </Button>
              )}
            </Card.Body>
          </Card>
          
          {/* Resume upload card */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">{t('resumeUpload')}</h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">
                {t('resumeUploadDescription')}
              </p>
              
              <Button 
                variant="outline-primary" 
                className="w-100"
              >
                <FontAwesomeIcon icon={faUpload} className="me-2" />
                {t('uploadResume')}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ApplicantSubmissionForm;
