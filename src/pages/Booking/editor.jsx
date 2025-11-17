// components/BookingEditor.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import rentService from '../../services/rentService';

const BookingEditor = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(bookingId);
  
  const [formData, setFormData] = useState({
    bookingNumber: '',
    customer: {
      name: '',
      email: '',
      phone: '',
      address: ''
    },
    propertyId: '', // Sửa từ property.id thành propertyId để phù hợp với model
    checkIn: '',
    checkOut: '',
    adults: 1, // Đổi từ guests sang adults
    children: 0, // Thêm children
    status: 'pending',
    paymentStatus: 'pending',
    specialRequests: '',
    notes: '',
    totalAmount: 0
  });

  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [properties, setProperties] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [availableProperties, setAvailableProperties] = useState([]); // Thêm state mới
  // Fetch properties từ database
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const propertiesData = await rentService.getAllRentals();
        const propertiesList = propertiesData.data || propertiesData;
        setProperties(propertiesData.data || propertiesData);
        setAvailableProperties(propertiesList);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setProperties([]);
      }
    };

    fetchProperties();
  }, []);

  // Fetch booking data khi edit
  useEffect(() => {
    if (isEditing) {
      const fetchBookingData = async () => {
        setLoading(true);
        try {
          const bookingData = await bookingService.getBookingById(bookingId);
          console.log('Booking data:', bookingData);
          
          // Transform data để phù hợp với form state
          // Giả sử bookingData có adults và children, nếu không sẽ dùng giá trị mặc định
          const transformedData = {
            ...bookingData.data || bookingData,
            propertyId: bookingData.data?.propertyId?._id || bookingData.data?.propertyId || bookingData.propertyId,
            adults: bookingData.data?.adults || 1,
            children: bookingData.data?.children || 0
          };
          
          setFormData(transformedData);
        } catch (error) {
          console.error('Error fetching booking data:', error);
          // Fallback data cho demo
          const mockData = {
            bookingNumber: 'BK-001',
            customer: {
              name: 'John Smith',
              email: 'john.smith@email.com',
              phone: '+1234567890',
              address: '123 Main St, New York, USA'
            },
            propertyId: '1',
            checkIn: '2024-02-15',
            checkOut: '2024-02-20',
            adults: 2,
            children: 1,
            status: 'confirmed',
            paymentStatus: 'paid',
            specialRequests: 'Early check-in would be appreciated',
            notes: 'Customer requested early check-in at 1 PM',
            totalAmount: 2500
          };
          setFormData(mockData);
        } finally {
          setLoading(false);
        }
      };

      fetchBookingData();
    } else {
      // Generate booking number cho booking mới
      const newBookingNumber = `BK-${Date.now().toString().slice(-6)}`;
      setFormData(prev => ({ ...prev, bookingNumber: newBookingNumber }));
    }
  }, [bookingId, isEditing]);

  const checkAllPropertiesAvailability = async (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return;
    
    setAvailabilityLoading(true);
    setAvailabilityError('');

    try {
      const availabilityPromises = properties.map(async (property) => {
        try {
          const propertyId = property.id || property._id;
          const result = await bookingService.checkAvailability(
            propertyId, 
            checkIn, 
            checkOut,
            isEditing ? bookingId : null // Exclude current booking khi edit
          );
          
          return {
            property,
            available: result.data?.available || result.available || false
          };
        } catch (error) {
          console.error(`Error checking availability for property ${property.id}:`, error);
          return {
            property,
            available: false,
            error: error.message
          };
        }
      });

      const results = await Promise.all(availabilityPromises);
      
      // Lọc ra các properties available
      const availableProps = results
        .filter(result => result.available)
        .map(result => result.property);

      setAvailableProperties(availableProps);

      // Nếu property hiện tại không available, reset propertyId
      const currentPropertyId = formData.propertyId;
      if (currentPropertyId && !availableProps.some(p => (p.id || p._id) === currentPropertyId)) {
        setFormData(prev => ({ ...prev, propertyId: '' }));
        setAvailabilityError('Currently selected property is not available for the chosen dates. Please select another property.');
      }

    } catch (error) {
      console.error('Error checking properties availability:', error);
      setAvailabilityError('Error checking properties availability');
      // Fallback: hiển thị tất cả properties nếu có lỗi
      setAvailableProperties(properties);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePropertyChange = async (e) => {
    const propertyId = e.target.value;
    const selectedProperty = properties.find(p => p.id === propertyId || p._id === propertyId);
    
    if (selectedProperty) {
      setFormData(prev => ({
        ...prev,
        propertyId: selectedProperty.id || selectedProperty._id,
        totalAmount: prev.totalAmount // Giữ nguyên totalAmount, sẽ tính lại khi save
      }));

      // Check availability nếu đã có dates
      if (formData.checkIn && formData.checkOut) {
        const isAvailable = await checkPropertyAvailability(
          selectedProperty.id || selectedProperty._id, 
          formData.checkIn, 
          formData.checkOut
        );
        if (!isAvailable) {
          setAvailabilityError('Property is not available for the selected dates');
        } else {
          setAvailabilityError('');
        }
      }
    }
  };

  const handleDateChange = async (field, value) => {
    const updatedFormData = { 
      ...formData, 
      [field]: value 
    };
    
    setFormData(updatedFormData);

    // Check availability cho tất cả properties khi dates thay đổi
    if (((field === 'checkIn' && updatedFormData.checkOut) || 
         (field === 'checkOut' && updatedFormData.checkIn))) {
      
      const checkIn = field === 'checkIn' ? value : formData.checkIn;
      const checkOut = field === 'checkOut' ? value : formData.checkOut;
      
      if (checkIn && checkOut && checkIn < checkOut) {
        await checkAllPropertiesAvailability(checkIn, checkOut);
      } else {
        // Nếu dates không hợp lệ, hiển thị tất cả properties
        setAvailableProperties(properties);
      }
    }
  };

  // Thay thế handleGuestsChange bằng các hàm mới
  const handleAdultsChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setFormData(prev => ({
      ...prev,
      adults: Math.max(1, value) // Đảm bảo ít nhất 1 người lớn
    }));
  };

  const handleChildrenChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setFormData(prev => ({
      ...prev,
      children: Math.max(0, value) // Đảm bảo không âm
    }));
  };

  // Check property availability
  const checkPropertyAvailability = async (propertyId, checkIn, checkOut, excludeBookingId = null) => {
    if (!propertyId || !checkIn || !checkOut) return true;
    
    setAvailabilityLoading(true);
    setAvailabilityError('');
    
    try {
      const result = await bookingService.checkAvailability(
        propertyId, 
        checkIn, 
        checkOut, 
        excludeBookingId
      );
      return result.data?.available || result.available;
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailabilityError(error.message || 'Error checking availability');
      return false;
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.propertyId || !formData.checkIn || !formData.checkOut || !formData.adults) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate dates
    if (new Date(formData.checkIn) >= new Date(formData.checkOut)) {
      alert('Check-out date must be after check-in date');
      return;
    }

    // Validate total guests (tùy chọn)
    const totalGuests = formData.adults + formData.children;
    if (totalGuests < 1) {
      alert('There must be at least 1 guest');
      return;
    }

    // Validate availability before submitting
    const isAvailable = await checkPropertyAvailability(
      formData.propertyId,
      formData.checkIn,
      formData.checkOut,
      bookingId
    );
    
    if (!isAvailable) {
      alert('Cannot proceed. Property is not available for the selected dates.');
      return;
    }

    setLoading(true);

    try {
      if (isEditing) {
        await bookingService.updateBooking(bookingId, formData);
      } else {
        await bookingService.createBooking(formData);
      }
      
      navigate('/bookings');
    } catch (error) {
      console.error('Error saving booking:', error);
      alert(error.message || 'Failed to save booking');
    } finally {
      setLoading(false);
    }
  };

  // Hàm gửi email - TẠM THỜI VÔ HIỆU HÓA
  const handleSendEmail = async () => {
    alert('Email sending feature is temporarily disabled');
    return;
  };

  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Lấy thông tin property đã chọn
  const selectedProperty = properties.find(p => 
    p.id === formData.propertyId || p._id === formData.propertyId
  );

  if (loading && isEditing) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            {isEditing ? 'Edit Booking' : 'Create New Booking'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditing ? 'Update booking details' : 'Create a new booking reservation'}
          </p>
        </div>
        <Link
          to="/bookings"
          className="text-gray-600 hover:text-gray-900 font-medium"
        >
          ← Back to Bookings
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Booking Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Number
              </label>
              <input
                type="text"
                name="bookingNumber"
                value={formData.bookingNumber}
                onChange={handleInputChange}
                required
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property *
              </label>
              <select
                value={formData.propertyId}
                onChange={handlePropertyChange}
                required
                disabled={properties.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">Select a property</option>
                {properties.map(property => (
                  <option key={property.id || property._id} value={property.id || property._id}>
                    {property.title} - {property.location} ({formatCurrency(property.price)}/night)
                  </option>
                ))}
              </select>
              {properties.length === 0 && (
                <p className="text-xs text-red-500 mt-1">No properties available. Please check the properties list.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-in Date *
              </label>
              <input
                type="date"
                value={formData.checkIn ? formData.checkIn.split('T')[0] : ''}
                onChange={(e) => handleDateChange('checkIn', e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-out Date *
              </label>
              <input
                type="date"
                value={formData.checkOut ? formData.checkOut.split('T')[0] : ''}
                onChange={(e) => handleDateChange('checkOut', e.target.value)}
                required
                min={formData.checkIn || new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Thay thế Number of Guests bằng Adults và Children */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adults *
              </label>
              <input
                type="number"
                value={formData.adults}
                onChange={handleAdultsChange}
                required
                min="1"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Age 13+</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Children
              </label>
              <input
                type="number"
                value={formData.children}
                onChange={handleChildrenChange}
                min="0"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Age 0-12</p>
            </div>

            {/* Availability Status */}
            <div className="md:col-span-2">
              {availabilityLoading && (
                <div className="text-blue-600 text-sm flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Checking availability...
                </div>
              )}
              {availabilityError && (
                <div className="text-red-600 text-sm font-medium">
                  {availabilityError}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Information - READ ONLY */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.customer.name}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.customer.email}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={formData.customer.phone}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                value={formData.customer.address}
                readOnly
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Information</h2>
          
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
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests
              </label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any special requests from the customer..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Internal Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Internal notes for this booking..."
              />
            </div>
          </div>
        </div>

        {/* Summary và Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Summary</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Booking Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Booking Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Property:</span>
                  <span className="font-medium">{selectedProperty?.title || 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{selectedProperty?.location || 'Not available'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium">{formData.checkIn || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium">{formData.checkOut || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nights:</span>
                  <span className="font-medium">{calculateNights()}</span>
                </div>
                {/* Cập nhật hiển thị Guests */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Adults:</span>
                  <span className="font-medium">{formData.adults}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Children:</span>
                  <span className="font-medium">{formData.children}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Guests:</span>
                  <span className="font-medium">{formData.adults + formData.children}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per night:</span>
                  <span className="font-medium">{formatCurrency(selectedProperty?.price)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-blue-600">
                      {formatCurrency(formData.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Customer Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-medium">{formData.customer.name || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-medium">{formData.customer.email || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <p className="font-medium">{formData.customer.phone || 'Not provided'}</p>
                </div>
                {formData.customer.address && (
                  <div>
                    <span className="text-gray-600">Address:</span>
                    <p className="font-medium">{formData.customer.address}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8 pt-6 border-t border-gray-200">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={sendingEmail || !formData.customer.email || !bookingId}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center"
              >
                {sendingEmail ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send Update Email
                  </>
                )}
              </button>
              
              {emailSent && (
                <span className="text-green-600 text-sm font-medium flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Email sent successfully!
                </span>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/bookings')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || availabilityLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg transition-colors font-medium"
              >
                {loading ? 'Saving...' : (isEditing ? 'Update Booking' : 'Create Booking')}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BookingEditor;