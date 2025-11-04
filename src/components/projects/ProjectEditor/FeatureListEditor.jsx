import { useState } from 'react';
import { Plus, MoveUp, MoveDown, Trash2 } from 'lucide-react';
import { getQuickSuggestions } from '../../../utils/projectHelpers';

const FeatureListEditor = ({ 
  items = [], 
  onChange, 
  placeholder = "Nhập tính năng..." 
}) => {
  const [localItems, setLocalItems] = useState(items);

  const updateItems = (newItems) => {
    setLocalItems(newItems);
    onChange(newItems);
  };

  const addItem = () => {
    const newItems = [...localItems, ''];
    updateItems(newItems);
  };

  const updateItem = (index, value) => {
    const newItems = [...localItems];
    newItems[index] = value;
    updateItems(newItems);
  };

  const removeItem = (index) => {
    const newItems = localItems.filter((_, i) => i !== index);
    updateItems(newItems);
  };

  const moveItem = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= localItems.length) return;
    
    const newItems = [...localItems];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    updateItems(newItems);
  };

  const addSuggestion = (suggestion) => {
    const newItems = [...localItems, suggestion];
    updateItems(newItems);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Danh sách tính năng ({localItems.length})
        </label>
        <button
          type="button"
          onClick={addItem}
          className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={16} className="mr-1" />
          Thêm mục
        </button>
      </div>

      <div className="space-y-2">
        {localItems.map((item, index) => (
          <div key={index} className="flex items-start space-x-2 group">
            {/* Order Controls */}
            <div className="flex flex-col space-y-1 pt-3">
              <button
                type="button"
                onClick={() => moveItem(index, index - 1)}
                disabled={index === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Di chuyển lên"
              >
                <MoveUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, index + 1)}
                disabled={index === localItems.length - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Di chuyển xuống"
              >
                <MoveDown size={14} />
              </button>
            </div>

            {/* Input Field */}
            <div className="flex-1">
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={placeholder}
              />
            </div>

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              title="Xóa mục này"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {localItems.length === 0 && (
        <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">Chưa có tính năng nào</p>
          <button
            type="button"
            onClick={addItem}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thêm tính năng đầu tiên
          </button>
        </div>
      )}

      {/* Quick Add Suggestions */}
      {localItems.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Gợi ý nhanh:</p>
          <div className="flex flex-wrap gap-2">
            {getQuickSuggestions(placeholder).map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => addSuggestion(suggestion)}
                className="px-3 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureListEditor;