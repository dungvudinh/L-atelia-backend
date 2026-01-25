// services/folderService.js - BẢN SỬA CẤP BÁCH
import axiosClient from "../configs/axios";

export const folderService = {
  // Get all folders
  getFolders: async () => {
    try {
      console.log('📋 Fetching folders');
      const response = await axiosClient.get('/v1/folders');
      console.log('✅ Folders fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error in getFolders service:', error);
      throw error;
    }
  },

  // Get folder by ID
  getFolderById: async (id) => {
    try {
      console.log(`📋 Fetching folder with ID: ${id}`);
      const response = await axiosClient.get(`/v1/folders/${id}`);
      console.log('✅ Folder fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error in getFolderById service:', error);
      throw error;
    }
  },

  // Create folder
  createFolder: async (folderData) => {
    try {
      console.log('🔄 Creating folder:', folderData);
      const response = await axiosClient.post('/v1/folders', folderData);
      console.log('✅ Folder created successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error in createFolder service:', error);
      throw error;
    }
  },

  // Update folder
  updateFolder: async (id, folderData) => {
    try {
      console.log(`🔄 Updating folder with ID: ${id}`);
      const response = await axiosClient.put(`/v1/folders/${id}`, folderData);
      console.log('✅ Folder updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error in updateFolder service:', error);
      throw error;
    }
  },

  // Delete folder
  deleteFolder: async (id) => {
    try {
      console.log(`🗑️ Deleting folder with ID: ${id}`);
      const response = await axiosClient.delete(`/v1/folders/${id}`);
      console.log('✅ Folder deleted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error in deleteFolder service:', error);
      throw error;
    }
  },

  // ========== FIX UPLOAD - GIẢI PHÁP CHÍNH ==========
  // Phương pháp 1: Dùng FormData với fetch (khó bị chặn hơn)
  uploadImages: async (folderId, formData) => {
    try {
      console.log(`🔄 Uploading images to folder: ${folderId}`);
      
      // OPTION 1: Dùng fetch với timeout dài
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 phút
      
      try {
        const response = await fetch(`https://l-atelia-api-yct5.onrender.com/v1/folders/${folderId}/upload`, {
          method: 'POST',
          body: formData,
          signal: controller.signal,
          // Không set header Content-Type để browser tự set
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Images uploaded successfully via fetch');
        return { data };
        
      } catch (fetchError) {
        console.log('Fetch upload failed, trying Form submission...', fetchError.message);
        
        // OPTION 2: Fallback to Form submission với iframe
        return await uploadViaFormSubmission(folderId, formData);
      }
      
    } catch (error) {
      console.error('❌ Error in uploadImages service:', error);
      throw error;
    }
  },

  // Phương pháp 2: Form submission với iframe (bypass extension)
  uploadImagesViaForm: async (folderId, files) => {
    return new Promise((resolve, reject) => {
      console.log('🔄 Using FORM submission to bypass extensions...');
      
      // 1. Tạo form ẩn
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `/v1/folders/${folderId}/upload-form`; // Endpoint đặc biệt
      form.style.display = 'none';
      form.enctype = 'multipart/form-data';
      
      // 2. Thêm files vào form
      files.forEach((file, index) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.name = 'images'; // 👈 Tên field phải khớp với backend
        input.multiple = true;
        
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        
        form.appendChild(input);
      });
      
      // 3. Tạo iframe để nhận response
      const iframe = document.createElement('iframe');
      const iframeName = `upload-iframe-${Date.now()}`;
      iframe.name = iframeName;
      iframe.style.display = 'none';
      
      form.target = iframeName;
      
      // 4. Xử lý response
      iframe.onload = () => {
        try {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
          const responseText = iframeDoc.body.textContent || iframeDoc.body.innerText;
          
          if (responseText) {
            const response = JSON.parse(responseText);
            if (response.success) {
              resolve({ data: response });
            } else {
              reject(new Error(response.message || 'Upload failed'));
            }
          } else {
            reject(new Error('Empty response from server'));
          }
        } catch (error) {
          console.error('Failed to parse response:', error);
          reject(new Error('Failed to parse server response'));
        } finally {
          // Cleanup
          if (form.parentNode) document.body.removeChild(form);
          if (iframe.parentNode) document.body.removeChild(iframe);
        }
      };
      
      iframe.onerror = () => {
        reject(new Error('Form upload failed'));
        if (form.parentNode) document.body.removeChild(form);
        if (iframe.parentNode) document.body.removeChild(iframe);
      };
      
      // 5. Thêm vào DOM và submit
      document.body.appendChild(iframe);
      document.body.appendChild(form);
      form.submit();
      
      // 6. Timeout
      setTimeout(() => {
        if (form.parentNode || iframe.parentNode) {
          reject(new Error('Form upload timeout (2 minutes)'));
          if (form.parentNode) document.body.removeChild(form);
          if (iframe.parentNode) document.body.removeChild(iframe);
        }
      }, 120000);
    });
  },

  // Delete image from folder
  deleteImage: async (folderId, imageId) => {
    try {
      console.log(`🗑️ Deleting image ${imageId} from folder ${folderId}`);
      const response = await axiosClient.delete(`/v1/folders/${folderId}/images/${imageId}`);
      console.log('✅ Image deleted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Error in deleteImage service:', error);
      throw error;
    }
  }
};

// Helper function: Form submission fallback
const uploadViaFormSubmission = (folderId, formData) => {
  return new Promise((resolve, reject) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/v1/folders/${folderId}/upload-form`;
    form.style.display = 'none';
    form.enctype = 'multipart/form-data';
    
    // Chuyển FormData thành form inputs
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const input = document.createElement('input');
        input.type = 'file';
        input.name = key;
        
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(value);
        input.files = dataTransfer.files;
        
        form.appendChild(input);
      }
    }
    
    const iframe = document.createElement('iframe');
    const iframeName = `form-upload-${Date.now()}`;
    iframe.name = iframeName;
    iframe.style.display = 'none';
    
    form.target = iframeName;
    
    iframe.onload = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const responseText = iframeDoc.body.textContent;
        const response = JSON.parse(responseText);
        resolve({ data: response });
      } catch (error) {
        reject(new Error('Form upload failed to parse response'));
      } finally {
        document.body.removeChild(form);
        document.body.removeChild(iframe);
      }
    };
    
    document.body.appendChild(iframe);
    document.body.appendChild(form);
    form.submit();
    
    setTimeout(() => {
      reject(new Error('Form upload timeout'));
    }, 120000);
  });
};