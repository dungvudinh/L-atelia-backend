import ImageUpload from './ImageUpload';
import FeatureListEditor from './FeatureListEditor';
import GalleryEditor from './GalleryEditor';

const SectionEditor = ({ title, section, onChange, type }) => {
  const renderEditor = () => {
    switch(type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <input
              value={section.title || ''}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Tiêu đề chính"
              className="w-full p-2 border rounded"
            />
            <textarea
              value={section.description || ''}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Mô tả ngắn"
              rows={3}
              className="w-full p-2 border rounded"
            />
            <ImageUpload
              value={section.image}
              onChange={(url) => onChange({ image: url })}
            />
          </div>
        );

      case 'text':
        return (
          <textarea
            value={section.content || ''}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder="Nhập nội dung mô tả..."
            rows={8}
            className="w-full p-3 border rounded-lg"
          />
        );

      case 'features':
        return (
          <div className="space-y-3">
            <input
              value={section.title || ''}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Tiêu đề section"
              className="w-full p-2 border rounded"
            />
            <FeatureListEditor
              items={section.items || []}
              onChange={(items) => onChange({ items })}
            />
          </div>
        );

      case 'gallery':
        return (
          <GalleryEditor
            images={section.images || []}
            onChange={(images) => onChange({ images })}
          />
        );

      default:
        return (
          <div className="text-gray-500">
            Editor for {type} type not implemented yet.
          </div>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {renderEditor()}
    </div>
  );
};

export default SectionEditor;