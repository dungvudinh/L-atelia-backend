// src/pages/admin/projects/CreateProject.jsx
import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Plus, Image as ImageIcon, X } from 'lucide-react';
// import ProjectEditor from '../../../components/admin/ProjectEditor';
import { initialProjectState } from '../../types/project';

const Create = () => {
  const navigate = useNavigate();
  const [project, setProject] = useState(initialProjectState);
  const [saving, setSaving] = useState(false);

  const handleSave = async (projectData) => {
    setSaving(true);
    try {
      
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
            to="/projects"
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



const ImageUpload = ({ value, onChange, multiple = false, onImagesChange }) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    
    if (multiple && onImagesChange) {
      // Xử lý multiple images
      const newImages = fileArray.map(file => ({
        id: Date.now() + Math.random(),
        url: URL.createObjectURL(file),
        file: file,
        name: file.name
      }));
      onImagesChange(newImages);
    } else {
      // Xử lý single image
      const file = files[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        onChange(imageUrl);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (indexToRemove) => {
    if (multiple && onImagesChange) {
      const newImages = value.filter((_, index) => index !== indexToRemove);
      onImagesChange(newImages);
    } else {
      onChange('');
    }
  };

  // For multiple images gallery
  if (multiple) {
    return (
      <div className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          
          <ImageIcon size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Kéo thả ảnh vào đây hoặc click để chọn
          </p>
          <p className="text-sm text-gray-500">
            PNG, JPG, WEBP tối đa 10MB
          </p>
        </div>

        {/* Image Preview Grid */}
        {value && value.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {value.map((image, index) => (
              <div key={image.id || index} className="relative group">
                <img
                  src={image.url}
                  alt={image.caption || `Image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-600 text-white rounded-full"
                  >
                    <X size={16} />
                  </button>
                </div>
                {image.caption && (
                  <input
                    type="text"
                    value={image.caption}
                    onChange={(e) => {
                      const newImages = [...value];
                      newImages[index].caption = e.target.value;
                      onImagesChange(newImages);
                    }}
                    placeholder="Chú thích ảnh"
                    className="w-full mt-2 p-1 text-xs border border-gray-300 rounded"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // For single image upload
  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="w-64 h-48 object-cover rounded-lg border border-gray-300"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          
          <Upload size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Chọn ảnh hoặc kéo thả vào đây
          </p>
          <p className="text-sm text-gray-500">
            PNG, JPG, WEBP tối đa 10MB
          </p>
        </div>
      )}

      {/* URL Input fallback */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Hoặc nhập URL ảnh..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleClick}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Upload
        </button>
      </div>
    </div>
  );
};
const FeatureListEditor = ({ items = [], onChange, placeholder = "Nhập tính năng..." }) => {
  const addItem = () => {
    const newItems = [...items, ''];
    onChange(newItems);
  };

  const updateItem = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const moveItem = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= items.length) return;
    
    const newItems = [...items];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    onChange(newItems);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Danh sách tính năng ({items.length})
        </label>
        <button
          type="button"
          onClick={addItem}
          className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={16} className="mr-1" />
          Thêm mục
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-start space-x-2 group">
            {/* Order Controls */}
            <div className="flex flex-col space-y-1 pt-3">
              <button
                type="button"
                onClick={() => moveItem(index, index - 1)}
                disabled={index === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Di chuyển lên"
              >
                <MoveUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, index + 1)}
                disabled={index === items.length - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Di chuyển xuống"
              >
                <MoveDown size={14} />
              </button>
            </div>

            {/* Input Field */}
            <div className="flex-1">
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={placeholder}
              />
            </div>

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              title="Xóa mục này"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">Chưa có tính năng nào</p>
          <button
            type="button"
            onClick={addItem}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thêm tính năng đầu tiên
          </button>
        </div>
      )}

      {/* Quick Add Suggestions */}
      {items.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Gợi ý nhanh:</p>
          <div className="flex flex-wrap gap-2">
            {getQuickSuggestions(placeholder).map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  const newItems = [...items, suggestion];
                  onChange(newItems);
                }}
                className="px-3 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function for quick suggestions
const getQuickSuggestions = (placeholder) => {
  if (placeholder.includes('tính năng') || placeholder.includes('feature')) {
    return [
      '5 Bedrooms',
      '6 Bathrooms', 
      '510m2 Living Space',
      'Swimming Pool',
      'Garden',
      'Garage',
      'Smart Home'
    ];
  }
  
  if (placeholder.includes('thông số') || placeholder.includes('specification')) {
    return [
      'Heated Pool',
      'Solar Panels',
      'Smart Lighting',
      'Security System',
      'Central AC',
      'Hardwood Floors'
    ];
  }
  
  return [
    'Tính năng 1',
    'Tính năng 2',
    'Tính năng 3'
  ];
};
const GalleryEditor = ({ images = [], onChange }) => {
  const [dragOver, setDragOver] = useState(false);
  const [editingCaption, setEditingCaption] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    
    const newImages = fileArray.map(file => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      file: file,
      name: file.name,
      caption: ''
    }));
    
    onChange([...images, ...newImages]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (indexToRemove) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    onChange(newImages);
  };

  const updateImageCaption = (index, caption) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], caption };
    onChange(newImages);
  };

  const moveImage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onChange(newImages);
  };

  const startEditingCaption = (index) => {
    setEditingCaption(index);
  };

  const finishEditingCaption = () => {
    setEditingCaption(null);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          dragOver 
            ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        
        <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Kéo thả ảnh vào đây hoặc click để chọn
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Hỗ trợ PNG, JPG, WEBP • Tối đa 10MB/ảnh
        </p>
        <button
          type="button"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Chọn ảnh từ máy tính
        </button>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Thư viện ảnh ({images.length} ảnh)
            </h3>
            <div className="text-sm text-gray-500">
              Kéo thả để sắp xếp hoặc dùng nút mũi tên
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div 
                key={image.id || index} 
                className="relative group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all"
              >
                {/* Image */}
                <div className="aspect-square relative">
                  <img
                    src={image.url}
                    alt={image.caption || `Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingCaption(index);
                        }}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                        title="Chỉnh sửa chú thích"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        title="Xóa ảnh"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Order Badge */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    #{index + 1}
                  </div>
                </div>

                {/* Caption */}
                <div className="p-3">
                  {editingCaption === index ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={image.caption || ''}
                        onChange={(e) => updateImageCaption(index, e.target.value)}
                        onBlur={finishEditingCaption}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') finishEditingCaption();
                        }}
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập chú thích..."
                        autoFocus
                      />
                      <div className="flex space-x-1">
                        <button
                          onClick={finishEditingCaption}
                          className="flex-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => startEditingCaption(index)}
                    >
                      <span className="text-sm text-gray-700 truncate flex-1">
                        {image.caption || 'Thêm chú thích...'}
                      </span>
                      <Edit size={12} className="text-gray-400 ml-1 flex-shrink-0" />
                    </div>
                  )}
                </div>

                {/* Move Controls */}
                <div className="absolute top-2 right-2 flex flex-col space-y-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveImage(index, index - 1);
                    }}
                    disabled={index === 0}
                    className="p-1 bg-black bg-opacity-70 text-white rounded hover:bg-opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Di chuyển lên"
                  >
                    <MoveUp size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveImage(index, index + 1);
                    }}
                    disabled={index === images.length - 1}
                    className="p-1 bg-black bg-opacity-70 text-white rounded hover:bg-opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Di chuyển xuống"
                  >
                    <MoveDown size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <ImageIcon size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có ảnh nào</h3>
          <p className="text-gray-600 mb-4">Thêm ảnh để tạo thư viện hình ảnh cho dự án</p>
        </div>
      )}

      {/* Bulk Actions */}
      {images.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {images.length} ảnh đã chọn
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleClick}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Thêm ảnh
            </button>
            {images.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Xóa tất cả
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// export default ImageUpload;
export default Create;