// Profile Synchronization Service

import axios from 'axios';

/**
 * Service for handling profile data synchronization between LinkedIn and the application
 */
class ProfileSyncService {
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
   * Get LinkedIn connection status
   * @param {number} userId - User ID
   * @returns {Promise<Object>} - LinkedIn connection status
   */
  async getLinkedInStatus(userId) {
    try {
      const response = await this.axios.get(`/linkedin/status`);
      return response.data;
    } catch (error) {
      console.error('Error getting LinkedIn status:', error);
      throw error;
    }
  }

  /**
   * Synchronize LinkedIn data
   * @param {number} userId - User ID
   * @returns {Promise<Object>} - Synchronization result
   */
  async syncLinkedInData(userId) {
    try {
      const response = await this.axios.post(`/linkedin/sync`);
      return response.data;
    } catch (error) {
      console.error('Error synchronizing LinkedIn data:', error);
      throw error;
    }
  }

  /**
   * Disconnect LinkedIn integration
   * @param {number} userId - User ID
   * @returns {Promise<Object>} - Disconnection result
   */
  async disconnectLinkedIn(userId) {
    try {
      const response = await this.axios.post(`/linkedin/disconnect`);
      return response.data;
    } catch (error) {
      console.error('Error disconnecting LinkedIn:', error);
      throw error;
    }
  }

  /**
   * Save profile data to backend
   * @param {number} userId - User ID
   * @param {Object} profileData - Profile data to save
   * @returns {Promise<Object>} - Save result
   */
  async saveProfileData(userId, profileData) {
    try {
      const response = await this.axios.post(`/profile/${userId}`, profileData);
      return response.data;
    } catch (error) {
      console.error('Error saving profile data:', error);
      throw error;
    }
  }

  /**
   * Get profile data from backend
   * @param {number} userId - User ID
   * @returns {Promise<Object>} - Profile data
   */
  async getProfileData(userId) {
    try {
      const response = await this.axios.get(`/profile/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting profile data:', error);
      throw error;
    }
  }

  /**
   * Check if profile data needs synchronization
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} - Whether synchronization is needed
   */
  async checkSyncNeeded(userId) {
    try {
      const status = await this.getLinkedInStatus(userId);
      
      // If not connected, no sync needed
      if (!status.connected) {
        return false;
      }
      
      // If no last sync date, sync is needed
      if (!status.lastSyncDate) {
        return true;
      }
      
      // Check if last sync was more than 7 days ago
      const lastSync = new Date(status.lastSyncDate);
      const now = new Date();
      const diffDays = Math.floor((now - lastSync) / (1000 * 60 * 60 * 24));
      
      return diffDays >= 7;
    } catch (error) {
      console.error('Error checking sync needed:', error);
      return false;
    }
  }

  /**
   * Get data source label
   * @param {string} source - Data source
   * @returns {string} - Formatted data source label
   */
  getDataSourceLabel(source) {
    switch (source) {
      case 'linkedin':
        return 'LinkedIn';
      case 'manual':
        return 'Manually Entered';
      case 'resume':
        return 'Uploaded Resume';
      default:
        return 'Unknown Source';
    }
  }

  /**
   * Format date for display
   * @param {string} dateString - Date string
   * @returns {string} - Formatted date
   */
  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  /**
   * Calculate profile completion percentage
   * @param {Object} profile - Profile data
   * @returns {number} - Completion percentage
   */
  calculateProfileCompletion(profile) {
    if (!profile) return 0;
    
    const sections = [
      // Basic profile - 25%
      {
        weight: 25,
        fields: [
          'firstName', 'lastName', 'email', 'phone',
          'headline', 'summary', 'location'
        ],
        data: profile.basicProfile
      },
      // Work experience - 25%
      {
        weight: 25,
        required: 1,
        data: profile.workExperience
      },
      // Education - 20%
      {
        weight: 20,
        required: 1,
        data: profile.education
      },
      // Skills - 20%
      {
        weight: 20,
        required: 3,
        data: profile.skills
      },
      // Certifications - 10%
      {
        weight: 10,
        required: 0,
        data: profile.certifications
      }
    ];
    
    let totalScore = 0;
    
    sections.forEach(section => {
      if (section.fields) {
        // For sections with fields, calculate percentage of filled fields
        const filledFields = section.fields.filter(field => 
          section.data && section.data[field]
        ).length;
        
        const sectionScore = (filledFields / section.fields.length) * section.weight;
        totalScore += sectionScore;
      } else if (section.data) {
        // For array sections, check if they meet the required count
        const count = section.data.length;
        const required = section.required;
        
        if (count >= required) {
          totalScore += section.weight;
        } else if (required > 0) {
          const sectionScore = (count / required) * section.weight;
          totalScore += sectionScore;
        }
      }
    });
    
    return Math.round(totalScore);
  }

  /**
   * Check if profile has changed since last sync
   * @param {Object} currentProfile - Current profile data
   * @param {Object} newProfile - New profile data from LinkedIn
   * @returns {Object} - Changes detected
   */
  detectProfileChanges(currentProfile, newProfile) {
    if (!currentProfile || !newProfile) return null;
    
    const changes = {
      basicProfile: false,
      workExperience: false,
      education: false,
      skills: false,
      certifications: false,
      hasChanges: false
    };
    
    // Check basic profile changes
    if (currentProfile.basicProfile && newProfile.basicProfile) {
      const fields = ['firstName', 'lastName', 'headline', 'summary', 'location'];
      for (const field of fields) {
        if (currentProfile.basicProfile[field] !== newProfile.basicProfile[field]) {
          changes.basicProfile = true;
          changes.hasChanges = true;
          break;
        }
      }
    }
    
    // Check work experience changes
    if (currentProfile.workExperience && newProfile.workExperience) {
      if (currentProfile.workExperience.length !== newProfile.workExperience.length) {
        changes.workExperience = true;
        changes.hasChanges = true;
      } else {
        // Check for changes in existing entries
        for (let i = 0; i < currentProfile.workExperience.length; i++) {
          const current = currentProfile.workExperience[i];
          const newExp = newProfile.workExperience[i];
          
          if (current.company !== newExp.company || 
              current.title !== newExp.title ||
              current.startDate !== newExp.startDate ||
              current.endDate !== newExp.endDate ||
              current.description !== newExp.description) {
            changes.workExperience = true;
            changes.hasChanges = true;
            break;
          }
        }
      }
    }
    
    // Check education changes
    if (currentProfile.education && newProfile.education) {
      if (currentProfile.education.length !== newProfile.education.length) {
        changes.education = true;
        changes.hasChanges = true;
      } else {
        // Check for changes in existing entries
        for (let i = 0; i < currentProfile.education.length; i++) {
          const current = currentProfile.education[i];
          const newEdu = newProfile.education[i];
          
          if (current.institution !== newEdu.institution || 
              current.degree !== newEdu.degree ||
              current.fieldOfStudy !== newEdu.fieldOfStudy ||
              current.startDate !== newEdu.startDate ||
              current.endDate !== newEdu.endDate) {
            changes.education = true;
            changes.hasChanges = true;
            break;
          }
        }
      }
    }
    
    // Check skills changes
    if (currentProfile.skills && newProfile.skills) {
      if (currentProfile.skills.length !== newProfile.skills.length) {
        changes.skills = true;
        changes.hasChanges = true;
      } else {
        // Check for changes in skills
        const currentSkills = new Set(currentProfile.skills.map(s => s.name));
        const newSkills = new Set(newProfile.skills.map(s => s.name));
        
        if (currentSkills.size !== newSkills.size) {
          changes.skills = true;
          changes.hasChanges = true;
        } else {
          for (const skill of currentSkills) {
            if (!newSkills.has(skill)) {
              changes.skills = true;
              changes.hasChanges = true;
              break;
            }
          }
        }
      }
    }
    
    // Check certifications changes
    if (currentProfile.certifications && newProfile.certifications) {
      if (currentProfile.certifications.length !== newProfile.certifications.length) {
        changes.certifications = true;
        changes.hasChanges = true;
      } else {
        // Check for changes in existing entries
        for (let i = 0; i < currentProfile.certifications.length; i++) {
          const current = currentProfile.certifications[i];
          const newCert = newProfile.certifications[i];
          
          if (current.name !== newCert.name || 
              current.issuingOrganization !== newCert.issuingOrganization ||
              current.issueDate !== newCert.issueDate ||
              current.expirationDate !== newCert.expirationDate) {
            changes.certifications = true;
            changes.hasChanges = true;
            break;
          }
        }
      }
    }
    
    return changes;
  }

  /**
   * Merge profile data from different sources
   * @param {Object} currentProfile - Current profile data
   * @param {Object} newData - New data to merge
   * @param {string} source - Source of new data
   * @returns {Object} - Merged profile data
   */
  mergeProfileData(currentProfile, newData, source) {
    if (!currentProfile) return { ...newData, source };
    if (!newData) return currentProfile;
    
    const merged = { ...currentProfile };
    
    // Merge basic profile
    if (newData.basicProfile) {
      merged.basicProfile = {
        ...merged.basicProfile,
        ...newData.basicProfile,
        source
      };
    }
    
    // Merge work experience
    if (newData.workExperience && newData.workExperience.length > 0) {
      // If source is the same, replace all entries
      if (source === currentProfile.source) {
        merged.workExperience = newData.workExperience.map(exp => ({
          ...exp,
          source
        }));
      } else {
        // Otherwise, merge by company and title
        const existingExp = new Map();
        merged.workExperience.forEach(exp => {
          const key = `${exp.company}-${exp.title}`;
          existingExp.set(key, exp);
        });
        
        newData.workExperience.forEach(exp => {
          const key = `${exp.company}-${exp.title}`;
          if (!existingExp.has(key)) {
            merged.workExperience.push({
              ...exp,
              source
            });
          }
        });
      }
    }
    
    // Merge education
    if (newData.education && newData.education.length > 0) {
      // If source is the same, replace all entries
      if (source === currentProfile.source) {
        merged.education = newData.education.map(edu => ({
          ...edu,
          source
        }));
      } else {
        // Otherwise, merge by institution and degree
        const existingEdu = new Map();
        merged.education.forEach(edu => {
          const key = `${edu.institution}-${edu.degree}`;
          existingEdu.set(key, edu);
        });
        
        newData.education.forEach(edu => {
          const key = `${edu.institution}-${edu.degree}`;
          if (!existingEdu.has(key)) {
            merged.education.push({
              ...edu,
              source
            });
          }
        });
      }
    }
    
    // Merge skills
    if (newData.skills && newData.skills.length > 0) {
      // Merge by skill name
      const existingSkills = new Map();
      merged.skills.forEach(skill => {
        existingSkills.set(skill.name, skill);
      });
      
      newData.skills.forEach(skill => {
        if (!existingSkills.has(skill.name)) {
          merged.skills.push({
            ...skill,
            source
          });
        }
      });
    }
    
    // Merge certifications
    if (newData.certifications && newData.certifications.length > 0) {
      // If source is the same, replace all entries
      if (source === currentProfile.source) {
        merged.certifications = newData.certifications.map(cert => ({
          ...cert,
          source
        }));
      } else {
        // Otherwise, merge by name and issuing organization
        const existingCerts = new Map();
        merged.certifications.forEach(cert => {
          const key = `${cert.name}-${cert.issuingOrganization}`;
          existingCerts.set(key, cert);
        });
        
        newData.certifications.forEach(cert => {
          const key = `${cert.name}-${cert.issuingOrganization}`;
          if (!existingCerts.has(key)) {
            merged.certifications.push({
              ...cert,
              source
            });
          }
        });
      }
    }
    
    return merged;
  }
}

export default new ProfileSyncService();
