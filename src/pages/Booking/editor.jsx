// components/BookingEditor.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import rentService from '../../services/rentService';

const BookingEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [formData, setFormData] = useState({
    bookingNumber: '',
    customer: {
      name: '',
      email: '',
      phone: '',
      address: ''
    },
    property: {
      id: '',
      title: '',
      location: '',
      price: ''
    },
    checkIn: '',
    checkOut: '',
    guests: 1,
    status: 'pending',
    paymentStatus: 'pending',
    specialRequests: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [properties, setProperties] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');

  // Fetch properties from database (rents)
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const propertiesData = await rentService.getAllRentals();
        console.log(propertiesData)
        setProperties(propertiesData.data);
      } catch (error) {
        console.error('Error fetching properties:', error);
        // Fallback to empty array if API fails
        setProperties([]);
      }
    };

    fetchProperties();
  }, []);

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
      return result.available;
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailabilityError(error.message || 'Error checking availability');
      return false;
    } finally {
      setAvailabilityLoading(false);
    }
  };

  useEffect(() => {
    if (isEditing) {
      const fetchBookingData = async () => {
        setLoading(true);
        try {
          const bookingData = await bookingService.getBookingById(id);
          setFormData(bookingData);
        } catch (error) {
          console.error('Error fetching booking data:', error);
          // Fallback to mock data for demonstration if API fails
          const mockData = {
            bookingNumber: 'BK-001',
            customer: {
              name: 'John Smith',
              email: 'john.smith@email.com',
              phone: '+1234567890',
              address: '123 Main St, New York, USA'
            },
            property: {
              id: 1,
              title: 'Villa Shirla',
              location: 'South, Sinh, San Rafael',
              price: 500
            },
            checkIn: '2024-02-15',
            checkOut: '2024-02-20',
            guests: 2,
            status: 'confirmed',
            paymentStatus: 'paid',
            specialRequests: 'Early check-in would be appreciated',
            notes: 'Customer requested early check-in at 1 PM'
          };
          setFormData(mockData);
        } finally {
          setLoading(false);
        }
      };

      fetchBookingData();
    } else {
      // Generate booking number for new booking
      const newBookingNumber = `BK-${Date.now().toString().slice(-6)}`;
      setFormData(prev => ({ ...prev, bookingNumber: newBookingNumber }));
    }
  }, [id, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePropertyChange = async (e) => {
    const propertyId = parseInt(e.target.value);
    const selectedProperty = properties.find(p => p.id === propertyId);
    
    if (selectedProperty) {
      setFormData(prev => ({
        ...prev,
        property: {
          id: selectedProperty.id,
          title: selectedProperty.title,
          location: selectedProperty.location,
          price: selectedProperty.price
        }
      }));

      // Check availability if dates are already selected
      if (prev.checkIn && prev.checkOut) {
        const isAvailable = await checkPropertyAvailability(
          selectedProperty.id, 
          prev.checkIn, 
          prev.checkOut
        );
        if (!isAvailable) {
          setAvailabilityError('Property is not available for the selected dates');
        } else {
          setAvailabilityError('');
        }
      }
    } else {
      // Reset property if no selection
      setFormData(prev => ({
        ...prev,
        property: {
          id: '',
          title: '',
          location: '',
          price: ''
        }
      }));
    }
  };

  const handleDateChange = async (field, value) => {
    const updatedFormData = { 
      ...formData, 
      [field]: value 
    };
    
    setFormData(updatedFormData);

    // Check availability if both dates and property are selected
    if (updatedFormData.property.id && 
        ((field === 'checkIn' && updatedFormData.checkOut) || 
         (field === 'checkOut' && updatedFormData.checkIn))) {
      
      const checkIn = field === 'checkIn' ? value : formData.checkIn;
      const checkOut = field === 'checkOut' ? value : formData.checkOut;
      
      if (checkIn && checkOut) {
        const isAvailable = await checkPropertyAvailability(
          updatedFormData.property.id, 
          checkIn, 
          checkOut
        );
        if (!isAvailable) {
          setAvailabilityError('Property is not available for the selected dates');
        } else {
          setAvailabilityError('');
        }
      }
    }
  };

  const handleGuestsChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      guests: parseInt(value) || 1
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.property.id || !formData.checkIn || !formData.checkOut || !formData.guests) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate availability before submitting
    const isAvailable = await checkPropertyAvailability(
      formData.property.id,
      formData.checkIn,
      formData.checkOut,
      id
    );
    
    if (!isAvailable) {
      alert('Cannot proceed. Property is not available for the selected dates.');
      return;
    }

    setLoading(true);

    try {
      if (isEditing) {
        await bookingService.updateBooking(id, formData);
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

  const handleSendEmail = async () => {
    if (!id) {
      alert('Please save the booking first before sending email');
      return;
    }

    setSendingEmail(true);
    
    try {
      await bookingService.sendBookingEmail(id, 'update');
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000);
    } catch (error) {
      console.error('Error sending email:', error);
      alert(error.message || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
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
            {isEditing ? 'Update booking details and send updates to customer' : 'Create a new booking reservation'}
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
                value={formData.property.id}
                onChange={handlePropertyChange}
                required
                disabled={properties.length === 0}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">Select a property</option>
                {properties.map(property => (
                  <option key={property.id} value={property.id}>
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
                value={formData.checkIn}
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
                value={formData.checkOut}
                onChange={(e) => handleDateChange('checkOut', e.target.value)}
                required
                min={formData.checkIn || new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Guests *
              </label>
              <input
                type="number"
                value={formData.guests}
                onChange={handleGuestsChange}
                required
                min="1"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
                  <span className="font-medium">{formData.property.title || 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{formData.property.location || 'Not available'}</span>
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
                <div className="flex justify-between">
                  <span className="text-gray-600">Guests:</span>
                  <span className="font-medium">{formData.guests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per night:</span>
                  <span className="font-medium">{formatCurrency(formData.property.price)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-blue-600">
                      {formatCurrency(calculateNights() * (formData.property.price || 0))}
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
                disabled={sendingEmail || !formData.customer.email || !id}
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