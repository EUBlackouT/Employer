// Notification Service
// This service handles notifications for both applicants and recruiters

import axios from 'axios';
import { toast } from 'react-toastify';

/**
 * Service for handling notifications in the recruitment system
 */
class NotificationService {
  /**
   * Initialize the service with API base URLs
   * @param {string} applicantBaseUrl - Applicant API base URL
   * @param {string} recruiterBaseUrl - Recruiter API base URL
   */
  constructor(applicantBaseUrl = '/api/applicants', recruiterBaseUrl = '/api/recruiters') {
    this.applicantBaseUrl = applicantBaseUrl;
    this.recruiterBaseUrl = recruiterBaseUrl;
    
    this.applicantAxios = axios.create({
      baseURL: `${applicantBaseUrl}/notifications`,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    this.recruiterAxios = axios.create({
      baseURL: `${recruiterBaseUrl}/notifications`,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Initialize WebSocket connections for real-time notifications
    this.initializeWebSockets();
    
    // Set up push notification support if available
    this.initializePushNotifications();
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
   * Initialize WebSocket connections for real-time notifications
   */
  initializeWebSockets() {
    try {
      // This would be implemented with actual WebSocket connections in production
      this.applicantSocket = {
        connected: false,
        connect: (userId) => {
          console.log(`Connecting to applicant notifications socket for user ${userId}`);
          this.applicantSocket.connected = true;
          this.applicantSocket.userId = userId;
          
          // Mock socket event listener
          this.applicantSocket.onmessage = (event) => {
            const notification = JSON.parse(event.data);
            this.showToastNotification(notification);
            this.notificationCallbacks.forEach(callback => callback(notification));
          };
        },
        disconnect: () => {
          console.log('Disconnecting from applicant notifications socket');
          this.applicantSocket.connected = false;
        },
        send: (message) => {
          console.log('Sending message to applicant socket:', message);
        }
      };
      
      this.recruiterSocket = {
        connected: false,
        connect: (userId) => {
          console.log(`Connecting to recruiter notifications socket for user ${userId}`);
          this.recruiterSocket.connected = true;
          this.recruiterSocket.userId = userId;
          
          // Mock socket event listener
          this.recruiterSocket.onmessage = (event) => {
            const notification = JSON.parse(event.data);
            this.showToastNotification(notification);
            this.notificationCallbacks.forEach(callback => callback(notification));
          };
        },
        disconnect: () => {
          console.log('Disconnecting from recruiter notifications socket');
          this.recruiterSocket.connected = false;
        },
        send: (message) => {
          console.log('Sending message to recruiter socket:', message);
        }
      };
      
      // Initialize callback array for notification listeners
      this.notificationCallbacks = [];
    } catch (error) {
      console.error('Error initializing WebSockets:', error);
    }
  }

  /**
   * Initialize push notifications if browser supports it
   */
  initializePushNotifications() {
    try {
      this.pushSupported = 'serviceWorker' in navigator && 'PushManager' in window;
      
      if (this.pushSupported) {
        // Register service worker for push notifications
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
            this.swRegistration = registration;
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error);
            this.pushSupported = false;
          });
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      this.pushSupported = false;
    }
  }

  /**
   * Connect to notification services for a user
   * @param {string} userId - User ID
   * @param {string} userType - User type (applicant or recruiter)
   */
  connect(userId, userType) {
    if (userType === 'applicant') {
      this.applicantSocket.connect(userId);
    } else if (userType === 'recruiter') {
      this.recruiterSocket.connect(userId);
    }
  }

  /**
   * Disconnect from notification services
   * @param {string} userType - User type (applicant or recruiter)
   */
  disconnect(userType = 'both') {
    if (userType === 'both' || userType === 'applicant') {
      this.applicantSocket.disconnect();
    }
    if (userType === 'both' || userType === 'recruiter') {
      this.recruiterSocket.disconnect();
    }
  }

  /**
   * Subscribe to push notifications
   * @param {string} userId - User ID
   * @param {string} userType - User type (applicant or recruiter)
   * @returns {Promise<boolean>} - Whether subscription was successful
   */
  async subscribeToPushNotifications(userId, userType) {
    if (!this.pushSupported || !this.swRegistration) {
      return false;
    }
    
    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
        )
      });
      
      console.log('User is subscribed to push notifications:', subscription);
      
      // Send subscription to server
      const response = await (userType === 'applicant' 
        ? this.applicantAxios.post('/push-subscription', { userId, subscription })
        : this.recruiterAxios.post('/push-subscription', { userId, subscription }));
      
      return response.data.success;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  }

