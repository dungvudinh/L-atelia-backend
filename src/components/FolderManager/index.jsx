// components/FolderManager.jsx
import { useState, useEffect, useCallback } from 'react';
import { folderService } from '../../services/folderService';

const FolderManager = ({ 
  onClose, 
  onSelect, 
  singleSelect = false,
  allowUpload = true,
  title = 'Thư viện Media',
  description = 'Chọn ảnh để sử dụng'
}) => {
  const [folders, setFolders] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [images, setImages] = useState([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http') || imagePath.startsWith('blob:') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    const baseUrl = 'http://localhost:3000';
    const normalizedPath = imagePath.replace(/\\/g, '/');
    let finalUrl = `${baseUrl}${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`;
    
    return finalUrl;
  };

  const loadFolders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await folderService.getFolders();
      const foldersData = response.data || [];
      
      setFolders(foldersData);
      
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
      
      const updatedFolders = folders.filter(folder => folder._id !== folderId);
      setFolders(updatedFolders);
      
      if (currentFolder && currentFolder._id === folderId) {
        if (updatedFolders.length > 0) {
          const newCurrentFolder = updatedFolders[0];
          setCurrentFolder(newCurrentFolder);
          await loadFolderImages(newCurrentFolder._id);
        } else {
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

  // components/FolderManager.jsx - CHỈ SỬA PHẦN UPLOAD
const handleFileUpload = async (event) => {
  if (!allowUpload) return;
  
  const files = Array.from(event.target.files);
  if (files.length === 0 || !currentFolder) return;

  setUploading(true);
  setError(null);

  try {
    // TRY 1: Dùng method thông thường
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await folderService.uploadImages(currentFolder._id, formData);
      const newImages = response.data.uploadedImages;
      
      // Update state
      setImages(prev => [...prev, ...newImages]);
      setFolders(prev => prev.map(folder => 
        folder._id === currentFolder._id 
          ? { 
              ...folder, 
              images: [...(folder.images || []), ...newImages]
            }
          : folder
      ));
      
    } catch (uploadError) {
      console.log('Standard upload failed, trying form submission...', uploadError.message);
      
      // TRY 2: Dùng form submission fallback
      const response = await folderService.uploadImagesViaForm(currentFolder._id, files);
      const newImages = response.data.uploadedImages;
      
      // Update state
      setImages(prev => [...prev, ...newImages]);
      setFolders(prev => prev.map(folder => 
        folder._id === currentFolder._id 
          ? { 
              ...folder, 
              images: [...(folder.images || []), ...newImages]
            }
          : folder
      ));
      
      // Hiển thị thông báo
      alert('Đã sử dụng phương pháp upload thay thế để vượt qua extension blocking');
    }

  } catch (error) {
    console.error('Error uploading images:', error);
    
    // Phân tích lỗi
    if (error.message.includes('timeout') || error.message.includes('blocked')) {
      setError('Upload bị chặn bởi extension trình duyệt. Vui lòng tắt ad-blocker hoặc dùng chế độ ẩn danh.');
    } else {
      setError('Không thể tải ảnh lên: ' + error.message);
    }
    
  } finally {
    setUploading(false);
    event.target.value = '';
  }
};

  const handleDeleteImage = async (imageId, event) => {
    event?.stopPropagation();
    if (!allowUpload) return;
    
    if (!window.confirm('Bạn có chắc muốn xóa ảnh này?')) {
      return;
    }

    try {
      await folderService.deleteImage(currentFolder._id, imageId);
      
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
    if (singleSelect) {
      // Chỉ chọn một ảnh
      if (onSelect) {
        onSelect(image);
      }
    } else {
      // Chọn nhiều ảnh
      const isSelected = selectedImages.some(img => img._id === image._id);
      let newSelectedImages;
      
      if (isSelected) {
        // Bỏ chọn nếu đã chọn
        newSelectedImages = selectedImages.filter(img => img._id !== image._id);
      } else {
        // Thêm vào danh sách chọn
        newSelectedImages = [...selectedImages, image];
      }
      
      setSelectedImages(newSelectedImages);
    }
  };

  const handleConfirmSelection = () => {
    if (onSelect && selectedImages.length > 0) {
      onSelect(selectedImages);
    }
    onClose();
  };

  const handleFolderSelect = async (folder) => {
    setCurrentFolder(folder);
    await loadFolderImages(folder._id);
  };

  const ImageItem = ({ image }) => {
    const [imgError, setImgError] = useState(false);
    const [imgLoading, setImgLoading] = useState(true);
    const isSelected = selectedImages.some(img => img._id === image._id);

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
        className={`group relative bg-white border ${isSelected ? 'border-blue-500 border-2' : 'border-gray-200'} rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all`}
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
            className="w-full h-full object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{ display: imgLoading ? 'none' : 'block' }}
          />
          {isSelected && (
            <div className="absolute top-2 left-2 bg-blue-500 text-white p-1 rounded-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button className="bg-white text-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>
        
        {allowUpload && (
          <button
            onClick={(e) => handleDeleteImage(image._id, e)}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <div className="p-2">
          <p className="text-xs font-medium text-gray-900 truncate mb-1">
            {image.filename}
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
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="text-gray-600 text-sm">
              {currentFolder ? `Đang xem: ${currentFolder.name}` : description}
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
                        
                        {allowUpload && (
                          <button
                            onClick={(e) => handleDeleteFolder(folder._id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-opacity"
                            title="Xóa folder"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {currentFolder ? (
              <>
                {allowUpload && (
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
                )}

                {uploading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600">Đang tải lên...</span>
                  </div>
                )}

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

        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                {currentFolder 
                  ? `Đang xem: ${currentFolder.name} • ${images.length} ảnh`
                  : 'Chọn folder để bắt đầu'
                }
              </p>
              {!singleSelect && selectedImages.length > 0 && (
                <p className="text-sm text-blue-600 mt-1">
                  Đã chọn {selectedImages.length} ảnh
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {!singleSelect && selectedImages.length > 0 && (
                <button
                  onClick={handleConfirmSelection}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Chọn {selectedImages.length} ảnh
                </button>
              )}
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
    </div>
  );
};

export default FolderManager;