import { useState } from 'react';
import SectionEditor from './SectionEditor';

const ProjectEditor = ({ project, onChange, mode = 'create' }) => {
  const [formData, setFormData] = useState(project);
  
  const updateSection = (sectionName, newData) => {
    const updatedData = {
      ...formData,
      sections: {
        ...formData.sections,
        [sectionName]: { 
          ...(formData.sections[sectionName] || {}),
          ...newData 
        }
      }
    };
    
    setFormData(updatedData);
    onChange(updatedData);
  };

  const sectionsConfig = [
    { key: 'hero', title: 'Hero Section', type: 'hero' },
    { key: 'description', title: 'Mô tả chi tiết', type: 'text' },
    { key: 'features', title: 'Tính năng bất động sản', type: 'features' },
    { key: 'specification', title: 'Thông số kỹ thuật', type: 'features' },
    { key: 'outdoor', title: 'Khu vực ngoài trời', type: 'mixed' },
    { key: 'gallery', title: 'Thư viện ảnh', type: 'gallery' },
    { key: 'pool', title: 'Hồ bơi', type: 'simple' },
  ];

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Thông tin cơ bản</h3>
        <input
          value={formData.title}
          onChange={(e) => {
            const newData = { ...formData, title: e.target.value };
            setFormData(newData);
            onChange(newData);
          }}
          className="w-full p-3 border rounded-lg"
          placeholder="Tên dự án"
        />
      </div>

      {/* Sections */}
      {sectionsConfig.map(({ key, title, type }) => (
        <SectionEditor
          key={key}
          title={title}
          section={formData.sections[key] || {}}
          onChange={(data) => updateSection(key, data)}
          type={type}
        />
      ))}
    </div>
  );
};

export default ProjectEditor;