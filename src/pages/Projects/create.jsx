// src/pages/admin/projects/CreateProject.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
// import ProjectEditor from '../../../components/admin/ProjectEditor';
import { initialProjectState } from '../../types/project';

const Create = () => {
  const navigate = useNavigate();
  const [project, setProject] = useState(initialProjectState);
  const [saving, setSaving] = useState(false);

  const handleSave = async (projectData) => {
    setSaving(true);
    try {
      // Gọi API để tạo dự án mới
      console.log('Creating project:', projectData);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sau khi tạo thành công, chuyển hướng về danh sách
      navigate('/admin/projects');
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/admin/projects"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tạo Dự án Mới</h1>
            <p className="text-gray-600">Thêm thông tin chi tiết cho dự án mới</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Link
            to="/admin/projects"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Hủy
          </Link>
          <button
            onClick={() => handleSave(project)}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <Save size={20} className="mr-2" />
            {saving ? 'Đang lưu...' : 'Tạo Dự án'}
          </button>
        </div>
      </div>

      {/* Project Editor */}
      <div className="bg-white rounded-lg border border-gray-200">
        <ProjectEditor
          project={project}
          onChange={setProject}
          mode="create"
        />
      </div>
    </div>
  );
};
const ProjectEditor = ({ project, onSave }) => {
    const [formData, setFormData] = useState(project);
    
    const updateSection = (sectionName, newData) => {
      setFormData({
        ...formData,
        sections: {
          ...formData.sections,
          [sectionName]: { ...formData.sections[sectionName], ...newData }
        }
      });
    };
  
    return (
      <div className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Thông tin cơ bản</h3>
          <input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-3 border rounded-lg"
            placeholder="Tên dự án"
          />
        </div>
  
        {/* FIXED SECTIONS - Luôn hiển thị theo đúng thứ tự */}
        <SectionEditor
          title="Hero Section"
          section={formData.sections.hero}
          onChange={(data) => updateSection('hero', data)}
          type="hero"
        />
  
        <SectionEditor
          title="Mô tả chi tiết" 
          section={formData.sections.description}
          onChange={(data) => updateSection('description', data)}
          type="text"
        />
  
        <SectionEditor
          title="Tính năng bất động sản"
          section={formData.sections.features} 
          onChange={(data) => updateSection('features', data)}
          type="features"
        />
  
        <SectionEditor
          title="Thông số kỹ thuật"
          section={formData.sections.specification}
          onChange={(data) => updateSection('specification', data)} 
          type="features"
        />
  
        <SectionEditor
          title="Khu vực ngoài trời"
          section={formData.sections.outdoor}
          onChange={(data) => updateSection('outdoor', data)}
          type="mixed"
        />
  
        <SectionEditor
          title="Thư viện ảnh"
          section={formData.sections.gallery}
          onChange={(data) => updateSection('gallery', data)}
          type="gallery"
        />
  
        <SectionEditor  
          title="Hồ bơi"
          section={formData.sections.pool}
          onChange={(data) => updateSection('pool', data)}
          type="simple"
        />
      </div>
    );
  };
  const SectionEditor = ({ title, section, onChange, type }) => {
    const renderEditor = () => {
      switch(type) {
        case 'hero':
          return (
            <div className="space-y-4">
              <input
                value={section.title || ''}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Tiêu đề chính"
                className="w-full p-2 border rounded"
              />
              <textarea
                value={section.description || ''}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder="Mô tả ngắn"
                rows={3}
                className="w-full p-2 border rounded"
              />
              <ImageUpload
                value={section.image}
                onChange={(url) => onChange({ image: url })}
              />
            </div>
          );
  
        case 'text':
          return (
            <textarea
              value={section.content || ''}
              onChange={(e) => onChange({ content: e.target.value })}
              placeholder="Nhập nội dung mô tả..."
              rows={8}
              className="w-full p-3 border rounded-lg"
            />
          );
  
        case 'features':
          return (
            <div className="space-y-3">
              <input
                value={section.title || ''}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Tiêu đề section"
                className="w-full p-2 border rounded"
              />
              <FeatureListEditor
                items={section.items || []}
                onChange={(items) => onChange({ items })}
              />
            </div>
          );
  
        case 'gallery':
          return (
            <GalleryEditor
              images={section.images || []}
              onChange={(images) => onChange({ images })}
            />
          );
  
        default:
          return null;
      }
    };
  
    return (
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        {renderEditor()}
      </div>
    );
  };
export default Create;