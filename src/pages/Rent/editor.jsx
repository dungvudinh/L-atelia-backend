// components/RentEditor.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import rentService from '../../services/rentService';

const RentEditor = () => {
  const { rentId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(rentId);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    priceUnit: 'per night',
    beds: '',
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
    featuredImage: '',
    status: 'available',
    featured: false
  });

  const [loading, setLoading] = useState(false);
  const [newHighlight, setNewHighlight] = useState({ title: '', description: '' });
  const [editingHighlight, setEditingHighlight] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [localImages, setLocalImages] = useState([]); // Lưu ảnh local khi create

  const amenitiesOptions = [
    'Safety room',
    'Safety unit location', 
    'Safety user presence',
    'District setting',
    'Air conditioning',
    'Parking',
    'Restaurants',
    'Balcony',
    'Swimming pool',
    'WiFi',
    'Kitchen',
    'TV'
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

  // Fetch rental data when editing
  useEffect(() => {
    const fetchRentalData = async () => {
      if (isEditing) {
        try {
          setLoading(true);
          const response = await rentService.getRentalById(rentId);
          if (response.success) {
            setFormData(response.data);
          } else {
            console.error('Failed to fetch rental data:', response.message);
            alert('Failed to load rental data');
            navigate('/rent');
          }
        } catch (error) {
          console.error('Error fetching rental:', error);
          alert('Error loading rental data');
          navigate('/rent');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRentalData();
  }, [rentId, isEditing, navigate]);

  // Hàm trigger file input
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Xử lý upload ảnh với rentId
  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    console.log('Files selected:', files);

    if (files.length === 0) return;

    setImageUploading(true);

    try {
      // Nếu đang create mới và chưa có rentId, xử lý local
      if (!isEditing) {
        console.log('Creating new rental - handling local preview only');
        
        const newImages = files.map(file => ({
          id: Date.now() + Math.random(),
          url: URL.createObjectURL(file),
          name: file.name,
          isFeatured: formData.gallery.length === 0,
          file: file // Lưu file object để upload sau khi có rentId
        }));

        setFormData(prev => {
          const updatedGallery = [...prev.gallery, ...newImages];
          const featuredImage = prev.featuredImage || (updatedGallery.length > 0 ? updatedGallery[0].url : '');
          
          return {
            ...prev,
            gallery: updatedGallery,
            featuredImage: featuredImage
          };
        });

        // Lưu ảnh local để upload sau
        setLocalImages(prev => [...prev, ...files]);
      } else {
        // Nếu đang edit, upload lên server ngay
        const formDataToUpload = new FormData();
        files.forEach(file => {
          formDataToUpload.append('images', file);
        });

        console.log('Uploading images for rentId:', rentId);
        
        const response = await rentService.uploadRentalImages(rentId, formDataToUpload);
        
        if (response.success) {
          console.log('Upload successful:', response.data);
          setFormData(prev => ({
            ...prev,
            gallery: response.data.gallery,
            featuredImage: response.data.featuredImage
          }));
        } else {
          console.error('Upload failed:', response.message);
          alert('Failed to upload images: ' + response.message);
        }
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images: ' + (error.message || 'Unknown error'));
    } finally {
      setImageUploading(false);
      event.target.value = '';
    }
  };

  // Hàm upload ảnh local sau khi tạo rental thành công
  const uploadLocalImages = async (newRentId) => {
    if (localImages.length === 0) return;

    try {
      const formDataToUpload = new FormData();
      localImages.forEach(file => {
        formDataToUpload.append('images', file);
      });

      console.log('Uploading local images for new rentId:', newRentId);
      const response = await rentService.uploadRentalImages(newRentId, formDataToUpload);
      
      if (response.success) {
        console.log('Local images upload successful');
        // Có thể cập nhật state nếu cần, nhưng thường sẽ redirect nên không cần
        setLocalImages([]); // Clear local images
      }
    } catch (error) {
      console.error('Error uploading local images:', error);
    }
  };

  // Xóa ảnh với API
  const removeImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    // Nếu đang create (chưa có rentId), chỉ xóa local
    if (!isEditing) {
      setFormData(prev => {
        const updatedGallery = prev.gallery.filter(img => img.id !== imageId);
        const featuredImage = prev.featuredImage === prev.gallery.find(img => img.id === imageId)?.url 
          ? (updatedGallery.length > 0 ? updatedGallery[0].url : '')
          : prev.featuredImage;
        
        return {
          ...prev,
          gallery: updatedGallery,
          featuredImage: featuredImage
        };
      });
      return;
    }

    // Nếu đang edit, xóa trên server
    try {
      const response = await rentService.deleteRentalImage(rentId, imageId);
      
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          gallery: response.data.gallery,
          featuredImage: response.data.featuredImage
        }));
      } else {
        alert('Failed to delete image: ' + response.message);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image');
    }
  };

  // Set featured image với API
  const setAsFeatured = async (imageId) => {
    // Nếu đang create (chưa có rentId), chỉ set local
    if (!isEditing) {
      setFormData(prev => ({
        ...prev,
        gallery: prev.gallery.map(img => ({
          ...img,
          isFeatured: img.id === imageId
        })),
        featuredImage: prev.gallery.find(img => img.id === imageId)?.url || ''
      }));
      return;
    }

    // Nếu đang edit, set trên server
    try {
      const response = await rentService.setFeaturedImage(rentId, imageId);
      
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          gallery: response.data.gallery,
          featuredImage: response.data.featuredImage
        }));
      } else {
        alert('Failed to set featured image: ' + response.message);
      }
    } catch (error) {
      console.error('Error setting featured image:', error);
      alert('Error setting featured image');
    }
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.location || !formData.price || 
          !formData.description || !formData.descriptionShort) {
        alert('Please fill in all required fields');
        setLoading(false);
        return;
      }

      let response;
      if (isEditing) {
        response = await rentService.updateRental(rentId, formData);
      } else {
        response = await rentService.createRental(formData);
        
        // Nếu tạo mới thành công, upload ảnh local
        if (response.success && response.data._id) {
          const newRentId = response.data._id;
          await uploadLocalImages(newRentId);
        }
      }

      if (response.success) {
        alert(`Rental ${isEditing ? 'updated' : 'created'} successfully!`);
        navigate('/rent');
      } else {
        alert(`Failed to ${isEditing ? 'update' : 'create'} rental: ${response.message}`);
      }
    } catch (error) {
      console.error('Error saving rental:', error);
      alert(`Error ${isEditing ? 'updating' : 'creating'} rental`);
    } finally {
      setLoading(false);
    }
  };

  // Các hàm xử lý khác giữ nguyên
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [name]: value
      }
    }));
  };

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

  const sortedGallery = [...formData.gallery].sort((a, b) => {
    if (a.isFeatured) return -1;
    if (b.isFeatured) return 1;
    return 0;
  });

  // Hàm render preview - xử lý xuống dòng
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

  if (loading && isEditing) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading rental data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Rental Property' : 'Create New Rental Property'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditing ? 'Update your rental property details' : 'Add a new property to your rental portfolio'}
          </p>
        </div>
        <Link
          to="/rent"
          className="text-gray-600 hover:text-gray-900 font-medium"
        >
          ← Back to Rentals
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Villa Shirla"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., South, Sinh, San Rafael"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="500"
                />
                <select
                  name="priceUnit"
                  value={formData.priceUnit}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="per night">per night</option>
                  <option value="for 2 nights">for 2 nights</option>
                  <option value="per week">per week</option>
                  <option value="per month">per month</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beds
                </label>
                <input
                  type="number"
                  name="beds"
                  value={formData.beds}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Property Images</h2>
          
          {/* Upload Area - Sử dụng button trigger */}
          <div className="mb-6">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={imageUploading}
            />
            
            <button
              type="button"
              onClick={triggerFileInput}
              disabled={imageUploading}
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex flex-col items-center justify-center">
                <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 10MB each)</p>
                {imageUploading && (
                  <p className="text-xs text-blue-500 mt-2">Uploading...</p>
                )}
              </div>
            </button>
            
            {!isEditing && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                Images will be saved to server after creating the rental
              </p>
            )}
          </div>

          {imageUploading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Uploading images...</span>
            </div>
          )}

          {/* Gallery Grid */}
          {sortedGallery.length > 0 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Gallery Images</h3>
                <p className="text-sm text-gray-600 mb-4">
                  First image will be used as featured image in listings. Click "Set as Featured" to change.
                </p>
                
                {/* Featured Image (Large) */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Featured Image</h4>
                  <div className="bg-gray-50 rounded-lg p-4 border-2 border-blue-200">
                    {formData.featuredImage ? (
                      <div className="relative group">
                        <img 
                          src={formData.featuredImage} 
                          alt="Featured" 
                          className="w-full h-64 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = '/images/placeholder.jpg';
                          }}
                        />
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                            Featured
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black bg-opacity-50 text-white">
                            Displayed in listings
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500">No featured image selected</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gallery Images Grid */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">All Images ({sortedGallery.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {sortedGallery.map((image, index) => (
                      <div
                        key={image.id}
                        className={`relative group bg-white border rounded-lg overflow-hidden ${
                          image.isFeatured ? 'border-2 border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        <div className="aspect-square bg-gray-100">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/images/placeholder.jpg';
                            }}
                          />
                          
                          {/* Overlay Actions */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex space-x-2">
                              {!image.isFeatured && (
                                <button
                                  type="button"
                                  onClick={() => setAsFeatured(image.id)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors"
                                  title="Set as Featured"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                  </svg>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeImage(image.id)}
                                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-colors"
                                title="Remove Image"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Featured Badge */}
                          {image.isFeatured && (
                            <div className="absolute top-2 left-2">
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-600 text-white">
                                Featured
                              </span>
                            </div>
                          )}

                          {/* Image Number */}
                          <div className="absolute top-2 right-2">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-black bg-opacity-50 text-white">
                              {index + 1}
                            </span>
                          </div>
                        </div>

                        {/* Image Info */}
                        <div className="p-2">
                          <p className="text-xs font-medium text-gray-900 truncate mb-1">
                            {image.name}
                          </p>
                          {image.isFeatured && (
                            <p className="text-xs text-blue-600 font-medium">Main thumbnail</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {sortedGallery.length === 0 && !imageUploading && (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No images uploaded</h3>
              <p className="text-gray-600">Upload images to showcase your property</p>
            </div>
          )}
        </div>

        {/* Description với textarea */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Description</h2>
          
          {/* Short Description (Summary) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short Description (Summary) *
              <span className="text-xs text-gray-500 ml-2">
                This will be shown initially to users
              </span>
            </label>
            <textarea
              value={formData.descriptionShort}
              onChange={handleShortDescriptionChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description that will be shown initially to users..."
            />
            <div className="text-xs text-gray-500 mt-1">
              This is the preview text that users will see first
            </div>
          </div>

          {/* Full Description (Show More Content) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Description (Show More Content) *
              <span className="text-xs text-gray-500 ml-2">
                This will be shown when users click "Show More"
              </span>
            </label>
            <textarea
              value={formData.description}
              onChange={handleDescriptionChange}
              required
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Detailed description that will be shown when users click 'Show More'..."
            />
            <div className="text-xs text-gray-500 mt-1">
              Detailed description that appears when users click "Show More"
            </div>
          </div>

          {/* Preview Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">How it will appear to users:</h4>
              <div className="bg-white p-4 rounded border">
                {renderDescriptionPreview()}
              </div>
              <div className="mt-3 text-xs text-gray-500">
                <p>• Short description is always visible</p>
                <p>• "Show More" button appears when full description is available</p>
                <p>• Users can toggle between short and full view</p>
              </div>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Highlights</h2>
          
          {/* Default Highlights */}
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
                      />
                      <textarea
                        value={newHighlight.description}
                        onChange={(e) => setNewHighlight(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Highlight description"
                        rows="2"
                      />
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={updateHighlight}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditingHighlight}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
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
              />
              <textarea
                value={newHighlight.description}
                onChange={(e) => setNewHighlight(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter highlight description"
                rows="2"
              />
              <button
                type="button"
                onClick={addHighlight}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add New Highlight
              </button>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Amenities</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {amenitiesOptions.map(amenity => (
              <label key={amenity} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Status & Featured */}
        <div className="bg-white rounded-lg shadowSm border border-gray-200 p-6">
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
              />
              <label className="ml-2 block text-sm text-gray-700">
                Mark as Featured Property
              </label>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/rent')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg transition-colors font-medium"
          >
            {loading ? 'Saving...' : (isEditing ? 'Update Property' : 'Create Property')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RentEditor;