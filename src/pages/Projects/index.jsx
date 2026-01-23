// src/pages/admin/projects/Projects.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Calendar, FolderOpen, Image, MapPin } from 'lucide-react';
import { projectService } from '../../services/projectService';
import { useDispatch, useSelector } from 'react-redux';
const Projects = () => {
  const {isLoading} = useSelector(state=>state.loading)
  const dispatch = useDispatch()
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(null);
  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectService.getProjects();
      console.log('API Response:', response);
      
      if (response.success) {
        setProjects(response.data.projects || []);
      } else {
        throw new Error(response.message || 'Failed to fetch projects');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

      // Hàm xử lý hiển thị ảnh
    // Hàm xử lý hiển thị ảnh - SỬA LẠI
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

  // Hàm xử lý lỗi ảnh
  const handleImageError = (e) => {
    e.target.src = '/api/placeholder/40/40'; // Fallback image
    e.target.alt = 'Image not available';
  };

      // Hàm hiển thị ảnh thumbnail
      // Hàm hiển thị ảnh thumbnail - SỬA LẠI
      const renderThumbnail = (project) => {
        
        const imageUrl = project.heroImage != null ? getImageUrl(project.heroImage.url) : null;
        
        if (imageUrl) {
          return (
            <img 
              src={imageUrl} 
              alt={project.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Image failed to load:', imageUrl);
                e.target.src = 'https://via.placeholder.com/40x40?text=Error';
              }}
              onLoad={() => console.log('Image loaded:', project.title)}
              loading="lazy"
            />
          );
        } else {
          return (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <Image size={16} className="text-gray-500" />
            </div>
          );
        }
      };

    // Handle delete project
    // Handle delete project - SỬA LẠI
    const handleDelete = async (projectId) => {
      if (!window.confirm('Bạn có chắc muốn xóa dự án này?')) {
        return;
      }
    
      try {
        setDeleteLoading(projectId);
        
        const response = await projectService.deleteProject(projectId);
        
        if (response.success) {
          setProjects(prevProjects => prevProjects.filter(p => p._id !== projectId));
          setSelectedItems(prevSelected => prevSelected.filter(id => id !== projectId));
          alert('Xóa dự án thành công');
        } else {
          throw new Error(response.message || 'Failed to delete project');
        }
      } catch (err) {
        console.error('Error deleting project:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xóa dự án';
        alert(`Lỗi: ${errorMessage}`);
      } finally {
        setDeleteLoading(null);
      }
    };
    // Handle bulk delete - THÊM HÀM NÀY
    const handleBulkDelete = async () => {
      if (selectedItems.length === 0) {
        alert('Vui lòng chọn ít nhất một dự án để xóa');
        return;
      }

      if (!window.confirm(`Bạn có chắc muốn xóa ${selectedItems.length} dự án đã chọn?`)) {
        return;
      }

      try {
        console.log(`Bulk deleting projects:`, selectedItems);
        
        // Nếu có API bulk delete
        // await projectService.bulkDeleteProjects(selectedItems);
        
        // Hoặc xóa từng cái một
        const deletePromises = selectedItems.map(id => projectService.deleteProject(id));
        await Promise.all(deletePromises);
        
        // Cập nhật UI sau khi xóa thành công
        setProjects(prevProjects => prevProjects.filter(p => !selectedItems.includes(p._id)));
        setSelectedItems([]);
        
        alert(`Đã xóa ${selectedItems.length} dự án thành công`);
      } catch (err) {
        console.error('Error bulk deleting projects:', err);
        
        const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xóa các dự án';
        alert(`Lỗi: ${errorMessage}`);
      }
    };
  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(filteredProjects.map(project => project._id));
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
      draft: { color: 'bg-yellow-100 text-yellow-800', label: 'Bản nháp' },
      archived: { color: 'bg-gray-100 text-gray-800', label: 'Đã lưu trữ' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    
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
            onClick={fetchProjects}
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Dự án</h1>
          <p className="text-gray-600">Tổng số: {filteredProjects.length} dự án</p>
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
            to="/projects/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Thêm Dự án
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
              placeholder="Tìm kiếm theo tên hoặc địa điểm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
            <option value="archived">Đã lưu trữ</option>
          </select>
          <button
            onClick={fetchProjects}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Làm mới
          </button>
        </div>
      </div>

      {/* Projects Table */}
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
                    checked={selectedItems.length === filteredProjects.length && filteredProjects.length > 0}
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dự án
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Địa điểm
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
              {filteredProjects.map((project) => (
                <tr 
                  key={project._id} 
                  className={selectedItems.includes(project._id) ? 'bg-blue-50' : 'hover:bg-gray-50'}
                >
                  <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                    <input
                      type="checkbox"
                      className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedItems.includes(project._id)}
                      onChange={() => handleSelectItem(project._id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {renderThumbnail(project)}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-semibold text-gray-900">
                            {project.title || 'Chưa có tiêu đề'}
                          </h4>
                        </div>
                        {/* <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                          {project.description || 'Chưa có mô tả'}
                        </p> */}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin size={14} className="mr-1 text-gray-400" />
                      {project.location || 'Chưa có địa điểm'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {formatDate(project.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(project.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/projects/${project._id}`}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        to={`/projects/edit/${project._id}`}
                        className="text-green-600 hover:text-green-900 transition-colors p-1 rounded hover:bg-green-50"
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(project._id)}
                        className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                        title="Xóa dự án"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FolderOpen size={64} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterStatus !== 'all' 
                ? 'Không tìm thấy dự án phù hợp' 
                : 'Chưa có dự án nào'
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Hãy thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn' 
                : 'Hãy tạo dự án đầu tiên của bạn'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Link
                to="/projects/create"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <Plus size={20} className="mr-2" />
                Tạo dự án mới
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;