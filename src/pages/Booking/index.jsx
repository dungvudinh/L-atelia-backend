// components/BookingList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterProperty, setFilterProperty] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const mockBookings = [
      {
        id: 1,
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
        totalAmount: 2500,
        status: 'confirmed',
        paymentStatus: 'paid',
        specialRequests: 'Early check-in would be appreciated',
        createdAt: '2024-01-10T10:30:00',
        updatedAt: '2024-01-10T10:30:00'
      },
      {
        id: 2,
        bookingNumber: 'BK-002',
        customer: {
          name: 'Maria Garcia',
          email: 'maria.garcia@email.com',
          phone: '+1234567891',
          address: '456 Oak Ave, Los Angeles, USA'
        },
        property: {
          id: 2,
          title: 'Villa Palma',
          location: 'North, Palma, Mallorca',
          price: 450
        },
        checkIn: '2024-03-01',
        checkOut: '2024-03-07',
        guests: 4,
        totalAmount: 2700,
        status: 'pending',
        paymentStatus: 'pending',
        specialRequests: 'Need baby crib',
        createdAt: '2024-01-11T14:20:00',
        updatedAt: '2024-01-11T14:20:00'
      },
      {
        id: 3,
        bookingNumber: 'BK-003',
        customer: {
          name: 'David Johnson',
          email: 'david.johnson@email.com',
          phone: '+1234567892',
          address: '789 Pine Rd, Chicago, USA'
        },
        property: {
          id: 3,
          title: 'Can Bancos',
          location: 'Jackie, Julia Town',
          price: 150
        },
        checkIn: '2024-02-20',
        checkOut: '2024-02-22',
        guests: 2,
        totalAmount: 300,
        status: 'cancelled',
        paymentStatus: 'refunded',
        specialRequests: '',
        createdAt: '2024-01-09T09:15:00',
        updatedAt: '2024-01-12T16:45:00'
      },
      {
        id: 4,
        bookingNumber: 'BK-004',
        customer: {
          name: 'Sarah Wilson',
          email: 'sarah.wilson@email.com',
          phone: '+1234567893',
          address: '321 Elm St, Miami, USA'
        },
        property: {
          id: 1,
          title: 'Villa Shirla',
          location: 'South, Sinh, San Rafael',
          price: 500
        },
        checkIn: '2024-04-10',
        checkOut: '2024-04-15',
        guests: 3,
        totalAmount: 2500,
        status: 'confirmed',
        paymentStatus: 'partial',
        specialRequests: 'Vegetarian meals required',
        createdAt: '2024-01-12T11:00:00',
        updatedAt: '2024-01-12T11:00:00'
      }
    ];
    
    setTimeout(() => {
      setBookings(mockBookings);
      setLoading(false);
    }, 1000);
  }, []);

  const statusOptions = ['all', 'pending', 'confirmed', 'cancelled', 'completed'];
  const propertyOptions = ['all', 'Villa Shirla', 'Villa Palma', 'Can Bancos', 'Villa Marina'];

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesProperty = filterProperty === 'all' || booking.property.title === filterProperty;
    
    return matchesSearch && matchesStatus && matchesProperty;
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      setBookings(bookings.filter(item => item.id !== id));
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} selected bookings?`)) {
      setBookings(bookings.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(filteredBookings.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      confirmed: { color: 'bg-green-100 text-green-800', label: 'Confirmed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      completed: { color: 'bg-blue-100 text-blue-800', label: 'Completed' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const paymentConfig = {
      paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      partial: { color: 'bg-blue-100 text-blue-800', label: 'Partial' },
      refunded: { color: 'bg-gray-100 text-gray-800', label: 'Refunded' }
    };
    
    const config = paymentConfig[paymentStatus] || { color: 'bg-gray-100 text-gray-800', label: paymentStatus };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateNights = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-2">Manage customer bookings and reservations</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Report
          </button>
        </div>
      </div>

      {/* Filters và Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search bookings by customer, email, or booking number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {selectedItems.length} selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>

        {/* Additional Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property
            </label>
            <select
              value={filterProperty}
              onChange={(e) => setFilterProperty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {propertyOptions.map(property => (
                <option key={property} value={property}>
                  {property === 'all' ? 'All Properties' : property}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>
        </div>
      </div>

      {/* Booking Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                  <input
                    type="checkbox"
                    className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onChange={handleSelectAll}
                    checked={selectedItems.length === filteredBookings.length && filteredBookings.length > 0}
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking & Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property & Dates
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stay Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr 
                  key={booking.id} 
                  className={selectedItems.includes(booking.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}
                >
                  <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                    <input
                      type="checkbox"
                      className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedItems.includes(booking.id)}
                      onChange={() => handleSelectItem(booking.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900">
                            {booking.bookingNumber}
                          </h4>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{booking.customer.name}</p>
                        <p className="text-sm text-gray-500">{booking.customer.email}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(booking.createdAt)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 space-y-1">
                      <p className="font-medium">{booking.property.title}</p>
                      <p className="text-gray-600 text-xs">{booking.property.location}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Nights:</span>
                        <span className="font-medium">{calculateNights(booking.checkIn, booking.checkOut)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Guests:</span>
                        <span className="font-medium">{booking.guests}</span>
                      </div>
                      {booking.specialRequests && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500 line-clamp-1" title={booking.specialRequests}>
                            {booking.specialRequests}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 space-y-1">
                      <p className="font-semibold text-lg">{formatCurrency(booking.totalAmount)}</p>
                      <p className="text-xs text-gray-500">
                        {getPaymentStatusBadge(booking.paymentStatus)}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/bookings/edit/${booking.id}`}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                        title="Edit Booking"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                        title="Delete Booking"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== 'all' || filterProperty !== 'all'
                ? 'Try adjusting your search or filters' 
                : 'No bookings have been made yet'
              }
            </p>
          </div>
        )}
      </div>

      {/* Summary và Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{filteredBookings.length}</span> of{' '}
          <span className="font-medium">{bookings.length}</span> bookings
        </div>
        
        <div className="flex space-x-2">
          <button className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 border border-gray-300 rounded-lg hover:bg-gray-50">
            Previous
          </button>
          <button className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 border border-gray-300 rounded-lg hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingList;