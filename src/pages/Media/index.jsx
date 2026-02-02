import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, Edit, Trash2, Eye, Calendar, 
  FileText, Image, Tag, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight 
} from 'lucide-react';
import { mediaService } from '../../services/mediaService';

const Media = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginationLoading, setPaginationLoading] = useState(false);

  // Refs để theo dõi ảnh đã tải
  const loadedImagesRef = useRef(new Set());
  const imageLoadingTimeoutsRef = useRef({});

  // Fetch media from API with pagination
  const fetchMedia = async (page = currentPage) => {
    try {
      if (page !== currentPage) {
        setPaginationLoading(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      
      const params = {
        page: page,
        limit: itemsPerPage
      };
      
      // Add filters if not "all"
      if (searchTerm) params.search = searchTerm;
      if (filterCategory !== 'all') params.category = filterCategory;
      if (filterStatus !== 'all') params.status = filterStatus;
      
      const response = await mediaService.getMedia(params);
      
      if (response.success) {
        setMedia(response.data || []);
        setTotalItems(response.pagination?.total || 0);
        setTotalPages(response.pagination?.pages || 1);
        setCurrentPage(response.pagination?.current || 1);
      } else {
        throw new Error(response.message || 'Failed to fetch media');
      }
    } catch (err) {
      console.error('Error fetching media:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // Effect for filters - reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchMedia(1);
  }, [searchTerm, filterCategory, filterStatus, itemsPerPage]);

  // Handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchMedia(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const newValue = parseInt(e.target.value);
    setItemsPerPage(newValue);
    setCurrentPage(1);
  };

  // Custom Image Component với loading state
  const MediaImage = ({ mediaItem }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
      const imageData = mediaItem.featuredImage;
      if (!imageData || !imageData.url) {
        setIsLoading(false);
        setHasError(true);
        return;
      }

      const displayUrl = imageData.thumbnailUrl || imageData.url;
      
      // Nếu ảnh đã được tải trước đó, bỏ qua loading
      if (loadedImagesRef.current.has(displayUrl)) {
        setIsLoading(false);
        return;
      }

      // Đặt timeout để tránh loading vĩnh viễn
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          console.warn(`Image load timeout: ${displayUrl.substring(0, 50)}...`);
          setIsLoading(false);
          loadedImagesRef.current.add(displayUrl); // Thêm vào cache dù timeout
        }
      }, 5000); // 5 giây timeout

      // Lưu timeout ID để dọn dẹp
      imageLoadingTimeoutsRef.current[mediaItem._id] = timeoutId;

      return () => {
        if (imageLoadingTimeoutsRef.current[mediaItem._id]) {
          clearTimeout(imageLoadingTimeoutsRef.current[mediaItem._id]);
          delete imageLoadingTimeoutsRef.current[mediaItem._id];
        }
      };
    }, [mediaItem._id, mediaItem.featuredImage]);

    const handleImageLoad = () => {
      const imageData = mediaItem.featuredImage;
      if (!imageData || !imageData.url) return;
      
      const displayUrl = imageData.thumbnailUrl || imageData.url;
      
      // Clear timeout nếu có
      if (imageLoadingTimeoutsRef.current[mediaItem._id]) {
        clearTimeout(imageLoadingTimeoutsRef.current[mediaItem._id]);
        delete imageLoadingTimeoutsRef.current[mediaItem._id];
      }
      
      // Thêm vào cache và cập nhật state
      loadedImagesRef.current.add(displayUrl);
      setIsLoading(false);
    };

    const handleImageError = (e) => {
      const imageData = mediaItem.featuredImage;
      if (!imageData) return;
      
      console.error('Image failed to load:', imageData.thumbnailUrl || imageData.url);
      
      // Clear timeout
      if (imageLoadingTimeoutsRef.current[mediaItem._id]) {
        clearTimeout(imageLoadingTimeoutsRef.current[mediaItem._id]);
        delete imageLoadingTimeoutsRef.current[mediaItem._id];
      }
      
      setHasError(true);
      setIsLoading(false);
      
      // Fallback logic
      if (imageData.thumbnailUrl && imageData.url && e.target.src !== imageData.url) {
        e.target.src = imageData.url;
        setHasError(false);
        setIsLoading(true);
      } else {
        e.target.src = 'https://via.placeholder.com/40x40?text=Error';
      }
    };

    if (!mediaItem.featuredImage || !mediaItem.featuredImage.url || hasError) {
      return (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
          <FileText size={16} className="text-gray-500" />
        </div>
      );
    }

    const displayUrl = 'https://cdn.latelia.com/latelia/'+mediaItem.featuredImage.thumbnailKey || mediaItem.featuredImage.key;
    return (
      <>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
        <img 
          ref={imgRef}
          src={displayUrl} 
          alt={mediaItem.title || 'Media image'}
          className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
          decoding="async"
        />
      </>
    );
  };

  // Hàm xử lý hiển thị ảnh - ĐƠN GIẢN HÓA
  const renderThumbnail = (mediaItem) => {
    return (
      <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
        <MediaImage mediaItem={mediaItem} />
        {/* {mediaItem.featuredImage?.hasThumbnail && (
          <span className="absolute top-0 right-0 bg-green-500 text-white text-xs px-1 py-0.5 rounded-bl-lg">
            Thumb
          </span>
        )} */}
      </div>
    );
  };

  // Handle delete media
  const handleDelete = async (mediaId) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài viết này?')) {
      return;
    }

    try {
      setDeleteLoading(mediaId);
      
      const response = await mediaService.deleteMedia(mediaId);
      
      if (response.success) {
        fetchMedia(currentPage);
        setSelectedItems(prev => prev.filter(id => id !== mediaId));
        alert('Xóa bài viết thành công');
      } else {
        throw new Error(response.message || 'Failed to delete media');
      }
    } catch (err) {
      console.error('Error deleting media:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xóa bài viết';
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một bài viết để xóa');
      return;
    }

    if (!window.confirm(`Bạn có chắc muốn xóa ${selectedItems.length} bài viết đã chọn?`)) {
      return;
    }

    try {
      const deletePromises = selectedItems.map(id => mediaService.deleteMedia(id));
      await Promise.all(deletePromises);
      
      fetchMedia(currentPage);
      setSelectedItems([]);
      
      alert(`Đã xóa ${selectedItems.length} bài viết thành công`);
    } catch (err) {
      console.error('Error bulk deleting media:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xóa các bài viết';
      alert(`Lỗi: ${errorMessage}`);
    }
  };

  // Filter media locally for selection (client-side)
  const filteredMedia = media.filter(mediaItem => {
    const matchesSearch = mediaItem.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mediaItem.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mediaItem.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || mediaItem.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || mediaItem.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(filteredMedia.map(mediaItem => mediaItem._id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  // Pagination component
  const Pagination = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">
            Hiển thị <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> đến{' '}
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> trong{' '}
            <span className="font-medium">{totalItems}</span> kết quả
          </span>
          
          <select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5 / trang</option>
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
            <option value={50}>50 / trang</option>
            <option value={100}>100 / trang</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1 || paginationLoading}
            className="p-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            title="Đầu trang"
          >
            <ChevronsLeft size={16} />
          </button>
          
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || paginationLoading}
            className="p-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            title="Trang trước"
          >
            <ChevronLeft size={16} />
          </button>
          
          <div className="flex items-center space-x-1">
            {pages.map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={paginationLoading}
                className={`min-w-[2rem] h-8 rounded-md text-sm font-medium ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                } ${paginationLoading ? 'opacity-50' : ''}`}
              >
                {page}
              </button>
            ))}
            
            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && (
                  <span className="px-2 text-gray-500">...</span>
                )}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={paginationLoading}
                  className="min-w-[2rem] h-8 rounded-md border border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || paginationLoading}
            className="p-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            title="Trang sau"
          >
            <ChevronRight size={16} />
          </button>
          
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages || paginationLoading}
            className="p-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            title="Cuối trang"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <tbody className="bg-white divide-y divide-gray-200">
      {[...Array(5)].map((_, index) => (
        <tr key={index} className="animate-pulse">
          <td className="px-6 py-4">
            <div className="flex items-center justify-center">
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-lg relative">
                <div className="absolute top-0 right-0 w-3 h-3 bg-green-200 rounded-full"></div>
              </div>
              <div className="ml-4 space-y-2">
                <div className="h-4 w-48 bg-gray-200 rounded"></div>
                <div className="h-3 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="space-y-2">
              <div className="h-3 w-full bg-gray-200 rounded"></div>
              <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="flex space-x-1">
              <div className="h-6 w-12 bg-gray-200 rounded-full"></div>
              <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
          </td>
          <td className="px-6 py-4">
            <div className="flex space-x-2 justify-end">
              <div className="h-6 w-6 bg-gray-200 rounded"></div>
              <div className="h-6 w-6 bg-gray-200 rounded"></div>
              <div className="h-6 w-6 bg-gray-200 rounded"></div>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );

  // Error state
  if (error && !paginationLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <FileText size={64} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi khi tải dữ liệu</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchMedia(currentPage)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Bài viết</h1>
          <p className="text-gray-600">
            {loading ? 'Đang tải...' : `Tổng số: ${totalItems} bài viết`}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              disabled={deleteLoading}
            >
              <Trash2 size={16} className="mr-2" />
              Xóa ({selectedItems.length})
            </button>
          )}
          <Link
            to="/media/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Tạo Bài viết
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề, mô tả hoặc tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả danh mục</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="properties">Properties</option>
            <option value="product">Product</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
          </select>
          <button
            onClick={() => fetchMedia(currentPage)}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>
      </div>

      {/* Media Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                  <input
                    type="checkbox"
                    className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onChange={handleSelectAll}
                    checked={selectedItems.length === filteredMedia.length && filteredMedia.length > 0}
                    disabled={loading}
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bài viết
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Thao tác</span>
                </th>
              </tr>
            </thead>
            
            {loading || paginationLoading ? (
              <LoadingSkeleton />
            ) : (
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMedia.map((mediaItem) => (
                  <tr 
                    key={mediaItem._id} 
                    className={selectedItems.includes(mediaItem._id) ? 'bg-blue-50' : 'hover:bg-gray-50'}
                  >
                    <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                      <input
                        type="checkbox"
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedItems.includes(mediaItem._id)}
                        onChange={() => handleSelectItem(mediaItem._id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {renderThumbnail(mediaItem)}
                        <div className="ml-4">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-semibold text-gray-900 max-w-xs truncate">
                              {mediaItem.title || 'Chưa có tiêu đề'}
                            </h4>
                            {/* {mediaItem.featuredImage?.hasThumbnail && (
                              <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                                ✓ Thumb
                              </span>
                            )} */}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {mediaItem.excerpt ? truncateContent(mediaItem.excerpt, 50) : 'Chưa có mô tả'}
                          </p>
                          {mediaItem.featuredImage?.thumbnailSize > 0 && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Thumbnail: {(mediaItem.featuredImage.thumbnailSize / 1024).toFixed(0)}KB
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        <p className="line-clamp-2">
                          {truncateContent(mediaItem.content, 80)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {mediaItem.tags && mediaItem.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                          >
                            <Tag size={10} className="mr-1" />
                            {tag}
                          </span>
                        ))}
                        {mediaItem.tags && mediaItem.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{mediaItem.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCategoryBadge(mediaItem.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {formatDate(mediaItem.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(mediaItem.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/media/${mediaItem._id}`}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          to={`/media/edit/${mediaItem._id}`}
                          className="text-green-600 hover:text-green-900 transition-colors p-1 rounded hover:bg-green-50"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(mediaItem._id)}
                          disabled={deleteLoading === mediaItem._id}
                          className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50 disabled:opacity-50"
                          title="Xóa bài viết"
                        >
                          {deleteLoading === mediaItem._id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {/* Empty State */}
        {!loading && !paginationLoading && filteredMedia.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FileText size={64} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                ? 'Không tìm thấy bài viết phù hợp' 
                : 'Chưa có bài viết nào'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                ? 'Hãy thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn' 
                : 'Hãy tạo bài viết đầu tiên của bạn'
              }
            </p>
            {!searchTerm && filterCategory === 'all' && filterStatus === 'all' && (
              <Link
                to="/media/create"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <Plus size={20} className="mr-2" />
                Tạo bài viết mới
              </Link>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && !paginationLoading && totalItems > 0 && totalPages > 1 && (
          <Pagination />
        )}
      </div>
    </div>
  );
};

export default Media;

// Helper functions
const getStatusBadge = (status) => {
  const statusConfig = {
    published: { color: 'bg-green-100 text-green-800', label: 'Đã đăng' },
    draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Bản nháp' }
  };
  
  const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

const getCategoryBadge = (category) => {
  const categoryConfig = {
    lifestyle: { color: 'bg-purple-100 text-purple-800', label: 'Lifestyle' },
    properties: { color: 'bg-blue-100 text-blue-800', label: 'Properties' },
    product: { color: 'bg-orange-100 text-orange-800', label: 'Product' }
  };
  
  const config = categoryConfig[category] || { color: 'bg-gray-100 text-gray-800', label: category };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const truncateContent = (content, length = 100) => {
  if (!content) return 'Chưa có nội dung';
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  let text = tempDiv.textContent || tempDiv.innerText || '';
  
  text = text.trim().replace(/\s+/g, ' ');
  
  return text.length > length ? text.substring(0, length) + '...' : text;
};