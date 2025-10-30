// src/pages/admin/projects/Projects.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Calendar,FolderOpen } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - thay bằng API call thực tế
  useEffect(() => {
    const mockProjects = [
      {
        id: 1,
        title: 'Mediterranean Townhouse',
        category: 'residential',
        status: 'published',
        location: 'Barcelona, Spain',
        price: '$2,500,000',
        featuredImage: '/api/placeholder/400/250',
        createdAt: '2024-01-15',
        sections: {
          hero: {
            title: 'Mediterranean Townhouse',
            description: 'An architectural gem immaculately restored...'
          }
        }
      },
      {
        id: 2,
        title: 'Modern Beach Villa',
        category: 'luxury',
        status: 'draft',
        location: 'Bali, Indonesia',
        price: '$1,800,000',
        featuredImage: '/api/placeholder/400/250',
        createdAt: '2024-01-10',
        sections: {
          hero: {
            title: 'Modern Beach Villa',
            description: 'Luxury beachfront property with panoramic ocean views...'
          }
        }
      }
    ];
    setProjects(mockProjects);
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (projectId) => {
    if (window.confirm('Bạn có chắc muốn xóa dự án này?')) {
      setProjects(projects.filter(p => p.id !== projectId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Dự án</h1>
          <p className="text-gray-600">Tổng số: {filteredProjects.length} dự án</p>
        </div>
        <Link
          to="/projects/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Thêm Dự án
        </Link>
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
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="relative">
              <img 
                src={project.featuredImage} 
                alt={project.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === 'published' 
                    ? 'bg-green-100 text-green-800' 
                    : project.status === 'draft'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {project.status === 'published' ? 'Đã đăng' : 'Bản nháp'}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{project.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {project.sections.hero.description}
              </p>
              
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <Calendar size={14} className="mr-1" />
                {new Date(project.createdAt).toLocaleDateString('vi-VN')}
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{project.location}</span>
                <span className="font-semibold text-green-600">{project.price}</span>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <Link
                    to={`/admin/projects/${project.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Xem chi tiết"
                  >
                    <Eye size={16} />
                  </Link>
                  <Link
                    to={`/admin/projects/edit/${project.id}`}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit size={16} />
                  </Link>
                </div>
                <button 
                  onClick={() => handleDelete(project.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Xóa dự án"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FolderOpen size={64} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có dự án nào</h3>
          <p className="text-gray-600 mb-4">Hãy tạo dự án đầu tiên của bạn</p>
          <Link
            to="/admin/projects/create"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Tạo dự án mới
          </Link>
        </div>
      )}
    </div>
  );
};

export default Projects;