  /**
   * Convert base64 string to Uint8Array for push subscription
   * @param {string} base64String - Base64 encoded string
   * @returns {Uint8Array} - Converted array
   */
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Add notification listener callback
   * @param {Function} callback - Callback function to be called when notification is received
   */
  addNotificationListener(callback) {
    if (typeof callback === 'function') {
      this.notificationCallbacks.push(callback);
    }
  }

  /**
   * Remove notification listener callback
   * @param {Function} callback - Callback function to remove
   */
  removeNotificationListener(callback) {
    this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
  }

  /**
   * Show toast notification
   * @param {Object} notification - Notification object
   */
  showToastNotification(notification) {
    const options = {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    };
    
    switch (notification.type) {
      case 'success':
        toast.success(notification.message, options);
        break;
      case 'error':
        toast.error(notification.message, options);
        break;
      case 'warning':
        toast.warning(notification.message, options);
        break;
      case 'info':
      default:
        toast.info(notification.message, options);
        break;
    }
  }

  /**
   * Get notifications for a user
   * @param {string} userId - User ID
   * @param {string} userType - User type (applicant or recruiter)
   * @param {Object} params - Query parameters (page, limit, read, type)
   * @returns {Promise<Object>} - Notifications with pagination info
   */
  async getNotifications(userId, userType, params = {}) {
    try {
      const response = await (userType === 'applicant'
        ? this.applicantAxios.get(`/${userId}`, { params })
        : this.recruiterAxios.get(`/${userId}`, { params }));
      
      return response.data;
    } catch (error) {
      console.error('Error getting notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} userType - User type (applicant or recruiter)
   * @returns {Promise<Object>} - Updated notification
   */
  async markAsRead(notificationId, userType) {
    try {
      const response = await (userType === 'applicant'
        ? this.applicantAxios.put(`/${notificationId}/read`)
        : this.recruiterAxios.put(`/${notificationId}/read`));
      
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   * @param {string} userId - User ID
   * @param {string} userType - User type (applicant or recruiter)
   * @returns {Promise<Object>} - Result of operation
   */
  async markAllAsRead(userId, userType) {
    try {
      const response = await (userType === 'applicant'
        ? this.applicantAxios.put(`/${userId}/read-all`)
        : this.recruiterAxios.put(`/${userId}/read-all`));
      
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   * @param {string} notificationId - Notification ID
   * @param {string} userType - User type (applicant or recruiter)
   * @returns {Promise<Object>} - Result of operation
   */
  async deleteNotification(notificationId, userType) {
    try {
      const response = await (userType === 'applicant'
        ? this.applicantAxios.delete(`/${notificationId}`)
        : this.recruiterAxios.delete(`/${notificationId}`));
      
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Create notification for applicant
   * @param {Object} notification - Notification data
   * @returns {Promise<Object>} - Created notification
   */
  async createApplicantNotification(notification) {
    try {
      const response = await this.applicantAxios.post('/', notification);
      return response.data;
    } catch (error) {
      console.error('Error creating applicant notification:', error);
      throw error;
    }
  }

  /**
   * Create notification for recruiter
   * @param {Object} notification - Notification data
   * @returns {Promise<Object>} - Created notification
   */
  async createRecruiterNotification(notification) {
    try {
      const response = await this.recruiterAxios.post('/', notification);
      return response.data;
    } catch (error) {
      console.error('Error creating recruiter notification:', error);
      throw error;
    }
  }

  /**
   * Create application status change notification
   * @param {Object} application - Application with updated status
   * @returns {Promise<Object>} - Created notification
   */
  async createStatusChangeNotification(application) {
    try {
      // Get job details
      const jobResponse = await axios.get(`/api/jobs/${application.jobId}`);
      const job = jobResponse.data;
      
      // Create notification for applicant
      const applicantNotification = await this.createApplicantStatusNotification(
        application, job
      );
      
      // Create notification for recruiter
      const recruiterNotification = await this.createRecruiterStatusNotification(
        application, job
      );
      
      return {
        applicant: applicantNotification,
        recruiter: recruiterNotification
      };
    } catch (error) {
      console.error('Error creating status change notifications:', error);
      throw error;
    }
  }

  /**
   * Create application status notification for applicant
   * @param {Object} application - Application with updated status
   * @param {Object} job - Job details
   * @returns {Promise<Object>} - Created notification
   */
  async createApplicantStatusNotification(application, job) {
    // Create notification based on status
    let title = '';
    let message = '';
    let type = 'application_update';
    
    switch (application.status) {
      case 'reviewing':
        title = 'Application Under Review';
        message = `Your application for the ${job.title} position at ${job.company} is now being reviewed.`;
        break;
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
      type,
      referenceId: application.id,
      referenceType: 'application',
      read: false,
      date: new Date().toISOString()
    };
    
    return this.createApplicantNotification(notification);
  }

  /**
   * Create application status notification for recruiter
   * @param {Object} application - Application with updated status
   * @param {Object} job - Job details
   * @returns {Promise<Object>} - Created notification
   */
  async createRecruiterStatusNotification(application, job) {
    // Get applicant details
    const applicantResponse = await axios.get(`/api/applicants/${application.applicantId}/profile`);
    const applicant = applicantResponse.data;
    
    // Create notification based on status
    let title = '';
    let message = '';
    let type = 'application_update';
    
    switch (application.status) {
      case 'reviewing':
        title = 'Application Marked for Review';
        message = `You've marked ${applicant.firstName} ${applicant.lastName}'s application for the ${job.title} position for review.`;
        break;
      case 'interview':
        title = 'Interview Scheduled';
        message = `An interview has been scheduled with ${applicant.firstName} ${applicant.lastName} for the ${job.title} position.`;
        if (application.interviewDate) {
          message += ` The interview is scheduled for ${new Date(application.interviewDate).toLocaleString()}.`;
        }
        break;
      case 'rejected':
        title = 'Application Rejected';
        message = `You've rejected ${applicant.firstName} ${applicant.lastName}'s application for the ${job.title} position.`;
        break;
      case 'offered':
        title = 'Job Offer Extended';
        message = `You've extended a job offer to ${applicant.firstName} ${applicant.lastName} for the ${job.title} position.`;
        break;
      case 'hired':
        title = 'Candidate Hired';
        message = `${applicant.firstName} ${applicant.lastName} has been hired for the ${job.title} position.`;
        break;
      default:
        title = 'Application Status Updated';
        message = `${applicant.firstName} ${applicant.lastName}'s application for the ${job.title} position has been updated to ${application.status}.`;
    }
    
    // Create notification
    const notification = {
      recruiterId: job.recruiterId,
      title,
      message,
      type,
      referenceId: application.id,
      referenceType: 'application',
      read: false,
      date: new Date().toISOString()
    };
    
    return this.createRecruiterNotification(notification);
  }

  /**
   * Create new job match notification for applicant
   * @param {string} applicantId - Applicant ID
   * @param {Object} job - Job details
   * @param {number} matchScore - Match score
   * @returns {Promise<Object>} - Created notification
   */
  async createJobMatchNotification(applicantId, job, matchScore) {
    const notification = {
      applicantId,
      title: 'New Job Match',
      message: `We found a new job that matches your profile: ${job.title} at ${job.company} (${matchScore}% match).`,
      type: 'job_match',
      referenceId: job.id,
      referenceType: 'job',
      read: false,
      date: new Date().toISOString()
    };
    
    return this.createApplicantNotification(notification);
  }

  /**
   * Create new applicant match notification for recruiter
   * @param {string} recruiterId - Recruiter ID
   * @param {Object} applicant - Applicant details
   * @param {Object} job - Job details
   * @param {number} matchScore - Match score
   * @returns {Promise<Object>} - Created notification
   */
  async createApplicantMatchNotification(recruiterId, applicant, job, matchScore) {
    const notification = {
      recruiterId,
      title: 'New Candidate Match',
      message: `We found a new candidate that matches your job posting: ${applicant.firstName} ${applicant.lastName} (${matchScore}% match) for ${job.title}.`,
      type: 'applicant_match',
      referenceId: applicant.id,
      referenceType: 'applicant',
      read: false,
      date: new Date().toISOString()
    };
    
    return this.createRecruiterNotification(notification);
  }

  /**
   * Create new application notification for recruiter
   * @param {Object} application - Application details
   * @param {Object} applicant - Applicant details
   * @param {Object} job - Job details
   * @returns {Promise<Object>} - Created notification
   */
  async createNewApplicationNotification(application, applicant, job) {
    const notification = {
      recruiterId: job.recruiterId,
      title: 'New Application Received',
      message: `${applicant.firstName} ${applicant.lastName} has applied for the ${job.title} position.`,
      type: 'new_application',
      referenceId: application.id,
      referenceType: 'application',
      read: false,
      date: new Date().toISOString()
    };
    
    return this.createRecruiterNotification(notification);
  }

  /**
   * Create profile update notification for applicant
   * @param {string} applicantId - Applicant ID
   * @param {string} source - Update source (linkedin, resume, manual)
   * @returns {Promise<Object>} - Created notification
   */
  async createProfileUpdateNotification(applicantId, source) {
    let message = 'Your profile has been updated';
    
    if (source === 'linkedin') {
      message = 'Your profile has been updated with your LinkedIn data.';
    } else if (source === 'resume') {
      message = 'Your profile has been updated with data from your resume.';
    }
    
    const notification = {
      applicantId,
      title: 'Profile Updated',
      message,
      type: 'profile_update',
      referenceId: applicantId,
      referenceType: 'profile',
      read: false,
      date: new Date().toISOString()
    };
    
    return this.createApplicantNotification(notification);
  }

  /**
   * Create job posting notification for applicants
   * @param {Object} job - Job details
   * @param {Array<string>} applicantIds - Array of applicant IDs to notify
   * @returns {Promise<Array<Object>>} - Created notifications
   */
  async createJobPostingNotification(job, applicantIds) {
    const notifications = applicantIds.map(applicantId => ({
      applicantId,
      title: 'New Job Posting',
      message: `A new job has been posted that might interest you: ${job.title} at ${job.company}.`,
      type: 'new_job',
      referenceId: job.id,
      referenceType: 'job',
      read: false,
      date: new Date().toISOString()
    }));
    
    const results = await Promise.all(
      notifications.map(notification => this.createApplicantNotification(notification))
    );
    
    return results;
  }

  /**
   * Get unread notification count
   * @param {string} userId - User ID
   * @param {string} userType - User type (applicant or recruiter)
   * @returns {Promise<number>} - Unread notification count
   */
  async getUnreadCount(userId, userType) {
    try {
      const response = await (userType === 'applicant'
        ? this.applicantAxios.get(`/${userId}/unread-count`)
        : this.recruiterAxios.get(`/${userId}/unread-count`));
      
      return response.data.count;
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      throw error;
    }
  }
}

export default new NotificationService();
