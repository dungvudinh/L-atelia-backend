// components/MediaEditor.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import { folderService } from '../../services/folderService';
import { mediaService } from '../../services/mediaService';
import { b2Service } from '../../services/b2Service';
import FolderManager from '../../components/FolderManager';

const MediaEditor = () => {
  const { mediaId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(mediaId);
  const editorRef = useRef(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'lifestyle',
    status: 'draft',
    featuredImage: '',
    tags: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [showFolderManager, setShowFolderManager] = useState(false);
  const [folderManagerMode, setFolderManagerMode] = useState('editor');
  const [pendingImageDeletion, setPendingImageDeletion] = useState(false);
  const [originalFeaturedImage, setOriginalFeaturedImage] = useState(null);
  const [pendingImageUpload, setPendingImageUpload] = useState(null);
  const [localImageUrl, setLocalImageUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedImageFromFolder, setSelectedImageFromFolder] = useState(null);

  useEffect(() => {
    if (isEditing) {
      loadMedia();
    }
  }, [mediaId, isEditing]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const response = await mediaService.getMediaById(mediaId);
      const featuredImage = response.data.featuredImage || '';
      
      setFormData({
        title: response.data.title,
        content: response.data.content,
        excerpt: response.data.excerpt || '',
        category: response.data.category,
        status: response.data.status,
        featuredImage: featuredImage,
        tags: response.data.tags ? response.data.tags.join(', ') : ''
      });
      
      if (featuredImage) {
        setOriginalFeaturedImage(featuredImage);
      } else {
        setOriginalFeaturedImage(null);
      }
      
      setPendingImageDeletion(false);
      setPendingImageUpload(null);
      setLocalImageUrl(null);
      setErrorMessage('');
      setSelectedImageFromFolder(null);
    } catch (error) {
      console.error('Error loading media:', error);
      alert('Không thể tải media');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditorChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const handleSelectImagesForEditor = (selectedImages) => {
    if (!selectedImages || selectedImages.length === 0) return;
    if (editorRef.current && isEditorReady) {
      const editor = editorRef.current;
      
      selectedImages.forEach(image => {
        const imageUrl = 'https://cdn.latelia.com/latelia/' + image.key;
        // const imageUrl = image.url; // Sử dụng URL trực tiếp từ image data
        editor.execCommand('mceInsertContent', false, `
          <img 
            src="${imageUrl}" 
            alt="${image.filename}" 
            style="max-width: 100%; height: auto;"
          />
        `);
      });
      
    } else {
      console.error('❌ Editor chưa sẵn sàng');
    }
    
    setShowFolderManager(false);
  };

  const handleSelectFeaturedImage = (selectedImages) => {
    if (!selectedImages || selectedImages.length === 0) return;
    
    try {
      const imageData = Array.isArray(selectedImages) ? selectedImages[0] : selectedImages;
      
      const newImage = {
        url: imageData.url,
        thumbnailUrl: imageData.thumbnailUrl || null,
        key: imageData.key,
        thumbnailKey: imageData.thumbnailKey || null,
        filename: imageData.filename,
        originalName: imageData.originalName || imageData.filename,
        size: imageData.size || 0,
        thumbnailSize: imageData.thumbnailSize || 0,
        hasThumbnail: imageData.hasThumbnail || false,
        isLocal: false,
        isNewFromFolder: true
      };
      
      setFormData(prev => ({
        ...prev,
        featuredImage: newImage
      }));
      
      setSelectedImageFromFolder(newImage);
      
      const displayUrl = newImage.thumbnailUrl || newImage.url;
      setLocalImageUrl(displayUrl);
      
      if (pendingImageUpload) {
        setPendingImageUpload(null);
      }
      
      if (pendingImageDeletion) {
        setPendingImageDeletion(false);
      }
      
      setErrorMessage('');
      
      
    } catch (error) {
      console.error('❌ Error selecting featured image from FolderManager:', error);
      alert('Không thể chọn ảnh từ thư viện');
    } finally {
      setShowFolderManager(false);
    }
  };

  const openFolderManagerForEditor = () => {
    setFolderManagerMode('editor');
    setShowFolderManager(true);
  };

  const openFolderManagerForFeaturedImage = () => {
    setFolderManagerMode('featured');
    setShowFolderManager(true);
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    try {
      setImageUploading(true);
      
      const localUrl = URL.createObjectURL(file);
      setLocalImageUrl(localUrl);
      
      setPendingImageUpload(file);
      
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '-').toLowerCase();
      const uniqueFilename = `${timestamp}-${safeName}`;
      
      setFormData(prev => ({
        ...prev,
        featuredImage: {
          url: localUrl,
          filename: uniqueFilename,
          originalName: file.name,
          size: file.size,
          type: file.type,
          isLocal: true,
          uploadPending: true,
          isNewUpload: true
        }
      }));
      
      setSelectedImageFromFolder(null);
      
      setErrorMessage('');
      
      
      
    } catch (error) {
      console.error('❌ Error preparing image:', error);
      alert('Không thể xử lý ảnh');
    } finally {
      setImageUploading(false);
    }
  };

  const uploadImageToB2 = async (file) => {
  try {
    
    // 🔴 THÊM: Upload ảnh vào path /latelia/media/
    const uploadResult = await b2Service.uploadFile(
      file, 
      'media', // 🔴 Sửa: 'media' thay vì 'featured-images'
      (percent) => {
        console.log(`📊 Upload progress: ${percent}%`);
      }
    );
    if (!uploadResult.success) {
      throw new Error(uploadResult.message);
    }
    
    
    return {
     ...uploadResult.data, 
      optimized: uploadResult.data.optimized || false,
      isFromMediaUpload: true, // 🔴 Đánh dấu đây là ảnh từ upload MediaEditor
      storagePath: 'media' // 🔴 Đánh dấu path
    };
    
  } catch (error) {
    console.error('❌ Featured image upload failed:', error);
    throw new Error(`Không thể upload ảnh đại diện: ${error.message}`);
  }
};

  const deleteImageFromB2 = async (imageKey, imageData = null) => {
  try {
    if (!imageKey) return;
    
    // 🔴 QUAN TRỌNG: Chỉ xóa nếu ảnh từ /latelia/media/
    if (imageData) {
      // Kiểm tra xem ảnh có từ path /latelia/media/ không
      const isFromMediaPath = imageData.isFromMediaUpload || 
                              (imageData.key && imageData.key.includes('/media/')) ||
                              (imageData.url && imageData.url.includes('/latelia/media/'));
      
      
      
      // 🔴 CHỈ xóa nếu ảnh từ path /latelia/media/
      if (!isFromMediaPath) {
        console.log('⚠️ Skipping deletion - Image is from FolderManager (folders/)');
        return;
      }
    }
    
    await b2Service.deleteFile(imageKey);
    
  } catch (error) {
    console.error('❌ Failed to delete image from B2:', error);
  }
};

  const handleDeleteFeaturedImage = () => {
  if (!formData.featuredImage) return;
  
  if (localImageUrl) {
    URL.revokeObjectURL(localImageUrl);
    setLocalImageUrl(null);
  }
  
  if (originalFeaturedImage) {
    // 🔴 Kiểm tra nguồn gốc ảnh để hiển thị thông báo phù hợp
    const isFromMediaUpload = originalFeaturedImage.isFromMediaUpload || 
                             (originalFeaturedImage.key && originalFeaturedImage.key.includes('/media/')) ||
                             (originalFeaturedImage.url && originalFeaturedImage.url.includes('/latelia/media/'));
    
    
    
    setPendingImageDeletion(true);
  }
  
  if (pendingImageUpload) {
    setPendingImageUpload(null);
  }
  
  if (selectedImageFromFolder) {
    setSelectedImageFromFolder(null);
  }
  
  setFormData(prev => ({
    ...prev,
    featuredImage: ''
  }));
  
  if (!isEditing) {
    setErrorMessage('Vui lòng thêm ảnh đại diện trước khi xuất bản');
  }
};

  const handleRestoreFeaturedImage = () => {
    if (originalFeaturedImage) {
      setFormData(prev => ({
        ...prev,
        featuredImage: originalFeaturedImage
      }));
      setPendingImageDeletion(false);
      setErrorMessage('');
    }
  };

  const hasFeaturedImage = () => {
    if (pendingImageUpload) return true;
    
    if (selectedImageFromFolder) return true;
    
    if (formData.featuredImage) {
      if (typeof formData.featuredImage === 'object') {
        if (formData.featuredImage.isNewFromFolder) return true;
        if (formData.featuredImage.isNewUpload) return true;
        return !formData.featuredImage.isLocal;
      }
      return true;
    }
    
    if (originalFeaturedImage && !pendingImageDeletion) return true;
    
    return false;
  };

  const validateBeforeSubmit = () => {
    if (!formData.title.trim()) {
      setErrorMessage('Vui lòng nhập tiêu đề');
      return false;
    }
    
    if (!formData.content.trim()) {
      setErrorMessage('Vui lòng nhập nội dung');
      return false;
    }
    
    if (!hasFeaturedImage()) {
      setErrorMessage('Vui lòng thêm ảnh đại diện trước khi ' + (isEditing ? 'cập nhật' : 'xuất bản'));
      return false;
    }
    
    setErrorMessage('');
    return true;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateBeforeSubmit()) {
    return;
  }
  
  setLoading(true);

  try {
    const submitData = {
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt,
      category: formData.category,
      status: formData.status,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    

    // 🟢 LOGIC ĐƠN GIẢN HÓA:
    
    // Xác định ảnh cần lưu
    let featuredImageToSave = null;
    
    // 1. Ưu tiên ảnh mới từ upload (sẽ lưu vào /latelia/media/)
    if (pendingImageUpload) {
      const uploadedImage = await uploadImageToB2(pendingImageUpload);
      featuredImageToSave = {
        ...uploadedImage, 
        isFromMediaUpload: true, // 🔴 Đánh dấu đây là ảnh từ MediaEditor
        storagePath: 'media' // 🔴 Đánh dấu path
      };
      setPendingImageUpload(null);
    }
    // 2. Ưu tiên ảnh mới từ FolderManager (path: /latelia/folders/.../)
    else if (selectedImageFromFolder) {
      featuredImageToSave = {
        url: selectedImageFromFolder.url,
        thumbnailUrl: selectedImageFromFolder.thumbnailUrl,
        key: selectedImageFromFolder.key,
        thumbnailKey: selectedImageFromFolder.thumbnailKey,
        filename: selectedImageFromFolder.filename,
        originalName: selectedImageFromFolder.originalName,
        size: selectedImageFromFolder.size,
        thumbnailSize: selectedImageFromFolder.thumbnailSize,
        hasThumbnail: selectedImageFromFolder.hasThumbnail || false,
        isFromMediaUpload: false, // 🔴 Đánh dấu KHÔNG phải từ MediaEditor
        storagePath: 'folders' // 🔴 Đánh dấu path
      };
    }
    // 3. Nếu xóa ảnh
    else if (pendingImageDeletion) {
      featuredImageToSave = ''; // Empty string để xóa
    }
    // 4. Nếu đang edit và không xóa, giữ ảnh cũ
    else if (isEditing && originalFeaturedImage && !pendingImageDeletion) {
      featuredImageToSave = originalFeaturedImage;
    }
    // 5. Nếu tạo mới và có ảnh trong formData
    else if (!isEditing && formData.featuredImage && typeof formData.featuredImage === 'object') {
      if (formData.featuredImage.key) {
        featuredImageToSave = {
          url: formData.featuredImage.url,
          thumbnailUrl: formData.featuredImage.thumbnailUrl,
          key: formData.featuredImage.key,
          thumbnailKey: formData.featuredImage.thumbnailKey,
          filename: formData.featuredImage.filename,
          originalName: formData.featuredImage.originalName,
          size: formData.featuredImage.size,
          thumbnailSize: formData.featuredImage.thumbnailSize,
          hasThumbnail: formData.featuredImage.hasThumbnail || false,
          // 🔴 Kiểm tra nguồn gốc
          isFromMediaUpload: formData.featuredImage.isFromMediaUpload || 
                           (formData.featuredImage.key?.includes('/media/') || 
                            formData.featuredImage.url?.includes('/latelia/media/')),
          storagePath: formData.featuredImage.key?.includes('/media/') ? 'media' : 'folders'
        };
      }
    }

    // 🔴 Xóa ảnh cũ nếu cần - CHỈ xóa nếu ảnh từ /latelia/media/
    if (isEditing && originalFeaturedImage && originalFeaturedImage.key) {
      // Kiểm tra xem ảnh cũ có phải từ MediaEditor không
      const isOldImageFromMediaUpload = originalFeaturedImage.isFromMediaUpload || 
                                       (originalFeaturedImage.key && originalFeaturedImage.key.includes('/media/')) ||
                                       (originalFeaturedImage.url && originalFeaturedImage.url.includes('/latelia/media/'));
      
      
      
      // Chỉ xóa ảnh cũ nếu:
      // 1. Có ảnh mới thay thế VÀ ảnh cũ từ MediaEditor
      // 2. Đang xóa ảnh VÀ ảnh cũ từ MediaEditor
      const shouldDeleteOldImage = 
        ((featuredImageToSave && featuredImageToSave !== '' && featuredImageToSave.key !== originalFeaturedImage.key) || 
         pendingImageDeletion) &&
        isOldImageFromMediaUpload;
      
      if (shouldDeleteOldImage) {
        try {
          await deleteImageFromB2(originalFeaturedImage.key, originalFeaturedImage);
        } catch (deleteError) {
          console.warn('⚠️ Could not delete old image from B2:', deleteError.message);
        }
      } else if (pendingImageDeletion && !isOldImageFromMediaUpload) {
        console.log('⚠️ Skipping deletion - Old image is from FolderManager (folders/)');
      }
    }

    // Thêm featuredImage vào submitData
    submitData.featuredImage = featuredImageToSave || '';


    // Gửi dữ liệu lên server
    let result;
    if (isEditing) {
      result = await mediaService.updateMedia(mediaId, submitData);
    } else {
      result = await mediaService.createMedia(submitData);
    }

    // Cleanup
    if (localImageUrl) {
      URL.revokeObjectURL(localImageUrl);
    }

    setPendingImageDeletion(false);
    setPendingImageUpload(null);
    setSelectedImageFromFolder(null);
    setLocalImageUrl(null);
    setErrorMessage('');
    
    alert(isEditing ? 'Cập nhật bài viết thành công' : 'Tạo bài viết thành công');
    navigate('/media');
  } catch (error) {
    console.error('❌ Error saving media:', error);
    console.error('Error response:', error.response?.data);
    alert('Không thể lưu media: ' + (error.response?.data?.message || error.message));
  } finally {
    setLoading(false);
  }
};

  const handleCancel = () => {
    if (localImageUrl) {
      URL.revokeObjectURL(localImageUrl);
    }
    
    setPendingImageDeletion(false);
    setPendingImageUpload(null);
    setSelectedImageFromFolder(null);
    setLocalImageUrl(null);
    setErrorMessage('');
    
    navigate('/media');
  };

  const getImageUrl = (imageData) => {
    if (!imageData) return null;
    
    if (typeof imageData === 'string') {
      return imageData;
    }
    
    if (typeof imageData === 'object' && imageData.url) {
      if (imageData.thumbnailUrl) {
        return imageData.thumbnailUrl;
      }
      return imageData.url;
    }
    
    return null;
  };

  const getImageInfo = () => {
    if (!formData.featuredImage) return null;
    
    if (typeof formData.featuredImage === 'object') {
      return {
        url: getImageUrl(formData.featuredImage),
        filename: formData.featuredImage.filename || 'Ảnh tải lên',
        isLocal: formData.featuredImage.isLocal || false,
        uploadPending: formData.featuredImage.uploadPending || false,
        hasThumbnail: formData.featuredImage.hasThumbnail || false,
        isNewFromFolder: formData.featuredImage.isNewFromFolder || false,
        isNewUpload: formData.featuredImage.isNewUpload || false
      };
    }
    
    return {
      url: getImageUrl(formData.featuredImage),
      filename: 'Ảnh đại diện'
    };
  };

  const imageInfo = getImageInfo();

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Chỉnh sửa Media' : 'Tạo Media mới'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEditing ? 'Cập nhật nội dung media của bạn' : 'Tạo nội dung media mới với trình soạn thảo TinyMCE'}
            </p>
          </div>
          <Link
            to="/media"
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Quay lại danh sách
          </Link>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 font-medium">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  placeholder="Nhập tiêu đề media..."
                />
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung *
                </label>
                <Editor
                  apiKey="e0mlbyctuw2vqfmgsikefb1m8z608cd8xxk435olgbfd46ez"
                  onInit={(evt, editor) => {
                    editorRef.current = editor;
                    setIsEditorReady(true);
                  }}
                  value={formData.content}
                  onEditorChange={handleEditorChange}
                  init={{
                    height: 500,
                    menubar: 'file edit view insert format tools table',
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | blocks fontfamily | bold italic forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | code',
                    file_picker_types: 'image',
                    file_picker_callback: (callback, value, meta) => {
                      openFolderManagerForEditor();
                    },
                    content_style: `
                      @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap');
                      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Infant:ital,wght@0,300..700;1,300..700&display=swap');
                      body { font-family: Nunito Sans, sans-serif; }
                      img { max-width: 100%; height: auto; }
                    `,
                    color_map: [
                      '#F3EEE7', 'BG Primary',
                      '#404040', 'TXT Primary',
                      '#2F5855', 'TXT Secondary',
                      '#434343', 'TXT Gray',
                      '#344D3B', 'BG Secondary',
                      '#D9D9D9', 'Dot',
                      '#000000', 'Black',
                      '#FFFFFF', 'White',
                      '#FF0000', 'Red'
                    ],
                    color_cols: 3,
                    color_default_foreground: '#404040',
                    color_default_background: '#F3EEE7'
                  }}
                />
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={openFolderManagerForEditor}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Chèn ảnh từ thư viện
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    Ảnh sẽ được chèn với chất lượng gốc
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                  Đoạn trích
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mô tả ngắn về nội dung..."
                />
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Xuất bản</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trạng thái
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="draft">Bản nháp</option>
                      <option value="published">Xuất bản</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Danh mục
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="lifestyle">Lifestyle</option>
                      <option value="properties">Properties</option>
                      <option value="product">Product</option>
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg transition-colors font-medium"
                    >
                      {loading ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Xuất bản')}
                    </button>
                    
                    {isEditing && (
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ảnh đại diện *</h3>
                
                {imageInfo ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <img 
                        src={imageInfo.url} 
                        alt="Featured" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {imageInfo.isLocal && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                          {imageInfo.uploadPending ? 'Chờ upload' : 'Chưa upload'}
                        </div>
                      )}
                      {pendingImageDeletion && !imageInfo.isLocal && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          Sẽ xóa
                        </div>
                      )}
                      {imageInfo.hasThumbnail && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          ✓ Thumb
                        </div>
                      )}
                      {imageInfo.isNewFromFolder && (
                        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Ảnh mới
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={handleDeleteFeaturedImage}
                        disabled={imageUploading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium disabled:bg-red-400"
                      >
                        {imageUploading ? 'Đang xử lý...' : 'Xóa ảnh'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={openFolderManagerForFeaturedImage}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                      >
                        Chọn từ thư viện
                      </button>
                      
                      {imageInfo.isNewFromFolder && (
                        <div className="text-xs text-blue-600 font-medium bg-blue-50 p-2 rounded text-center">
                          Đã chọn ảnh mới từ thư viện. Ảnh này sẽ được lưu khi bạn nhấn "{isEditing ? 'Cập nhật' : 'Xuất bản'}"
                        </div>
                      )}
                      
                      {pendingImageDeletion && !imageInfo.isLocal && (
                        <div className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded text-center">
                          Ảnh sẽ bị xóa khi bạn nhấn "{isEditing ? 'Cập nhật' : 'Xuất bản'}"
                        </div>
                      )}
                      
                      {imageInfo.isLocal && (
                        <div className="text-xs text-yellow-600 font-medium bg-yellow-50 p-2 rounded text-center">
                          Ảnh sẽ được upload trực tiếp lên cloud khi bạn nhấn "{isEditing ? 'Cập nhật' : 'Xuất bản'}"
                        </div>
                      )}
                    </div>
                    
                    {pendingImageDeletion && originalFeaturedImage && !imageInfo.isLocal && (
                      <button
                        type="button"
                        onClick={handleRestoreFeaturedImage}
                        className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Khôi phục ảnh
                      </button>
                    )}
                  </div>
                ) : (
                  <div className={`border-2 border-dashed ${errorMessage && !hasFeaturedImage() ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-lg p-6 text-center`}>
                    <input
                      type="file"
                      id="featuredImage"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleImageUpload(file);
                        e.target.value = '';
                      }}
                      className="hidden"
                      disabled={imageUploading}
                    />
                    <label htmlFor="featuredImage" className="cursor-pointer">
                      <svg className={`w-12 h-12 ${errorMessage && !hasFeaturedImage() ? 'text-red-400' : 'text-gray-400'} mx-auto mb-3`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className={`text-sm ${errorMessage && !hasFeaturedImage() ? 'text-red-600' : 'text-gray-600'} mb-2`}>
                        {imageUploading ? 'Đang xử lý...' : 'Nhấp để tải ảnh lên'}
                      </p>
                      <span className={`text-xs ${errorMessage && !hasFeaturedImage() ? 'text-red-500' : 'text-gray-500'}`}>
                        PNG, JPG, GIF tối đa 10MB
                      </span>
                      {errorMessage && !hasFeaturedImage() && (
                        <p className="text-xs text-red-600 mt-2 font-medium">
                          Ảnh đại diện là bắt buộc
                        </p>
                      )}
                    </label>
                    
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={openFolderManagerForFeaturedImage}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                      >
                        Chọn từ thư viện
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="react, javascript, web..."
                />
                <p className="text-xs text-gray-500 mt-2">Phân cách tags bằng dấu phẩy</p>
              </div>
            </div>
          </div>
        </form>
      </div>

      {showFolderManager && (
        <FolderManager
          onClose={() => setShowFolderManager(false)}
          onSelect={(images) => {
            if (folderManagerMode === 'editor') {
              handleSelectImagesForEditor(images);
            } else {
              handleSelectFeaturedImage(images);
            }
          }}
          singleSelect={folderManagerMode === 'featured'}
          title={folderManagerMode === 'editor' ? 'Chọn ảnh cho bài viết' : 'Chọn ảnh đại diện'}
          description={folderManagerMode === 'editor' ? 'Chọn ảnh để chèn vào nội dung' : 'Chọn 1 ảnh làm ảnh đại diện'}
          allowUpload={true}
        />
      )}
    </>
  );
};

export default MediaEditor;