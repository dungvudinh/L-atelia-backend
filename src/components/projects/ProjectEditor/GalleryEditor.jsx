import { useState, useRef } from 'react';
import { ImageIcon, X, MoveUp, MoveDown, Edit } from 'lucide-react';

const GalleryEditor = ({ images = [], onChange }) => {
  const [dragOver, setDragOver] = useState(false);
  const [editingCaption, setEditingCaption] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    
    const newImages = fileArray.map(file => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      file: file,
      name: file.name,
      caption: ''
    }));
    
    onChange([...images, ...newImages]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (indexToRemove) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    onChange(newImages);
  };

  const updateImageCaption = (index, caption) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], caption };
    onChange(newImages);
  };

  const moveImage = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onChange(newImages);
  };

  const startEditingCaption = (index) => {
    setEditingCaption(index);
  };

  const finishEditingCaption = () => {
    setEditingCaption(null);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          dragOver 
            ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        
        <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          Kéo thả ảnh vào đây hoặc click để chọn
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Hỗ trợ PNG, JPG, WEBP • Tối đa 10MB/ảnh
        </p>
        <button
          type="button"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Chọn ảnh từ máy tính
        </button>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Thư viện ảnh ({images.length} ảnh)
            </h3>
            <div className="text-sm text-gray-500">
              Kéo thả để sắp xếp hoặc dùng nút mũi tên
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div 
                key={image.id || index} 
                className="relative group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all"
              >
                {/* Image */}
                <div className="aspect-square relative">
                  <img
                    src={image.url}
                    alt={image.caption || `Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingCaption(index);
                        }}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                        title="Chỉnh sửa chú thích"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        title="Xóa ảnh"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Order Badge */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    #{index + 1}
                  </div>
                </div>

                {/* Caption */}
                <div className="p-3">
                  {editingCaption === index ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={image.caption || ''}
                        onChange={(e) => updateImageCaption(index, e.target.value)}
                        onBlur={finishEditingCaption}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') finishEditingCaption();
                        }}
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập chú thích..."
                        autoFocus
                      />
                      <div className="flex space-x-1">
                        <button
                          onClick={finishEditingCaption}
                          className="flex-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => startEditingCaption(index)}
                    >
                      <span className="text-sm text-gray-700 truncate flex-1">
                        {image.caption || 'Thêm chú thích...'}
                      </span>
                      <Edit size={12} className="text-gray-400 ml-1 flex-shrink-0" />
                    </div>
                  )}
                </div>

                {/* Move Controls */}
                <div className="absolute top-2 right-2 flex flex-col space-y-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveImage(index, index - 1);
                    }}
                    disabled={index === 0}
                    className="p-1 bg-black bg-opacity-70 text-white rounded hover:bg-opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Di chuyển lên"
                  >
                    <MoveUp size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveImage(index, index + 1);
                    }}
                    disabled={index === images.length - 1}
                    className="p-1 bg-black bg-opacity-70 text-white rounded hover:bg-opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    title="Di chuyển xuống"
                  >
                    <MoveDown size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <ImageIcon size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có ảnh nào</h3>
          <p className="text-gray-600 mb-4">Thêm ảnh để tạo thư viện hình ảnh cho dự án</p>
        </div>
      )}

      {/* Bulk Actions */}
      {images.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {images.length} ảnh đã chọn
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleClick}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Thêm ảnh
            </button>
            {images.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Xóa tất cả
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryEditor;