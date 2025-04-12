// Job Matching Service
// This service handles matching applicants to job positions based on their profiles

import axios from 'axios';

/**
 * Service for handling job matching functionality
 */
class JobMatchingService {
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
   * Get matching jobs for an applicant
   * @param {string} applicantId - Applicant ID
   * @param {Object} filters - Optional filters for job matching
   * @returns {Promise<Array>} - List of matching jobs
   */
  async getMatchingJobs(applicantId, filters = {}) {
    try {
      const response = await this.axios.get(`/applicants/${applicantId}/matching-jobs`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error getting matching jobs:', error);
      throw error;
    }
  }

  /**
   * Apply for a job
   * @param {string} applicantId - Applicant ID
   * @param {string} jobId - Job ID
   * @param {Object} applicationData - Additional application data
   * @returns {Promise<Object>} - Application result
   */
  async applyForJob(applicantId, jobId, applicationData = {}) {
    try {
      const response = await this.axios.post('/applications', {
        applicantId,
        jobId,
        ...applicationData
      });
      return response.data;
    } catch (error) {
      console.error('Error applying for job:', error);
      throw error;
    }
  }

  /**
   * Get applications for an applicant
   * @param {string} applicantId - Applicant ID
   * @returns {Promise<Array>} - List of applications
   */
  async getApplications(applicantId) {
    try {
      const response = await this.axios.get(`/applicants/${applicantId}/applications`);
      return response.data;
    } catch (error) {
      console.error('Error getting applications:', error);
      throw error;
    }
  }

  /**
   * Get application details
   * @param {string} applicationId - Application ID
   * @returns {Promise<Object>} - Application details
   */
  async getApplicationDetails(applicationId) {
    try {
      const response = await this.axios.get(`/applications/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting application details:', error);
      throw error;
    }
  }

  /**
   * Update application status
   * @param {string} applicationId - Application ID
   * @param {string} status - New status
   * @param {Object} statusData - Additional status data
   * @returns {Promise<Object>} - Updated application
   */
  async updateApplicationStatus(applicationId, status, statusData = {}) {
    try {
      const response = await this.axios.put(`/applications/${applicationId}/status`, {
        status,
        ...statusData
      });
      return response.data;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  /**
   * Withdraw application
   * @param {string} applicationId - Application ID
   * @param {string} reason - Withdrawal reason
   * @returns {Promise<Object>} - Withdrawal result
   */
  async withdrawApplication(applicationId, reason = '') {
    try {
      const response = await this.axios.put(`/applications/${applicationId}/withdraw`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error withdrawing application:', error);
      throw error;
    }
  }

  /**
   * Schedule interview for application
   * @param {string} applicationId - Application ID
   * @param {Object} interviewData - Interview details
   * @returns {Promise<Object>} - Scheduling result
   */
  async scheduleInterview(applicationId, interviewData) {
    try {
      const response = await this.axios.post(`/applications/${applicationId}/interview`, interviewData);
      return response.data;
    } catch (error) {
      console.error('Error scheduling interview:', error);
      throw error;
    }
  }

  /**
   * Get job details
   * @param {string} jobId - Job ID
   * @returns {Promise<Object>} - Job details
   */
  async getJobDetails(jobId) {
    try {
      const response = await this.axios.get(`/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting job details:', error);
      throw error;
    }
  }

  /**
   * Search for jobs
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Array>} - Search results
   */
  async searchJobs(searchParams) {
    try {
      const response = await this.axios.get('/jobs/search', {
        params: searchParams
      });
      return response.data;
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  }

  /**
   * Calculate match score between applicant and job
   * @param {Object} applicantProfile - Applicant profile
   * @param {Object} jobRequirements - Job requirements
   * @returns {Object} - Match score and details
   */
  calculateMatchScore(applicantProfile, jobRequirements) {
    // Initialize score components
    const scoreComponents = {
      skills: { score: 0, maxScore: 40, details: [] },
      experience: { score: 0, maxScore: 25, details: [] },
      education: { score: 0, maxScore: 20, details: [] },
      location: { score: 0, maxScore: 10, details: [] },
      jobType: { score: 0, maxScore: 5, details: [] }
    };
    
    // Calculate skills match
    if (applicantProfile.skills && jobRequirements.requiredSkills) {
      const applicantSkills = applicantProfile.skills.map(s => s.name.toLowerCase());
      const requiredSkills = jobRequirements.requiredSkills.map(s => s.toLowerCase());
      const preferredSkills = jobRequirements.preferredSkills?.map(s => s.toLowerCase()) || [];
      
      let matchedRequired = 0;
      let matchedPreferred = 0;
      
      // Check required skills
      requiredSkills.forEach(skill => {
        const matched = applicantSkills.some(s => s === skill || s.includes(skill) || skill.includes(s));
        if (matched) {
          matchedRequired++;
          scoreComponents.skills.details.push({
            skill,
            type: 'required',
            matched: true
          });
        } else {
          scoreComponents.skills.details.push({
            skill,
            type: 'required',
            matched: false
          });
        }
      });
      
      // Check preferred skills
      preferredSkills.forEach(skill => {
        const matched = applicantSkills.some(s => s === skill || s.includes(skill) || skill.includes(s));
        if (matched) {
          matchedPreferred++;
          scoreComponents.skills.details.push({
            skill,
            type: 'preferred',
            matched: true
          });
        } else {
          scoreComponents.skills.details.push({
            skill,
            type: 'preferred',
            matched: false
          });
        }
      });
      
      // Calculate skills score
      const requiredWeight = 30;
      const preferredWeight = 10;
      
      if (requiredSkills.length > 0) {
        scoreComponents.skills.score += (matchedRequired / requiredSkills.length) * requiredWeight;
      } else {
        scoreComponents.skills.score += requiredWeight;
      }
      
      if (preferredSkills.length > 0) {
        scoreComponents.skills.score += (matchedPreferred / preferredSkills.length) * preferredWeight;
      } else {
        scoreComponents.skills.score += preferredWeight;
      }
    }
    
    // Calculate experience match
    if (applicantProfile.workExperience && jobRequirements.experience) {
      const requiredYears = jobRequirements.experience.minYears || 0;
      
      // Calculate total years of experience
      let totalYears = 0;
      applicantProfile.workExperience.forEach(job => {
        if (job.startDate) {
          const startYear = parseInt(job.startDate.split('-')[0]);
          let endYear;
          
          if (job.isCurrent) {
            endYear = new Date().getFullYear();
          } else if (job.endDate) {
            endYear = parseInt(job.endDate.split('-')[0]);
          } else {
            endYear = startYear;
          }
          
          totalYears += endYear - startYear;
        }
      });
      
      // Calculate experience score
      if (totalYears >= requiredYears) {
        scoreComponents.experience.score = scoreComponents.experience.maxScore;
        scoreComponents.experience.details.push({
          required: requiredYears,
          actual: totalYears,
          matched: true
        });
      } else if (requiredYears > 0) {
        // Partial credit for some experience
        const ratio = Math.min(totalYears / requiredYears, 1);
        scoreComponents.experience.score = ratio * scoreComponents.experience.maxScore;
        scoreComponents.experience.details.push({
          required: requiredYears,
          actual: totalYears,
          matched: false
        });
      } else {
        // No experience required
        scoreComponents.experience.score = scoreComponents.experience.maxScore;
        scoreComponents.experience.details.push({
          required: 0,
          actual: totalYears,
          matched: true
        });
      }
    }
    
    // Calculate education match
    if (applicantProfile.education && jobRequirements.education) {
      const requiredDegree = jobRequirements.education.degree?.toLowerCase();
      const requiredField = jobRequirements.education.fieldOfStudy?.toLowerCase();
      
      let degreeMatch = false;
      let fieldMatch = false;
      
      // Check for degree and field match
      applicantProfile.education.forEach(edu => {
        const degree = edu.degree?.toLowerCase();
        const field = edu.fieldOfStudy?.toLowerCase();
        
        // Check degree match
        if (requiredDegree && degree) {
          if (
            degree === requiredDegree ||
            degree.includes(requiredDegree) ||
            requiredDegree.includes(degree)
          ) {
            degreeMatch = true;
          }
        }
        
        // Check field match
        if (requiredField && field) {
          if (
            field === requiredField ||
            field.includes(requiredField) ||
            requiredField.includes(field)
          ) {
            fieldMatch = true;
          }
        }
      });
      
      // Calculate education score
      if (requiredDegree && requiredField) {
        // Both degree and field specified
        if (degreeMatch && fieldMatch) {
          scoreComponents.education.score = scoreComponents.education.maxScore;
        } else if (degreeMatch) {
          scoreComponents.education.score = scoreComponents.education.maxScore * 0.7;
        } else if (fieldMatch) {
          scoreComponents.education.score = scoreComponents.education.maxScore * 0.3;
        }
      } else if (requiredDegree) {
        // Only degree specified
        if (degreeMatch) {
          scoreComponents.education.score = scoreComponents.education.maxScore;
        }
      } else if (requiredField) {
        // Only field specified
        if (fieldMatch) {
          scoreComponents.education.score = scoreComponents.education.maxScore;
        }
      } else {
        // No education requirements
        scoreComponents.education.score = scoreComponents.education.maxScore;
      }
      
      scoreComponents.education.details.push({
        requiredDegree: requiredDegree || 'None',
        requiredField: requiredField || 'None',
        degreeMatch,
        fieldMatch
      });
    }
    
    // Calculate location match
    if (applicantProfile.preferences && jobRequirements.location) {
      const jobLocation = jobRequirements.location.toLowerCase();
      const applicantLocations = applicantProfile.preferences.locations?.map(l => l.toLowerCase()) || [];
      const willingToRelocate = applicantProfile.preferences.willingToRelocate || false;
      const remoteWork = applicantProfile.preferences.remoteWork || false;
      const jobRemote = jobRequirements.remote || false;
      
      let locationMatch = false;
      
      // Check for location match
      if (applicantLocations.length > 0) {
        locationMatch = applicantLocations.some(
          loc => loc === jobLocation || loc.includes(jobLocation) || jobLocation.includes(loc)
        );
      }
      
      // Calculate location score
      if (jobRemote && remoteWork) {
        // Remote job and applicant is open to remote work
        scoreComponents.location.score = scoreComponents.location.maxScore;
        scoreComponents.location.details.push({
          jobLocation,
          remote: true,
          matched: true,
          reason: 'Remote job match'
        });
      } else if (locationMatch) {
        // Location match
        scoreComponents.location.score = scoreComponents.location.maxScore;
        scoreComponents.location.details.push({
          jobLocation,
          remote: false,
          matched: true,
          reason: 'Location match'
        });
      } else if (willingToRelocate) {
        // Willing to relocate
        scoreComponents.location.score = scoreComponents.location.maxScore * 0.7;
        scoreComponents.location.details.push({
          jobLocation,
          remote: false,
          matched: false,
          reason: 'Willing to relocate'
        });
      } else {
        // No match
        scoreComponents.location.details.push({
          jobLocation,
          remote: jobRemote,
          matched: false,
          reason: 'No location match'
        });
      }
    }
    
    // Calculate job type match
    if (applicantProfile.preferences && jobRequirements.jobType) {
      const jobType = jobRequirements.jobType.toLowerCase();
      const applicantJobTypes = applicantProfile.preferences.jobTypes?.map(t => t.toLowerCase()) || [];
      
      // Check for job type match
      const jobTypeMatch = applicantJobTypes.some(
        type => type === jobType || type.includes(jobType) || jobType.includes(type)
      );
      
      // Calculate job type score
      if (jobTypeMatch) {
        scoreComponents.jobType.score = scoreComponents.jobType.maxScore;
        scoreComponents.jobType.details.push({
          jobType,
          matched: true
        });
      } else if (applicantJobTypes.length === 0) {
        // No preferences specified, give partial credit
        scoreComponents.jobType.score = scoreComponents.jobType.maxScore * 0.5;
        scoreComponents.jobType.details.push({
          jobType,
          matched: false,
          reason: 'No preferences specified'
        });
      } else {
        scoreComponents.jobType.details.push({
          jobType,
          matched: false,
          reason: 'Job type mismatch'
        });
      }
    }
    
    // Calculate total score
    let totalScore = 0;
    let totalMaxScore = 0;
    
    Object.values(scoreComponents).forEach(component => {
      totalScore += component.score;
      totalMaxScore += component.maxScore;
    });
    
    const matchPercentage = Math.round((totalScore / totalMaxScore) * 100);
    
    // Return match results
    return {
      score: matchPercentage,
      components: scoreComponents,
      matchingSkills: scoreComponents.skills.details
        .filter(detail => detail.matched)
        .map(detail => detail.skill)
    };
  }
}

export default new JobMatchingService();
