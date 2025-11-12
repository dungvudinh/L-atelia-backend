// src/hooks/usePermission.js
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const usePermission = (requiredPermission = null) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkPermission = async () => {
      try {
        setLoading(true);
        
        // Lấy thông tin user hiện tại
        const { user } = authService.getStoredUserData();
        
        if (!user) {
          navigate('/login', { state: { from: location } });
          return;
        }

        // Nếu không có requiredPermission, cho phép truy cập
        if (!requiredPermission) {
          setHasPermission(true);
          return;
        }

        // Logic check permission dựa trên role
        const userRole = user.role;
        const hasAccess = checkRolePermission(userRole, requiredPermission);
        
        if (!hasAccess) {
          // Lưu URL hiện tại để có thể quay lại sau
          localStorage.setItem('last_attempted_url', location.pathname);
          navigate('/access-denied');
          return;
        }

        setHasPermission(true);
      } catch (error) {
        console.error('Permission check error:', error);
        navigate('/access-denied');
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [requiredPermission, navigate, location]);

  return { hasPermission, loading };
};

// Helper function để check permission theo role
const checkRolePermission = (userRole, requiredPermission) => {
  const rolePermissions = {
    admin: ['*'], // Admin có tất cả quyền
    
    project_manager: [
      'dashboard', 'projects', 'projects_create', 'projects_edit',
      'media_view', 'rents_view', 'bookings_view'
    ],
    
    media_manager: [
      'dashboard', 'media', 'media_create', 'media_edit',
      'projects_view'
    ],
    
    rent_manager: [
      'dashboard', 'rents', 'rents_create', 'rents_edit',
      'projects_view', 'media_view', 'bookings_view'
    ],
    
    booking_manager: [
      'dashboard', 'bookings', 'bookings_edit',
      'projects_view', 'media_view', 'rents_view'
    ]
  };

  const userPerms = rolePermissions[userRole] || [];
  
  // Nếu user có quyền '*' hoặc có requiredPermission
  return userPerms.includes('*') || userPerms.includes(requiredPermission);
};

export default usePermission;