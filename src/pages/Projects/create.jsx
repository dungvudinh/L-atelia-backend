'use client';

import { useEffect, useState } from 'react';
import { Upload, X, Plus, Trash2, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { projectService } from '../../services/projectService';

export default function CreateProject() {
  
  const navigate = useNavigate();
  const [searchParams]= useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;
  const [loading, setLoading] = useState(false);

  const [project, setProject] = useState({
    title: '',
    description: '',
    heroImage: '',
    gallery: [],
    details: { area: '', bedrooms: '', bathrooms: '', floors: '', style: '', year: '', location: '' },
    floorPlans: [],
    constructionProgress: [],
    designImages: [],
    brochure: null,
    featureSections: []
  });
  // Preview states
  const [galleryPreview, setGalleryPreview] = useState([]);
  const [floorPlanPreview, setFloorPlanPreview] = useState([]);
  const [progressPreview, setProgressPreview] = useState([]);
  const [designPreview, setDesignPreview] = useState([]);
  const [brochurePreview, setBrochurePreview] = useState(null); // NEW

  useEffect(()=>{
    if(editId) loadProject(editId);
  }, [editId])
  const loadProject = async(id)=>
  {
    try 
    {
      setLoading(true);
      const res = await projectService.getProjectById(id);
      const p = res.data;
      setProject(p);
      setGalleryPreview(p.gallery || []);
      setFloorPlanPreview(p.floorPlans || []);
      setProgressPreview(p.constructionProgress || []);
      setDesignPreview(p.designImages || []);
      if (p.brochure) setBrochurePreview({ url: p.brochure, name: 'brochure.pdf' });
    }
    catch(err)
    {
      alert('Không tải được dự án')
    }
    finally{
      setLoading(false)
    }
  }
  // Handle text input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProject(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setProject(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle image upload
  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);

    if (type === 'hero') {
      setProject(p => ({ ...p, heroImage: url }));
    }
    else if (type === 'gallery') {
      setProject(p => ({ ...p, gallery: [...p.gallery, url] }));
      setGalleryPreview(p => [...p, url]);
    }
    else if (type === 'floorplan') {
      setProject(p => ({ ...p, floorPlans: [...p.floorPlans, url] }));
      setFloorPlanPreview(p => [...p, url]);
    }
    else if (type === 'progress') {
      setProject(p => ({ ...p, constructionProgress: [...p.constructionProgress, url] }));
      setProgressPreview(p => [...p, url]);
    }
    else if (type === 'design') {
      setProject(p => ({ ...p, designImages: [...p.designImages, url] }));
      setDesignPreview(p => [...p, url]);
    }
    else if (type === 'brochure') {
      setProject(p => ({ ...p, brochure: url }));
      setBrochurePreview({ url, name: file.name, type: file.type });
    }
  };

  // Remove image
  const removeImage = (type, index = null) => {
    if (type === 'hero') setProject(p => ({ ...p, heroImage: '' }));
    else if (type === 'gallery') {
      const newGallery = project.gallery.filter((_, i) => i !== index);
      const newPreview = galleryPreview.filter((_, i) => i !== index);
      setProject(p => ({ ...p, gallery: newGallery }));
      setGalleryPreview(newPreview);
    }
    else if (type === 'floorplan') {
      const newPlans = project.floorPlans.filter((_, i) => i !== index);
      const newPreview = floorPlanPreview.filter((_, i) => i !== index);
      setProject(p => ({ ...p, floorPlans: newPlans }));
      setFloorPlanPreview(newPreview);
    }
    else if (type === 'progress') {
      const newArr = project.constructionProgress.filter((_, i) => i !== index);
      const newPrev = progressPreview.filter((_, i) => i !== index);
      setProject(p => ({ ...p, constructionProgress: newArr }));
      setProgressPreview(newPrev);
    }
    else if (type === 'design') {
      const newArr = project.designImages.filter((_, i) => i !== index);
      const newPrev = designPreview.filter((_, i) => i !== index);
      setProject(p => ({ ...p, designImages: newArr }));
      setDesignPreview(newPrev);
    }
    else if (type === 'brochure') {
      setProject(p => ({ ...p, brochure: null }));
      setBrochurePreview(null);
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
      title: 'NEW FEATURE',
      shortDescription: 'Short description...',
      fullDescription: 'Full description here...',
      isExpandable: true
    };
    setProject(prev => ({ ...prev, featureSections: [...prev.featureSections, newSection] }));
  };

  const removeFeatureSection = (id) => {
    setProject(prev => ({ ...prev, featureSections: prev.featureSections.filter(sec => sec.id !== id) }));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    try 
    {
      if(isEditMode)
      {
        await projectService.updateProject(editId, project);
        alert('Cập nhập thành công');
      }
      else 
      {
        await projectService.createProject(project);
        alert('Tạo thành công');
      }
      navigate('/projects');
    }
    catch(err)
    {
      alert(err.response?.data?.message || 'Lỗi');
    }
    finally
    {
      setLoading(false)
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Tạo Dự Án Mới</h1>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* THÔNG TIN CƠ BẢN */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>
              <input type="text" name="title" value={project.title} onChange={handleInputChange} placeholder="Patiki Townhouse" className="w-full px-3 py-2 border rounded-md mb-3" required />
              <textarea name="description" value={project.description} onChange={handleInputChange} rows={4} placeholder="An architectural gem..." className="w-full px-3 py-2 border rounded-md" required />
            </div>

            {/* ẢNH CHÍNH */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Ảnh chính (Hero)</h2>
              {project.heroImage ? (
                <div className="relative">
                  <img src={project.heroImage} alt="Hero" className="w-full h-80 object-cover rounded-lg" />
                  <button type="button" onClick={() => removeImage('hero')} className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full"><X className="w-5 h-5" /></button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-80 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50">
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
                    <button type="button" onClick={() => removeImage('gallery', i)} className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50">
                  <Plus className="w-8 h-8 text-gray-400" />
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
                  <input key={k} type="text" name={`details.${k}`} value={project.details[k]} onChange={handleInputChange} placeholder={l} className="px-3 py-2 border rounded-md" />
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
              <button type="button" onClick={() => console.log(project)} className="px-6 py-2.5 border rounded-md text-gray-700 hover:bg-gray-50">Xem Dữ Liệu</button>
              <button type="submit" className="px-8 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium">Tạo Dự Án</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}