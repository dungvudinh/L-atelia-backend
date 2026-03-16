'use client';

import { useEffect, useState } from 'react';
import { Upload, X, Plus, Trash2, FileText, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import FolderManager from '../../components/FolderManager';

// Hàm tạo special sections mặc định
// Sửa hàm tạo special sections mặc định
const getDefaultSpecialSections = () => [
  {
    id: `special-${Date.now()}-1-${Math.random().toString(36).substr(2, 9)}`,
    type: 'architecture',
    title: 'SPECTACULAR ARCHITECTURE',
    shortDescription: 'Designed by Parisian architects in the late 19th century this property exudes french charm with an air of grandeur and opulence rarely seen anywhere else on the island.',
    fullDescription: 'Designed by Parisian architects in the late 19th century this property exudes french charm with an air of grandeur and opulence rarely seen anywhere else on the island. The intricate details and craftsmanship showcase the exceptional architectural heritage of this magnificent building.',
    isExpandable: true
  },
  {
    id: `special-${Date.now()}-2-${Math.random().toString(36).substr(2, 9)}`,
    type: 'history',
    title: 'THE HISTORY',
    shortDescription: 'When scientists discovered the health benefits of vitamin C in the late 18th century Sóller\'s citrus trade boomed and the town saw a massive influx of wealth.',
    fullDescription: 'When scientists discovered the health benefits of vitamin C in the late 18th century Sóller\'s citrus trade boomed and the town saw a massive influx of wealth. It was during this time of opulence in 1896 that this townhouse was built. Parisian architects were hired and materials such as stained glass and wood were shipped in from all over the world.',
    isExpandable: true
  },
  {
    id: `special-${Date.now()}-3-${Math.random().toString(36).substr(2, 9)}`,
    type: 'details',
    title: 'IMMATECULATE DETAILS',
    shortDescription: 'The extensive reformation saw all the historic sections painstakingly restored to their original glory while adding modern comforts and luxuries throughout.',
    fullDescription: 'The extensive reformation saw all the historic sections painstakingly restored to their original glory while adding modern comforts and luxuries throughout. Every detail was carefully considered to maintain the historical integrity while providing contemporary living standards.',
    isExpandable: true
  }
];

export default function ProjectEditor() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const isEditMode = !!projectId;
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // State cho FolderManager
  const [folderManagerOpen, setFolderManagerOpen] = useState({
    heroImage: false,
    gallery: false,
    constructionProgress: false,
    designImages: false,
    brochure: false
  });

  // State với special sections mặc định
  const [project, setProject] = useState({
    title: '',
    description: '',
    type: 'rent',
    status: 'available',
    location: '',
    price:'',
    heroImage: null,
    gallery: [],
    propertyFeatures: [],
    specifications: [],
    constructionProgress: [],
    designImages: [],
    brochure: [],
    propertyHighlights: [],
    specialSections: getDefaultSpecialSections(), 
    youtubeLinks:[]
  });

  // Preview states
  const [galleryPreview, setGalleryPreview] = useState([]);
  const [progressPreview, setProgressPreview] = useState([]);
  const [designPreview, setDesignPreview] = useState([]);
  const [brochurePreview, setBrochurePreview] = useState([]);

  useEffect(() => {
    if (projectId) loadProject(projectId);
  }, [projectId]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'Bạn có thay đổi chưa được lưu. Bạn có chắc muốn rời đi?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Load project data
  const loadProject = async (id) => {
    try {
      setIsProcessing(true);
      setLoading(true);
      const res = await projectService.getProjectById(id);
      const p = res.data;

      // 🔥 QUAN TRỌNG: Đảm bảo mỗi property feature có ID duy nhất
      const propertyFeaturesWithIds = (p.propertyFeatures || []).map((feature, index) => {
      // Nếu feature là string thì chuyển thành object
        if (typeof feature === 'string') {
          return {
            id: `feature-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
            text: feature
          };
        }
        // Nếu đã có object thì kiểm tra ID
        return {
          id: feature.id || `feature-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
          text: feature.text || ''
        };
      });
      const specificationsWithIds = (p.specifications || []).map((spec, index) => {
        if (typeof spec === 'string') {
          return {
            id: `spec-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
            text: spec
          };
        }
        return {
          id: spec.id || `spec-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
          text: spec.text || ''
        };
      });
      const propertyHighlightsWithIds = (p.propertyHighlights || []).map((highlight, highlightIndex) => {
        // Đảm bảo highlight có ID
        const highlightWithId = {
          id: highlight.id || `highlight-${Date.now()}-${highlightIndex}-${Math.random().toString(36).substr(2, 5)}`,
          title: highlight.title || '',
          description: highlight.description || '',
          featureSections: []
        };
  
        // ✅ FIX QUAN TRỌNG: Xử lý Feature Sections với ID duy nhất
        highlightWithId.featureSections = (highlight.featureSections || []).map((section, sectionIndex) => {
          // Nếu section là string thì chuyển thành object
          if (typeof section === 'string') {
            return {
              id: `section-${Date.now()}-${highlightIndex}-${sectionIndex}-${Math.random().toString(36).substr(2, 5)}`,
              name: section,
              description: ''
            };
          }
          
          // Nếu đã là object thì đảm bảo có ID và đủ fields
          return {
            id: section.id || `section-${Date.now()}-${highlightIndex}-${sectionIndex}-${Math.random().toString(36).substr(2, 5)}`,
            name: section.name || section.title || '',
            description: section.description || ''
          };
        });
  
        return highlightWithId;
      });
      let specialSectionsWithIds;
      if (p.specialSections && p.specialSections.length > 0) {
        // Nếu có dữ liệu từ API, đảm bảo mỗi section có ID duy nhất
        specialSectionsWithIds = p.specialSections.map((section, index) => ({
          id: section.id || `special-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
          type: section.type || 'custom',
          title: section.title || '',
          shortDescription: section.shortDescription || '',
          fullDescription: section.fullDescription || '',
          isExpandable: section.isExpandable !== undefined ? section.isExpandable : true
        }));
      } else {
        // Nếu không có, dùng mặc định và tạo ID
        specialSectionsWithIds = getDefaultSpecialSections().map((section, index) => ({
          ...section,
          id: `special-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`
        }));
      }
      // Set basic project data
      setProject({
        title: p.title || '',
        description: p.description || '',
        type: p.type || 'rent',
        status: p.status || 'available',
        location: p.location || '',
        price: p.price || '',
        heroImage: p.heroImage || null,
        gallery: p.gallery || [],
        propertyFeatures: propertyFeaturesWithIds,
        specifications:specificationsWithIds,  
        constructionProgress: p.constructionProgress || [],
        designImages: p.designImages || [],
        brochure: p.brochure || [],
        propertyHighlights:propertyHighlightsWithIds,
        specialSections: specialSectionsWithIds, 
         youtubeLinks: p.youtubeLinks || []
      });

      // Set previews
      setGalleryPreview(p.gallery ? p.gallery.map(img => getImageUrl(img)) : []);
      setProgressPreview(p.constructionProgress ? p.constructionProgress.map(img => getImageUrl(img)) : []);
      setDesignPreview(p.designImages ? p.designImages.map(img => getImageUrl(img)) : []);
      
      if (p.brochure) {
        const brochurePreviews = p.brochure.map(brochure => {
          const url = getImageUrl(brochure);
          return {
            url,
            name: url.split('/').pop() || 'brochure.pdf',
            type: url.endsWith('.pdf') ? 'application/pdf' : 'image/*'
          };
        });
        setBrochurePreview(brochurePreviews);
      } else {
        setBrochurePreview([]);
      }
      
    } catch (err) {
      console.error('Error loading project:', err);
      alert('Không tải được dự án');
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };
  const addYouTubeLink = () => {
  const newLink = {
    id: `youtube-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    url: ''
  };
  setProject(prev => ({
    ...prev,
    youtubeLinks: [...(prev.youtubeLinks || []), newLink]
  }));
  setIsDirty(true);
};

const updateYouTubeLink = (id, url) => {
  setProject(prev => ({
    ...prev,
    youtubeLinks: prev.youtubeLinks.map(link =>
      link.id === id ? { ...link, url } : link
    )
  }));
  setIsDirty(true);
};
const removeYouTubeLink = (id) => {
  setProject(prev => ({
    ...prev,
    youtubeLinks: prev.youtubeLinks.filter(link => link.id !== id)
  }));
  setIsDirty(true);
};
  // Handle text input với dirty flag
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
    setIsDirty(true);
  };

  // Mở FolderManager cho từng loại ảnh
  const openFolderManager = (type) => {
    setFolderManagerOpen(prev => ({ ...prev, [type]: true }));
  };

  // Đóng FolderManager
  const closeFolderManager = (type) => {
    setFolderManagerOpen(prev => ({ ...prev, [type]: false }));
  };

  // Xử lý khi chọn ảnh từ FolderManager
  const handleSelectImagesFromFolder = (type, selectedImages) => {
  if (!selectedImages || selectedImages.length === 0) return;

  const imagesData = Array.isArray(selectedImages) 
    ? selectedImages.map(img => ({
        url: img.url,
        thumbnailUrl: img.thumbnailUrl || null, // ✅ Lưu thumbnailUrl
        key: img.key,
        thumbnailKey: img.thumbnailKey || null, // ✅ Lưu thumbnailKey
        filename: img.originalName || img.filename,
        uploaded_at: new Date(),
        size: img.size || 0,
        thumbnailSize: img.thumbnailSize || 0,
        hasThumbnail: img.hasThumbnail || false
      }))
    : [{
        url: selectedImages.url,
        thumbnailUrl: selectedImages.thumbnailUrl || null,
        key: selectedImages.key,
        thumbnailKey: selectedImages.thumbnailKey || null,
        filename: selectedImages.originalName || selectedImages.filename,
        uploaded_at: new Date(),
        size: selectedImages.size || 0,
        thumbnailSize: selectedImages.thumbnailSize || 0,
        hasThumbnail: selectedImages.hasThumbnail || false
      }];

  if (type === 'heroImage') {
    // Xử lý heroImage (chỉ 1 ảnh)
    const imageData = imagesData[0];
    setProject(prev => ({ ...prev, heroImage: imageData }));
  } else {
    // Xử lý các loại ảnh khác (nhiều ảnh)
    setProject(prev => ({ 
      ...prev, 
      [type]: [...prev[type], ...imagesData] 
    }));

    // Cập nhật preview - HIỂN THỊ THUMBNAIL TRONG EDITOR
    imagesData.forEach(imageData => {
      const previewUrl = imageData.thumbnailUrl || imageData.url; // ✅ Ưu tiên thumbnail
      switch (type) {
        case 'gallery':
          setGalleryPreview(prev => [...prev, previewUrl]);
          break;
        case 'constructionProgress':
          setProgressPreview(prev => [...prev, previewUrl]);
          break;
        case 'designImages':
          setDesignPreview(prev => [...prev, previewUrl]);
          break;
        case 'brochure':
          setBrochurePreview(prev => [...prev, {
            url: previewUrl,
            name: imageData.filename || 'brochure.pdf',
            type: imageData.type || 'image/*'
          }]);
          break;
      }
    });
  }

  setIsDirty(true);
  closeFolderManager(type);
};

  // Xóa ảnh đã chọn
  const removeImage = (type, index = null) => {
    if (isProcessing) {
      alert('Đang xử lý, vui lòng chờ...');
      return;
    }

    setIsProcessing(true);

    try {
      if (type === 'heroImage') {
        setProject(prev => ({ ...prev, heroImage: null }));
      } else {
        // Xóa ảnh khỏi project
        const newProjectArray = [...project[type]];
        newProjectArray.splice(index, 1);
        setProject(prev => ({ ...prev, [type]: newProjectArray }));

        // Xóa preview
        switch (type) {
          case 'gallery':
            const newGalleryPreview = [...galleryPreview];
            newGalleryPreview.splice(index, 1);
            setGalleryPreview(newGalleryPreview);
            break;
          case 'constructionProgress':
            const newProgressPreview = [...progressPreview];
            newProgressPreview.splice(index, 1);
            setProgressPreview(newProgressPreview);
            break;
          case 'designImages':
            const newDesignPreview = [...designPreview];
            newDesignPreview.splice(index, 1);
            setDesignPreview(newDesignPreview);
            break;
          case 'brochure':
            const newBrochurePreview = [...brochurePreview];
            newBrochurePreview.splice(index, 1);
            setBrochurePreview(newBrochurePreview);
            break;
        }
      }
      
      setIsDirty(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Hủy bỏ project
  const handleCancel = async () => {
    if (isProcessing) {
      alert('Đang xử lý, vui lòng chờ...');
      return;
    }

    if (isDirty) {
      const userConfirmed = window.confirm('Dự án chưa được lưu. Bạn có chắc muốn hủy?');
      if (!userConfirmed) return;
    }

    navigate('/projects');
  };

  // Hàm getImageUrl
  const getImageUrl = (imageData) => {
  if (!imageData) return null;
  
  // Nếu imageData là object có thumbnail, ưu tiên thumbnail
  if (typeof imageData === 'object' && imageData.thumbnailUrl) {
    return imageData.thumbnailUrl;
  }
  
  // Fallback về url gốc
  if (typeof imageData === 'object' && imageData.url) {
    const url = imageData.url;
    if (url.startsWith('http') || url.startsWith('https')) {
      return url;
    }
    // Normalize path
    const normalizedPath = url.replace(/\\/g, '/');
    const baseUrl = 'http://localhost:3000';
    return `${baseUrl}${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`;
  }
  
  if (typeof imageData === 'string') {
    return imageData;
  }
  
  return null;
};

  // ========== CÁC HÀM XỬ LÝ CHO THÔNG TIN CHI TIẾT ==========

  // Property Features Functions
  const addPropertyFeature = () => {
    // ✅ Tạo ID duy nhất với timestamp + random string
    const newFeature = {
      id: `feature-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: ''
    };
    setProject(prev => ({
      ...prev,
      propertyFeatures: [...prev.propertyFeatures, newFeature]
    }));
    setIsDirty(true);
  };

  const updatePropertyFeature = (id, text) => {
    setProject(prev => ({
      ...prev,
      propertyFeatures: prev.propertyFeatures.map(feature =>
        feature.id === id ? { ...feature, text } : feature
      )
    }));
    setIsDirty(true);
  };

  const removePropertyFeature = (id) => {
    setProject(prev => ({
      ...prev,
      propertyFeatures: prev.propertyFeatures.filter(feature => feature.id !== id)
    }));
    setIsDirty(true);
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
    setIsDirty(true);
  };

  const updateSpecification = (id, text) => {
    setProject(prev => ({
      ...prev,
      specifications: prev.specifications.map(spec =>
        spec.id === id ? { ...spec, text } : spec
      )
    }));
    setIsDirty(true);
  };

  const removeSpecification = (id) => {
    setProject(prev => ({
      ...prev,
      specifications: prev.specifications.filter(spec => spec.id !== id)
    }));
    setIsDirty(true);
  };

  // Property Highlights Functions
  const addPropertyHighlight = () => {
    const newHighlight = {
      id: `highlight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: '',
      description: '',
      featureSections: []
    };
    setProject(prev => ({
      ...prev,
      propertyHighlights: [...prev.propertyHighlights, newHighlight]
    }));
    setIsDirty(true);
  };

  const updatePropertyHighlight = (id, field, value) => {
    setProject(prev => ({
      ...prev,
      propertyHighlights: prev.propertyHighlights.map(highlight =>
        highlight.id === id
          ? { ...highlight, [field]: value }  // Tạo object mới
          : highlight
      )
    }));
    setIsDirty(true);
  };

  const removePropertyHighlight = (id) => {
    setProject(prev => ({
      ...prev,
      propertyHighlights: prev.propertyHighlights.filter(highlight => highlight.id !== id)
    }));
    setIsDirty(true);
  };

  // Feature Section Functions (trong Property Highlight)
  const addFeatureSection = (highlightId) => {
    const newSection = {
      id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      description: ''
    };
    
    setProject(prev => ({
      ...prev,
      propertyHighlights: prev.propertyHighlights.map(highlight =>
        highlight.id === highlightId
          ? {
              ...highlight,
              featureSections: [...(highlight.featureSections || []), newSection]
            }
          : highlight
      )
    }));
    setIsDirty(true);
  };

  const updateFeatureSection = (highlightId, sectionId, field, value) => {
    setProject(prev => {
      // Log để debug
      
  
      return {
        ...prev,
        propertyHighlights: prev.propertyHighlights.map(highlight => {
          if (highlight.id !== highlightId) return highlight;
          
          return {
            ...highlight,
            featureSections: highlight.featureSections.map(section =>
              section.id === sectionId
                ? { ...section, [field]: value }  // Tạo object mới
                : section
            )
          };
        })
      };
    });
    setIsDirty(true);
  };

  const removeFeatureSection = (highlightId, sectionId) => {
    setProject(prev => ({
      ...prev,
      propertyHighlights: prev.propertyHighlights.map(highlight =>
        highlight.id === highlightId
          ? {
              ...highlight,
              featureSections: highlight.featureSections.filter(
                section => section.id !== sectionId
              )
            }
          : highlight
      )
    }));
    setIsDirty(true);
  };

  // Special Sections Functions
  const updateSpecialSection = (id, field, value) => {
    setProject(prev => {
      // Log để debug
      
  
      return {
        ...prev,
        specialSections: prev.specialSections.map(section =>
          section.id === id 
            ? { ...section, [field]: value }  // Tạo object mới, không mutate
            : section
        )
      };
    });
    setIsDirty(true);
  };

  const toggleSpecialSectionExpandable = (id) => {
    setProject(prev => {
      
      return {
        ...prev,
        specialSections: prev.specialSections.map(section =>
          section.id === id 
            ? { ...section, isExpandable: !section.isExpandable }  // Tạo object mới
            : section
        )
      };
    });
    setIsDirty(true);
  };
//   const renderThumbnail = (project) => {
//   const imageData = project.heroImage;
  
//   if (imageData) {
//     // Ưu tiên thumbnail trong editor
//     const displayUrl = imageData.thumbnailUrl || imageData.url;
//     return (
//       <img 
//         src={displayUrl} 
//         alt={project.title}
//         className="w-full h-full object-cover"
//         onError={(e) => {
//           console.error('Image failed to load:', displayUrl);
//           // Fallback về ảnh gốc nếu thumbnail lỗi
//           if (imageData.url && displayUrl === imageData.thumbnailUrl) {
//             e.target.src = imageData.url;
//           } else {
//             e.target.src = 'https://via.placeholder.com/40x40?text=Error';
//           }
//         }}
//         onLoad={() => console.log('Thumbnail loaded successfully:', project.title)}
//         loading="lazy"
//       />
//     );
//   } else {
//     return (
//       <div className="w-full h-full bg-gray-300 flex items-center justify-center">
//         <Image size={16} className="text-gray-500" />
//       </div>
//     );
//   }
// };

// Trong các phần hiển thị ảnh, thêm badge thumbnail
{galleryPreview.map((img, i) => (
  <div key={i} className="relative group">
    <img 
      src={img} 
      alt="" 
      className="w-full h-40 object-cover rounded-lg" 
    />
    {/* ✅ Badge hiển thị đang xem thumbnail */}
    {project.gallery[i]?.thumbnailUrl && (
      <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
        Thumb
      </span>
    )}
    <button 
      type="button" 
      onClick={() => removeImage('gallery', i)} 
      className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-20"
      disabled={isProcessing}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
))}
  // Hàm submit - GỬI JSON THUẦN
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isProcessing) {
      alert('Đang xử lý, vui lòng chờ...');
      return;
    }

    setLoading(true);
    setIsProcessing(true);
    
    try {
      // Validation
      if (!project.title.trim() || !project.description.trim()) {
        alert('Vui lòng nhập tiêu đề và mô tả dự án');
        setLoading(false);
        setIsProcessing(false);
        return;
      }
      
      // Kiểm tra heroImage
      if (!project.heroImage) {
        alert('⚠️ Vui lòng chọn ảnh chính (Hero Image)!');
        setLoading(false);
        setIsProcessing(false);
        return;
      }
      
      // Chuẩn bị project data - GỬI JSON THUẦN
      const projectData = {
        title: project.title,
        description: project.description,
        type: project.type,
        status: project.status,
        location: project.location,
        price: project.price,
        propertyFeatures: project.propertyFeatures.filter(f => f.text.trim()),
        specifications: project.specifications.filter(s => s.text.trim()),
        propertyHighlights: project.propertyHighlights,
        specialSections: project.specialSections,
        heroImage: project.heroImage,
        gallery: project.gallery,
        constructionProgress: project.constructionProgress,
        designImages: project.designImages,
        brochure: project.brochure,
        youtubeLinks: project.youtubeLinks.filter(link => link.url.trim()) // Thêm dòng này
      };
      console.log('Submitting project data:', projectData);
      
      let result;
      if (isEditMode) {
        // Update project với JSON thuần
        result = await projectService.updateProject(projectId, projectData);
      } else {
        // Create new project với JSON thuần
        result = await projectService.createProject(projectData);
      }
      
      alert(isEditMode ? 'Cập nhật thành công' : 'Tạo dự án thành công');
      setIsDirty(false);
      navigate('/projects');
      
    } catch (err) {
      console.error('Submit error:', err);
      alert('Có lỗi xảy ra: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setIsProcessing(false);
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
          {/* Thông tin cơ bản */}
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
                  disabled={isProcessing}
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
                  disabled={isProcessing}
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
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá bán
                  </label>
                  <input 
                    type="text" 
                    name="price" 
                    value={project.price} 
                    onChange={handleInputChange} 
                    placeholder="Giá bán" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phân loại
                  </label>
                  <select 
                    name="type" 
                    value={project.type} 
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isProcessing}
                  >
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
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
                    disabled={isProcessing}
                  >
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                    {/* <option value="archived">Đã lưu trữ</option> */}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Ảnh chính */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Ảnh chính (Hero) *</h2>
            <div className="relative">
              {project.heroImage ? (
                <div className="relative">
                  <img 
                    src={getImageUrl(project.heroImage)} 
                    alt="Hero" 
                    className="w-full h-80 object-cover rounded-lg" 
                  />
                  <button 
                    type="button" 
                    onClick={() => removeImage('heroImage')} 
                    className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 z-20"
                    disabled={isProcessing}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button 
                  type="button" 
                  onClick={() => openFolderManager('heroImage')}
                  className={`flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isProcessing}
                >
                  <Upload className="w-16 h-16 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-600">Chọn ảnh từ thư viện Media</span>
                  <span className="text-xs text-gray-500 mt-1">(Bắt buộc)</span>
                </button>
              )}
            </div>
          </div>

          {/* Bộ sưu tập nội thất */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Bộ sưu tập ảnh nội thất</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryPreview.map((img, i) => (
                <div key={i} className="relative group">
                  <img 
                    src={img} 
                    alt="" 
                    className="w-full h-40 object-cover rounded-lg" 
                  />
                  <button 
                    type="button" 
                    onClick={() => removeImage('gallery', i)} 
                    className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-20"
                    disabled={isProcessing}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <button 
                type="button" 
                onClick={() => openFolderManager('gallery')}
                className={`flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isProcessing}
              >
                <Plus className="w-8 h-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-600">Chọn từ thư viện Media</span>
              </button>
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
                  disabled={isProcessing}
                >
                  <Plus className="w-4 h-4" /> Thêm Feature
                </button>
              </div>
              
              <div className="space-y-3">
                {project.propertyFeatures && project.propertyFeatures.map((feature, index) => (
                  <div key={feature.id} className="flex items-center gap-3 group">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={feature.text}
                        onChange={(e) => updatePropertyFeature(feature.id, e.target.value)}
                        placeholder="Ví dụ: 5 Bedrooms | 6 Bathrooms"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={isProcessing}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePropertyFeature(feature.id)}
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                      title="Xóa feature"
                      disabled={isProcessing}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {(!project.propertyFeatures || project.propertyFeatures.length === 0) && (
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
                  disabled={isProcessing}
                >
                  <Plus className="w-4 h-4" /> Thêm Specification
                </button>
              </div>
              
              <div className="space-y-3">
                {project.specifications && project.specifications.map((spec, index) => (
                  <div key={spec.id} className="flex items-center gap-3 group">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={spec.text}
                        onChange={(e) => updateSpecification(spec.id, e.target.value)}
                        placeholder="Ví dụ: Heated Pool, Immaculate Reformation, Roof terrace"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        disabled={isProcessing}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSpecification(spec.id)}
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                      title="Xóa specification"
                      disabled={isProcessing}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {(!project.specifications || project.specifications.length === 0) && (
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
                disabled={isProcessing}
              >
                <Plus className="w-4 h-4" /> Thêm Highlight
              </button>
            </div>
            
            <div className="space-y-6">
              {project.propertyHighlights && project.propertyHighlights.map((highlight) => (
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
                        disabled={isProcessing}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePropertyHighlight(highlight.id)}
                      className="text-red-500 hover:text-red-700 ml-4 mt-7"
                      disabled={isProcessing}
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
                      disabled={isProcessing}
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
                        disabled={isProcessing}
                      >
                        <Plus className="w-3 h-3" /> Thêm Feature
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {highlight.featureSections && highlight.featureSections.map((section) => (
                        <div key={section.id} className="flex items-start gap-3 p-3 bg-white border rounded-lg">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={section.name}
                              onChange={(e) => updateFeatureSection(highlight.id, section.id, 'name', e.target.value)}
                              placeholder="Tên feature (ví dụ: SALT WATER EXCHANGE SWIMMING POOL)"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              disabled={isProcessing}
                            />
                            <textarea
                              value={section.description}
                              onChange={(e) => updateFeatureSection(highlight.id, section.id, 'description', e.target.value)}
                              rows={2}
                              placeholder="Mô tả feature"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              disabled={isProcessing}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFeatureSection(highlight.id, section.id)}
                            className="text-red-500 hover:text-red-700 mt-2"
                            disabled={isProcessing}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      {(!highlight.featureSections || highlight.featureSections.length === 0) && (
                        <div className="text-center py-3 text-gray-500 border border-dashed rounded-lg">
                          <p className="text-sm">Chưa có feature sections nào</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {(!project.propertyHighlights || project.propertyHighlights.length === 0) && (
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
                  <div key={section.id} className="p-6 border-2 border-orange-200 rounded-lg bg-orange-50 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                        <input
                          type="text"
                          value={section.title || ''}
                          onChange={(e) => updateSpecialSection(section.id, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg font-bold"
                          placeholder="Ví dụ: SPECTACULAR ARCHITECTURE"
                          disabled={isProcessing}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                      <textarea
                        value={section.shortDescription || ''}
                        onChange={(e) => updateSpecialSection(section.id, 'shortDescription', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Mô tả ngắn sẽ hiển thị trực tiếp..."
                        disabled={isProcessing}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả đầy đủ</label>
                      <textarea
                        value={section.fullDescription || ''}
                        onChange={(e) => updateSpecialSection(section.id, 'fullDescription', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Mô tả đầy đủ sẽ hiển thị khi bấm 'Read more'..."
                        disabled={isProcessing}
                      />
                    </div>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={section.isExpandable || false}
                        onChange={() => toggleSpecialSectionExpandable(section.id)}
                        className="w-4 h-4 text-orange-600"
                        disabled={isProcessing}
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

          {/* Tiến độ thi công */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Ảnh tiến độ thi công</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {progressPreview.map((img, i) => (
                <div key={i} className="relative group">
                  <img 
                    src={img} 
                    alt="" 
                    className="w-full h-40 object-cover rounded-lg" 
                  />
                  <button 
                    type="button" 
                    onClick={() => removeImage('constructionProgress', i)} 
                    className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-20"
                    disabled={isProcessing}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => openFolderManager('constructionProgress')}
                className={`flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isProcessing}
              >
                <Plus className="w-8 h-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-600">Chọn từ thư viện Media</span>
              </button>
            </div>
          </div>

          {/* Hình ảnh thiết kế */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Hình ảnh thiết kế (3D/Concept)</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {designPreview.map((img, i) => (
                <div key={i} className="relative group">
                  <img 
                    src={img} 
                    alt="" 
                    className="w-full h-40 object-cover rounded-lg" 
                  />
                  <button 
                    type="button" 
                    onClick={() => removeImage('designImages', i)} 
                    className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-20"
                    disabled={isProcessing}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => openFolderManager('designImages')}
                className={`flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isProcessing}
              >
                <Plus className="w-8 h-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-600">Chọn từ thư viện Media</span>
              </button>
            </div>
          </div>

          {/* YouTube Links */}
<div className="bg-white p-6 rounded-lg shadow-sm">
  <h2 className="text-xl font-semibold mb-4">Video YouTube</h2>
  
  {/* Danh sách YouTube links */}
  <div className="space-y-3 mb-4">
    {project.youtubeLinks && project.youtubeLinks.map((link, index) => (
      <div key={link.id} className="flex items-center gap-3 group p-3 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex-1">
          <input
            type="url"
            value={link.url}
            onChange={(e) => updateYouTubeLink(link.id, e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
            disabled={isProcessing}
          />
          {link.url && (
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
              <span>Preview:</span>
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {link.url}
              </a>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => removeYouTubeLink(link.id)}
          className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-2"
          title="Xóa link YouTube"
          disabled={isProcessing}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ))}
    
    {(!project.youtubeLinks || project.youtubeLinks.length === 0) && (
      <div className="text-center py-6 text-gray-500 border-2 border-dashed rounded-lg">
        <p className="text-sm">Chưa có YouTube links nào</p>
        <p className="text-xs mt-1">Thêm link YouTube để hiển thị video trên trang dự án</p>
      </div>
    )}
  </div>
  
  {/* Nút thêm YouTube link */}
  <button
    type="button"
    onClick={addYouTubeLink}
    className={`flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
    disabled={isProcessing}
  >
    <Plus className="w-4 h-4" />
    Thêm YouTube Link
  </button>
  
  <p className="text-xs text-gray-500 mt-2">
    * Hỗ trợ YouTube link dạng: youtube.com/watch?v=... hoặc youtu.be/...
  </p>
</div>
          {/* Brochure */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Brochure (PDF hoặc ảnh)</h2>
            <div className="space-y-4">
              {brochurePreview.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {brochurePreview.map((brochure, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3 flex-1">
                        {brochure.type.startsWith('image/') ? (
                          <img 
                            src={brochure.url} 
                            alt="Brochure" 
                            className="w-16 h-16 object-cover rounded" 
                          />
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
                        disabled={isProcessing}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <button 
                type="button" 
                onClick={() => openFolderManager('brochure')}
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isProcessing}
              >
                <FileText className="w-10 h-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600 text-center px-4">
                  Chọn brochure từ thư viện Media<br />
                  <span className="text-xs">(PDF hoặc ảnh)</span>
                </span>
              </button>
              
              {brochurePreview.length > 0 && (
                <p className="text-sm text-gray-500 text-center">
                  Đã chọn {brochurePreview.length} brochure
                </p>
              )}
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end gap-4 py-6">
            <button 
              type="button" 
              onClick={handleCancel}
              className="px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isProcessing}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={loading || isProcessing}
              className="px-8 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 transition-colors font-medium flex items-center disabled:cursor-not-allowed"
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

      {/* FolderManager cho từng loại ảnh */}
      {folderManagerOpen.heroImage && (
        <FolderManager
          onClose={() => closeFolderManager('heroImage')}
          onSelect={(image) => handleSelectImagesFromFolder('heroImage', image)}
          singleSelect={true}
          title="Chọn ảnh chính (Hero)"
          description="Chọn 1 ảnh từ thư viện Media"
        />
      )}
      
      {folderManagerOpen.gallery && (
        <FolderManager
          onClose={() => closeFolderManager('gallery')}
          onSelect={(images) => handleSelectImagesFromFolder('gallery', images)}
          singleSelect={false}
          title="Chọn ảnh nội thất"
          description="Chọn nhiều ảnh từ thư viện Media"
        />
      )}
      
      {folderManagerOpen.constructionProgress && (
        <FolderManager
          onClose={() => closeFolderManager('constructionProgress')}
          onSelect={(images) => handleSelectImagesFromFolder('constructionProgress', images)}
          singleSelect={false}
          title="Chọn ảnh tiến độ thi công"
          description="Chọn nhiều ảnh từ thư viện Media"
        />
      )}
      
      {folderManagerOpen.designImages && (
        <FolderManager
          onClose={() => closeFolderManager('designImages')}
          onSelect={(images) => handleSelectImagesFromFolder('designImages', images)}
          singleSelect={false}
          title="Chọn ảnh thiết kế"
          description="Chọn nhiều ảnh từ thư viện Media"
        />
      )}
      
      {folderManagerOpen.brochure && (
        <FolderManager
          onClose={() => closeFolderManager('brochure')}
          onSelect={(images) => handleSelectImagesFromFolder('brochure', images)}
          singleSelect={false}
          title="Chọn brochure"
          description="Chọn PDF hoặc ảnh từ thư viện Media"
        />
      )}
    </div>
  );
}