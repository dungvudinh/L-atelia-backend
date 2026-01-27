// services/b2Service.js - COMPLETE PROXY SERVICE
import axiosClient from "../configs/axios";

const B2_PUBLIC_URL = 'https://f005.backblazeb2.com/file/latelia';

export const b2Service = {
  // Main upload method - always via backend proxy
  uploadFile: async (file, folder = 'general', onProgress = null) => {
    try {
      // console.log('🔄 Starting file upload via backend proxy...', {
      //   name: file.name,
      //   size: (file.size / 1024 / 1024).toFixed(2) + 'MB',
      //   type: file.type,
      //   folder
      // });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await axiosClient.post('/v1/b2/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000, // 60 seconds timeout
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        }
      });

      // console.log('✅ Upload successful:', {
      //   filename: response.data.data.filename,
      //   size: (response.data.data.size / 1024 / 1024).toFixed(2) + 'MB',
      //   url: response.data.data.url,
      //   optimized: response.data.data.optimized
      // });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };

    } catch (error) {
      console.error('❌ Upload failed:', error);
      
      let errorMessage = 'Upload failed';
      let errorDetails = null;
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        errorDetails = error.response.data;
      } else if (error.request) {
        // Request was made but no response
        errorMessage = 'No response from server. Please check your internet connection.';
      } else {
        // Something else happened
        errorMessage = error.message;
      }
      
      return {
        success: false,
        message: errorMessage,
        details: errorDetails,
        error: error
      };
    }
  },

  // Upload multiple files
  uploadMultipleFiles: async (files, folder = 'general', onProgress = null) => {
    try {
      // console.log(`📦 Uploading ${files.length} files...`);

      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });
      formData.append('folder', folder);

      const response = await axiosClient.post('/v1/b2/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000, // 2 minutes for multiple files
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        }
      });

      // console.log('✅ Multiple upload completed:', {
      //   total: response.data.data.total,
      //   successful: response.data.data.successful,
      //   failed: response.data.data.failed
      // });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };

    } catch (error) {
      console.error('❌ Multiple upload failed:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        error: error
      };
    }
  },

  // Delete file
  deleteFile: async (fileKey) => {
    try {
      // console.log('🗑️ Deleting file:', fileKey);
      
      const response = await axiosClient.delete('/v1/b2/files', {
        data: { fileKey },
        timeout: 10000
      });
      
      // console.log('✅ File deleted successfully');
      
      return {
        success: true,
        data: response.data,
        message: 'File deleted successfully'
      };
      
    } catch (error) {
      console.error('❌ Delete failed:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        error: error
      };
    }
  },

  // List files in folder
  listFiles: async (folder = '', options = {}) => {
    try {
      const { prefix = '', limit = 100 } = options;
      
      // console.log('📋 Listing files:', { folder, prefix });
      
      const response = await axiosClient.get('/v1/b2/files', {
        params: { folder, prefix, limit },
        timeout: 10000
      });
      
      // console.log(`✅ Found ${response.data.data.total} files`);
      
      return {
        success: true,
        data: response.data.data,
        message: 'Files retrieved successfully'
      };
      
    } catch (error) {
      console.error('❌ List files failed:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        error: error
      };
    }
  },

  // Get file info
  getFileInfo: async (fileKey) => {
    try {
      // console.log('📄 Getting file info for:', fileKey);
      
      const response = await axiosClient.get(`/v1/b2/files/${encodeURIComponent(fileKey)}`, {
        timeout: 10000
      });
      
      // console.log('✅ File info retrieved');
      
      return {
        success: true,
        data: response.data.data,
        message: 'File info retrieved successfully'
      };
      
    } catch (error) {
      console.error('❌ Get file info failed:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        error: error
      };
    }
  },

  // Helper: Get public URL from key
  getPublicUrl: (key) => {
    if (!key) return null;
    // Remove leading slash if present
    const cleanKey = key.startsWith('/') ? key.substring(1) : key;
    return `${B2_PUBLIC_URL}/${cleanKey}`;
  },

  // Helper: Extract filename from key
  getFilenameFromKey: (key) => {
    if (!key) return '';
    const parts = key.split('/');
    return parts[parts.length - 1];
  },

  // Helper: Extract folder from key
  getFolderFromKey: (key) => {
    if (!key) return '';
    const parts = key.split('/');
    if (parts.length > 1) {
      parts.pop(); // Remove filename
      return parts.join('/');
    }
    return '';
  }
};