// src/pages/admin/media/Media.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Calendar, FolderOpen, Image, Video, FileText, Building, User, Package } from 'lucide-react';
import { mediaService } from '../../services/mediaService';

const Media = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await mediaService.getMedia();
      
      if (response.success) {
        setMedia(response.data.media || []);
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

  const getImageUrl = (filePath) => {
    if (!filePath) return null;
    
    if (filePath.startsWith('http') || filePath.startsWith('blob:') || filePath.startsWith('data:')) {
      return filePath;
    }
    
    const baseUrl = 'http://localhost:3000';
    const normalizedPath = filePath.replace(/\\/g, '/');
    return `${baseUrl}${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`;
  };

  const getFileIcon = (mimeType, category) => {
    if (mimeType.startsWith('image/')) {
      return <Image size={20} className="text-blue-500" />;
    } else if (mimeType.startsWith('video/')) {
      return <Video size={20} className="text-purple-500" />;
    } else {
      return <FileText size={20} className="text-gray-500" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Properties':
        return <Building size={16} className="text-green-600" />;
      case 'Lifestyle':
        return <User size={16} className="text-blue-600" />;
      case 'Product':
        return <Package size={16} className="text-orange-600" />;
      default:
        return <FolderOpen size={16} className="text-gray-600" />;
    }
  };

  const getCategoryBadge = (category) => {
    const categoryConfig = {
      Properties: { color: 'bg-green-100 text-green-800', label: 'Properties' },
      Lifestyle: { color: 'bg-blue-100 text-blue-800', label: 'Lifestyle' },
      Product: { color: 'bg-orange-100 text-orange-800', label: 'Product' }
    };
    
    const config = categoryConfig[category] || { color: 'bg-gray-100 text-gray-800', label: category };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {getCategoryIcon(category)}
        <span className="ml-1">{config.label}</span>
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      image: { color: 'bg-blue-100 text-blue-800', label: 'Image' },
      video: { color: 'bg-purple-100 text-purple-800', label: 'Video' },
      document: { color: 'bg-gray-100 text-gray-800', label: 'Document' }
    };
    
    const config = typeConfig[type] || { color: 'bg-gray-100 text-gray-800', label: type };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleDelete = async (mediaId) => {
    if (!window.confirm('Bạn có chắc muốn xóa media này?')) {
      return;
    }

    try {
      setDeleteLoading(mediaId);
      const response = await mediaService.deleteMedia(mediaId);
      
      if (response.success) {
        setMedia(prev => prev.filter(m => m._id !== mediaId));
        setSelectedItems(prev => prev.filter(id => id !== mediaId));
        alert('Xóa media thành công');
      } else {
        throw new Error(response.message || 'Failed to delete media');
      }
    } catch (err) {
      console.error('Error deleting media:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xóa media';
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một media để xóa');
      return;
    }

    if (!window.confirm(`Bạn có chắc muốn xóa ${selectedItems.length} media đã chọn?`)) {
      return;
    }

    try {
      await mediaService.bulkDeleteMedia(selectedItems);
      setMedia(prev => prev.filter(m => !selectedItems.includes(m._id)));
      setSelectedItems([]);
      alert(`Đã xóa ${selectedItems.length} media thành công`);
    } catch (err) {
      console.error('Error bulk deleting media:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xóa các media';
      alert(`Lỗi: ${errorMessage}`);
    }
  };

  const filteredMedia = media.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(filteredMedia.map(media => media._id));
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <FolderOpen size={64} className="mx-auto" />
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Media</h1>
          <p className="text-gray-600">Tổng số: {filteredMedia.length} media</p>
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
            Upload Media
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
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả loại</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="document">Document</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả danh mục</option>
            <option value="Properties">Properties</option>
            <option value="Lifestyle">Lifestyle</option>
            <option value="Product">Product</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            onClick={fetchMedia}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Làm mới
          </button>
        </div>
      </div>

      {/* Media Grid */}
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
                  Media
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kích thước
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày upload
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
              {filteredMedia.map((item) => (
                <tr 
                  key={item._id} 
                  className={selectedItems.includes(item._id) ? 'bg-blue-50' : 'hover:bg-gray-50'}
                >
                  <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                    <input
                      type="checkbox"
                      className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedItems.includes(item._id)}
                      onChange={() => handleSelectItem(item._id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.mimeType?.startsWith('image/') ? (
                          <img 
                            src={getImageUrl(item.filePath)} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/48x48?text=Error';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            {getFileIcon(item.mimeType, item.category)}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-semibold text-gray-900">
                            {item.title || 'Untitled'}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                          {item.description || 'No description'}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-gray-400">
                          <span>{item.fileName}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCategoryBadge(item.category)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(item.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatFileSize(item.fileSize)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {formatDate(item.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/media/${item._id}`}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        to={`/media/edit/${item._id}`}
                        className="text-green-600 hover:text-green-900 transition-colors p-1 rounded hover:bg-green-50"
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(item._id)}
                        disabled={deleteLoading === item._id}
                        className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50 disabled:opacity-50"
                        title="Xóa media"
                      >
                        {deleteLoading === item._id ? (
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
              <FolderOpen size={64} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterType !== 'all' || filterCategory !== 'all' || filterStatus !== 'all'
                ? 'Không tìm thấy media phù hợp' 
                : 'Chưa có media nào'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterType !== 'all' || filterCategory !== 'all' || filterStatus !== 'all'
                ? 'Hãy thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn' 
                : 'Hãy upload media đầu tiên của bạn'
              }
            </p>
            {!searchTerm && filterType === 'all' && filterCategory === 'all' && filterStatus === 'all' && (
              <Link
                to="/media/upload"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <Plus size={20} className="mr-2" />
                Upload Media
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Media;