// src/components/admin/MediaManager.jsx
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Image, 
  Video,
  FileText,
  MoreVertical,
  Download,
  Eye
} from 'lucide-react';

const MediaManager = () => {
    const navigate = useNavigate();
  const [mediaItems, setMediaItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Mock data based on the image content
  const initialMediaData = [
    {
      id: 1,
      title: 'Exploring Mon Cor: Barrow Projects Presents a Remarkable Architectural Marvel in Soller, Mallorca',
      description: 'Dubbed Mon Cor, the newly renovated home dates to 1903',
      category: 'Properties',
      type: 'image',
      url: '/images/properties/mon-cor.jpg',
      tags: ['architecture', 'renovation', 'mallorca'],
      uploadDate: '2024-01-15',
      fileSize: '2.4 MB',
      dimensions: '1920x1080'
    },
    {
      id: 2,
      title: 'Six of the best inland towns in Mallorca',
      description: 'Smart buyers are heading for the Spanish island\'s hills, to escape the crowds and find bargains. Buy in from €350,000',
      category: 'Lifestyle',
      type: 'image',
      url: '/images/lifestyle/mallorca-towns.jpg',
      tags: ['travel', 'real-estate', 'spain'],
      uploadDate: '2024-01-10',
      fileSize: '1.8 MB',
      dimensions: '1920x1080'
    },
    {
      id: 3,
      title: '148th abcMallorca Property Special 2022',
      description: 'Smart buyers are heading for the Spanish island\'s hills, to escape the crowds and find bargains. Buy in from €350,000',
      category: 'Product',
      type: 'document',
      url: '/documents/property-special-2022.pdf',
      tags: ['property', 'magazine', '2022'],
      uploadDate: '2024-01-05',
      fileSize: '4.2 MB',
      dimensions: 'A4'
    },
    {
      id: 4,
      title: 'Modern Architecture - Carlyle Residence',
      description: 'As well as a strong connection to the surrounds, the brief called for visual research, spatial flexibility and generous outdoor living.',
      category: 'Properties',
      type: 'image',
      url: '/images/properties/carlyle-residence.jpg',
      tags: ['modern', 'architecture', 'residence'],
      uploadDate: '2024-01-03',
      fileSize: '3.1 MB',
      dimensions: '1920x1080'
    }
  ];

  useEffect(() => {
    setMediaItems(initialMediaData);
    setFilteredItems(initialMediaData);
  }, []);

  useEffect(() => {
    filterMedia();
  }, [selectedFilter, searchTerm, mediaItems]);

  const filterMedia = () => {
    let filtered = mediaItems;

    if (selectedFilter !== 'All') {
      filtered = filtered.filter(item => item.category === selectedFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredItems(filtered);
  };

  const categories = ['All', 'Lifestyle', 'Properties', 'Product'];

  const handleEdit = (item) => {
    setEditingItem({ ...item });
  };

  const handleSave = () => {
    if (editingItem) {
      setMediaItems(prev => 
        prev.map(item => item.id === editingItem.id ? editingItem : item)
      );
      setEditingItem(null);
    }
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this media item?')) {
      setMediaItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleUpload = (newItem) => {
    const item = {
      ...newItem,
      id: Math.max(...mediaItems.map(i => i.id)) + 1,
      uploadDate: new Date().toISOString().split('T')[0]
    };
    setMediaItems(prev => [...prev, item]);
    setShowUploadModal(false);
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return <Image className="w-6 h-6" />;
      case 'video': return <Video className="w-6 h-6" />;
      case 'document': return <FileText className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Media Library</h1>
          <p className="text-gray-600">Manage your media files and documents</p>
        </div>
        <button
          onClick={() =>navigate('/media/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Upload Media
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search media..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <span className="text-gray-600 whitespace-nowrap">Filter by:</span>
            <div className="flex gap-1">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedFilter(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedFilter === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
            {/* Media Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getFileIcon(item.type)}
                  <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {item.category}
                  </span>
                </div>
                <div className="relative">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
              
              {editingItem?.id === item.id ? (
                <input
                  type="text"
                  value={editingItem.title}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full font-semibold text-gray-800 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                />
              ) : (
                <h3 className="font-semibold text-gray-800 line-clamp-2">{item.title}</h3>
              )}
            </div>

            {/* Media Content */}
            <div className="p-4">
              {item.type === 'image' && (
                <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  <Image className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              {editingItem?.id === item.id ? (
                <textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  className="w-full text-sm text-gray-600 border rounded p-2 focus:outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{item.description}</p>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {item.tags.map((tag, index) => (
                  <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* File Info */}
              <div className="text-xs text-gray-500 space-y-1">
                <div>Uploaded: {item.uploadDate}</div>
                <div>Size: {item.fileSize}</div>
                {item.dimensions && <div>Dimensions: {item.dimensions}</div>}
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-3 bg-gray-50 border-t flex justify-between">
              {editingItem?.id === item.id ? (
                <>
                  <button
                    onClick={() => setEditingItem(null)}
                    className="text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1 text-gray-400 hover:text-green-600 transition-colors" title="View">
                      <Eye size={16} />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-purple-600 transition-colors" title="Download">
                      <Download size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No media found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedFilter !== 'All' 
              ? 'Try changing your search or filter criteria'
              : 'Get started by uploading your first media file'
            }
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="inline mr-2" />
            Upload Media
          </button>
        </div>
      )}

    </div>
  );
};

// Upload Modal Component
// 

export default MediaManager;