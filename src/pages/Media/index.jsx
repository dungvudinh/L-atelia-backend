// src/pages/admin/media/Media.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Calendar, FileText, Image, Tag } from 'lucide-react';
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

  // Fetch media from API
  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await mediaService.getMedia();
      console.log('Media API response:', response);
      
      if (response.success) {
        setMedia(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch media');
      }
    } catch (err) {
      console.error('Error fetching media:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // Hàm xử lý hiển thị ảnh
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Nếu là URL đầy đủ (http/https) hoặc data URL
    if (imagePath.startsWith('http') || imagePath.startsWith('blob:') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    // Nếu là đường dẫn tương đối
    const baseUrl = 'http://localhost:3000';
    const normalizedPath = imagePath.replace(/\\/g, '/');
    let finalUrl = `${baseUrl}${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`;
    
    return finalUrl;
  };

  // Hàm hiển thị thumbnail
  const renderThumbnail = (mediaItem) => {
    const imageUrl = getImageUrl(mediaItem.featuredImage);
    console.log(imageUrl)
    if (imageUrl) {
      return (
        <img 
          src={imageUrl} 
          alt={mediaItem.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Image failed to load:', imageUrl);
            e.target.src = 'https://via.placeholder.com/40x40?text=Error';
          }}
          loading="lazy"
        />
      );
    } else {
      return (
        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
          <FileText size={16} className="text-gray-500" />
        </div>
      );
    }
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
        setMedia(prev => prev.filter(m => m._id !== mediaId));
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
      // Xóa từng cái một
      const deletePromises = selectedItems.map(id => mediaService.deleteMedia(id));
      await Promise.all(deletePromises);
      
      setMedia(prev => prev.filter(m => !selectedItems.includes(m._id)));
      setSelectedItems([]);
      
      alert(`Đã xóa ${selectedItems.length} bài viết thành công`);
    } catch (err) {
      console.error('Error bulk deleting media:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xóa các bài viết';
      alert(`Lỗi: ${errorMessage}`);
    }
  };

  // Filter media
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

  // Truncate content for preview
  const truncateContent = (content, length = 100) => {
    if (!content) return 'Chưa có nội dung';
    
    // Remove HTML tags và decode HTML entities
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    let text = tempDiv.textContent || tempDiv.innerText || '';
    
    // Alternative: sử dụng regex để decode các HTML entities phổ biến
    // text = content.replace(/<[^>]*>/g, '') // Remove HTML tags first
    //   .replace(/&nbsp;/g, ' ') // Replace &nbsp; với space
    //   .replace(/&amp;/g, '&') // Replace &amp; với &
    //   .replace(/&lt;/g, '<') // Replace &lt; với <
    //   .replace(/&gt;/g, '>') // Replace &gt; với >
    //   .replace(/&quot;/g, '"') // Replace &quot; với "
    //   .replace(/&#39;/g, "'"); // Replace &#39; với '
    
    
    // Trim và xử lý khoảng trắng
    text = text.trim().replace(/\s+/g, ' ');
    
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <FileText size={64} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi khi tải dữ liệu</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchMedia}
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
          <p className="text-gray-600">Tổng số: {filteredMedia.length} bài viết</p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
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
            onClick={fetchMedia}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Làm mới
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
                      <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {renderThumbnail(mediaItem)}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-semibold text-gray-900 max-w-xs truncate">
                            {mediaItem.title || 'Chưa có tiêu đề'}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {mediaItem.excerpt ? truncateContent(mediaItem.excerpt, 50) : 'Chưa có mô tả'}
                        </p>
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
          </table>
        </div>

        {filteredMedia.length === 0 && (
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
      </div>
    </div>
  );
};

export default Media;