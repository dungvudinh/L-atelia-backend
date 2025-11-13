// components/MediaEditor.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import { folderService } from '../../services/folderService';
import { mediaService } from '../../services/mediaService';

const MediaEditor = () => {
  const { mediaId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(mediaId);
  const editorRef = useRef(null);
  
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
  const [showMediaManager, setShowMediaManager] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadMedia();
    }
  }, [mediaId, isEditing]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const response = await mediaService.getMediaById(mediaId);
      setFormData({
        title: response.data.title,
        content: response.data.content,
        excerpt: response.data.excerpt || '',
        category: response.data.category,
        status: response.data.status,
        featuredImage: response.data.featuredImage || '',
        tags: response.data.tags ? response.data.tags.join(', ') : ''
      });
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

  const handleImageUpload = async (file) => {
    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append('featuredImage', file);

      const response = await mediaService.uploadFeaturedImage(formData);
      // Lưu đường dẫn vào formData
      setFormData(prev => ({
        ...prev,
        featuredImage: response.data.url // Lưu đường dẫn tương đối
      }));
      
    } catch (error) {
      console.error('Error uploading featured image:', error);
      alert('Không thể tải ảnh lên');
    } finally {
      setImageUploading(false);
    }
  };
  const handleDeleteFeaturedImage = async () => {
    if (!formData.featuredImage) return;
    try {
      // Lấy filename từ đường dẫn
      const imageInfo = {
        imageUrl: formData.featuredImage,  // URL đầy đủ (cho Cloudinary)
        filename: formData.featuredImage.split('/').pop() // Tên file (cho local)
      };
      
      // Gọi API xóa file
      await mediaService.deleteFeaturedImage(imageInfo);
      
      // Xóa khỏi form data
      setFormData(prev => ({
        ...prev,
        featuredImage: ''
      }));
      
    } catch (error) {
      console.error('Error deleting featured image:', error);
      alert('Không thể xóa ảnh');
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (isEditing) {
        await mediaService.updateMedia(mediaId, submitData);
      } else {
        await mediaService.createMedia(submitData);
      }

      navigate('/media');
    } catch (error) {
      console.error('Error saving media:', error);
      alert('Không thể lưu media');
    } finally {
      setLoading(false);
    }
  };

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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
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
                  onInit={(evt, editor) => editorRef.current = editor}
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
                    toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | code',
                    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                    file_picker_types: 'image media',
                    file_picker_callback: (callback, value, meta) => {
                      if (meta.filetype === 'image') {
                        setShowMediaManager(true);
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowMediaManager(true)}
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Mở Media Manager
                </button>
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

            <div className="space-y-6">
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
                        onClick={() => navigate('/media')}
                        className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Ảnh đại diện</h3>
                
                {formData.featuredImage ? (
                  <div className="space-y-3">
                    <img 
                      src={getImageUrl(formData.featuredImage)} 
                      alt="Featured" 
                      className="w-full h-48 object-cover rounded-lg"
                      crossOrigin="anonymous"
                    />
                    <button
                      type="button"
                      onClick={handleDeleteFeaturedImage}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      id="featuredImage"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleImageUpload(file);
                      }}
                      className="hidden"
                    />
                    <label htmlFor="featuredImage" className="cursor-pointer">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-600 mb-2">
                        {imageUploading ? 'Đang tải lên...' : 'Nhấp để tải ảnh lên'}
                      </p>
                      <span className="text-xs text-gray-500">PNG, JPG, GIF tối đa 10MB</span>
                    </label>
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

      {showMediaManager && (
        <MediaManager
          onClose={() => setShowMediaManager(false)} 
          editorRef={editorRef}
        />
      )}
    </>
  );
};
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  console.log('Original image path:', imagePath);
  
  // Nếu là URL đầy đủ (http/https) hoặc data URL
  if (imagePath.startsWith('http') || imagePath.startsWith('blob:') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Nếu là đường dẫn tương đối
  const baseUrl = 'http://localhost:3000';
  
  // Xử lý đường dẫn Windows (có backslash)
  const normalizedPath = imagePath.replace(/\\/g, '/');
  
  // Đảm bảo có slash ở giữa
  let finalUrl = `${baseUrl}${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`;
  
  console.log('Final image URL:', finalUrl);
  return finalUrl;
};
const MediaManager = ({ onClose, editorRef }) => {
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [images, setImages] = useState([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load folders với useCallback để tránh re-render không cần thiết
  const loadFolders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await folderService.getFolders();
      const foldersData = response.data || [];
      
      setFolders(foldersData);
      
      // Set folder đầu tiên làm current folder
      if (foldersData.length > 0) {
        const firstFolder = foldersData[0];
        setCurrentFolder(firstFolder);
        await loadFolderImages(firstFolder._id);
      } else {
        setCurrentFolder(null);
        setImages([]);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
      setError('Không thể tải danh sách folder');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  const loadFolderImages = async (folderId) => {
    try {
      const response = await folderService.getFolderById(folderId);
      const folderData = response.data;
      setCurrentFolder(folderData);
      setImages(folderData.images || []);
    } catch (error) {
      console.error('Error loading folder images:', error);
      setError('Không thể tải ảnh từ folder');
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      const response = await folderService.createFolder({
        name: newFolderName.trim()
      });
      
      setFolders(prev => [...prev, response.data]);
      setNewFolderName('');
      setShowCreateFolder(false);
      
      // Load lại folder mới tạo
      await loadFolderImages(response.data._id);
    } catch (error) {
      console.error('Error creating folder:', error);
      setError('Không thể tạo folder');
    }
  };

  const handleDeleteFolder = async (folderId, event) => {
    event?.stopPropagation();
    
    if (!window.confirm('Bạn có chắc muốn xóa folder này? Tất cả ảnh trong folder sẽ bị xóa.')) {
      return;
    }

    try {
      await folderService.deleteFolder(folderId);
      
      // CẬP NHẬT QUAN TRỌNG: Xử lý state update đúng cách
      const updatedFolders = folders.filter(folder => folder._id !== folderId);
      setFolders(updatedFolders);
      
      // Nếu đang xem folder bị xóa
      if (currentFolder && currentFolder._id === folderId) {
        if (updatedFolders.length > 0) {
          // Chuyển đến folder đầu tiên trong danh sách còn lại
          const newCurrentFolder = updatedFolders[0];
          setCurrentFolder(newCurrentFolder);
          await loadFolderImages(newCurrentFolder._id);
        } else {
          // Không còn folder nào
          setCurrentFolder(null);
          setImages([]);
        }
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Không thể xóa folder');
      }
    }
  };
  console.log(images)
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0 || !currentFolder) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file); // Sửa thành 'images' thay vì 'mediaFiles'
      });

      const response = await folderService.uploadImages(currentFolder._id, formData);
      console.log('RESPONSE', response)
      // Cập nhật state một lần duy nhất
      const newImages = response.data.uploadedImages;
      setImages(prev => [...prev, ...newImages]);
      
      setFolders(prev => prev.map(folder => 
        folder._id === currentFolder._id 
          ? { 
              ...folder, 
              images: [...(folder.images || []), ...newImages]
            }
          : folder
      ));

    } catch (error) {
      console.error('Error uploading images:', error);
      setError('Không thể tải ảnh lên');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDeleteImage = async (imageId, event) => {
    event?.stopPropagation();
    
    if (!window.confirm('Bạn có chắc muốn xóa ảnh này?')) {
      return;
    }

    try {
      await folderService.deleteImage(currentFolder._id, imageId);
      
      // Cập nhật state một lần duy nhất
      setImages(prev => prev.filter(img => img._id !== imageId));
      
      setFolders(prev => prev.map(folder => 
        folder._id === currentFolder._id 
          ? { 
              ...folder, 
              images: folder.images?.filter(img => img._id !== imageId) || []
            }
          : folder
      ));

    } catch (error) {
      console.error('Error deleting image:', error);
      setError('Không thể xóa ảnh');
    }
  };

  const handleImageSelect = (image) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const imageUrl = getImageUrl(image.url);
      
      // Chèn ảnh vào editor
      editor.execCommand('mceInsertContent', false, `
        <img 
          src="${imageUrl}" 
          crossOrigin="anonymous"
          alt="${image.originalName}" 
          style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;"
          data-image-id="${image._id}"
        />
      `);
      
      console.log('✅ Đã chèn ảnh vào editor:', image.originalName);
    }
    
    onClose();
  };

  const handleFolderSelect = async (folder) => {
    setCurrentFolder(folder);
    await loadFolderImages(folder._id);
  };

  // Component Image với xử lý lỗi tốt hơn
  const ImageItem = ({ image }) => {
    const [imgError, setImgError] = useState(false);
    const [imgLoading, setImgLoading] = useState(true);

    const handleImageError = () => {
      setImgError(true);
      setImgLoading(false);
    };

    const handleImageLoad = () => {
      setImgLoading(false);
    };

    return (
      <div
        onClick={() => handleImageSelect(image)}
        className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all"
      >
        <div className="aspect-square bg-gray-100 relative">
          {imgLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          )}
          <img
            src={imgError ? '/images/placeholder.jpg' : getImageUrl(image.url)}
            alt={image.originalName}
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{ display: imgLoading ? 'none' : 'block' }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button className="bg-white text-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>
        
        <button
          onClick={(e) => handleDeleteImage(image._id, e)}
          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-2">
          <p className="text-xs font-medium text-gray-900 truncate mb-1">
            {image.originalName}
          </p>
          <p className="text-xs text-gray-500">
            {image.size ? `${(image.size / (1024 * 1024)).toFixed(1)} MB` : 'Unknown size'}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Thư viện Media</h2>
            <p className="text-gray-600 text-sm">
              {currentFolder ? `Đang xem: ${currentFolder.name}` : 'Chọn ảnh để chèn vào bài viết'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="mt-2 text-red-600 hover:text-red-800 text-sm"
            >
              Đóng
            </button>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Folders */}
          <div className="w-64 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
            <div className="space-y-2">
              <button
                onClick={() => setShowCreateFolder(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tạo thư mục
              </button>

              {showCreateFolder && (
                <div className="p-3 bg-white border border-gray-200 rounded-lg space-y-3">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Tên thư mục..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleCreateFolder();
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateFolder}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Tạo
                    </button>
                    <button
                      onClick={() => setShowCreateFolder(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1 mt-4">
                {folders.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Chưa có folder nào
                  </p>
                ) : (
                  folders.map(folder => (
                    <div
                      key={folder._id}
                      className={`group relative flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        currentFolder?._id === folder._id
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <button
                        onClick={() => handleFolderSelect(folder)}
                        className="flex-1 flex items-center gap-3 text-left"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span className="font-medium truncate">{folder.name}</span>
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                          {folder.images?.length || 0}
                        </span>
                        
                        <button
                          onClick={(e) => handleDeleteFolder(folder._id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-opacity"
                          title="Xóa folder"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Images */}
          <div className="flex-1 p-6 overflow-y-auto">
            {currentFolder ? (
              <>
                {/* Upload Area */}
                <div className="mb-6">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Nhấp để tải lên</span> hoặc kéo thả
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF (Tối đa 10MB)</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>

                {uploading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600">Đang tải lên...</span>
                  </div>
                )}

                {/* Images Grid - Sử dụng ImageItem component mới */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {images.map(image => (
                    <ImageItem key={image._id} image={image} />
                  ))}
                </div>

                {images.length === 0 && !uploading && (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Không có ảnh nào</h3>
                    <p className="text-gray-600">Tải lên ảnh đầu tiên của bạn</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chọn một folder</h3>
                <p className="text-gray-600">Chọn folder từ sidebar để xem ảnh</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {currentFolder 
                ? `Đang xem: ${currentFolder.name} • ${images.length} ảnh`
                : 'Chọn folder để bắt đầu'
              }
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaEditor;