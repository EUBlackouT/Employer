// Notification Component
// This component displays notifications for both applicants and recruiters

import React, { useState, useEffect } from 'react';
import { 
  Dropdown, Badge, Spinner, ListGroup, 
  Button, Modal, Alert
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, faCheckCircle, faExclamationTriangle, 
  faInfoCircle, faTimes, faCheck, faTrash,
  faEnvelope, faBriefcase, faUser, faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';

// Import notification service
import NotificationService from '../services/NotificationService';

// Import translation function
import { useTranslation } from 'react-i18next';

/**
 * Notification Component
 * Displays notifications for both applicants and recruiters
 */
const NotificationCenter = ({ userId, userType }) => {
  const { t } = useTranslation();
  
  // State variables
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  // Fetch notifications on component mount
  useEffect(() => {
    if (userId) {
      fetchNotifications();
      
      // Connect to notification service
      NotificationService.connect(userId, userType);
      
      // Add notification listener
      NotificationService.addNotificationListener(handleNewNotification);
      
      // Set up interval to refresh notifications
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 60000); // Check every minute
      
      // Clean up on unmount
      return () => {
        clearInterval(interval);
        NotificationService.disconnect(userType);
        NotificationService.removeNotificationListener(handleNewNotification);
      };
    }
  }, [userId, userType]);
  
  /**
   * Fetch notifications
   */
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get notifications from service
      const response = await NotificationService.getNotifications(userId, userType, {
        limit: 10,
        page: 1
      });
      
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Error loading notifications. Please try again.');
      setLoading(false);
    }
  };
  
  /**
   * Fetch unread notification count
   */
  const fetchUnreadCount = async () => {
    try {
      const count = await NotificationService.getUnreadCount(userId, userType);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };
  
  /**
   * Handle new notification
   */
  const handleNewNotification = (notification) => {
    // Add new notification to the list
    setNotifications(prevNotifications => [notification, ...prevNotifications]);
    
    // Update unread count
    setUnreadCount(prevCount => prevCount + 1);
  };
  
  /**
   * Mark notification as read
   */
  const markAsRead = async (notificationId) => {
    try {
      await NotificationService.markAsRead(notificationId, userType);
      
      // Update notifications list
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  /**
   * Mark all notifications as read
   */
  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead(userId, userType);
      
      // Update notifications list
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      // Update unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  /**
   * Delete notification
   */
  const deleteNotification = async (notificationId) => {
    try {
      await NotificationService.deleteNotification(notificationId, userType);
      
      // Update notifications list
      const updatedNotifications = notifications.filter(
        notification => notification.id !== notificationId
      );
      setNotifications(updatedNotifications);
      
      // Update unread count if needed
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
      
      // Close modal if open
      if (selectedNotification && selectedNotification.id === notificationId) {
        setShowNotificationModal(false);
        setSelectedNotification(null);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };
  
  /**
   * View notification details
   */
  const viewNotificationDetails = (notification) => {
    // Mark as read if not already
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    setSelectedNotification(notification);
    setShowNotificationModal(true);
  };
  
  /**
   * View all notifications
   */
  const viewAllNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all notifications from service
      const response = await NotificationService.getNotifications(userId, userType, {
        limit: 50,
        page: 1
      });
      
      setNotifications(response.notifications);
      setShowAllNotifications(true);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching all notifications:', error);
      setError('Error loading notifications. Please try again.');
      setLoading(false);
    }
  };
  
  /**
   * Get notification icon based on type
   */
  const getNotificationIcon = (notification) => {
    switch (notification.type) {
      case 'application_update':
        return faEnvelope;
      case 'job_match':
      case 'new_job':
        return faBriefcase;
      case 'applicant_match':
      case 'new_application':
        return faUser;
      case 'profile_update':
        return faCheckCircle;
      case 'interview':
        return faCalendarAlt;
      default:
        return faInfoCircle;
    }
  };
  
  /**
   * Get notification color based on type
   */
  const getNotificationColor = (notification) => {
    switch (notification.type) {
      case 'application_update':
        if (notification.title.includes('Offer')) return 'warning';
        if (notification.title.includes('Interview')) return 'info';
        if (notification.title.includes('Hired')) return 'success';
        if (notification.title.includes('Rejected')) return 'danger';
        return 'primary';
      case 'job_match':
      case 'new_job':
        return 'success';
      case 'applicant_match':
      case 'new_application':
        return 'info';
      case 'profile_update':
        return 'primary';
      case 'interview':
        return 'warning';
      default:
        return 'secondary';
    }
  };
  
  /**
   * Render notification item
   */
  const renderNotificationItem = (notification) => {
    const icon = getNotificationIcon(notification);
    const color = getNotificationColor(notification);
    
    return (
      <ListGroup.Item 
        key={notification.id}
        className={`notification-item ${!notification.read ? 'unread' : ''}`}
        action
        onClick={() => viewNotificationDetails(notification)}
      >
        <div className="d-flex align-items-start">
          <div className={`notification-icon text-${color} me-3`}>
            <FontAwesomeIcon icon={icon} size="lg" />
          </div>
          <div className="notification-content flex-grow-1">
            <div className="d-flex justify-content-between">
              <div className="notification-title fw-bold">
                {notification.title}
              </div>
              <div className="notification-date text-muted small">
                {new Date(notification.date).toLocaleDateString()}
              </div>
            </div>
            <div className="notification-message">
              {notification.message}
            </div>
          </div>
        </div>
      </ListGroup.Item>
    );
  };
  
  /**
   * Render notification dropdown
   */
  const renderNotificationDropdown = () => {
    return (
      <Dropdown align="end">
        <Dropdown.Toggle variant="light" id="notification-dropdown" className="position-relative">
          <FontAwesomeIcon icon={faBell} />
          {unreadCount > 0 && (
            <Badge 
              bg="danger" 
              pill 
              className="position-absolute top-0 start-100 translate-middle"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Dropdown.Toggle>
        
        <Dropdown.Menu className="notification-dropdown-menu">
          <div className="notification-header d-flex justify-content-between align-items-center p-3 border-bottom">
            <h6 className="mb-0">{t('notifications')}</h6>
            {unreadCount > 0 && (
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 text-decoration-none"
                onClick={markAllAsRead}
              >
                {t('markAllAsRead')}
              </Button>
            )}
          </div>
          
          {loading ? (
            <div className="text-center p-3">
              <Spinner animation="border" size="sm" />
              <span className="ms-2">{t('loading')}</span>
            </div>
          ) : error ? (
            <div className="p-3">
              <Alert variant="danger" className="mb-0 py-2">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                {error}
              </Alert>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center p-3 text-muted">
              {t('noNotifications')}
            </div>
          ) : (
            <>
              <div className="notification-list" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                <ListGroup variant="flush">
                  {notifications.slice(0, 5).map(renderNotificationItem)}
                </ListGroup>
              </div>
              
              <div className="notification-footer p-2 border-top text-center">
                <Button 
                  variant="link" 
                  className="text-decoration-none"
                  onClick={viewAllNotifications}
                >
                  {t('viewAllNotifications')}
                </Button>
              </div>
            </>
          )}
        </Dropdown.Menu>
      </Dropdown>
    );
  };
  
  /**
   * Render notification modal
   */
  const renderNotificationModal = () => {
    if (!selectedNotification) return null;
    
    const icon = getNotificationIcon(selectedNotification);
    const color = getNotificationColor(selectedNotification);
    
    return (
      <Modal 
        show={showNotificationModal} 
        onHide={() => setShowNotificationModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={icon} className={`text-${color} me-2`} />
            {selectedNotification.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            {selectedNotification.message}
          </div>
          <div className="text-muted small">
            {new Date(selectedNotification.date).toLocaleString()}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outline-danger" 
            onClick={() => deleteNotification(selectedNotification.id)}
          >
            <FontAwesomeIcon icon={faTrash} className="me-2" />
            {t('delete')}
          </Button>
          <Button 
            variant="primary"
            onClick={() => setShowNotificationModal(false)}
          >
            <FontAwesomeIcon icon={faCheck} className="me-2" />
            {t('ok')}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };
  
  /**
   * Render all notifications view
   */
  const renderAllNotificationsView = () => {
    if (!showAllNotifications) return null;
    
    return (
      <Modal 
        show={showAllNotifications} 
        onHide={() => setShowAllNotifications(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faBell} className="me-2" />
            {t('allNotifications')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {loading ? (
            <div className="text-center p-4">
              <Spinner animation="border" />
              <div className="mt-2">{t('loading')}</div>
            </div>
          ) : error ? (
            <div className="p-3">
              <Alert variant="danger">
                <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
                {error}
              </Alert>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center p-4 text-muted">
              {t('noNotifications')}
            </div>
          ) : (
            <ListGroup variant="flush">
              {notifications.map(renderNotificationItem)}
            </ListGroup>
          )}
        </Modal.Body>
        <Modal.Footer>
          {unreadCount > 0 && (
            <Button 
              variant="outline-primary" 
              onClick={markAllAsRead}
              className="me-auto"
            >
              <FontAwesomeIcon icon={faCheck} className="me-2" />
              {t('markAllAsRead')}
            </Button>
          )}
          <Button 
            variant="secondary"
            onClick={() => setShowAllNotifications(false)}
          >
            <FontAwesomeIcon icon={faTimes} className="me-2" />
            {t('close')}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };
  
  return (
    <>
      {renderNotificationDropdown()}
      {renderNotificationModal()}
      {renderAllNotificationsView()}
    </>
  );
};

export default NotificationCenter;
