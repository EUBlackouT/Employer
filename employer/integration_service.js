// Integration Service
// This service handles the integration between the applicant portal and recruiter system

import axios from 'axios';

/**
 * Service for handling integration between applicant portal and recruiter system
 */
class IntegrationService {
  /**
   * Initialize the service with API base URLs
   * @param {string} applicantBaseUrl - Applicant API base URL
   * @param {string} recruiterBaseUrl - Recruiter API base URL
   */
  constructor(applicantBaseUrl = '/api/applicants', recruiterBaseUrl = '/api/recruiters') {
    this.applicantBaseUrl = applicantBaseUrl;
    this.recruiterBaseUrl = recruiterBaseUrl;
    
    this.applicantAxios = axios.create({
      baseURL: applicantBaseUrl,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    this.recruiterAxios = axios.create({
      baseURL: recruiterBaseUrl,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Set authentication token for API requests
   * @param {string} token - Authentication token
   * @param {string} userType - User type (applicant or recruiter)
   */
  setAuthToken(token, userType = 'both') {
    if (token) {
      if (userType === 'both' || userType === 'applicant') {
        this.applicantAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      if (userType === 'both' || userType === 'recruiter') {
        this.recruiterAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } else {
      if (userType === 'both' || userType === 'applicant') {
        delete this.applicantAxios.defaults.headers.common['Authorization'];
      }
      if (userType === 'both' || userType === 'recruiter') {
        delete this.recruiterAxios.defaults.headers.common['Authorization'];
      }
    }
  }

  /**
   * Sync applicant profile to recruiter system
   * @param {string} applicantId - Applicant ID
   * @returns {Promise<Object>} - Sync result
   */
  async syncApplicantToRecruiter(applicantId) {
    try {
      // Get applicant profile
      const profileResponse = await this.applicantAxios.get(`/${applicantId}/profile`);
      const profile = profileResponse.data;
      
      // Transform profile to recruiter format
      const recruiterApplicant = this.transformProfileToRecruiterFormat(profile);
      
      // Check if applicant already exists in recruiter system
      try {
        await this.recruiterAxios.get(`/applicants/${applicantId}`);
        // Applicant exists, update
        const updateResponse = await this.recruiterAxios.put(`/applicants/${applicantId}`, recruiterApplicant);
        return {
          success: true,
          action: 'updated',
          data: updateResponse.data
        };
      } catch (error) {
        // Applicant doesn't exist, create
        const createResponse = await this.recruiterAxios.post('/applicants', {
          ...recruiterApplicant,
          id: applicantId
        });
        return {
          success: true,
          action: 'created',
          data: createResponse.data
        };
      }
    } catch (error) {
      console.error('Error syncing applicant to recruiter system:', error);
      throw error;
    }
  }

  /**
   * Transform applicant profile to recruiter format
   * @param {Object} profile - Applicant profile
   * @returns {Object} - Transformed profile in recruiter format
   */
  transformProfileToRecruiterFormat(profile) {
    // Extract basic information
    const basicInfo = {
      firstName: profile.basicProfile.firstName,
      lastName: profile.basicProfile.lastName,
      email: profile.basicProfile.email,
      phone: profile.basicProfile.phone,
      location: profile.basicProfile.location,
      headline: profile.basicProfile.headline,
      summary: profile.basicProfile.summary
    };
    
    // Extract skills
    const skills = profile.skills.map(skill => skill.name);
    
    // Extract education
    const education = profile.education.map(edu => ({
      institution: edu.institution,
      degree: edu.degree,
      fieldOfStudy: edu.fieldOfStudy,
      startDate: edu.startDate,
      endDate: edu.endDate,
      isCurrent: edu.isCurrent
    }));
    
    // Extract experience
    const experience = profile.workExperience.map(job => ({
      company: job.company,
      title: job.title,
      location: job.location,
      startDate: job.startDate,
      endDate: job.endDate,
      isCurrent: job.isCurrent,
      description: job.description
    }));
    
    // Extract certifications
    const certifications = profile.certifications ? profile.certifications.map(cert => cert.name) : [];
    
    // Extract preferences
    const preferences = {
      jobTypes: profile.preferences?.jobTypes || [],
      locations: profile.preferences?.locations || [],
      remoteWork: profile.preferences?.remoteWork || false,
      salaryExpectation: profile.preferences?.salaryExpectation || '',
      availability: profile.preferences?.availability || '',
      willingToRelocate: profile.preferences?.willingToRelocate || false
    };
    
    // Return transformed profile
    return {
      ...basicInfo,
      skills,
      education,
      experience,
      certifications,
      preferences,
      source: profile.source || 'applicant_portal',
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Sync job from recruiter system to applicant portal
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} - Sync result
   */
  async syncJobToApplicantPortal(jobId) {
    try {
      // Get job from recruiter system
      const jobResponse = await this.recruiterAxios.get(`/jobs/${jobId}`);
      const job = jobResponse.data;
      
      // Transform job to applicant portal format
      const applicantJob = this.transformJobToApplicantFormat(job);
      
      // Check if job already exists in applicant portal
      try {
        await this.applicantAxios.get(`/jobs/${jobId}`);
        // Job exists, update
        const updateResponse = await this.applicantAxios.put(`/jobs/${jobId}`, applicantJob);
        return {
          success: true,
          action: 'updated',
          data: updateResponse.data
        };
      } catch (error) {
        // Job doesn't exist, create
        const createResponse = await this.applicantAxios.post('/jobs', {
          ...applicantJob,
          id: jobId
        });
        return {
          success: true,
          action: 'created',
          data: createResponse.data
        };
      }
    } catch (error) {
      console.error('Error syncing job to applicant portal:', error);
      throw error;
    }
  }

  /**
   * Transform job from recruiter format to applicant portal format
   * @param {Object} job - Job in recruiter format
   * @returns {Object} - Transformed job in applicant portal format
   */
  transformJobToApplicantFormat(job) {
    return {
      title: job.title,
      company: job.company,
      location: job.location,
      jobType: job.jobType,
      remote: job.remote || false,
      salary: job.salary || '',
      description: job.description || '',
      requiredSkills: job.requiredSkills || [],
      preferredSkills: job.preferredSkills || [],
      experience: {
        minYears: job.minYearsExperience || 0,
        preferred: job.preferredYearsExperience || 0
      },
      education: {
        degree: job.requiredDegree || '',
        fieldOfStudy: job.requiredFieldOfStudy || ''
      },
      postDate: job.postDate || new Date().toISOString(),
      expiryDate: job.expiryDate || '',
      status: job.status || 'active',
      recruiterId: job.recruiterId || '',
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Sync application from applicant portal to recruiter system
   * @param {string} applicationId - Application ID
   * @returns {Promise<Object>} - Sync result
   */
  async syncApplicationToRecruiter(applicationId) {
    try {
      // Get application from applicant portal
      const applicationResponse = await this.applicantAxios.get(`/applications/${applicationId}`);
      const application = applicationResponse.data;
      
      // Transform application to recruiter format
      const recruiterApplication = this.transformApplicationToRecruiterFormat(application);
      
      // Check if application already exists in recruiter system
      try {
        await this.recruiterAxios.get(`/applications/${applicationId}`);
        // Application exists, update
        const updateResponse = await this.recruiterAxios.put(`/applications/${applicationId}`, recruiterApplication);
        return {
          success: true,
          action: 'updated',
          data: updateResponse.data
        };
      } catch (error) {
        // Application doesn't exist, create
        const createResponse = await this.recruiterAxios.post('/applications', {
          ...recruiterApplication,
          id: applicationId
        });
        return {
          success: true,
          action: 'created',
          data: createResponse.data
        };
      }
    } catch (error) {
      console.error('Error syncing application to recruiter system:', error);
      throw error;
    }
  }

  /**
   * Transform application from applicant portal format to recruiter format
   * @param {Object} application - Application in applicant portal format
   * @returns {Object} - Transformed application in recruiter format
   */
  transformApplicationToRecruiterFormat(application) {
    return {
      applicantId: application.applicantId,
      jobId: application.jobId,
      status: application.status,
      applicationDate: application.applicationDate,
      coverLetter: application.coverLetter || '',
      additionalInfo: application.additionalInfo || '',
      availableStartDate: application.availableStartDate || '',
      salaryExpectation: application.salaryExpectation || '',
      matchScore: application.matchScore || 0,
      interviewDate: application.interviewDate || null,
      interviewType: application.interviewType || '',
      notes: application.notes || '',
      source: 'applicant_portal',
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Sync application status from recruiter system to applicant portal
   * @param {string} applicationId - Application ID
   * @returns {Promise<Object>} - Sync result
   */
  async syncApplicationStatusToApplicant(applicationId) {
    try {
      // Get application from recruiter system
      const applicationResponse = await this.recruiterAxios.get(`/applications/${applicationId}`);
      const application = applicationResponse.data;
      
      // Update status in applicant portal
      const updateResponse = await this.applicantAxios.put(`/applications/${applicationId}/status`, {
        status: application.status,
        interviewDate: application.interviewDate,
        interviewType: application.interviewType,
        notes: application.notes
      });
      
      // Create notification for applicant
      if (application.status !== 'applied') {
        await this.createStatusChangeNotification(application);
      }
      
      return {
        success: true,
        action: 'updated',
        data: updateResponse.data
      };
    } catch (error) {
      console.error('Error syncing application status to applicant portal:', error);
      throw error;
    }
  }

  /**
   * Create notification for application status change
   * @param {Object} application - Application with updated status
   * @returns {Promise<Object>} - Created notification
   */
  async createStatusChangeNotification(application) {
    try {
      // Get job details
      const jobResponse = await this.recruiterAxios.get(`/jobs/${application.jobId}`);
      const job = jobResponse.data;
      
      // Create notification based on status
      let title = '';
      let message = '';
      
      switch (application.status) {
        case 'interview':
          title = 'Interview Invitation';
          message = `You have been invited to an interview for the ${job.title} position at ${job.company}.`;
          if (application.interviewDate) {
            message += ` The interview is scheduled for ${new Date(application.interviewDate).toLocaleString()}.`;
          } else {
            message += ' Please check your application for details.';
          }
          break;
        case 'rejected':
          title = 'Application Update';
          message = `We regret to inform you that your application for the ${job.title} position at ${job.company} has not been selected to move forward.`;
          break;
        case 'offered':
          title = 'Job Offer';
          message = `Congratulations! You have received a job offer for the ${job.title} position at ${job.company}. Please check your application for details.`;
          break;
        case 'hired':
          title = 'Welcome Aboard';
          message = `Congratulations on your new role as ${job.title} at ${job.company}! We're excited to have you join the team.`;
          break;
        default:
          title = 'Application Status Update';
          message = `Your application for the ${job.title} position at ${job.company} has been updated to ${application.status}.`;
      }
      
      // Create notification
      const notification = {
        applicantId: application.applicantId,
        title,
        message,
        type: 'application_update',
        referenceId: application.id,
        referenceType: 'application',
        read: false,
        date: new Date().toISOString()
      };
      
      const notificationResponse = await this.applicantAxios.post('/notifications', notification);
      return notificationResponse.data;
    } catch (error) {
      console.error('Error creating status change notification:', error);
      throw error;
    }
  }

  /**
   * Sync all jobs from recruiter system to applicant portal
   * @returns {Promise<Object>} - Sync result
   */
  async syncAllJobsToApplicantPortal() {
    try {
      // Get all active jobs from recruiter system
      const jobsResponse = await this.recruiterAxios.get('/jobs', {
        params: { status: 'active' }
      });
      const jobs = jobsResponse.data;
      
      // Sync each job
      const results = await Promise.all(
        jobs.map(job => this.syncJobToApplicantPortal(job.id))
      );
      
      return {
        success: true,
        totalJobs: jobs.length,
        results
      };
    } catch (error) {
      console.error('Error syncing all jobs to applicant portal:', error);
      throw error;
    }
  }

  /**
   * Get applicant details for recruiter view
   * @param {string} applicantId - Applicant ID
   * @returns {Promise<Object>} - Applicant details with applications
   */
  async getApplicantDetailsForRecruiter(applicantId) {
    try {
      // Get applicant profile
      const profileResponse = await this.applicantAxios.get(`/${applicantId}/profile`);
      const profile = profileResponse.data;
      
      // Get applicant's applications
      const applicationsResponse = await this.applicantAxios.get(`/${applicantId}/applications`);
      const applications = applicationsResponse.data;
      
      // Get resume URL if available
      let resumeUrl = null;
      try {
        const resumeResponse = await this.applicantAxios.get(`/${applicantId}/resume`);
        resumeUrl = resumeResponse.data.fileUrl;
      } catch (error) {
        // Resume not found, ignore
      }
      
      // Transform profile to recruiter format
      const recruiterApplicant = this.transformProfileToRecruiterFormat(profile);
      
      return {
        ...recruiterApplicant,
        applications,
        resumeUrl,
        source: profile.source || 'applicant_portal'
      };
    } catch (error) {
      console.error('Error getting applicant details for recruiter:', error);
      throw error;
    }
  }

  /**
   * Get job details with applicants for recruiter view
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} - Job details with applicants
   */
  async getJobDetailsWithApplicants(jobId) {
    try {
      // Get job details
      const jobResponse = await this.recruiterAxios.get(`/jobs/${jobId}`);
      const job = jobResponse.data;
      
      // Get applications for this job
      const applicationsResponse = await this.recruiterAxios.get(`/jobs/${jobId}/applications`);
      const applications = applicationsResponse.data;
      
      // Get applicant details for each application
      const applicantsPromises = applications.map(async application => {
        try {
          const applicantResponse = await this.getApplicantDetailsForRecruiter(application.applicantId);
          return {
            ...applicantResponse,
            application: {
              id: application.id,
              status: application.status,
              applicationDate: application.applicationDate,
              matchScore: application.matchScore,
              interviewDate: application.interviewDate,
              interviewType: application.interviewType
            }
          };
        } catch (error) {
          console.error(`Error getting details for applicant ${application.applicantId}:`, error);
          return null;
        }
      });
      
      const applicants = (await Promise.all(applicantsPromises)).filter(Boolean);
      
      return {
        ...job,
        applicants,
        totalApplicants: applicants.length
      };
    } catch (error) {
      console.error('Error getting job details with applicants:', error);
      throw error;
    }
  }
}

export default new IntegrationService();
