import React from "react";
import EditableText from "./EditableText";
import EditableImage from "./EditableImage";

export default function SectionEditor({ section, onChange }) {
  const handleUpdate = (key, value) => {
    onChange({ ...section, [key]: value });
  };

  return (
    <div className="space-y-4 border-b pb-8 mb-8">
      <EditableText
        value={section.title}
        onChange={(val) => handleUpdate("title", val)}
        className="text-2xl font-bold"
      />
      <EditableText
        value={section.text}
        onChange={(val) => handleUpdate("text", val)}
        className="text-gray-700"
      />
      <EditableImage
        src={section.image}
        onChange={(val) => handleUpdate("image", val)}
      />
    </div>
  );
}
