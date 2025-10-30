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