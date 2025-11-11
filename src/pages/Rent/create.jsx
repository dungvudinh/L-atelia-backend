// components/RentEditor.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const RentEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    priceUnit: 'per night',
    beds: '',
    bedrooms: '',
    bathrooms: '',
    description: '', // Nội dung đầy đủ (Show More)
    descriptionShort: '', // Nội dung tóm tắt
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
  const [showMediaManager, setShowMediaManager] = useState(false);
  const [newHighlight, setNewHighlight] = useState({ title: '', description: '' });
  const [editingHighlight, setEditingHighlight] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

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

  useEffect(() => {
    if (isEditing) {
      const mockData = {
        title: 'Villa Shirla',
        location: 'South, Sinh, San Rafael',
        price: '500',
        priceUnit: 'per night',
        beds: '2',
        bedrooms: '1',
        bathrooms: '1',
        description: 'Luxury villa with panoramic views of the sea and mountains. Perfect for romantic getaways and family vacations.\n\nThis stunning property features:\n• Private infinity pool\n• Spacious living areas\n• Modern kitchen with high-end appliances\n• Luxurious bedrooms with en-suite bathrooms\n• Beautiful garden and outdoor dining area\n\nLocated in a peaceful neighborhood with easy access to beaches, restaurants, and shopping centers.',
        descriptionShort: 'Luxury villa with panoramic sea and mountain views. Perfect for romantic getaways and family vacations. Private infinity pool and modern amenities.',
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
          },
          {
            id: 4,
            title: 'Ocean View',
            description: 'Stunning panoramic views of the ocean from every room.',
            icon: 'star',
            isDefault: false
          }
        ],
        amenities: ['Safety room', 'Safety unit location', 'Air conditioning', 'Parking', 'Restaurants'],
        contactInfo: {
          phone: '+1234567890',
          email: 'info@villashirla.com',
          address: 'South, Sinh, San Rafael, Mallorca'
        },
        gallery: [
          { id: 1, url: '/images/villa-shirla-1.jpg', name: 'villa-shirla-1.jpg', isFeatured: true },
          { id: 2, url: '/images/villa-shirla-2.jpg', name: 'villa-shirla-2.jpg', isFeatured: false },
          { id: 3, url: '/images/villa-shirla-3.jpg', name: 'villa-shirla-3.jpg', isFeatured: false }
        ],
        featuredImage: '/images/villa-shirla-1.jpg',
        status: 'available',
        featured: true
      };
      setFormData(mockData);
    }
  }, [id, isEditing]);

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

  // Các hàm xử lý highlight giữ nguyên
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

  // Các hàm xử lý ảnh giữ nguyên
  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setImageUploading(true);

    const newImages = [];
    for (const file of files) {
      const newImage = {
        id: Date.now() + Math.random(),
        url: URL.createObjectURL(file),
        name: file.name,
        isFeatured: formData.gallery.length === 0
      };

      newImages.push(newImage);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setFormData(prev => {
      const updatedGallery = [...prev.gallery, ...newImages];
      const featuredImage = prev.featuredImage || (updatedGallery.length > 0 ? updatedGallery[0].url : '');
      
      return {
        ...prev,
        gallery: updatedGallery,
        featuredImage: featuredImage
      };
    });

    setImageUploading(false);
    event.target.value = '';
  };

  const setAsFeatured = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      featuredImage: imageUrl,
      gallery: prev.gallery.map(img => ({
        ...img,
        isFeatured: img.url === imageUrl
      }))
    }));
  };

  const removeImage = (imageId) => {
    setFormData(prev => {
      const updatedGallery = prev.gallery.filter(img => img.id !== imageId);
      const featuredImage = updatedGallery.length > 0 ? updatedGallery[0].url : '';
      
      return {
        ...prev,
        gallery: updatedGallery,
        featuredImage: prev.featuredImage === prev.gallery.find(img => img.id === imageId)?.url ? featuredImage : prev.featuredImage
      };
    });
  };

  const sortedGallery = [...formData.gallery].sort((a, b) => {
    if (a.isFeatured) return -1;
    if (b.isFeatured) return 1;
    return 0;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      console.log('Form data:', formData);
      setLoading(false);
      navigate('/rent');
    }, 2000);
  };

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
        {/* Basic Information - Giữ nguyên */}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery - Giữ nguyên */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Property Images</h2>
          
          {/* Upload Area */}
          <div className="mb-6">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 10MB each)</p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={imageUploading}
              />
            </label>
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
                          />
                          
                          {/* Overlay Actions */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex space-x-2">
                              {!image.isFeatured && (
                                <button
                                  type="button"
                                  onClick={() => setAsFeatured(image.url)}
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

        {/* Highlights - Giữ nguyên */}
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

        {/* Amenities - Giữ nguyên */}
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

        {/* Contact Information - Giữ nguyên */}
        {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.contactInfo.phone}
                onChange={handleContactChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.contactInfo.email}
                onChange={handleContactChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="info@example.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.contactInfo.address}
                onChange={handleContactChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Full physical address"
              />
            </div>
          </div>
        </div> */}

        {/* Status & Featured - Giữ nguyên */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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

        {/* Submit Buttons - Giữ nguyên */}
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