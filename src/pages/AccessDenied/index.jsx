// src/pages/AccessDenied.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Home, ArrowLeft, AlertTriangle } from 'lucide-react';

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="relative">
              <Shield className="w-16 h-16 text-red-500" />
              <AlertTriangle className="w-8 h-8 text-red-600 absolute -top-2 -right-2" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">!</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Access Denied
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              You don't have permission to access this feature. 
              Please contact your administrator if you believe this is a mistake.
            </p>
          </div>

          {/* Error Code (Optional) */}
          <div className="bg-gray-100 rounded-lg p-4 inline-block">
            <code className="text-sm text-gray-700 font-mono">
              Error: 403 - Forbidden
            </code>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium group"
            >
              <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Back to Home
            </button>
          </div>

          {/* Additional Help */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help?{' '}
              <button 
                onClick={() => navigate('/contact')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Contact Support
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;