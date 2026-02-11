// components/FolderManager.jsx
import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { folderService } from '../../services/folderService';
import { b2Service } from '../../services/b2Service';

const BASE_CDN_URL = 'http://cdn.latelia.com/latelia/';

// ✅ Tách ImageItem ra ngoài để tránh re-render không cần thiết
const ImageItem = memo(({ 
  image, 
  isSelected, 
  onSelect, 
  onDelete,
  getImageUrl,
  getOriginalUrl,
  allowUpload 
}) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef(null);

  // ✅ Xác định URL để hiển thị
  const displayUrl = showOriginal || !image.thumbnailUrl 
    ? getOriginalUrl(image) 
    : getImageUrl(image, true);

  // ✅ Effect để check nếu ảnh đã cache
  useEffect(() => {
    // Tạo một image object để kiểm tra trạng thái
    const img = new Image();
    img.src = displayUrl;
    
    if (img.complete) {
      // Ảnh đã được cache hoặc load xong
      setImgLoading(false);
      setImageLoaded(true);
    } else {
      // Đặt timeout để tránh loading vô hạn
      const timeoutId = setTimeout(() => {
        if (imgLoading) {
          setImgLoading(false);
        }
      }, 3000); // 3 giây timeout
      
      img.onload = () => {
        setImgLoading(false);
        setImageLoaded(true);
        clearTimeout(timeoutId);
      };
      
      img.onerror = () => {
        setImgError(true);
        setImgLoading(false);
        clearTimeout(timeoutId);
      };
      
      return () => {
        clearTimeout(timeoutId);
        img.onload = null;
        img.onerror = null;
      };
    }
  }, [displayUrl]);

  const handleImageError = useCallback(() => {
    setImgError(true);
    setImgLoading(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImgLoading(false);
    setImageLoaded(true);
  }, []);

  const handleToggleOriginal = useCallback((e) => {
    e.stopPropagation();
    setShowOriginal(prev => !prev);
    setImgLoading(true); // Reset loading khi toggle
  }, []);

  const handleClick = useCallback(() => {
    onSelect(image);
  }, [image, onSelect]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    onDelete(image._id, e);
  }, [image._id, onDelete]);

  // ✅ Xác định kích thước hiển thị
  const displayDimensions = showOriginal || !image.thumbnailUrl
    ? (image.dimensions ? `${image.dimensions.width}x${image.dimensions.height}` : 'Original')
    : (image.thumbnailDimensions ? `${image.thumbnailDimensions.width}x${image.thumbnailDimensions.height}` : 'Thumbnail');

  return (
    <div
      onClick={handleClick}
      className={`group relative bg-white border ${isSelected ? 'border-blue-500 border-2' : 'border-gray-200'} rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all`}
    >
      <div className="aspect-square bg-gray-100 relative">
        {/* ✅ Chỉ hiển thị spinner khi đang thực sự loading */}
        {imgLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : null}
        
        <img
          ref={imgRef}
          src={imgError ? '/images/placeholder.jpg' : displayUrl}
          alt={image.filename}
          className={`w-full h-full object-cover ${imgLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading="lazy"
        />
        
        {isSelected && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white p-1 rounded-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        
        {/* ✅ Badge hiển thị loại ảnh (thumbnail/original) */}
        <div className="absolute top-2 right-2">
          {image.thumbnailUrl && !imgLoading && (
            <button
              onClick={handleToggleOriginal}
              className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full hover:bg-opacity-70 transition-opacity"
              title={showOriginal ? "Hiển thị thumbnail" : "Hiển thị ảnh gốc"}
            >
              {showOriginal ? '👁️ Gốc' : '📸 Thumb'}
            </button>
          )}
        </div>
        
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button className="bg-white text-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </div>
      
      {allowUpload && !imgLoading && (
        <button
          onClick={handleDelete}
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
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">
            {image.size ? `${(image.size / 1024).toFixed(0)} KB` : 'Unknown size'}
          </p>
          <span className="text-xs text-gray-400" title={`Kích thước: ${displayDimensions}`}>
            {displayDimensions}
          </span>
        </div>
        
        {/* ✅ Hiển thị thông tin thumbnail */}
        {image.hasThumbnail && (
          <div className="mt-1 flex items-center gap-1">
            <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
              ✓ Thumbnail
            </span>
            {image.thumbnailSize > 0 && (
              <span className="text-xs text-gray-400">
                ({(image.thumbnailSize / 1024).toFixed(0)}KB)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // ✅ Custom comparison function để tối ưu re-render
  return (
    prevProps.image._id === nextProps.image._id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.onSelect === nextProps.onSelect &&
    prevProps.onDelete === nextProps.onDelete &&
    prevProps.getImageUrl === nextProps.getImageUrl &&
    prevProps.getOriginalUrl === nextProps.getOriginalUrl &&
    prevProps.allowUpload === nextProps.allowUpload
  );
});

// ✅ Main Component
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
  const [useThumbnails, setUseThumbnails] = useState(true);
  const scrollContainerRef = useRef(null);

  // ✅ Hàm lấy URL ảnh (ưu tiên thumbnail)
  const getImageUrl = useCallback((image, preferThumbnail = true) => {
    if (!image) return null;
    
    let imageKey = image.key;
    
    // Ưu tiên thumbnail nếu có và user muốn dùng
    if (preferThumbnail && useThumbnails && image.thumbnailKey) {
      imageKey = image.thumbnailKey;
    }
    
    if (!imageKey) return null;
    
    let finalUrl = BASE_CDN_URL + imageKey;
    return finalUrl;
  }, [useThumbnails]);

  // ✅ Hàm lấy URL original (cho preview chất lượng cao)
  const getOriginalUrl = useCallback((image) => {
    if (!image || !image.url) return null;
    
    const imagePath = image.url;
    
    if (imagePath.startsWith('http') || imagePath.startsWith('blob:') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    const baseUrl = 'http://localhost:3000';
    const normalizedPath = imagePath.replace(/\\/g, '/');
    let finalUrl = `${baseUrl}${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`;
    
    return finalUrl;
  }, []);

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

  const loadFolderImages = useCallback(async (folderId) => {
    try {
      const response = await folderService.getFolderById(folderId);
      const folderData = response.data;
      setCurrentFolder(folderData);
      setImages(folderData.images || []);
      
      // ✅ Log thông tin thumbnail
      const thumbnailsCount = folderData.images?.filter(img => img.thumbnailUrl).length || 0;
      const totalImages = folderData.images?.length || 0;
      
    } catch (error) {
      console.error('Error loading folder images:', error);
      setError('Không thể tải ảnh từ folder');
    }
  }, []);

  const handleCreateFolder = useCallback(async () => {
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
  }, [newFolderName, loadFolderImages]);

  const handleDeleteFolder = useCallback(async (folderId, event) => {
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
  }, [folders, currentFolder, loadFolderImages]);

  const handleFileUpload = useCallback(async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0 || !currentFolder) return;

    setUploading(true);
    setError(null);

    try {
      // Chỉ lấy file đầu tiên (vì input chỉ cho phép 1 file)
      const file = files[0];

      const uploadResult = await b2Service.uploadFile(
        file,
        `folders/${currentFolder._id}`,
        (percent) => {
          console.log(`📊 Upload progress: ${percent}%`);
        }
      );

      if (!uploadResult.success) {
        throw new Error(uploadResult.message);
      }


      // Save to database
      const imageData = {
        url: uploadResult.data.url,
        thumbnailUrl: uploadResult.data.thumbnailUrl,
        key: uploadResult.data.key,
        thumbnailKey: uploadResult.data.thumbnailKey,
        filename: uploadResult.data.filename,
        size: uploadResult.data.size,
        thumbnailSize: uploadResult.data.thumbnailSize || 0,
        hasThumbnail: uploadResult.data.hasThumbnail || false
      };

      const saveResponse = await folderService.uploadImageToFolder(
        currentFolder._id,
        imageData
      );

      // Update UI
      setImages(prev => [...prev, saveResponse.data]);
      setFolders(prev => prev.map(folder => 
        folder._id === currentFolder._id 
          ? { 
              ...folder, 
              images: [...(folder.images || []), saveResponse.data]
            }
          : folder
      ));


    } catch (error) {
      console.error('❌ Upload process failed:', error);
      setError(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }, [currentFolder]);

  const handleDeleteImage = useCallback(async (imageId, event) => {
    event?.stopPropagation();
    if (!window.confirm('Bạn có chắc muốn xóa ảnh này?')) {
      return;
    }
  
    try {
      // Get image info to get the B2 keys
      const imageToDelete = images.find(img => img._id === imageId);
      
      if (imageToDelete) {
        // Delete from B2 (both original and thumbnail)
        const deleteResult = await b2Service.deleteFile({
          fileKey: imageToDelete.key,
          thumbnailKey: imageToDelete.thumbnailKey
        });
        
        if (!deleteResult.success) {
          throw new Error(deleteResult.message);
        }
        
       
      }
      
      // Delete from database
      await folderService.deleteImage(currentFolder._id, imageId);
      
      // Update UI
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
  }, [currentFolder, images]);

  const handleImageSelect = useCallback((image) => {
    if (singleSelect) {
      // Chỉ chọn một ảnh
      if (onSelect) {
        onSelect(image);
      }
    } else {
      // Chọn nhiều ảnh
      setSelectedImages(prev => {
        const isSelected = prev.some(img => img._id === image._id);
        if (isSelected) {
          // Bỏ chọn nếu đã chọn
          return prev.filter(img => img._id !== image._id);
        } else {
          // Thêm vào danh sách chọn
          return [...prev, image];
        }
      });
    }
  }, [singleSelect, onSelect]);

  const handleConfirmSelection = useCallback(() => {
    if (onSelect && selectedImages.length > 0) {
      onSelect(selectedImages);
    }
    onClose();
  }, [onSelect, selectedImages, onClose]);

  const handleFolderSelect = useCallback(async (folder) => {
    setCurrentFolder(folder);
    await loadFolderImages(folder._id);
  }, [loadFolderImages]);

  // ✅ Sử dụng useMemo để tránh re-render không cần thiết
  const folderItems = useMemo(() => {
    return folders.map(folder => (
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
    ));
  }, [folders, currentFolder, handleFolderSelect, allowUpload, handleDeleteFolder]);

  // ✅ Sử dụng useMemo cho danh sách ImageItem
  const imageItems = useMemo(() => {
    return images.map(image => (
      <ImageItem
        key={image._id}
        image={image}
        isSelected={selectedImages.some(img => img._id === image._id)}
        onSelect={handleImageSelect}
        onDelete={handleDeleteImage}
        getImageUrl={getImageUrl}
        getOriginalUrl={getOriginalUrl}
        allowUpload={allowUpload}
      />
    ));
  }, [images, selectedImages, handleImageSelect, handleDeleteImage, getImageUrl, getOriginalUrl, allowUpload]);

  // ✅ Thông tin thumbnail summary
  const thumbnailSummary = useMemo(() => {
    if (!currentFolder || images.length === 0) return null;
    
    const thumbnailsCount = images.filter(img => img.thumbnailUrl).length;
    return `${thumbnailsCount}/${images.length} ảnh có thumbnail (${images.length > 0 ? Math.round((thumbnailsCount / images.length) * 100) : 0}%)`;
  }, [currentFolder, images]);

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
          
          <div className="flex items-center gap-4">
            {/* ✅ Toggle sử dụng thumbnail */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Thumbnail:</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useThumbnails}
                  onChange={() => setUseThumbnails(!useThumbnails)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
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

        {/* ✅ Thông báo về thumbnail */}
        {useThumbnails && (
          <div className="mx-6 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-blue-700">
                Đang sử dụng thumbnail để tăng tốc độ tải. Click vào badge "Thumb" để xem ảnh gốc.
              </p>
            </div>
            <div className="mt-2 text-xs text-blue-600">
              {thumbnailSummary}
            </div>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
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
                  folderItems
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 p-6 overflow-y-auto" 
            style={{ overflowAnchor: 'none' }}
          >
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
                        <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP (Tối đa 10MB)</p>
                        <p className="text-xs text-green-600 mt-1">✓ Tự động tạo thumbnail</p>
                      </div>
                      <input
                        type="file"
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
                    <span className="ml-3 text-gray-600">Đang tải lên và tạo thumbnail...</span>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {imageItems}
                </div>

                {images.length === 0 && !uploading && (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Không có ảnh nào</h3>
                    <p className="text-gray-600">Tải lên ảnh đầu tiên của bạn</p>
                    <p className="text-sm text-green-600 mt-1">Thumbnail sẽ được tạo tự động</p>
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
              {/* ✅ Thông tin thumbnail */}
              {currentFolder && images.length > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  {thumbnailSummary}
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