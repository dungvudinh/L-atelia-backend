import React from "react";

export default function EditableImage({ src, onChange }) {
  return (
    <div className="relative group">
      <img src={src} alt="" className="rounded-lg w-full" />
      <label className="absolute bottom-2 right-2 bg-white text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 cursor-pointer">
        Change
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) onChange(URL.createObjectURL(file));
          }}
        />
      </label>
    </div>
  );
}
