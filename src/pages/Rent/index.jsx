// components/RentList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import rentService from '../../services/rentService';
import { useDispatch, useSelector } from 'react-redux';
const RentList = () => {
  const {isLoading} = useSelector(state=>state.loading)
  const [rentals, setRentals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  // Fetch rentals from API
  useEffect(() => {
    fetchRentals();
  }, [currentPage, searchTerm, filterStatus, sortBy]);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        sort: getSortParam(sortBy)
      };

      const response = await rentService.getAllRentals(params);
      
      if (response.success) {
        setRentals(response.data);
        setTotalPages(response.pagination?.pages || 1);
        setTotalItems(response.pagination?.total || 0);
      } else {
        console.error('Failed to fetch rentals:', response.message);
        alert('Failed to load rental properties');
      }
    } catch (error) {
      console.error('Error fetching rentals:', error);
      alert('Error loading rental properties');
    } finally {
      setLoading(false);
    }
  };

  const getSortParam = (sortBy) => {
    switch (sortBy) {
      case 'price-low':
        return 'price';
      case 'price-high':
        return '-price';
      case 'name':
        return 'title';
      case 'date-new':
        return '-createdAt';
      case 'date-old':
        return 'createdAt';
      default:
        return '-featured,-createdAt';
    }
  };

  // Delete rental with API
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this rental property?')) {
      try {
        const response = await rentService.deleteRental(id);
        if (response.success) {
          alert('Rental property deleted successfully');
          fetchRentals(); // Refresh the list
          setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        } else {
          alert('Failed to delete rental: ' + response.message);
        }
      } catch (error) {
        console.error('Error deleting rental:', error);
        alert('Error deleting rental property');
      }
    }
  };

  // Bulk delete with API
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} selected rental properties?`)) {
      try {
        const deletePromises = selectedItems.map(id => rentService.deleteRental(id));
        const results = await Promise.allSettled(deletePromises);
        
        const successfulDeletes = results.filter(result => result.status === 'fulfilled' && result.value.success);
        const failedDeletes = results.filter(result => result.status === 'rejected' || !result.value?.success);
        
        if (failedDeletes.length === 0) {
          alert(`Successfully deleted ${successfulDeletes.length} rental properties`);
        } else {
          alert(`Deleted ${successfulDeletes.length} properties, but failed to delete ${failedDeletes.length} properties`);
        }
        
        fetchRentals(); // Refresh the list
        setSelectedItems([]);
      } catch (error) {
        console.error('Error in bulk delete:', error);
        alert('Error deleting selected rental properties');
      }
    }
  };

  // Toggle featured status
  const toggleFeatured = async (id, currentFeatured) => {
    try {
      const response = await rentService.toggleFeatured(id, !currentFeatured);
      if (response.success) {
        fetchRentals(); // Refresh the list
      } else {
        alert('Failed to update featured status: ' + response.message);
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      alert('Error updating featured status');
    }
  };

  // Update rental status
  const updateStatus = async (id, newStatus) => {
    try {
      const response = await rentService.updateRentalStatus(id, newStatus);
      if (response.success) {
        fetchRentals(); // Refresh the list
      } else {
        alert('Failed to update status: ' + response.message);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating rental status');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(rentals.map(item => item._id));
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

  const getThumbnailUrl = (rental) => {
    if (rental.featuredImage.thumbnailKey) {
      return 'https://cdn.latelia.com/latelia/' + rental.featuredImage.thumbnailKey;
    }
    if (rental.gallery && rental.gallery.length > 0) {
      return 'https://cdn.latelia.com/latelia/' + rental.gallery[0].thumbnailKey || rental.gallery[0].key;
    }
    return '/images/placeholder-property.jpg';
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading && rentals.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading rental properties...</span>
        </div>
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
                  placeholder="Search properties by title or location..."
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Under Maintenance</option>
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
                    checked={selectedItems.length === rentals.length && rentals.length > 0}
                  />
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
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
              {rentals.map((rental) => (
                <tr 
                  key={rental._id} 
                  className={selectedItems.includes(rental._id) ? 'bg-blue-50' : 'hover:bg-gray-50'}
                >
                  <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                    <input
                      type="checkbox"
                      className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedItems.includes(rental._id)}
                      onChange={() => handleSelectItem(rental._id)}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center min-w-0"> {/* Thêm min-w-0 để cho phép truncate */}
                      <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={getThumbnailUrl(rental)} 
                          alt={rental.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/images/placeholder-property.jpg';
                          }}
                        />
                      </div>
                      <div className="ml-3 min-w-0 flex-1"> {/* Thêm min-w-0 và flex-1 */}
                        <div className="flex items-center space-x-1">
                          <h4 className="text-sm font-semibold text-gray-900 truncate" title={rental.title}>
                            {rental.title}
                          </h4>
                          {getFeaturedBadge(rental.featured)}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5" title={rental.descriptionShort || rental.description}>
                          {rental.descriptionShort || (rental.description ? rental.description.substring(0, 40) + '...' : 'No description')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-900 truncate block max-w-xs" title={rental.location}>
                      {rental.location}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-blue-600">
                      {formatPrice(rental.price, rental.priceUnit)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900 space-y-1">
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-600 text-xs">Adults:</span>
                        <span className="font-medium text-xs">{rental.adultBeds || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-600 text-xs">Children:</span>
                        <span className="font-medium text-xs">{rental.childBeds || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-600 text-xs">Bath:</span>
                        <span className="font-medium text-xs">{rental.bathrooms || 0}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(rental.createdAt)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getStatusBadge(rental.status)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => toggleFeatured(rental._id, rental.featured)}
                        className={`p-1 rounded transition-colors ${
                          rental.featured 
                            ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50' 
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                        }`}
                        title={rental.featured ? 'Remove featured' : 'Mark as featured'}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </button>
                      <Link
                        to={`/rent/edit/${rental._id}`}
                        className="text-blue-600 hover:text-blue-900 transition-colors p-1 rounded hover:bg-blue-50"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(rental._id)}
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

        {rentals.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rental properties found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filters' 
                : 'Get started by creating your first rental property'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
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
          Showing <span className="font-medium">{rentals.length}</span> of{' '}
          <span className="font-medium">{totalItems}</span> properties
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-3 py-2 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default RentList;