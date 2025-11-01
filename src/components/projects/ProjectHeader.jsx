import { Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

const ProjectHeader = ({ 
  title, 
  subtitle, 
  saving, 
  onSave, 
  onCancel 
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link
          to={onCancel}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600">{subtitle}</p>
        </div>
      </div>
      
      <div className="flex space-x-3">
        <Link
          to={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Hủy
        </Link>
        <button
          onClick={onSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          <Save size={20} className="mr-2" />
          {saving ? 'Đang lưu...' : 'Tạo Dự án'}
        </button>
      </div>
    </div>
  );
};

export default ProjectHeader;