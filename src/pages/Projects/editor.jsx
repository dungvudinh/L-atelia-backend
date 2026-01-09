'use client';

import { useEffect, useState } from 'react';
import { Upload, X, Plus, Trash2, FileText } from 'lucide-react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { projectService } from '../../services/projectService';

// Hàm tạo special sections mặc định - ĐẶT NGOÀI COMPONENT
const getDefaultSpecialSections = () => [
  {
    id: 'spectacular-architecture',
    type: 'architecture',
    title: 'SPECTACULAR ARCHITECTURE',
    shortDescription: 'Designed by Parisian architects in the late 19th century this property exudes french charm with an air of grandeur and opulence rarely seen anywhere else on the island.',
    fullDescription: 'Designed by Parisian architects in the late 19th century this property exudes french charm with an air of grandeur and opulence rarely seen anywhere else on the island. The intricate details and craftsmanship showcase the exceptional architectural heritage of this magnificent building.',
    isExpandable: true
  },
  {
    id: 'the-history',
    type: 'history',
    title: 'THE HISTORY',
    shortDescription: 'When scientists discovered the health benefits of vitamin C in the late 18th century Sóller\'s citrus trade boomed and the town saw a massive influx of wealth.',
    fullDescription: 'When scientists discovered the health benefits of vitamin C in the late 18th century Sóller\'s citrus trade boomed and the town saw a massive influx of wealth. It was during this time of opulence in 1896 that this townhouse was built. Parisian architects were hired and materials such as stained glass and wood were shipped in from all over the world.',
    isExpandable: true
  },
  {
    id: 'immataculate-details',
    type: 'details',
    title: 'IMMATECULATE DETAILS',
    shortDescription: 'The extensive reformation saw all the historic sections painstakingly restored to their original glory while adding modern comforts and luxuries throughout.',
    fullDescription: 'The extensive reformation saw all the historic sections painstakingly restored to their original glory while adding modern comforts and luxuries throughout. Every detail was carefully considered to maintain the historical integrity while providing contemporary living standards.',
    isExpandable: true
  }
];

