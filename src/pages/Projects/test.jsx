'use client';

import { useEffect, useState } from 'react';
import { Upload, X, Plus, Trash2, FileText } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { projectService } from '../../services/projectService';

export default function Editor() {
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;
  const [loading, setLoading] = useState(false);

  const [project, setProject] = useState({
    title: '',
    description: '',
    status: 'draft',
    location: '',
    heroImage: '',
    gallery: [],
    details: { area: '', bedrooms: '', bathrooms: '', floors: '', style: '', year: '', location: '' },
    floorPlans: [],
    constructionProgress: [],
    designImages: [],
    brochure: '',
    featureSections: []
  });

  // Preview states
  const [galleryPreview, setGalleryPreview] = useState([]);
  const [floorPlanPreview, setFloorPlanPreview] = useState([]);
  const [progressPreview, setProgressPreview] = useState([]);
  const [designPreview, setDesignPreview] = useState([]);
  const [brochurePreview, setBrochurePreview] = useState(null);

  // Store actual File objects for upload
  const [fileObjects, setFileObjects] = useState({
    heroImage: null,
    gallery: [],
    floorPlans: [],
    constructionProgress: [],
    designImages: [],
    brochure: null
  });

  useEffect(() => {
    if (editId) loadProject(editId);
  }, [editId]);

  const loadProject = async (id) => {
    try {
      setLoading(true);
      const res = await projectService.getProjectById(id);
      const p = res.data;
      setProject(p);
      setGalleryPreview(p.gallery || []);
      setFloorPlanPreview(p.floorPlans || []);
      setProgressPreview(p.constructionProgress || []);
      setDesignPreview(p.designImages || []);
      if (p.brochure) setBrochurePreview({ url: p.brochure, name: 'brochure.pdf' });
    } catch (err) {
      alert('Không tải được dự án');
    } finally {
      setLoading(false);
    }
  };

  // Handle text input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProject(prev => ({ 
        ...prev, 
        [parent]: { ...prev[parent], [child]: value } 
      }));
    } else {
      setProject(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle image upload - store both preview URL and File object
  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    if (type === 'hero') {
      setProject(p => ({ ...p, heroImage: url }));
      setFileObjects(prev => ({ ...prev, heroImage: file }));
    } else if (type === 'gallery') {
      setProject(p => ({ ...p, gallery: [...p.gallery, url] }));
      setGalleryPreview(p => [...p, url]);
      setFileObjects(prev => ({ ...prev, gallery: [...prev.gallery, file] }));
    } else if (type === 'floorplan') {
      setProject(p => ({ ...p, floorPlans: [...p.floorPlans, url] }));
      setFloorPlanPreview(p => [...p, url]);
      setFileObjects(prev => ({ ...prev, floorPlans: [...prev.floorPlans, file] }));
    } else if (type === 'progress') {
      setProject(p => ({ ...p, constructionProgress: [...p.constructionProgress, url] }));
      setProgressPreview(p => [...p, url]);
      setFileObjects(prev => ({ ...prev, constructionProgress: [...prev.constructionProgress, file] }));
    } else if (type === 'design') {
      setProject(p => ({ ...p, designImages: [...p.designImages, url] }));
      setDesignPreview(p => [...p, url]);
      setFileObjects(prev => ({ ...prev, designImages: [...prev.designImages, file] }));
    } else if (type === 'brochure') {
      setProject(p => ({ ...p, brochure: url }));
      setBrochurePreview({ url, name: file.name, type: file.type });
      setFileObjects(prev => ({ ...prev, brochure: file }));
    }

    // Reset file input
    e.target.value = '';
  };

  // Remove image
  const removeImage = (type, index = null) => {
    if (type === 'hero') {
      setProject(p => ({ ...p, heroImage: '' }));
      setFileObjects(prev => ({ ...prev, heroImage: null }));
    } else if (type === 'gallery') {
      const newGallery = project.gallery.filter((_, i) => i !== index);
      const newPreview = galleryPreview.filter((_, i) => i !== index);
      const newFiles = fileObjects.gallery.filter((_, i) => i !== index);
      
      setProject(p => ({ ...p, gallery: newGallery }));
      setGalleryPreview(newPreview);
      setFileObjects(prev => ({ ...prev, gallery: newFiles }));
    } else if (type === 'floorplan') {
      const newPlans = project.floorPlans.filter((_, i) => i !== index);
      const newPreview = floorPlanPreview.filter((_, i) => i !== index);
      const newFiles = fileObjects.floorPlans.filter((_, i) => i !== index);
      
      setProject(p => ({ ...p, floorPlans: newPlans }));
      setFloorPlanPreview(newPreview);
      setFileObjects(prev => ({ ...prev, floorPlans: newFiles }));
    } else if (type === 'progress') {
      const newArr = project.constructionProgress.filter((_, i) => i !== index);
      const newPrev = progressPreview.filter((_, i) => i !== index);
      const newFiles = fileObjects.constructionProgress.filter((_, i) => i !== index);
      
      setProject(p => ({ ...p, constructionProgress: newArr }));
      setProgressPreview(newPrev);
      setFileObjects(prev => ({ ...prev, constructionProgress: newFiles }));
    } else if (type === 'design') {
      const newArr = project.designImages.filter((_, i) => i !== index);
      const newPrev = designPreview.filter((_, i) => i !== index);
      const newFiles = fileObjects.designImages.filter((_, i) => i !== index);
      
      setProject(p => ({ ...p, designImages: newArr }));
      setDesignPreview(newPrev);
      setFileObjects(prev => ({ ...prev, designImages: newFiles }));
    } else if (type === 'brochure') {
      setProject(p => ({ ...p, brochure: '' }));
      setBrochurePreview(null);
      setFileObjects(prev => ({ ...prev, brochure: null }));
    }
  };

  // Feature Section Functions
  const updateFeatureSection = (id, field, value) => {
    setProject(prev => ({
      ...prev,
      featureSections: prev.featureSections.map(sec =>
        sec.id === id ? { ...sec, [field]: value } : sec
      )
    }));
  };

  const toggleExpandable = (id) => {
    setProject(prev => ({
      ...prev,
      featureSections: prev.featureSections.map(sec =>
        sec.id === id ? { ...sec, isExpandable: !sec.isExpandable } : sec
      )
    }));
  };

  const addFeatureSection = () => {
    const newSection = {
      id: `custom-${Date.now()}`,
      title: 'Tiêu đề tính năng',
      shortDescription: 'Mô tả ngắn...',
      fullDescription: 'Mô tả đầy đủ...',
      isExpandable: true
    };
    setProject(prev => ({ 
      ...prev, 
      featureSections: [...prev.featureSections, newSection] 
    }));
  };

  const removeFeatureSection = (id) => {
    setProject(prev => ({ 
      ...prev, 
      featureSections: prev.featureSections.filter(sec => sec.id !== id) 
    }));
  };

  // Prepare form data for API call
  const prepareFormData = () => {
    const formData = new FormData();
    
    // Prepare text data
    const textData = {
      title: project.title,
      description: project.description,
      status: project.status,
      location: project.location,
      details: project.details,
      featureSections: project.featureSections
    };
    
    formData.append('data', JSON.stringify(textData));
    
    // Append files
    if (fileObjects.heroImage) {
      formData.append('heroImage', fileObjects.heroImage);
    }
    
    fileObjects.gallery.forEach(file => {
      formData.append('gallery', file);
    });
    
    fileObjects.floorPlans.forEach(file => {
      formData.append('floorPlans', file);
    });
    
    fileObjects.constructionProgress.forEach(file => {
      formData.append('constructionProgress', file);
    });
    
    fileObjects.designImages.forEach(file => {
      formData.append('designImages', file);
    });
    
    if (fileObjects.brochure) {
      formData.append('brochure', fileObjects.brochure);
    }
    
    return formData;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate required fields
      if (!project.title.trim() || !project.description.trim()) {
        alert('Vui lòng nhập tiêu đề và mô tả dự án');
        setLoading(false);
        return;
      }

      const formData = prepareFormData();

      if (isEditMode) {
        await projectService.updateProject(editId, formData);
        alert('Cập nhật thành công');
      } else {
        await projectService.createProject(formData);
        alert('Tạo dự án thành công');
      }
      navigate('/projects');
    } catch (err) {
      console.error('Submit error:', err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi lưu dự án');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {isEditMode ? 'Chỉnh sửa Dự Án' : 'Tạo Dự Án Mới'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* THÔNG TIN CƠ BẢN */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề *
                </label>
                <input 
                  type="text" 
                  name="title" 
                  value={project.title} 
                  onChange={handleInputChange} 
                  placeholder="Nhập tiêu đề dự án" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả *
                </label>
                <textarea 
                  name="description" 
                  value={project.description} 
                  onChange={handleInputChange} 
                  rows={4} 
                  placeholder="Mô tả chi tiết về dự án..." 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa điểm
                  </label>
                  <input 
                    type="text" 
                    name="location" 
                    value={project.location} 
                    onChange={handleInputChange} 
                    placeholder="Địa điểm dự án" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select 
                    name="status" 
                    value={project.status} 
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="draft">Bản nháp</option>
                    <option value="published">Đã xuất bản</option>
                    <option value="archived">Đã lưu trữ</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ẢNH CHÍNH */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Ảnh chính (Hero)</h2>
            {project.heroImage ? (
              <div className="relative">
                <img src={project.heroImage} alt="Hero" className="w-full h-80 object-cover rounded-lg" />
                <button type="button" onClick={() => removeImage('hero')} className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-80 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <Upload className="w-16 h-16 text-gray-400" />
                <span className="mt-2 text-sm text-gray-600">Tải lên ảnh chính</span>
                <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'hero')} />
              </label>
            )}
          </div>

          {/* BỘ SƯU TẬP NỘI THẤT */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Bộ sưu tập ảnh nội thất</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryPreview.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img} alt="" className="w-full h-40 object-cover rounded-lg" />
                  <button type="button" onClick={() => removeImage('gallery', i)} className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <Plus className="w-8 h-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-600">Thêm ảnh</span>
                <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'gallery')} />
              </label>
            </div>
          </div>

          {/* THÔNG TIN CHI TIẾT */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Thông tin chi tiết</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries({
                area: 'Diện tích', bedrooms: 'Phòng ngủ', bathrooms: 'Phòng tắm',
                floors: 'Số tầng', style: 'Phong cách', year: 'Năm xây', location: 'Vị trí'
              }).map(([k, l]) => (
                <div key={k}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{l}</label>
                  <input 
                    type="text" 
                    name={`details.${k}`} 
                    value={project.details[k]} 
                    onChange={handleInputChange} 
                    placeholder={l} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* BẢN VẼ MẶT BẰNG */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Bản vẽ mặt bằng</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {floorPlanPreview.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt="" className="w-full h-32 object-contain bg-gray-50 border rounded-lg" />
                    <button type="button" onClick={() => removeImage('floorplan', i)} className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50">
                  <Plus className="w-6 h-6 text-gray-400" />
                  <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'floorplan')} />
                </label>
              </div>
            </div>

            {/* TIẾN ĐỘ THI CÔNG */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Ảnh tiến độ thi công</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {progressPreview.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt="" className="w-full h-40 object-cover rounded-lg" />
                    <button type="button" onClick={() => removeImage('progress', i)} className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50">
                  <Plus className="w-8 h-8 text-gray-400" />
                  <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'progress')} />
                </label>
              </div>
            </div>

            {/* HÌNH ẢNH THIẾT KẾ */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Hình ảnh thiết kế (3D/Concept)</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {designPreview.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt="" className="w-full h-40 object-cover rounded-lg" />
                    <button type="button" onClick={() => removeImage('design', i)} className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50">
                  <Plus className="w-8 h-8 text-gray-400" />
                  <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'design')} />
                </label>
              </div>
            </div>

            {/* BROCHURE */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Brochure (PDF hoặc ảnh)</h2>
              {brochurePreview ? (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    {brochurePreview.type.startsWith('image/') ? (
                      <img src={brochurePreview.url} alt="Brochure" className="w-16 h-16 object-cover rounded" />
                    ) : (
                      <FileText className="w-10 h-10 text-blue-600" />
                    )}
                    <div>
                      <p className="font-medium">{brochurePreview.name}</p>
                      <p className="text-sm text-gray-500">{brochurePreview.type}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeImage('brochure')} className="text-red-500 hover:text-red-700"><Trash2 className="w-5 h-5" /></button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50">
                  <FileText className="w-10 h-10 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Tải lên brochure (PDF hoặc ảnh)</span>
                  <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => handleImageUpload(e, 'brochure')} />
                </label>
              )}
            </div>

            {/* FEATURE SECTIONS */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Các phần nổi bật</h2>
                <button type="button" onClick={addFeatureSection} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm"><Plus className="w-4 h-4" /> Thêm</button>
              </div>
              <div className="space-y-6">
                {project.featureSections.map(sec => (
                  <div key={sec.id} className="p-5 border rounded-lg bg-gray-50 space-y-3">
                    <div className="flex justify-between">
                      <input type="text" value={sec.title} onChange={e => updateFeatureSection(sec.id, 'title', e.target.value)} className="text-lg font-bold w-full px-2 py-1 border rounded" />
                      <button type="button" onClick={() => removeFeatureSection(sec.id)} className="text-red-500 ml-2"><Trash2 className="w-5 h-5" /></button>
                    </div>
                    <textarea value={sec.shortDescription} onChange={e => updateFeatureSection(sec.id, 'shortDescription', e.target.value)} rows={2} className="w-full px-3 py-2 border rounded text-sm" placeholder="Mô tả ngắn..." />
                    <textarea value={sec.fullDescription} onChange={e => updateFeatureSection(sec.id, 'fullDescription', e.target.value)} rows={3} className="w-full px-3 py-2 border rounded text-sm" placeholder="Mô tả đầy đủ..." />
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={sec.isExpandable} onChange={() => toggleExpandable(sec.id)} className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Bật "Read more"</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

          {/* SUBMIT */}
          <div className="flex justify-end gap-4 py-6">
            <button 
              type="button" 
              onClick={() => navigate('/projects')}
              className="px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 transition-colors font-medium flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang xử lý...
                </>
              ) : (
                isEditMode ? 'Cập nhật Dự Án' : 'Tạo Dự Án'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}