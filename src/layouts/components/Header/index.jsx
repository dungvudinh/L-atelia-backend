// src/components/admin/Header.jsx
import { Bell, Menu, Search, User, X, Loader } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../../services/notificationService';
import authService from '../../../services/authService';

const Header = ({ setSidebarOpen }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const notificationRef = useRef(null);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedData = authService.getStoredUserData();
        if (storedData.user) {
          setCurrentUser(storedData.user);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  // Load notifications from API
  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await notificationService.getNewBookings();
      
      if (response.success) {
        // Transform API data to match our notification format
        const apiNotifications = response.data.map(booking => ({
          id: booking._id || booking.id,
          type: 'new_booking',
          title: 'New Booking Received',
          message: `${booking.customer?.name || 'Customer'} booked ${booking.property?.title || 'Property'} for ${calculateNights(booking.checkIn, booking.checkOut)} nights`,
          time: formatTimeAgo(booking.createdAt),
          read: booking.notificationRead || false,
          bookingId: booking.bookingNumber || booking._id
        }));
        
        setNotifications(apiNotifications);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError('Failed to load notifications');
      // Fallback to empty array
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Load notifications when dropdown opens
  useEffect(() => {
    if (notificationMenuOpen) {
      loadNotifications();
    }
  }, [notificationMenuOpen]);

  // Close notification menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Helper functions
  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  };

  // Filter only new_booking notifications
  const newBookingNotifications = notifications.filter(
    notification => notification.type === 'new_booking'
  );

  const unreadCount = newBookingNotifications.filter(notification => !notification.read).length;

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read via API
      await notificationService.markAsRead(notification.id);
      
      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      ));
      
      // Navigate to booking if it has bookingId
      if (notification.bookingId) {
        navigate('/bookings');
      }
      
      setNotificationMenuOpen(false);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Still update UI even if API fails
      setNotifications(notifications.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      ));
      setNotificationMenuOpen(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      // Update all notifications to read
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
      // Still update UI even if API fails
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }
  };

  const handleViewAllBookings = () => {
    navigate('/bookings');
    setNotificationMenuOpen(false);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const getNotificationIcon = () => {
    return '📅';
  };

  const getNotificationColor = () => {
    return 'text-green-600 bg-green-100';
  };

  const getUserRoleDisplay = (role) => {
    const roleMap = {
      admin: 'Administrator',
      project_manager: 'Project Manager',
      media_manager: 'Media Manager',
      rent_manager: 'Rent Manager',
      booking_manager: 'Booking Manager'
    };
    return roleMap[role] || role;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left Section */}
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Menu size={20} />
          </button>
          
          {/* Search Bar */}
          <div className="ml-4 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications - Real API Data */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              disabled={loading}
            >
              {loading ? (
                <Loader size={20} className="animate-spin" />
              ) : (
                <Bell size={20} />
              )}
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">New Bookings</h3>
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        disabled={loading}
                      >
                        Mark all as read
                      </button>
                    )}
                    <button
                      onClick={() => setNotificationMenuOpen(false)}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <X size={16} className="text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader size={24} className="animate-spin text-blue-500" />
                    </div>
                  ) : error ? (
                    <div className="p-4 text-center">
                      <p className="text-red-600 text-sm mb-2">{error}</p>
                      <button
                        onClick={loadNotifications}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : newBookingNotifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No new bookings
                    </div>
                  ) : (
                    newBookingNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getNotificationColor()}`}>
                            {getNotificationIcon()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-gray-900 truncate">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={handleViewAllBookings}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-center"
                  >
                    View All Bookings
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 text-right">
                  {currentUser?.fullName || 'Loading...'}
                </p>
                <p className="text-xs text-gray-500 text-right">
                  {currentUser ? getUserRoleDisplay(currentUser.role) : ''}
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {currentUser ? (
                  currentUser.fullName?.charAt(0).toUpperCase() || 'U'
                ) : (
                  <User size={16} />
                )}
              </div>
            </button>

            {/* User Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">
                    {currentUser?.fullName || 'User'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {currentUser?.email || ''}
                  </p>
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    {currentUser ? getUserRoleDisplay(currentUser.role) : ''}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/admin/profile');
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <User size={16} className="mr-3 text-gray-400" />
                    Profile Settings
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-200 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;