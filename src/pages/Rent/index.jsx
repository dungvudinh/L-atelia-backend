// components/RentList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const RentList = () => {
  const [rentals, setRentals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProperty, setFilterProperty] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const mockRentals = [
      {
        id: 1,
        title: 'Villa Shirla',
        location: 'South, Sinh, San Rafael',
        price: 500,
        priceUnit: 'per night',
        beds: 2,
        bedrooms: 1,
        bathrooms: 1,
        thumbnail: '/images/villa-shirla-1.jpg',
        featured: true,
        status: 'available',
        description: 'Luxury villa with panoramic views',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-15',
        author: 'Admin'
      },
      {
        id: 2,
        title: 'Villa Palma',
        location: 'North, Palma, Mallorca',
        price: 450,
        priceUnit: 'per night',
        beds: 3,
        bedrooms: 2,
        bathrooms: 2,
        thumbnail: '/images/villa-shirla-2.jpg',
        featured: false,
        status: 'available',
        description: 'Modern villa with private pool',
        createdAt: '2024-01-14',
        updatedAt: '2024-01-14',
        author: 'Editor'
      },
      {
        id: 3,
        title: 'Can Bancos',
        location: 'Jackie, Julia Town',
        price: 150,
        priceUnit: 'for 2 nights',
        beds: 2,
        bedrooms: 1,
        bathrooms: 1,
        thumbnail: '/images/can-bancos.jpg',
        featured: true,
        status: 'occupied',
        description: 'Breathtaking grand villa near Jackie',
        createdAt: '2024-01-13',
        updatedAt: '2024-01-16',
        author: 'Manager'
      },
      {
        id: 4,
        title: 'Villa Marina',
        location: 'South, Sinh, San Rafael',
        price: 600,
        priceUnit: 'per night',
        beds: 4,
        bedrooms: 3,
        bathrooms: 2,
        thumbnail: '/images/villa-marina.jpg',
        featured: false,
        status: 'available',
        description: 'Beachfront luxury villa',
        createdAt: '2024-01-12',
        updatedAt: '2024-01-12',
        author: 'Admin'
      }
    ];
    
    setTimeout(() => {
      setRentals(mockRentals);
      setLoading(false);
    }, 1000);
  }, []);

  const propertyTypes = ['all', 'properties', 'lifestyle', 'product'];

  const filteredRentals = rentals.filter(rental => {
    const matchesSearch = rental.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rental.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProperty = filterProperty === 'all' || rental.title.toLowerCase().includes(filterProperty);
    
    return matchesSearch && matchesProperty;
  });

  const sortedRentals = [...filteredRentals].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.title.localeCompare(b.title);
      case 'date-new':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'date-old':
        return new Date(a.createdAt) - new Date(b.createdAt);
      default:
        return a.featured === b.featured ? 0 : a.featured ? -1 : 1;
    }
  });

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa rental property này?')) {
      setRentals(rentals.filter(item => item.id !== id));
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`Bạn có chắc muốn xóa ${selectedItems.length} rental properties đã chọn?`)) {
      setRentals(rentals.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(filteredRentals.map(item => item.id));
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
    if (status === 'available') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Available
        </span>
      );
    } else if (status === 'occupied') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Occupied
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Maintenance
      </span>
    );
  };

  const getFeaturedBadge = (featured) => {
    if (featured) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Featured
        </span>
      );
    }
    return null;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (price, unit) => {
    return `$${price} ${unit}`;
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
      {/* Header với nút Add New bên phải */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rental Properties</h1>
          <p className="text-gray-600 mt-2">Manage your rental properties and listings</p>
        </div>
        <Link
          to="/rent/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Property
        </Link>
      </div>

      {/* Filters và Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {/* Category Filter Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {propertyTypes.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilterProperty(category)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    filterProperty === category
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
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

        {/* Additional Filters - ĐÃ LOẠI BỎ LOCATION FILTER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="default">Default sorting</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
              <option value="date-new">Date: Newest</option>
              <option value="date-old">Date: Oldest</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rental Properties Table */}
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
                    checked={selectedItems.length === filteredRentals.length && filteredRentals.length > 0}
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
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
              {sortedRentals.map((rental) => (
                <tr 
                  key={rental.id} 
                  className={selectedItems.includes(rental.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}
                >
                  <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                    <input
                      type="checkbox"
                      className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedItems.includes(rental.id)}
                      onChange={() => handleSelectItem(rental.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={rental.thumbnail} 
                          alt={rental.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-semibold text-gray-900">
                            {rental.title}
                          </h4>
                          {getFeaturedBadge(rental.featured)}
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                          {rental.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{rental.location}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-blue-600">
                      {formatPrice(rental.price, rental.priceUnit)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Beds:</span>
                        <span className="font-medium">{rental.beds}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Bedrooms:</span>
                        <span className="font-medium">{rental.bedrooms}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Bathrooms:</span>
                        <span className="font-medium">{rental.bathrooms}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{rental.author}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(rental.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(rental.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        to={`/rent/edit/${rental.id}`}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <Link
                        to={`/rent/view/${rental.id}`}
                        className="text-green-600 hover:text-green-900 transition-colors p-1 rounded hover:bg-green-50"
                        title="View"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(rental.id)}
                        className="text-red-600 hover:text-red-900 transition-colors p-1 rounded hover:bg-red-50"
                        title="Delete"
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

        {sortedRentals.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rental properties found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterProperty !== 'all'
                ? 'Try adjusting your search or filters' 
                : 'Get started by creating your first rental property'
              }
            </p>
            {!searchTerm && filterProperty === 'all' && (
              <Link
                to="/rent/create"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                Add New Property
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Pagination và Summary */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{sortedRentals.length}</span> of{' '}
          <span className="font-medium">{rentals.length}</span> properties
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

export default RentList;