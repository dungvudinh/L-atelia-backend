'use client';

import { useEffect, useState } from 'react';
import { Upload, X, Plus, Trash2, FileText, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { imageUploadService } from '../../services/imageUploadService';
import { useDispatch } from 'react-redux';
import { setLoading as setLoadingSlice } from '../../redux/features/loadingSlice';
// Hàm tạo special sections mặc định
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
  const { projectId } = useParams();
  const isEditMode = !!projectId;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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

  // Preview states
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

  // State cho real-time upload
  const [uploadingImages, setUploadingImages] = useState({
    heroImage: { loading: false, progress: 0, error: null },
    gallery: {},
    constructionProgress: {},
    designImages: {},
    brochure: {}
  });

  // State lưu các image đã upload tạm thời
  const [tempUploadedImages, setTempUploadedImages] = useState({
    heroImage: null,
    gallery: [],
    constructionProgress: [],
    designImages: [],
    brochure: []
  });

  // State lưu tempId cho từng ảnh
  const [tempImageIds, setTempImageIds] = useState({
    heroImage: null,
    gallery: [],
    constructionProgress: [],
    designImages: [],
    brochure: []
  });

  // State để track ảnh đã load xong
  const [loadedImages, setLoadedImages] = useState({
    heroImage: false,
    gallery: {},
    constructionProgress: {},
    designImages: {},
    brochure: {}
  });

  useEffect(() => {
    if (projectId) loadProject(projectId);
  }, [projectId]);

  // Debounced auto-save
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
      
      setOriginalImages({
        heroImage: p.heroImage,
        gallery: p.gallery || [],
        constructionProgress: p.constructionProgress || [],
        designImages: p.designImages || [],
        brochure: p.brochure || []
      });

      const extractUrl = (imageData) => {
        if (!imageData) return '';
        if (typeof imageData === 'object' && imageData.url) {
          return imageData.url;
        }
        return imageData;
      };

      const extractImageData = (imageData) => {
        if (!imageData) return '';
        return imageData;
      };

      // Set basic project data
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

      // Set previews
      setGalleryPreview(p.gallery ? p.gallery.map(extractUrl) : []);
      setProgressPreview(p.constructionProgress ? p.constructionProgress.map(extractUrl) : []);
      setDesignPreview(p.designImages ? p.designImages.map(extractUrl) : []);
      
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
      
      // Reset các state upload
      setFileObjects({
        heroImage: null,
        gallery: [],
        constructionProgress: [],
        designImages: [],
        brochure: []
      });
      
      setTempUploadedImages({
        heroImage: null,
        gallery: [],
        constructionProgress: [],
        designImages: [],
        brochure: []
      });
      
      setTempImageIds({
        heroImage: null,
        gallery: [],
        constructionProgress: [],
        designImages: [],
        brochure: []
      });
      
      setLoadedImages({
        heroImage: true,
        gallery: {},
        constructionProgress: {},
        designImages: {},
        brochure: {}
      });
      
    } catch (err) {
      console.error('Error loading project:', err);
      alert('Không tải được dự án');
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
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

  // Generate temp ID
  const generateTempId = (prefix) => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Hàm reset loading state sau khi upload thành công
  const resetUploadingState = (type, tempId = null) => {
    if (tempId) {
      setUploadingImages(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          [tempId]: { loading: false, progress: 100, error: null }
        }
      }));
    } else {
      setUploadingImages(prev => ({
        ...prev,
        [type]: { loading: false, progress: 100, error: null }
      }));
    }
  };

  // Hàm xử lý upload ảnh ngay khi chọn
  const handleImageUploadRealtime = async (e, type) => {
    if (isProcessing) {
      alert('Đang xử lý, vui lòng chờ...');
      e.target.value = '';
      return;
    }

    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsProcessing(true);

    if (type === 'hero') {
      const file = files[0];
      const tempId = generateTempId('hero');
      
      // Hiển thị preview ngay với blob URL
      const url = URL.createObjectURL(file);
      setProject(p => ({ ...p, heroImage: url }));
      
      // Set loading state
      setUploadingImages(prev => ({
        ...prev,
        heroImage: { loading: true, progress: 0, error: null }
      }));
      
      // Reset loaded state
      setLoadedImages(prev => ({ ...prev, heroImage: false }));
      
      try {
        // Upload ngay lên B2 và lưu tạm vào DB
        dispatch(setLoadingSlice(true));
        const uploadResult = await imageUploadService.uploadTempImage(
          file, 
          'heroImage', 
          tempId,
          projectId || null,
          (progress) => {
            setUploadingImages(prev => ({
              ...prev,
              heroImage: { ...prev.heroImage, progress }
            }));
          }
        );
        
        // Lưu thông tin đã upload
        setTempUploadedImages(prev => ({
          ...prev,
          heroImage: uploadResult.data
        }));
        
        setTempImageIds(prev => ({
          ...prev,
          heroImage: tempId
        }));
        
        // Update preview với URL thật từ B2
        setProject(p => ({ 
          ...p, 
          heroImage: uploadResult.data.url 
        }));
        
        // Reset loading state ngay sau khi cập nhật URL
        setTimeout(() => {
          resetUploadingState('heroImage');
        }, 100);
        
        // Revoke blob URL để tránh memory leak
        URL.revokeObjectURL(url);
        
        setIsDirty(true);
        dispatch(setLoadingSlice(false));
      } catch (error) {
        console.error('Error uploading hero image:', error);
        setUploadingImages(prev => ({
          ...prev,
          heroImage: { loading: false, progress: 0, error: 'Upload failed' }
        }));
        
        // Rollback: xóa preview
        setTimeout(() => {
          setProject(p => ({ ...p, heroImage: '' }));
        }, 2000);
        
        alert('Lỗi upload ảnh. Vui lòng thử lại.');
      } finally {
        setIsProcessing(false);
      }
    }
    else if (type === 'gallery') {
      // Xử lý multiple upload
      const uploadPromises = files.map(async (file, fileIndex) => {
        const tempId = generateTempId('gallery');
        
        // Hiển thị preview ngay với blob URL
        const url = URL.createObjectURL(file);
        const tempPreviewIndex = galleryPreview.length;
        
        // Thêm vào state ngay lập tức để hiển thị
        setProject(p => ({ ...p, gallery: [...p.gallery, url] }));
        setGalleryPreview(p => [...p, url]);
        
        // Set loading state cho item này
        setUploadingImages(prev => ({
          ...prev,
          gallery: {
            ...prev.gallery,
            [tempId]: { loading: true, progress: 0, error: null }
          }
        }));
        
        // Reset loaded state
        setLoadedImages(prev => ({
          ...prev,
          gallery: { ...prev.gallery, [tempId]: false }
        }));
        
        try {
          // Upload ngay lên B2
          dispatch(setLoadingSlice(true))
          const uploadResult = await imageUploadService.uploadTempImage(
            file, 
            'gallery', 
            tempId,
            projectId || null,
            (progress) => {
              setUploadingImages(prev => ({
                ...prev,
                gallery: {
                  ...prev.gallery,
                  [tempId]: { ...prev.gallery[tempId], progress }
                }
              }));
            }
          );
          
          // Lưu thông tin đã upload
          setTempUploadedImages(prev => ({
            ...prev,
            gallery: [...prev.gallery, uploadResult.data]
          }));
          
          setTempImageIds(prev => ({
            ...prev,
            gallery: [...prev.gallery, tempId]
          }));
          
          // Update preview với URL thật từ B2
          setGalleryPreview(prev => {
            const newArray = [...prev];
            newArray[tempPreviewIndex] = uploadResult.data.url;
            return newArray;
          });
          
          setProject(p => {
            const newGallery = [...p.gallery];
            newGallery[tempPreviewIndex] = uploadResult.data.url;
            return { ...p, gallery: newGallery };
          });
          
          // Reset loading state sau khi cập nhật URL
          setTimeout(() => {
            resetUploadingState('gallery', tempId);
          }, 100);
          
          // Revoke blob URL
          URL.revokeObjectURL(url);
          
          setIsDirty(true);
          dispatch(setLoadingSlice(false))
        } catch (error) {
          console.error('Error uploading gallery image:', error);
          setUploadingImages(prev => ({
            ...prev,
            gallery: {
              ...prev.gallery,
              [tempId]: { loading: false, progress: 0, error: 'Upload failed' }
            }
          }));
          
          // Rollback: xóa ảnh bị lỗi sau 2 giây
          setTimeout(() => {
            removeImage('gallery', tempPreviewIndex);
          }, 2000);
        }
      });

      try {
        await Promise.all(uploadPromises);
      } catch (error) {
        console.error('Error in gallery upload:', error);
      } finally {
        setIsProcessing(false);
      }
    }
    else if (type === 'progress') {
      // Tương tự như gallery
      const uploadPromises = files.map(async (file, fileIndex) => {
        const tempId = generateTempId('progress');
        const url = URL.createObjectURL(file);
        const tempPreviewIndex = progressPreview.length;
        
        setProject(p => ({ ...p, constructionProgress: [...p.constructionProgress, url] }));
        setProgressPreview(p => [...p, url]);
        
        setUploadingImages(prev => ({
          ...prev,
          constructionProgress: {
            ...prev.constructionProgress,
            [tempId]: { loading: true, progress: 0, error: null }
          }
        }));
        
        setLoadedImages(prev => ({
          ...prev,
          constructionProgress: { ...prev.constructionProgress, [tempId]: false }
        }));
        
        try {
          dispatch(setLoadingSlice(true))
          const uploadResult = await imageUploadService.uploadTempImage(
            file, 
            'constructionProgress', 
            tempId,
            projectId || null,
            (progress) => {
              setUploadingImages(prev => ({
                ...prev,
                constructionProgress: {
                  ...prev.constructionProgress,
                  [tempId]: { ...prev.constructionProgress[tempId], progress }
                }
              }));
            }
          );
          
          setTempUploadedImages(prev => ({
            ...prev,
            constructionProgress: [...prev.constructionProgress, uploadResult.data]
          }));
          
          setTempImageIds(prev => ({
            ...prev,
            constructionProgress: [...prev.constructionProgress, tempId]
          }));
          
          setProgressPreview(prev => {
            const newArray = [...prev];
            newArray[tempPreviewIndex] = uploadResult.data.url;
            return newArray;
          });
          
          setProject(p => {
            const newArray = [...p.constructionProgress];
            newArray[tempPreviewIndex] = uploadResult.data.url;
            return { ...p, constructionProgress: newArray };
          });
          
          // Reset loading state
          setTimeout(() => {
            resetUploadingState('constructionProgress', tempId);
          }, 100);
          
          URL.revokeObjectURL(url);
          setIsDirty(true);
          dispatch(setLoadingSlice(false))
        } catch (error) {
          console.error('Error uploading progress image:', error);
          setUploadingImages(prev => ({
            ...prev,
            constructionProgress: {
              ...prev.constructionProgress,
              [tempId]: { loading: false, progress: 0, error: 'Upload failed' }
            }
          }));
          
          setTimeout(() => {
            removeImage('progress', tempPreviewIndex);
          }, 2000);
        }
      });

      try {
        await Promise.all(uploadPromises);
      } catch (error) {
        console.error('Error in progress upload:', error);
      } finally {
        setIsProcessing(false);
      }
    }
    else if (type === 'design') {
      // Tương tự như gallery
      const uploadPromises = files.map(async (file, fileIndex) => {
        const tempId = generateTempId('design');
        const url = URL.createObjectURL(file);
        const tempPreviewIndex = designPreview.length;
        
        setProject(p => ({ ...p, designImages: [...p.designImages, url] }));
        setDesignPreview(p => [...p, url]);
        
        setUploadingImages(prev => ({
          ...prev,
          designImages: {
            ...prev.designImages,
            [tempId]: { loading: true, progress: 0, error: null }
          }
        }));
        
        setLoadedImages(prev => ({
          ...prev,
          designImages: { ...prev.designImages, [tempId]: false }
        }));
        
        try {
          dispatch(setLoadingSlice(true))
          const uploadResult = await imageUploadService.uploadTempImage(
            file, 
            'designImages', 
            tempId,
            projectId || null,
            (progress) => {
              setUploadingImages(prev => ({
                ...prev,
                designImages: {
                  ...prev.designImages,
                  [tempId]: { ...prev.designImages[tempId], progress }
                }
              }));
            }
          );
          
          setTempUploadedImages(prev => ({
            ...prev,
            designImages: [...prev.designImages, uploadResult.data]
          }));
          
          setTempImageIds(prev => ({
            ...prev,
            designImages: [...prev.designImages, tempId]
          }));
          
          setDesignPreview(prev => {
            const newArray = [...prev];
            newArray[tempPreviewIndex] = uploadResult.data.url;
            return newArray;
          });
          
          setProject(p => {
            const newArray = [...p.designImages];
            newArray[tempPreviewIndex] = uploadResult.data.url;
            return { ...p, designImages: newArray };
          });
          
          // Reset loading state
          setTimeout(() => {
            resetUploadingState('designImages', tempId);
          }, 100);
          
          URL.revokeObjectURL(url);
          setIsDirty(true);
          dispatch(setLoadingSlice(false))
        } catch (error) {
          console.error('Error uploading design image:', error);
          setUploadingImages(prev => ({
            ...prev,
            designImages: {
              ...prev.designImages,
              [tempId]: { loading: false, progress: 0, error: 'Upload failed' }
            }
          }));
          
          setTimeout(() => {
            removeImage('design', tempPreviewIndex);
          }, 2000);
        }
      });

      try {
        await Promise.all(uploadPromises);
      } catch (error) {
        console.error('Error in design upload:', error);
      } finally {
        setIsProcessing(false);
      }
    }
    else if (type === 'brochure') {
      const uploadPromises = files.map(async (file, fileIndex) => {
        const tempId = generateTempId('brochure');
        const url = URL.createObjectURL(file);
        const tempPreviewIndex = brochurePreview.length;
        
        const brochureItem = {
          url,
          name: file.name,
          type: file.type,
          tempId
        };
        
        setProject(p => ({ ...p, brochure: [...p.brochure, url] }));
        setBrochurePreview(p => [...p, brochureItem]);
        
        setUploadingImages(prev => ({
          ...prev,
          brochure: {
            ...prev.brochure,
            [tempId]: { loading: true, progress: 0, error: null }
          }
        }));
        
        setLoadedImages(prev => ({
          ...prev,
          brochure: { ...prev.brochure, [tempId]: false }
        }));
        
        try {
          dispatch(setLoadingSlice(true))
          const uploadResult = await imageUploadService.uploadTempImage(
            file, 
            'brochure', 
            tempId,
            projectId || null,
            (progress) => {
              setUploadingImages(prev => ({
                ...prev,
                brochure: {
                  ...prev.brochure,
                  [tempId]: { ...prev.brochure[tempId], progress }
                }
              }));
            }
          );
          
          setTempUploadedImages(prev => ({
            ...prev,
            brochure: [...prev.brochure, uploadResult.data]
          }));
          
          setTempImageIds(prev => ({
            ...prev,
            brochure: [...prev.brochure, tempId]
          }));
          
          // Update preview với URL thật
          setBrochurePreview(prev => {
            const newArray = [...prev];
            newArray[tempPreviewIndex] = {
              ...newArray[tempPreviewIndex],
              url: uploadResult.data.url
            };
            return newArray;
          });
          
          setProject(p => {
            const newArray = [...p.brochure];
            newArray[tempPreviewIndex] = uploadResult.data.url;
            return { ...p, brochure: newArray };
          });
          
          // Reset loading state
          setTimeout(() => {
            resetUploadingState('brochure', tempId);
          }, 100);
          
          URL.revokeObjectURL(url);
          setIsDirty(true);
          dispatch(setLoadingSlice(false))
        } catch (error) {
          console.error('Error uploading brochure:', error);
          setUploadingImages(prev => ({
            ...prev,
            brochure: {
              ...prev.brochure,
              [tempId]: { loading: false, progress: 0, error: 'Upload failed' }
            }
          }));
          
          setTimeout(() => {
            removeImage('brochure', tempPreviewIndex);
          }, 2000);
        }
      });

      try {
        await Promise.all(uploadPromises);
      } catch (error) {
        console.error('Error in brochure upload:', error);
      } finally {
        setIsProcessing(false);
      }
    }

    e.target.value = '';
  };

  // Remove image với xử lý temp images
  const removeImage = async (type, index = null) => {
    if (isProcessing) {
      alert('Đang xử lý, vui lòng chờ...');
      return;
    }

    setIsProcessing(true);

    try {
      if (type === 'hero') {
        // Nếu có temp image, thêm vào danh sách sẽ xóa
        if (tempImageIds.heroImage) {
          try {
            dispatch(setLoadingSlice(true));
            await imageUploadService.deleteTempImages([tempImageIds.heroImage]);
            dispatch(setLoadingSlice(false));
          } catch (error) {
            console.error('Error deleting hero image:', error);
          }
        }
        
        setProject(p => ({ ...p, heroImage: '' }));
        setTempUploadedImages(prev => ({ ...prev, heroImage: null }));
        setTempImageIds(prev => ({ ...prev, heroImage: null }));
        setUploadingImages(prev => ({ ...prev, heroImage: { loading: false, progress: 0, error: null } }));
        setLoadedImages(prev => ({ ...prev, heroImage: false }));
      } else {
        const typeMap = {
          gallery: ['gallery', galleryPreview, 'gallery'],
          progress: ['constructionProgress', progressPreview, 'constructionProgress'],
          design: ['designImages', designPreview, 'designImages'],
          brochure: ['brochure', brochurePreview, 'brochure']
        };

        const [projectKey, previewState, fileKey] = typeMap[type];
        
        // Lấy tempId của ảnh sẽ xóa
        const tempIdToDelete = tempImageIds[fileKey][index];
        if (tempIdToDelete) {
          try {
            dispatch(setLoadingSlice(true));
            await imageUploadService.deleteTempImages([tempIdToDelete]);
            console.log('Đã xoá ảnh tạm:', tempIdToDelete);
            dispatch(setLoadingSlice(false));
          } catch (error) {
            console.error('Lỗi khi xoá ảnh từ B2:', error);
          }
        }
        
        // Tạo bản sao mới của các array
        const newProjectArray = [...project[projectKey]];
        const newPreview = [...previewState];
        const newTempImages = [...tempUploadedImages[fileKey]];
        const newTempIds = [...tempImageIds[fileKey]];
        const newUploadingStates = { ...uploadingImages[fileKey] };
        const newLoadedStates = { ...loadedImages[fileKey] };
        
        // Lấy item bị xóa để revoke blob URL
        const removedItem = newProjectArray[index];
        if (removedItem && typeof removedItem === 'string' && removedItem.startsWith('blob:')) {
          URL.revokeObjectURL(removedItem);
        }
        
        // Xóa phần tử tại index
        newProjectArray.splice(index, 1);
        newPreview.splice(index, 1);
        newTempImages.splice(index, 1);
        newTempIds.splice(index, 1);
        
        // Xóa uploading state nếu có
        if (tempIdToDelete) {
          delete newUploadingStates[tempIdToDelete];
          delete newLoadedStates[tempIdToDelete];
        }
        
        // Cập nhật state
        setProject(p => ({ ...p, [projectKey]: newProjectArray }));
        setTempUploadedImages(prev => ({ ...prev, [fileKey]: newTempImages }));
        setTempImageIds(prev => ({ ...prev, [fileKey]: newTempIds }));
        setUploadingImages(prev => ({ ...prev, [fileKey]: newUploadingStates }));
        setLoadedImages(prev => ({ ...prev, [fileKey]: newLoadedStates }));
        
        // Cập nhật preview state tương ứng
        if (type === 'gallery') setGalleryPreview(newPreview);
        if (type === 'progress') setProgressPreview(newPreview);
        if (type === 'design') setDesignPreview(newPreview);
        if (type === 'brochure') setBrochurePreview(newPreview);
      }
      
      setIsDirty(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý hủy project
  const handleCancel = async () => {
    if (isProcessing) {
      alert('Đang xử lý, vui lòng chờ...');
      return;
    }

    // Lấy tất cả tempIds từ tất cả các loại ảnh chưa được xóa
    const allRemainingTempIds = [
      tempImageIds.heroImage,
      ...tempImageIds.gallery,
      ...tempImageIds.constructionProgress,
      ...tempImageIds.designImages,
      ...tempImageIds.brochure
    ].filter(id => id !== null);

    const hasUnsavedChanges = isDirty || allRemainingTempIds.length > 0;

    if (hasUnsavedChanges) {
      const message = `Dự án chưa được lưu. Bạn có chắc muốn hủy?${
        allRemainingTempIds.length > 0 
          ? `\n\nCó ${allRemainingTempIds.length} ảnh đã upload sẽ bị xóa.` 
          : ''
      }`;
      
      const userConfirmed = window.confirm(message);
      if (userConfirmed) {
        setIsProcessing(true);
        try {
          // Xóa tất cả ảnh tạm từ B2 và database
          if (allRemainingTempIds.length > 0) {
            dispatch(setLoadingSlice(true));
            await imageUploadService.deleteTempImages(allRemainingTempIds);
            console.log('Đã xóa ảnh tạm thời khi hủy');
            dispatch(setLoadingSlice(false))
          }
        } catch (error) {
          console.error('Lỗi khi xóa ảnh tạm:', error);
        } finally {
          setIsProcessing(false);
        }
        
        // Điều hướng về trang projects
        navigate('/projects');
      }
    } else {
      navigate('/projects');
    }
  };

  // THÊM CÁC HÀM XỬ LÝ TỪ CODE CŨ CHO "THÔNG TIN CHI TIẾT"

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
      id: `highlight-${Date.now()}`,
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
        highlight.id === id ? { ...highlight, [field]: value } : highlight
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
    setIsDirty(true);
  };

  const updateFeatureSection = (highlightId, sectionId, field, value) => {
    setProject(prev => ({
      ...prev,
      propertyHighlights: prev.propertyHighlights.map(highlight =>
        highlight.id === highlightId
          ? {
              ...highlight,
              featureSections: highlight.featureSections.map(section =>
                section.id === sectionId ? { ...section, [field]: value } : section
              )
            }
          : highlight
      )
    }));
    setIsDirty(true);
  };

  const removeFeatureSection = (highlightId, sectionId) => {
    setProject(prev => ({
      ...prev,
      propertyHighlights: prev.propertyHighlights.map(highlight =>
        highlight.id === highlightId
          ? {
              ...highlight,
              featureSections: highlight.featureSections.filter(section => section.id !== sectionId)
            }
          : highlight
      )
    }));
    setIsDirty(true);
  };

  // Special Sections Functions
  const updateSpecialSection = (id, field, value) => {
    setProject(prev => ({
      ...prev,
      specialSections: prev.specialSections.map(section =>
        section.id === id ? { ...section, [field]: value } : section
      )
    }));
    setIsDirty(true);
  };

  const toggleSpecialSectionExpandable = (id) => {
    setProject(prev => ({
      ...prev,
      specialSections: prev.specialSections.map(section =>
        section.id === id ? { ...section, isExpandable: !section.isExpandable } : section
      )
    }));
    setIsDirty(true);
  };

  // Chuẩn bị data để confirm images
  const prepareTempImageData = () => {
    return {
      heroImage: tempUploadedImages.heroImage ? {
        tempId: tempImageIds.heroImage,
        ...tempUploadedImages.heroImage
      } : null,
      gallery: tempUploadedImages.gallery.map((img, index) => ({
        tempId: tempImageIds.gallery[index],
        ...img
      })),
      constructionProgress: tempUploadedImages.constructionProgress.map((img, index) => ({
        tempId: tempImageIds.constructionProgress[index],
        ...img
      })),
      designImages: tempUploadedImages.designImages.map((img, index) => ({
        tempId: tempImageIds.designImages[index],
        ...img
      })),
      brochure: tempUploadedImages.brochure.map((img, index) => ({
        tempId: tempImageIds.brochure[index],
        ...img
      }))
    };
  };

  // Hàm submit với confirm images
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
      
      // Chuẩn bị project data
      const projectData = {
        title: project.title,
        description: project.description,
        status: project.status,
        location: project.location,
        propertyFeatures: project.propertyFeatures,
        specifications: project.specifications,
        propertyHighlights: project.propertyHighlights,
        specialSections: project.specialSections,
        // Images sẽ được thêm qua confirm API
        heroImage: tempUploadedImages.heroImage ? tempUploadedImages.heroImage.url : project.heroImage,
        gallery: tempUploadedImages.gallery.map(img => img.url),
        constructionProgress: tempUploadedImages.constructionProgress.map(img => img.url),
        designImages: tempUploadedImages.designImages.map(img => img.url),
        brochure: tempUploadedImages.brochure.map(img => img.url)
      };
      console.log(projectData)
      // Chuẩn bị temp image data
      const tempImageData = prepareTempImageData();
      const hasTempImages = Object.values(tempImageData).some(
        item => item && (Array.isArray(item) ? item.length > 0 : item.tempId)
      );
      
      let result;
      if (isEditMode) {
        // Update project
        if (hasTempImages) {
          result = await projectService.updateProjectWithConfirm(
            projectId,
            projectData,
            tempImageData
          );
        } else {
          result = await projectService.updateProject(projectId, projectData);
        }
      } else {
        // Create new project
        if (hasTempImages) {
          result = await projectService.createProjectWithConfirm(
            projectData,
            tempImageData
          );
        } else {
          result = await projectService.createProject(projectData);
        }
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

  // Hàm getImageUrl
  const getImageUrl = (imageData) => {
    if (!imageData) return null;
    
    if (typeof imageData === 'object' && imageData.url) {
      const url = imageData.url;
      if (url.startsWith('blob:') || url.startsWith('data:')) {
        return url;
      }
      const normalizedPath = url.replace(/\\/g, '/');
      return normalizedPath;
    }
    
    if (typeof imageData === 'string') {
      if (imageData.startsWith('blob:') || imageData.startsWith('data:')) {
        return imageData;
      }
      const normalizedPath = imageData.replace(/\\/g, '/');
      return normalizedPath;
    }
    
    return null;
  };

  // Component hiển thị loading/error cho từng ảnh
  const renderUploadStatus = (type, tempId = null, imageUrl = null) => {
    const status = tempId 
      ? uploadingImages[type]?.[tempId]
      : uploadingImages[type];
    
    if (!status) return null;
    
    // Nếu loading đã hoàn thành (progress 100) hoặc có lỗi
    if (status.loading && status.progress === 100) {
      // Nếu là URL từ B2 (không phải blob), ẩn loading
      if (imageUrl && !imageUrl.startsWith('blob:')) {
        return null;
      }
    }
    
    if (status.loading) {
      return (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-lg z-10">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-white animate-spin mx-auto" />
            <p className="text-white text-sm mt-2">
              {status.progress < 100 ? `${status.progress}%` : 'Đang xử lý...'}
            </p>
          </div>
        </div>
      );
    }
    
    if (status.error) {
      return (
        <div className="absolute inset-0 bg-red-500 bg-opacity-90 flex items-center justify-center rounded-lg z-10">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-white mx-auto" />
            <p className="text-white text-sm mt-2">{status.error}</p>
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Handler khi ảnh load xong
  const handleImageLoad = (type, tempId = null) => {
    if (tempId) {
      // Update loaded state
      setLoadedImages(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          [tempId]: true
        }
      }));
      
      // Clear loading state nếu còn
      if (uploadingImages[type]?.[tempId]?.loading) {
        setUploadingImages(prev => ({
          ...prev,
          [type]: {
            ...prev[type],
            [tempId]: { loading: false, progress: 100, error: null }
          }
        }));
      }
    } else {
      setLoadedImages(prev => ({ ...prev, [type]: true }));
      if (uploadingImages[type]?.loading) {
        setUploadingImages(prev => ({
          ...prev,
          [type]: { loading: false, progress: 100, error: null }
        }));
      }
    }
  };

  // Handler khi ảnh load lỗi
  const handleImageError = (type, tempId = null) => {
    if (tempId) {
      setUploadingImages(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          [tempId]: { loading: false, progress: 0, error: 'Failed to load image' }
        }
      }));
    } else {
      setUploadingImages(prev => ({
        ...prev,
        [type]: { loading: false, progress: 0, error: 'Failed to load image' }
      }));
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
                    Trạng thái
                  </label>
                  <select 
                    name="status" 
                    value={project.status} 
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isProcessing}
                  >
                    <option value="draft">Bản nháp</option>
                    <option value="published">Đã xuất bản</option>
                    <option value="archived">Đã lưu trữ</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Ảnh chính với upload status */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Ảnh chính (Hero)</h2>
            <div className="relative">
              {project.heroImage ? (
                <div className="relative">
                  <img 
                    src={getImageUrl(project.heroImage)} 
                    alt="Hero" 
                    className="w-full h-80 object-cover rounded-lg" 
                    onLoad={() => handleImageLoad('heroImage')}
                    onError={() => handleImageError('heroImage')}
                  />
                  {renderUploadStatus('heroImage', null, project.heroImage)}
                  <button 
                    type="button" 
                    onClick={() => removeImage('hero')} 
                    className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 z-20"
                    disabled={isProcessing}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center h-80 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {uploadingImages.heroImage.loading ? (
                    <div className="text-center">
                      <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
                      <p className="mt-2 text-sm text-gray-600">Đang upload... {uploadingImages.heroImage.progress}%</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-16 h-16 text-gray-400" />
                      <span className="mt-2 text-sm text-gray-600">Tải lên ảnh chính</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={e => handleImageUploadRealtime(e, 'hero')}
                    disabled={isProcessing || uploadingImages.heroImage.loading}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Bộ sưu tập nội thất với upload status */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Bộ sưu tập ảnh nội thất</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryPreview.map((img, i) => {
                const tempId = tempImageIds.gallery[i];
                return (
                  <div key={i} className="relative group">
                    <img 
                      src={getImageUrl(img)} 
                      alt="" 
                      className="w-full h-40 object-cover rounded-lg" 
                      onLoad={() => handleImageLoad('gallery', tempId)}
                      onError={() => handleImageError('gallery', tempId)}
                    />
                    {renderUploadStatus('gallery', tempId, img)}
                    <button 
                      type="button" 
                      onClick={() => removeImage('gallery', i)} 
                      className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-20"
                      disabled={isProcessing}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
              
              <label className={`flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Plus className="w-8 h-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-600">Thêm ảnh</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  multiple
                  onChange={e => handleImageUploadRealtime(e, 'gallery')}
                  disabled={isProcessing}
                />
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
              {progressPreview.map((img, i) => {
                const tempId = tempImageIds.constructionProgress[i];
                return (
                  <div key={i} className="relative group">
                    <img 
                      src={getImageUrl(img)} 
                      alt="" 
                      className="w-full h-40 object-cover rounded-lg" 
                      onLoad={() => handleImageLoad('constructionProgress', tempId)}
                      onError={() => handleImageError('constructionProgress', tempId)}
                    />
                    {renderUploadStatus('constructionProgress', tempId, img)}
                    <button 
                      type="button" 
                      onClick={() => removeImage('progress', i)} 
                      className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-20"
                      disabled={isProcessing}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
              <label className={`flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Plus className="w-8 h-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-600">Thêm ảnh</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  multiple
                  onChange={e => handleImageUploadRealtime(e, 'progress')}
                  disabled={isProcessing}
                />
              </label>
            </div>
          </div>

          {/* Hình ảnh thiết kế */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Hình ảnh thiết kế (3D/Concept)</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {designPreview.map((img, i) => {
                const tempId = tempImageIds.designImages[i];
                return (
                  <div key={i} className="relative group">
                    <img 
                      src={getImageUrl(img)} 
                      alt="" 
                      className="w-full h-40 object-cover rounded-lg" 
                      onLoad={() => handleImageLoad('designImages', tempId)}
                      onError={() => handleImageError('designImages', tempId)}
                    />
                    {renderUploadStatus('designImages', tempId, img)}
                    <button 
                      type="button" 
                      onClick={() => removeImage('design', i)} 
                      className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-20"
                      disabled={isProcessing}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
              <label className={`flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Plus className="w-8 h-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-600">Thêm ảnh</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  multiple
                  onChange={e => handleImageUploadRealtime(e, 'design')}
                  disabled={isProcessing}
                />
              </label>
            </div>
          </div>

          {/* Brochure */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Brochure (PDF hoặc ảnh) - Multiple</h2>
            <div className="space-y-4">
              {brochurePreview.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {brochurePreview.map((brochure, index) => {
                    const tempId = tempImageIds.brochure[index];
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3 flex-1">
                          {brochure.type.startsWith('image/') ? (
                            <img 
                              src={getImageUrl(brochure.url)} 
                              alt="Brochure" 
                              className="w-16 h-16 object-cover rounded" 
                              onLoad={() => handleImageLoad('brochure', tempId)}
                              onError={() => handleImageError('brochure', tempId)}
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
                    );
                  })}
                </div>
              )}
              
              <label className={`flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
                  onChange={e => handleImageUploadRealtime(e, 'brochure')} 
                  disabled={isProcessing}
                />
              </label>
              
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
    </div>
  );
}