export default function Editor() {
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {projectId} = useParams()
  const isEditMode = !!projectId;
  const [loading, setLoading] = useState(false);

  // State với special sections mặc định
  const [project, setProject] = useState({
    title: '',
    description: '',
    status: 'draft',
    location: '',
    heroImage: '',
    gallery: [],
    propertyFeatures: [],
    specifications: [],
    constructionProgress: [],
    designImages: [],
    brochure: [],
    propertyHighlights: [],
    specialSections: getDefaultSpecialSections()
  });

  // Preview states - ĐÃ SỬA ĐỂ HỖ TRỢ OBJECT {url, uploaded_at}
  const [galleryPreview, setGalleryPreview] = useState([]);
  const [progressPreview, setProgressPreview] = useState([]);
  const [designPreview, setDesignPreview] = useState([]);
  const [brochurePreview, setBrochurePreview] = useState([]);

  // Store actual File objects for upload
  const [fileObjects, setFileObjects] = useState({
    heroImage: null,
    gallery: [],
    constructionProgress: [],
    designImages: [],
    brochure: []
  });
  const [originalImages, setOriginalImages] = useState({
    heroImage: null,
    gallery: [],
    constructionProgress: [],
    designImages: [],
    brochure: []
  });
  useEffect(() => {
    if (projectId) loadProject(projectId);
  }, [projectId]);

  const loadProject = async (id) => {
    try {
      setLoading(true);
      const res = await projectService.getProjectById(id);
      const p = res.data;
      
        console.log('Loaded project data:', p);
        setOriginalImages({
          heroImage: p.heroImage,
          gallery: p.gallery || [],
          constructionProgress: p.constructionProgress || [],
          designImages: p.designImages || [],
          brochure: p.brochure || []
        });
      // Hàm extract URL từ image object {url, uploaded_at} hoặc string (backward compatibility)
      const extractUrl = (imageData) => {
        if (!imageData) return '';
        if (typeof imageData === 'object' && imageData.url) {
          return imageData.url;
        }
        return imageData;
      };

      // Hàm extract toàn bộ image data (giữ nguyên object nếu có)
      const extractImageData = (imageData) => {
        if (!imageData) return '';
        return imageData;
      };

      // Set basic project data với cấu trúc mới
      setProject({
        title: p.title || '',
        description: p.description || '',
        status: p.status || 'draft',
        location: p.location || '',
        heroImage: extractImageData(p.heroImage) || '',
        gallery: p.gallery ? p.gallery.map(extractImageData) : [],
        propertyFeatures: p.propertyFeatures || [],
        specifications: p.specifications || [],
        constructionProgress: p.constructionProgress ? p.constructionProgress.map(extractImageData) : [],
        designImages: p.designImages ? p.designImages.map(extractImageData) : [],
        brochure: p.brochure ? p.brochure.map(extractImageData) : [],
        propertyHighlights: p.propertyHighlights || [],
        specialSections: p.specialSections && p.specialSections.length > 0 ? p.specialSections : getDefaultSpecialSections()
      });

      // Set previews với existing images - CHỈ LẤY URL ĐỂ HIỂN THỊ
      setGalleryPreview(p.gallery ? p.gallery.map(extractUrl) : []);
      setProgressPreview(p.constructionProgress ? p.constructionProgress.map(extractUrl) : []);
      setDesignPreview(p.designImages ? p.designImages.map(extractUrl) : []);
      
      // Xử lý brochure - ĐÃ SỬA ĐỂ HỖ TRỢ OBJECT {url, uploaded_at}
      if (p.brochure) {
        if (Array.isArray(p.brochure)) {
          const brochurePreviews = p.brochure.map(brochure => {
            const url = extractUrl(brochure);
            return {
              url,
              name: url.split('/').pop() || 'brochure.pdf',
              type: url.endsWith('.pdf') ? 'application/pdf' : 'image/*'
            };
          });
          setBrochurePreview(brochurePreviews);
        } else {
          const url = extractUrl(p.brochure);
          setBrochurePreview([{
            url: url,
            name: 'brochure.pdf',
            type: url.endsWith('.pdf') ? 'application/pdf' : 'image/*'
          }]);
        }
      } else {
        setBrochurePreview([]);
      }
      
      // Reset file objects
      setFileObjects({
        heroImage: null,
        gallery: [],
        constructionProgress: [],
        designImages: [],
        brochure: []
      });
      
    } catch (err) {
      console.error('Error loading project:', err);
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

  // Handle image upload
  const handleImageUpload = (e, type) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (type === 'hero') {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setProject(p => ({ ...p, heroImage: url }));
      setFileObjects(prev => ({ ...prev, heroImage: file }));
    } 
    else if (type === 'gallery') {
      files.forEach(file => {
        const url = URL.createObjectURL(file);
        setProject(p => ({ ...p, gallery: [...p.gallery, url] }));
        setGalleryPreview(p => [...p, url]);
        setFileObjects(prev => ({ ...prev, gallery: [...prev.gallery, file] }));
      });
    }
    else if (type === 'progress') {
      files.forEach(file => {
        const url = URL.createObjectURL(file);
        setProject(p => ({ ...p, constructionProgress: [...p.constructionProgress, url] }));
        setProgressPreview(p => [...p, url]);
        setFileObjects(prev => ({ ...prev, constructionProgress: [...prev.constructionProgress, file] }));
      });
    } 
    else if (type === 'design') {
      files.forEach(file => {
        const url = URL.createObjectURL(file);
        setProject(p => ({ ...p, designImages: [...p.designImages, url] }));
        setDesignPreview(p => [...p, url]);
        setFileObjects(prev => ({ ...prev, designImages: [...prev.designImages, file] }));
      });
    } 
    else if (type === 'brochure') {
      files.forEach(file => {
        const url = URL.createObjectURL(file);
        const brochureItem = {
          url,
          name: file.name,
          type: file.type
        };
        setProject(p => ({ ...p, brochure: [...p.brochure, url] }));
        setBrochurePreview(p => [...p, brochureItem]);
        setFileObjects(prev => ({ ...prev, brochure: [...prev.brochure, file] }));
      });
    }

    e.target.value = '';
  };

  // Remove image
  // Sửa hàm removeImage
// Sửa hàm removeImage
const removeImage = (type, index = null) => {
  if (type === 'hero') {
    setProject(p => ({ ...p, heroImage: '' }));
    setFileObjects(prev => ({ ...prev, heroImage: null }));
  } else {
    const typeMap = {
      gallery: ['gallery', galleryPreview, 'gallery'],
      progress: ['constructionProgress', progressPreview, 'constructionProgress'],
      design: ['designImages', designPreview, 'designImages'],
      brochure: ['brochure', brochurePreview, 'brochure']
    };

    const [projectKey, previewState, fileKey] = typeMap[type];
    
    // Tạo bản sao mới của các array
    const newProjectArray = [...project[projectKey]];
    const newPreview = [...previewState];
    const newFiles = [...fileObjects[fileKey]];
    
    // Lấy item bị xóa để revoke blob URL (tránh memory leak)
    const removedItem = newProjectArray[index];
    if (removedItem) {
      const url = typeof removedItem === 'string' ? removedItem : removedItem.url;
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    }
    
    // Xóa phần tử tại index
    newProjectArray.splice(index, 1);
    newPreview.splice(index, 1);
    newFiles.splice(index, 1);
    
    // Cập nhật state
    setProject(p => ({ ...p, [projectKey]: newProjectArray }));
    
    // Cập nhật preview state tương ứng
    if (type === 'gallery') setGalleryPreview(newPreview);
    if (type === 'progress') setProgressPreview(newPreview);
    if (type === 'design') setDesignPreview(newPreview);
    if (type === 'brochure') setBrochurePreview(newPreview);
    
    setFileObjects(prev => ({ ...prev, [fileKey]: newFiles }));
  }
};

  // Property Features Functions
  const addPropertyFeature = () => {
    const newFeature = {
      id: `feature-${Date.now()}`,
      text: ''
    };
    setProject(prev => ({
      ...prev,
      propertyFeatures: [...prev.propertyFeatures, newFeature]
    }));
  };

  const updatePropertyFeature = (id, text) => {
    setProject(prev => ({
      ...prev,
      propertyFeatures: prev.propertyFeatures.map(feature =>
        feature.id === id ? { ...feature, text } : feature
      )
    }));
  };

  const removePropertyFeature = (id) => {
    setProject(prev => ({
      ...prev,
      propertyFeatures: prev.propertyFeatures.filter(feature => feature.id !== id)
    }));
  };

  // Specification Functions
  const addSpecification = () => {
    const newSpec = {
      id: `spec-${Date.now()}`,
      text: ''
    };
    setProject(prev => ({
      ...prev,
      specifications: [...prev.specifications, newSpec]
    }));
  };

  const updateSpecification = (id, text) => {
    setProject(prev => ({
      ...prev,
      specifications: prev.specifications.map(spec =>
        spec.id === id ? { ...spec, text } : spec
      )
    }));
  };

  const removeSpecification = (id) => {
    setProject(prev => ({
      ...prev,
      specifications: prev.specifications.filter(spec => spec.id !== id)
    }));
  };

  // Property Highlights Functions
  const addPropertyHighlight = () => {
    const newHighlight = {
      id: `highlight-${Date.now()}`,
      title: '',
      description: '',
      featureSections: []
    };
    setProject(prev => ({
      ...prev,
      propertyHighlights: [...prev.propertyHighlights, newHighlight]
    }));
  };

  const updatePropertyHighlight = (id, field, value) => {
    setProject(prev => ({
      ...prev,
      propertyHighlights: prev.propertyHighlights.map(highlight =>
        highlight.id === id ? { ...highlight, [field]: value } : highlight
      )
    }));
  };

  const removePropertyHighlight = (id) => {
    setProject(prev => ({
      ...prev,
      propertyHighlights: prev.propertyHighlights.filter(highlight => highlight.id !== id)
    }));
  };

  // Feature Section Functions (trong Property Highlight)
  const addFeatureSection = (highlightId) => {
    const newSection = {
      id: `section-${Date.now()}`,
      name: '',
      description: ''
    };
    setProject(prev => ({
      ...prev,
      propertyHighlights: prev.propertyHighlights.map(highlight =>
        highlight.id === highlightId
          ? { ...highlight, featureSections: [...highlight.featureSections, newSection] }
          : highlight
      )
    }));
  };

  const updateFeatureSection = (highlightId, sectionId, field, value) => {
    setProject(prev => ({
      ...prev,
      propertyHighlights: prev.propertyHighlights.map(highlight =>
        highlight._id === highlightId
          ? {
              ...highlight,
              featureSections: highlight.featureSections.map(section =>
                section._id === sectionId ? { ...section, [field]: value } : section
              )
            }
          : highlight
      )
    }));
  };

  const removeFeatureSection = (highlightId, sectionId) => {
    setProject(prev => ({
      ...prev,
      propertyHighlights: prev.propertyHighlights.map(highlight =>
        highlight.id === highlightId
          ? {
              ...highlight,
              featureSections: highlight.featureSections.filter(section => section._id !== sectionId)
            }
          : highlight
      )
    }));
  };

  // Special Sections Functions
  const updateSpecialSection = (id, field, value) => {
    setProject(prev => ({
      ...prev,
      specialSections: prev.specialSections.map(section =>
        section._id === id ? { ...section, [field]: value } : section
      )
    }));
  };

  const toggleSpecialSectionExpandable = (id) => {
    setProject(prev => ({
      ...prev,
      specialSections: prev.specialSections.map(section =>
        section._id === id ? { ...section, isExpandable: !section.isExpandable } : section
      )
    }));
  };
  // Trong component Editor
const findDeletedImages = (originalArray, currentArray) => {
  if (!originalArray || originalArray.length === 0) return [];
  
  // Extract URLs từ cả original và current
  const extractUrls = (arr) => {
    return arr.map(item => {
      if (!item) return '';
      if (typeof item === 'object' && item.url) {
        return item.url;
      }
      if (typeof item === 'string') {
        return item;
      }
      return '';
    }).filter(url => url && url.trim() !== '');
  };
  
  const originalUrls = extractUrls(originalArray);
  const currentUrls = extractUrls(currentArray);
  
  console.log('=== DEBUG: FIND DELETED IMAGES ===');
  console.log('Original URLs count:', originalUrls.length);
  console.log('Current URLs count:', currentUrls.length);
  
  // Tìm URLs có trong original nhưng không có trong current
  const deleted = originalUrls.filter(url => !currentUrls.includes(url));
  console.log('Deleted URLs found:', deleted.length);
  
  return deleted;
};
  // Prepare form data for API call
  const prepareFormData = () => {
    try {
      const formData = new FormData();
      
      // Tìm ảnh đã bị xóa cho TẤT CẢ các loại
      const deletedImages = {
        gallery: findDeletedImages(originalImages.gallery, project.gallery),
        constructionProgress: findDeletedImages(originalImages.constructionProgress, project.constructionProgress),
        designImages: findDeletedImages(originalImages.designImages, project.designImages),
        brochure: findDeletedImages(originalImages.brochure, project.brochure)
      };
      
      // Nếu heroImage bị xóa
      if (originalImages.heroImage && !project.heroImage) {
        const heroUrl = typeof originalImages.heroImage === 'object' 
          ? originalImages.heroImage.url 
          : originalImages.heroImage;
        if (heroUrl && heroUrl.trim() !== '') {
          deletedImages.heroImage = heroUrl;
        }
      }
      
      // QUAN TRỌNG: Gửi đầy đủ tất cả danh sách ảnh HIỆN TẠI
      const textData = {
        title: project.title || '',
        description: project.description || '',
        status: project.status || 'draft',
        location: project.location || '',
        propertyFeatures: project.propertyFeatures || [],
        specifications: project.specifications || [],
        propertyHighlights: project.propertyHighlights || [],
        specialSections: project.specialSections || getDefaultSpecialSections(),
        
        // Gửi danh sách ảnh HIỆN TẠI của TẤT CẢ các loại
        gallery: project.gallery || [],
        constructionProgress: project.constructionProgress || [],
        designImages: project.designImages || [],
        brochure: project.brochure || [],
        heroImage: project.heroImage || '',
        
        // Gửi thông tin ảnh cần xóa của TẤT CẢ các loại
        deletedImages: deletedImages
      };
      
      console.log('=== DEBUG: CURRENT IMAGES DATA ===');
      console.log('Gallery count:', textData.gallery.length);
      console.log('Construction Progress count:', textData.constructionProgress.length);
      console.log('Design Images count:', textData.designImages.length);
      console.log('Brochure count:', textData.brochure.length);
      
      // DEBUG: Log deleted images
      console.log('=== DEBUG: DELETED IMAGES ===');
      Object.keys(deletedImages).forEach(key => {
        if (Array.isArray(deletedImages[key]) && deletedImages[key].length > 0) {
          console.log(`Deleted ${key}:`, deletedImages[key].length);
        } else if (deletedImages[key]) {
          console.log(`Deleted ${key}:`, deletedImages[key]);
        }
      });
      
      // Stringify với error handling
      let jsonString;
      try {
        jsonString = JSON.stringify(textData, (key, value) => {
          // Handle special cases
          if (value === undefined) return null;
          if (value === null) return null;
          return value;
        });
        
        console.log('✅ JSON is valid, length:', jsonString.length);
      } catch (jsonError) {
        console.error('❌ JSON stringify error:', jsonError);
        // Simple fallback - chỉ gửi data cơ bản
        const simpleData = {
          title: textData.title,
          description: textData.description,
          status: textData.status,
          location: textData.location,
          gallery: textData.gallery,
          constructionProgress: textData.constructionProgress,
          designImages: textData.designImages,
          brochure: textData.brochure,
          heroImage: textData.heroImage,
          deletedImages: textData.deletedImages
        };
        jsonString = JSON.stringify(simpleData);
        console.log('✅ JSON fixed (simple version)');
      }
      
      formData.append('data', jsonString);
      
      // Append NEW files only (files mới upload) cho TẤT CẢ loại
      if (fileObjects.heroImage) {
        console.log('Adding NEW heroImage file:', fileObjects.heroImage.name);
        formData.append('heroImage', fileObjects.heroImage);
      }
      
      fileObjects.gallery.forEach((file, index) => {
        if (file) {
          console.log(`Adding NEW gallery file ${index}:`, file.name);
          formData.append('gallery', file);
        }
      });
      
      fileObjects.constructionProgress.forEach((file, index) => {
        if (file) {
          console.log(`Adding NEW constructionProgress file ${index}:`, file.name);
          formData.append('constructionProgress', file);
        }
      });
      
      fileObjects.designImages.forEach((file, index) => {
        if (file) {
          console.log(`Adding NEW designImages file ${index}:`, file.name);
          formData.append('designImages', file);
        }
      });
      
      fileObjects.brochure.forEach((file, index) => {
        if (file) {
          console.log(`Adding NEW brochure file ${index}:`, file.name);
          formData.append('brochure', file);
        }
      });
      
      // DEBUG: Count total new files
      const totalNewFiles = 
        (fileObjects.heroImage ? 1 : 0) +
        fileObjects.gallery.length +
        fileObjects.constructionProgress.length +
        fileObjects.designImages.length +
        fileObjects.brochure.length;
      
      console.log(`📁 Total new files to upload: ${totalNewFiles}`);
      
      return formData;
    } catch (error) {
      console.error('❌ Error preparing FormData:', error);
      throw error;
    }
  };

  // Hàm getImageUrl - ĐÃ SỬA ĐỂ HỖ TRỢ OBJECT {url, uploaded_at}
  const getImageUrl = (imageData) => {
    if (!imageData) return null;
    
    // Nếu là object {url, uploaded_at}
    if (typeof imageData === 'object' && imageData.url) {
      const url = imageData.url;
      if (url.startsWith('blob:') || url.startsWith('data:')) {
        return url;
      }
      // Đảm bảo URL hiển thị đúng từ Cloudinary
      const normalizedPath = url.replace(/\\/g, '/');
      return normalizedPath;
    }
    
    // Nếu là string (backward compatibility)
    if (typeof imageData === 'string') {
      if (imageData.startsWith('blob:') || imageData.startsWith('data:')) {
        return imageData;
      }
      const normalizedPath = imageData.replace(/\\/g, '/');
      return normalizedPath;
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validation 1: Tiêu đề và mô tả
      if (!project.title.trim() || !project.description.trim()) {
        alert('Vui lòng nhập tiêu đề và mô tả dự án');
        setLoading(false);
        return;
      }
      
      // ========== QUAN TRỌNG: Validation 2 - HeroImage ==========
      if (isEditMode) {
        // Kiểm tra trong chế độ chỉnh sửa
        console.log('=== HEROIMAGE VALIDATION ===');
        console.log('Current heroImage:', project.heroImage);
        console.log('Original heroImage:', originalImages.heroImage);
        console.log('New heroImage file:', fileObjects.heroImage);
        
        // Nếu người dùng đã xóa ảnh hero (project.heroImage là rỗng)
        // VÀ không có ảnh mới upload (fileObjects.heroImage là null)
        // VÀ ban đầu có ảnh hero (originalImages.heroImage không null)
        if (!project.heroImage && 
            !fileObjects.heroImage && 
            originalImages.heroImage) {
          alert('⚠️ Vui lòng chọn ảnh chính (Hero Image) mới!\n\nBạn đã xóa ảnh hero cũ, vui lòng tải lên ảnh hero mới để tiếp tục.');
          setLoading(false);
          return;
        }
      } else {
        // Kiểm tra trong chế độ tạo mới
        if (!project.heroImage && !fileObjects.heroImage) {
          alert('⚠️ Vui lòng chọn ảnh chính (Hero Image)!\n\nẢnh hero là bắt buộc để tạo dự án mới.');
          setLoading(false);
          return;
        }
      }
      
      // Validation 3: Đảm bảo có ít nhất một ảnh hero (cũ hoặc mới)
      const hasHeroImage = project.heroImage || fileObjects.heroImage;
      if (!hasHeroImage) {
        alert('❌ Lỗi: Dự án phải có ít nhất một ảnh chính (Hero Image)');
        setLoading(false);
        return;
      }
    
      console.log('=== START SUBMIT PROCESS ===');
      console.log('Project ID:', projectId);
      console.log('Is edit mode:', isEditMode);
      
      let formData;
      try {
        formData = prepareFormData();
        console.log('✅ FormData created');
      } catch (formDataError) {
        console.error('❌ FormData creation failed:', formDataError);
        alert('Lỗi khi chuẩn bị dữ liệu: ' + formDataError.message);
        setLoading(false);
        return;
      }
    
      if (!formData) {
        console.error('❌ formData is null or undefined');
        alert('Lỗi khi chuẩn bị dữ liệu form');
        setLoading(false);
        return;
      }
    
      // DEBUG: Kiểm tra cuối cùng trước khi gửi
      console.log('=== FINAL CHECK BEFORE API CALL ===');
      let dataFieldExists = false;
      for (let [key, value] of formData.entries()) {
        if (key === 'data') {
          dataFieldExists = true;
          try {
            const parsed = JSON.parse(value);
            console.log('✅ data field is valid JSON');
            console.log('Parsed data sample:', {
              title: parsed.title,
              descriptionLength: parsed.description?.length,
              features: parsed.propertyFeatures?.length,
              highlights: parsed.propertyHighlights?.length,
              heroImage: parsed.heroImage ? 'Has heroImage' : 'No heroImage'
            });
          } catch (parseError) {
            console.error('❌ data field is NOT valid JSON');
            console.error('Parse error:', parseError.message);
            console.error('First 200 chars:', value.substring(0, 200));
          }
          break;
        }
      }
      
      if (!dataFieldExists) {
        console.error('❌ No "data" field found in FormData!');
        alert('Lỗi: Thiếu trường dữ liệu trong form');
        setLoading(false);
        return;
      }
    
      if (isEditMode) {
        console.log('🔄 Updating project...');
        try {
          const response = await projectService.updateProject(projectId, formData);
          console.log('✅ Update successful:', response);
          alert('Cập nhật thành công');
          navigate('/projects');
        } catch (updateError) {
          console.error('❌ Update failed:', updateError);
          console.error('Error response:', updateError.response?.data);
          console.error('Error status:', updateError.response?.status);
          throw updateError;
        }
      } else {
        console.log('🆕 Creating project...');
        try {
          const response = await projectService.createProject(formData);
          console.log('✅ Create successful:', response);
          alert('Tạo dự án thành công');
          navigate('/projects');
        } catch (createError) {
          console.error('❌ Create failed:', createError);
          console.error('Error response:', createError.response?.data);
          console.error('Error status:', createError.response?.status);
          throw createError;
        }
      }
    } catch (err) {
      console.error('=== SUBMIT ERROR DETAILS ===');
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      
      // Hiển thị thông báo lỗi chi tiết
      let errorMessage = 'Có lỗi xảy ra khi lưu dự án';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message.includes('JSON')) {
        errorMessage = 'Lỗi định dạng dữ liệu JSON';
      }
      
      alert(`Lỗi: ${errorMessage}\n\nVui lòng kiểm tra console để biết chi tiết.`);
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
                <img src={getImageUrl(project.heroImage)} alt="Hero" className="w-full h-80 object-cover rounded-lg"  />
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
                  <img src={getImageUrl(img)} alt="" className="w-full h-40 object-cover rounded-lg" />
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
            <h2 className="text-xl font-semibold mb-6">Thông tin chi tiết</h2>
            
            {/* PROPERTY FEATURES */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">Property Features</h3>
                <button 
                  type="button" 
                  onClick={addPropertyFeature}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Thêm Feature
                </button>
              </div>
              
              <div className="space-y-3">
                {project.propertyFeatures.map((feature, index) => (
                  <div key={feature.id} className="flex items-center gap-3 group">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={feature.text}
                        onChange={(e) => updatePropertyFeature(feature.id, e.target.value)}
                        placeholder="Ví dụ: 5 Bedrooms | 6 Bathrooms"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePropertyFeature(feature.id)}
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                      title="Xóa feature"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {project.propertyFeatures.length === 0 && (
                  <div className="text-center py-4 text-gray-500 border-2 border-dashed rounded-lg">
                    <p>Chưa có property features nào</p>
                    <p className="text-sm mt-1">Nhấn "Thêm Feature" để bắt đầu</p>
                  </div>
                )}
              </div>
            </div>

            {/* SPECIFICATION */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">Specification</h3>
                <button 
                  type="button" 
                  onClick={addSpecification}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Thêm Specification
                </button>
              </div>
              
              <div className="space-y-3">
                {project.specifications.map((spec, index) => (
                  <div key={spec.id} className="flex items-center gap-3 group">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={spec.text}
                        onChange={(e) => updateSpecification(spec.id, e.target.value)}
                        placeholder="Ví dụ: Heated Pool, Immaculate Reformation, Roof terrace"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSpecification(spec.id)}
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                      title="Xóa specification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {project.specifications.length === 0 && (
                  <div className="text-center py-4 text-gray-500 border-2 border-dashed rounded-lg">
                    <p>Chưa có specifications nào</p>
                    <p className="text-sm mt-1">Nhấn "Thêm Specification" để bắt đầu</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PROPERTY HIGHLIGHTS */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Property Highlights</h2>
              <button 
                type="button" 
                onClick={addPropertyHighlight}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Thêm Highlight
              </button>
            </div>
            
            <div className="space-y-6">
              {project.propertyHighlights.map((highlight) => (
                <div key={highlight.id} className="p-6 border-2 border-purple-200 rounded-lg bg-purple-50 space-y-4">
                  {/* Highlight Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tên Highlight</label>
                      <input
                        type="text"
                        value={highlight.title}
                        onChange={(e) => updatePropertyHighlight(highlight.id, 'title', e.target.value)}
                        placeholder="Ví dụ: EXPANSIVE OUTDOORS"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg font-bold"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePropertyHighlight(highlight.id)}
                      className="text-red-500 hover:text-red-700 ml-4 mt-7"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Highlight Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                    <textarea
                      value={highlight.description}
                      onChange={(e) => updatePropertyHighlight(highlight.id, 'description', e.target.value)}
                      rows={4}
                      placeholder="Ví dụ: The imposing building presides over an oasis like garden with a state-of-the-art swimming pool, private dining area, and plentiful sunbathing spaces..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>

                  {/* Feature Sections */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700">Feature Sections</label>
                      <button
                        type="button"
                        onClick={() => addFeatureSection(highlight.id)}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                      >
                        <Plus className="w-3 h-3" /> Thêm Feature
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {highlight.featureSections.map((section) => (
                        <div key={section._id} className="flex items-start gap-3 p-3 bg-white border rounded-lg">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={section.name}
                              onChange={(e) => updateFeatureSection(highlight._id, section._id, 'name', e.target.value)}
                              placeholder="Tên feature (ví dụ: SALT WATER EXCHANGE SWIMMING POOL)"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <textarea
                              value={section.description}
                              onChange={(e) => updateFeatureSection(highlight._id, section._id, 'description', e.target.value)}
                              rows={2}
                              placeholder="Mô tả feature"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFeatureSection(highlight._id, section._id)}
                            className="text-red-500 hover:text-red-700 mt-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      {highlight.featureSections.length === 0 && (
                        <div className="text-center py-3 text-gray-500 border border-dashed rounded-lg">
                          <p className="text-sm">Chưa có feature sections nào</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {project.propertyHighlights.length === 0 && (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg bg-purple-25">
                  <p>Chưa có property highlights nào</p>
                  <p className="text-sm mt-1">Nhấn "Thêm Highlight" để bắt đầu</p>
                </div>
              )}
            </div>
          </div>

          {/* SPECIAL SECTIONS */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Các Phần Đặc Biệt</h2>
            
            <div className="space-y-6">
              {project.specialSections && project.specialSections.length > 0 ? (
                project.specialSections.map((section) => (
                  <div key={section._id} className="p-6 border-2 border-orange-200 rounded-lg bg-orange-50 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                        <input
                          type="text"
                          value={section.title || ''}
                          onChange={(e) => updateSpecialSection(section._id, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg font-bold"
                          placeholder="Ví dụ: SPECTACULAR ARCHITECTURE"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                      <textarea
                        value={section.shortDescription || ''}
                        onChange={(e) => updateSpecialSection(section._id, 'shortDescription', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Mô tả ngắn sẽ hiển thị trực tiếp..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả đầy đủ</label>
                      <textarea
                        value={section.fullDescription || ''}
                        onChange={(e) => updateSpecialSection(section._id, 'fullDescription', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Mô tả đầy đủ sẽ hiển thị khi bấm 'Read more'..."
                      />
                    </div>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={section.isExpandable || false}
                        onChange={() => toggleSpecialSectionExpandable(section._id)}
                        className="w-4 h-4 text-orange-600"
                      />
                      <span className="text-sm font-medium">Bật "Read more" cho section này</span>
                    </label>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                  <p>Không có special sections nào</p>
                  <p className="text-sm mt-1">Các special sections sẽ được tạo tự động</p>
                </div>
              )}
            </div>
          </div>

          {/* TIẾN ĐỘ THI CÔNG */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Ảnh tiến độ thi công</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {progressPreview.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={getImageUrl(img)} alt="" className="w-full h-40 object-cover rounded-lg" />
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
                  <img src={getImageUrl(img)} alt="" className="w-full h-40 object-cover rounded-lg" />
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
            <h2 className="text-xl font-semibold mb-4">Brochure (PDF hoặc ảnh) - Multiple</h2>
            <div className="space-y-4">
              {brochurePreview.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {brochurePreview.map((brochure, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3 flex-1">
                        {brochure.type.startsWith('image/') ? (
                          <img src={getImageUrl(brochure.url)} alt="Brochure" className="w-16 h-16 object-cover rounded" />
                        ) : (
                          <FileText className="w-10 h-10 text-blue-600" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{brochure.name}</p>
                          <p className="text-xs text-gray-500">
                            {brochure.type.startsWith('image/') ? 'Hình ảnh' : 'PDF Document'}
                          </p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeImage('brochure', index)} 
                        className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <FileText className="w-10 h-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 text-center px-4">
                  Tải lên brochure (PDF hoặc ảnh)<br />
                  <span className="text-xs">Có thể chọn nhiều file</span>
                </span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*,.pdf" 
                  multiple
                  onChange={e => handleImageUpload(e, 'brochure')} 
                />
              </label>
              
              {brochurePreview.length > 0 && (
                <p className="text-sm text-gray-500 text-center">
                  Đã chọn {brochurePreview.length} brochure
                </p>
              )}
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