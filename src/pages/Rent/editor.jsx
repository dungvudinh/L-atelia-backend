// components/RentEditor.jsx
'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import rentService from '../../services/rentService';
import FolderManager from '../../components/FolderManager';

const RentEditor = () => {
  const { rentId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!rentId;
  
  // State cho FolderManager
  const [folderManagerOpen, setFolderManagerOpen] = useState({
    featuredImage: false,
    gallery: false
  });

  // State cho rental data - CẬP NHẬT: featuredImage là object
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    priceUnit: 'per night',
    adultBeds: '',
    childBeds: '',
    bedrooms: '',
    bathrooms: '',
    description: '',
    descriptionShort: '',
    highlights: [
      {
        id: 1,
        title: 'Outdoor entertainment',
        description: 'The alfresco dining and outdoor seating are great for summer trips.',
        icon: 'calendar',
        isDefault: true
      },
      {
        id: 2,
        title: 'Room in a rental unit',
        description: 'Your own room in a home, plus access to shared spaces.',
        icon: 'home',
        isDefault: true
      },
      {
        id: 3,
        title: 'Free cancellation for 24 hours',
        description: 'Get a full refund if you change your mind.',
        icon: 'shield',
        isDefault: true
      }
    ],
    amenities: [],
    contactInfo: {
      phone: '',
      email: '',
      address: ''
    },
    gallery: [],
    featuredImage: null, // ✅ CHUYỂN THÀNH OBJECT thay vì string
    status: 'available',
    featured: false
  });

  const [loading, setLoading] = useState(false);
  const [newHighlight, setNewHighlight] = useState({ title: '', description: '' });
  const [editingHighlight, setEditingHighlight] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const amenitiesOptions = [
    'Balcony',
    'Air conditioning', 
    'Parking',
    'Fitness center',
    'Kitchen',
    'Family rooms',
    'Non-smoking rooms',
    'Wifi in all areas',
    'Beachfront',
  ];

  // Icon mapping
  const iconComponents = {
    calendar: (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    home: (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    shield: (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
    star: (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    )
  };

  // Load rental data khi edit
  useEffect(() => {
    if (rentId) loadRental(rentId);
  }, [rentId]);

  const loadRental = async (id) => {
    try {
      setIsProcessing(true);
      setLoading(true);
      const response = await rentService.getRentalById(id);
      const rental = response.data;

      if (!rental) {
        alert('Không tìm thấy rental');
        navigate('/rent');
        return;
      }

      // ✅ Xử lý featuredImage: có thể là string hoặc object
      let featuredImageData = null;
      if (rental.featuredImage) {
        if (typeof rental.featuredImage === 'string') {
          // Nếu là string (URL cũ), tìm trong gallery
          const foundInGallery = rental.gallery?.find(img => img.url === rental.featuredImage);
          if (foundInGallery) {
            featuredImageData = foundInGallery;
          } else {
            // Tạo object từ URL string
            featuredImageData = {
              id: `featured-${Date.now()}`,
              url: rental.featuredImage,
              key: rental.featuredImage.split('/').pop() || 'featured-image',
              filename: 'featured-image.jpg',
              size: 0,
              thumbnailUrl: null,
              thumbnailKey: null,
              thumbnailSize: 0,
              hasThumbnail: false,
              isFeatured: true,
              uploadedAt: new Date()
            };
          }
        } else if (typeof rental.featuredImage === 'object') {
          // Nếu đã là object
          featuredImageData = {
            ...rental.featuredImage,
            isFeatured: true
          };
        }
      }

      // Set rental data
      setFormData({
        title: rental.title || '',
        location: rental.location || '',
        price: rental.price || '',
        priceUnit: rental.priceUnit || 'per night',
        adultBeds: rental.adultBeds || '',
        childBeds: rental.childBeds || '',
        bedrooms: rental.bedrooms || '',
        bathrooms: rental.bathrooms || '',
        description: rental.description || '',
        descriptionShort: rental.descriptionShort || '',
        highlights: rental.highlights || [],
        amenities: rental.amenities || [],
        contactInfo: rental.contactInfo || { phone: '', email: '', address: '' },
        gallery: rental.gallery?.map(img => ({
          ...img,
          isFeatured: img.url === rental.featuredImage?.url || img.url === rental.featuredImage
        })) || [],
        featuredImage: featuredImageData, // ✅ Lưu object thay vì string
        status: rental.status || 'available',
        featured: rental.featured || false
      });
      
    } catch (err) {
      console.error('Error loading rental:', err);
      alert('Không tải được rental');
      navigate('/rent');
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  // Mở FolderManager
  const openFolderManager = (type) => {
    setFolderManagerOpen(prev => ({ ...prev, [type]: true }));
  };

  // Đóng FolderManager
  const closeFolderManager = (type) => {
    setFolderManagerOpen(prev => ({ ...prev, [type]: false }));
  };

  // ✅ Hàm tạo image object đầy đủ từ image data
  const createImageObject = (imageData, isFeatured = false) => {
    return {
      id: imageData._id || `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      url: imageData.url,
      key: imageData.key,
      filename: imageData.filename || imageData.originalName || `image-${Date.now()}`,
      size: imageData.size || 0,
      thumbnailUrl: imageData.thumbnailUrl || null,
      thumbnailKey: imageData.thumbnailKey || null,
      thumbnailSize: imageData.thumbnailSize || 0,
      hasThumbnail: imageData.hasThumbnail || false,
      isFeatured: isFeatured,
      uploadedAt: new Date()
    };
  };

  // Xử lý chọn ảnh từ FolderManager
  const handleSelectImagesFromFolder = (type, selectedImages) => {
    if (!selectedImages || selectedImages.length === 0) return;

    if (type === 'featuredImage') {
      // Chỉ chọn 1 ảnh cho featured
      const imageData = Array.isArray(selectedImages) ? selectedImages[0] : selectedImages;
      const featuredImageObject = createImageObject(imageData, true);
      
      setFormData(prev => ({ 
        ...prev, 
        featuredImage: featuredImageObject,
        // Update gallery để bỏ isFeatured khỏi các ảnh khác
        gallery: prev.gallery.map(img => ({ ...img, isFeatured: false }))
      }));
    } else if (type === 'gallery') {
      // Thêm vào gallery
      const imagesToAdd = Array.isArray(selectedImages) ? selectedImages : [selectedImages];
      const newGalleryImages = imagesToAdd.map(img => createImageObject(img, false));
      
      setFormData(prev => ({ 
        ...prev, 
        gallery: [...prev.gallery, ...newGalleryImages] 
      }));
    }

    closeFolderManager(type);
  };

  // Xóa ảnh
  const removeImage = (type, index = null) => {
    if (isProcessing) {
      alert('Đang xử lý, vui lòng chờ...');
      return;
    }

    setIsProcessing(true);

    try {
      if (type === 'featuredImage') {
        setFormData(prev => ({ ...prev, featuredImage: null }));
      } else if (type === 'gallery') {
        const newGallery = [...formData.gallery];
        newGallery.splice(index, 1);
        setFormData(prev => ({ ...prev, gallery: newGallery }));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Set featured image từ gallery
  const setAsFeatured = (index) => {
    if (isProcessing) {
      alert('Đang xử lý, vui lòng chờ...');
      return;
    }

    setIsProcessing(true);

    try {
      const selectedImage = formData.gallery[index];
      if (selectedImage) {
        // Tạo featured image object từ gallery image
        const featuredImageObject = {
          ...selectedImage,
          isFeatured: true
        };
        
        // Update gallery để bỏ isFeatured khỏi các ảnh khác
        const updatedGallery = formData.gallery.map((img, i) => ({
          ...img,
          isFeatured: i === index
        }));
        
        setFormData(prev => ({ 
          ...prev, 
          featuredImage: featuredImageObject,
          gallery: updatedGallery
        }));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ Hàm getImageUrl để hiển thị ảnh
  const getImageUrl = (imageData) => {
    if (!imageData) return null;
    
    // Nếu imageData là object có thumbnail, ưu tiên thumbnail
    if (typeof imageData === 'object' && imageData.thumbnailKey) {
      return 'https://cdn.latelia.com/latelia/' + imageData.thumbnailKey;
    }
    
    // Fallback về url gốc
    if (typeof imageData === 'object' && imageData.key) {
      return 'https://cdn.latelia.com/latelia/' + imageData.key;
    }
    
    // Nếu imageData là string (URL cũ)
    if (typeof imageData === 'string') {
      return imageData;
    }
    
    return null;
  };

  // Hàm submit
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
      if (!formData.title.trim() || !formData.location.trim() || !formData.price || 
          !formData.description.trim() || !formData.descriptionShort.trim()) {
        alert('Vui lòng nhập đầy đủ thông tin bắt buộc');
        setLoading(false);
        setIsProcessing(false);
        return;
      }
      
      // Kiểm tra featuredImage (không bắt buộc nhưng nên có)
      if (!formData.featuredImage && formData.gallery.length === 0) {
        const confirmNoImage = window.confirm('⚠️ Bạn chưa chọn ảnh nào. Bạn có chắc muốn tiếp tục?');
        if (!confirmNoImage) {
          setLoading(false);
          setIsProcessing(false);
          return;
        }
      }
      
      // ✅ Chuẩn bị rental data với featuredImage là object
      const rentalData = {
        title: formData.title,
        location: formData.location,
        price: parseFloat(formData.price),
        priceUnit: formData.priceUnit,
        adultBeds: formData.adultBeds ? parseInt(formData.adultBeds) : 0,
        childBeds: formData.childBeds ? parseInt(formData.childBeds) : 0,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : 0,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : 0,
        description: formData.description,
        descriptionShort: formData.descriptionShort,
        highlights: formData.highlights.filter(h => h.title.trim() && h.description.trim()),
        amenities: formData.amenities,
        gallery: formData.gallery,
        featuredImage: formData.featuredImage, // ✅ Gửi object thay vì string
        status: formData.status,
        featured: formData.featured
      };
      
      
      let result;
      if (isEditMode) {
        // Update rental với JSON thuần
        result = await rentService.updateRental(rentId, rentalData);
      } else {
        // Create new rental với JSON thuần
        result = await rentService.createRental(rentalData);
      }
      
      alert(isEditMode ? 'Cập nhật rental thành công' : 'Tạo rental thành công');
      navigate('/rent');
      
    } catch (err) {
      console.error('Submit error:', err);
      alert('Có lỗi xảy ra: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  // Các hàm xử lý khác giữ nguyên...
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // const handleContactChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData(prev => ({
  //     ...prev,
  //     contactInfo: {
  //       ...prev.contactInfo,
  //       [name]: value
  //     }
  //   }));
  // };

  const handleDescriptionChange = (e) => {
    setFormData(prev => ({
      ...prev,
      description: e.target.value
    }));
  };

  const handleShortDescriptionChange = (e) => {
    setFormData(prev => ({
      ...prev,
      descriptionShort: e.target.value
    }));
  };

  const startEditingHighlight = (highlight) => {
    setEditingHighlight(highlight);
    setNewHighlight({ title: highlight.title, description: highlight.description });
  };

  const cancelEditingHighlight = () => {
    setEditingHighlight(null);
    setNewHighlight({ title: '', description: '' });
  };

  const updateHighlight = () => {
    if (newHighlight.title.trim() && newHighlight.description.trim()) {
      setFormData(prev => ({
        ...prev,
        highlights: prev.highlights.map(h => 
          h.id === editingHighlight.id 
            ? { ...h, title: newHighlight.title.trim(), description: newHighlight.description.trim() }
            : h
        )
      }));
      cancelEditingHighlight();
    }
  };

  const addHighlight = () => {
    if (newHighlight.title.trim() && newHighlight.description.trim()) {
      const newHighlightItem = {
        id: Date.now(),
        title: newHighlight.title.trim(),
        description: newHighlight.description.trim(),
        icon: 'star',
        isDefault: false
      };

      setFormData(prev => ({
        ...prev,
        highlights: [...prev.highlights, newHighlightItem]
      }));
      setNewHighlight({ title: '', description: '' });
    }
  };

  const removeHighlight = (highlightId) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter(h => !(h.id === highlightId && h.isDefault))
    }));
  };

  const toggleAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const renderDescriptionPreview = () => {
    if (!formData.descriptionShort && !formData.description) {
      return <p className="text-gray-500 italic">No description available</p>;
    }

    if (!showFullDescription) {
      return (
        <div>
          <p className="text-gray-700 mb-3 whitespace-pre-line">{formData.descriptionShort}</p>
          {formData.description && (
            <button
              type="button"
              onClick={() => setShowFullDescription(true)}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
            >
              Show More
            </button>
          )}
        </div>
      );
    }

    return (
      <div>
        <p className="text-gray-700 mb-3 whitespace-pre-line">{formData.descriptionShort}</p>
        <p className="text-gray-700 mb-3 whitespace-pre-line">{formData.description}</p>
        <button
          type="button"
          onClick={() => setShowFullDescription(false)}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
        >
          Show Less
        </button>
      </div>
    );
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
          {isEditMode ? 'Chỉnh sửa Rental' : 'Tạo Rental Mới'}
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
                  value={formData.title} 
                  onChange={handleInputChange} 
                  placeholder="Nhập tiêu đề rental" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  required 
                  disabled={isProcessing}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa điểm *
                </label>
                <input 
                  type="text" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleInputChange} 
                  placeholder="Địa điểm rental" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  required 
                  disabled={isProcessing}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá *
                  </label>
                  <input 
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleInputChange} 
                    min="0"
                    step="0.01"
                    placeholder="Giá thuê" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    required 
                    disabled={isProcessing}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đơn vị giá
                  </label>
                  <select 
                    name="priceUnit" 
                    value={formData.priceUnit} 
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isProcessing}
                  >
                    <option value="per night">Per night</option>
                    <option value="for 2 nights">For 2 nights</option>
                    <option value="per week">Per week</option>
                    <option value="per month">Per month</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giường người lớn
                  </label>
                  <input 
                    type="number" 
                    name="adultBeds" 
                    value={formData.adultBeds} 
                    onChange={handleInputChange} 
                    min="0"
                    placeholder="2" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isProcessing}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giường trẻ em
                  </label>
                  <input 
                    type="number" 
                    name="childBeds" 
                    value={formData.childBeds} 
                    onChange={handleInputChange} 
                    min="0"
                    placeholder="1" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isProcessing}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phòng ngủ
                  </label>
                  <input 
                    type="number" 
                    name="bedrooms" 
                    value={formData.bedrooms} 
                    onChange={handleInputChange} 
                    min="0"
                    placeholder="1" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isProcessing}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phòng tắm
                  </label>
                  <input 
                    type="number" 
                    name="bathrooms" 
                    value={formData.bathrooms} 
                    onChange={handleInputChange} 
                    min="0"
                    placeholder="1" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ảnh đặc trưng */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Ảnh đặc trưng</h2>
            <p className="text-gray-600 text-sm mb-4">Ảnh này sẽ hiển thị làm thumbnail chính</p>
            
            <div className="relative">
              {formData.featuredImage ? (
                <div className="relative">
                  <img 
                    src={getImageUrl(formData.featuredImage)} 
                    alt="Featured" 
                    className="w-full h-80 object-cover rounded-lg" 
                  />
                  <button 
                    type="button" 
                    onClick={() => removeImage('featuredImage')} 
                    className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 z-20"
                    disabled={isProcessing}
                  >
                    <X className="w-5 h-5" />
                  </button>
                  {formData.featuredImage.thumbnailUrl && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                      Using Thumbnail
                    </div>
                  )}
                  {/* ✅ Hiển thị thông tin featured image */}
                  <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white text-xs p-2 rounded">
                    <p>Filename: {formData.featuredImage.filename}</p>
                    <p>Size: {(formData.featuredImage.size / 1024).toFixed(1)} KB</p>
                    {formData.featuredImage.hasThumbnail && (
                      <p>✓ Has thumbnail</p>
                    )}
                  </div>
                </div>
              ) : (
                <button 
                  type="button" 
                  onClick={() => openFolderManager('featuredImage')}
                  className={`flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isProcessing}
                >
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="mt-2 text-sm text-gray-600">Chọn ảnh từ thư viện Media</span>
                  <span className="text-xs text-gray-500 mt-1">(Lưu đầy đủ thông tin ảnh)</span>
                </button>
              )}
            </div>
          </div>

          {/* Gallery */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Bộ sưu tập ảnh</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {formData.gallery.map((image, i) => (
                <div key={image.id || i} className="relative group">
                  <img 
                    src={getImageUrl(image)} 
                    alt={image.filename || `Image ${i+1}`} 
                    className="w-full h-40 object-cover rounded-lg" 
                  />
                  {image.thumbnailUrl && (
                    <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      Thumb
                    </span>
                  )}
                  {image.isFeatured && (
                    <span className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      Featured
                    </span>
                  )}
                  <button 
                    type="button" 
                    onClick={() => removeImage('gallery', i)} 
                    className="absolute top-8 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-20"
                    disabled={isProcessing}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {!image.isFeatured && (
                    <button 
                      type="button" 
                      onClick={() => setAsFeatured(i)} 
                      className="absolute top-1 right-8 bg-blue-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600 z-20"
                      disabled={isProcessing}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  )}
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

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Mô tả</h2>
            
            {/* Short Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả ngắn *
                <span className="text-xs text-gray-500 ml-2">
                  Sẽ hiển thị ban đầu cho người dùng
                </span>
              </label>
              <textarea
                value={formData.descriptionShort}
                onChange={handleShortDescriptionChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mô tả ngắn sẽ hiển thị ban đầu..."
                disabled={isProcessing}
              />
            </div>

            {/* Full Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả đầy đủ *
                <span className="text-xs text-gray-500 ml-2">
                  Sẽ hiển thị khi người dùng click "Show More"
                </span>
              </label>
              <textarea
                value={formData.description}
                onChange={handleDescriptionChange}
                required
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mô tả chi tiết sẽ hiển thị khi click 'Show More'..."
                disabled={isProcessing}
              />
            </div>

            {/* Preview Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Cách hiển thị cho người dùng:</h4>
                <div className="bg-white p-4 rounded border">
                  {renderDescriptionPreview()}
                </div>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Highlights</h2>
            
            <div className="space-y-4 mb-6">
              {formData.highlights.map((highlight) => (
                <div key={highlight.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    {iconComponents[highlight.icon]}
                  </div>
                  <div className="flex-1">
                    {editingHighlight?.id === highlight.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={newHighlight.title}
                          onChange={(e) => setNewHighlight(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Highlight title"
                          disabled={isProcessing}
                        />
                        <textarea
                          value={newHighlight.description}
                          onChange={(e) => setNewHighlight(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Highlight description"
                          rows="2"
                          disabled={isProcessing}
                        />
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={updateHighlight}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                            disabled={isProcessing}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditingHighlight}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                            disabled={isProcessing}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{highlight.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{highlight.description}</p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              type="button"
                              onClick={() => startEditingHighlight(highlight)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Edit highlight"
                              disabled={isProcessing}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {!highlight.isDefault && (
                              <button
                                type="button"
                                onClick={() => removeHighlight(highlight.id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Remove highlight"
                                disabled={isProcessing}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                        {highlight.isDefault && (
                          <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Default
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Highlight */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Highlight</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newHighlight.title}
                  onChange={(e) => setNewHighlight(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter highlight title (e.g., Ocean View)"
                  disabled={isProcessing}
                />
                <textarea
                  value={newHighlight.description}
                  onChange={(e) => setNewHighlight(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter highlight description"
                  rows="2"
                  disabled={isProcessing}
                />
                <button
                  type="button"
                  onClick={addHighlight}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  disabled={isProcessing}
                >
                  Add New Highlight
                </button>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Amenities</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {amenitiesOptions.map(amenity => (
                <label key={amenity} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isProcessing}
                  />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Status & Featured */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isProcessing}
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Under Maintenance</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isProcessing}
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Mark as Featured Property
                </label>
              </div>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end gap-4 py-6">
            <button 
              type="button" 
              onClick={() => navigate('/rent')}
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
                isEditMode ? 'Cập nhật Rental' : 'Tạo Rental'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* FolderManager cho từng loại ảnh */}
      {folderManagerOpen.featuredImage && (
        <FolderManager
          onClose={() => closeFolderManager('featuredImage')}
          onSelect={(image) => handleSelectImagesFromFolder('featuredImage', image)}
          singleSelect={true}
          title="Chọn ảnh đặc trưng"
          description="Chọn 1 ảnh từ thư viện Media"
        />
      )}
      
      {folderManagerOpen.gallery && (
        <FolderManager
          onClose={() => closeFolderManager('gallery')}
          onSelect={(images) => handleSelectImagesFromFolder('gallery', images)}
          singleSelect={false}
          title="Chọn ảnh cho gallery"
          description="Chọn nhiều ảnh từ thư viện Media"
        />
      )}
    </div>
  );
};

export default RentEditor;