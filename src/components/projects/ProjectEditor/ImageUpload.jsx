import { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

const ImageUpload = ({ value, onChange, multiple = false, onImagesChange }) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    
    if (multiple && onImagesChange) {
      const newImages = fileArray.map(file => ({
        id: Date.now() + Math.random(),
        url: URL.createObjectURL(file),
        file: file,
        name: file.name
      }));
      onImagesChange(newImages);
    } else {
      const file = files[0];
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        onChange(imageUrl);
      }
    }
  };

  // ... (giữ nguyên các hàm handleDrop, handleDragOver, handleDragLeave, handleClick, removeImage)

  // For multiple images gallery
  if (multiple) {
    return (
      <div className="space-y-4">
        {/* Upload area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
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
          
          <ImageIcon size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Kéo thả ảnh vào đây hoặc click để chọn
          </p>
          <p className="text-sm text-gray-500">
            PNG, JPG, WEBP tối đa 10MB
          </p>
        </div>

        {/* Image Preview Grid */}
        {value && value.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {value.map((image, index) => (
              <div key={image.id || index} className="relative group">
                <img
                  src={image.url}
                  alt={image.caption || `Image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-600 text-white rounded-full"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // For single image upload (giữ nguyên phần này)
  // ... (giữ nguyên code single image upload)
};

export default ImageUpload;