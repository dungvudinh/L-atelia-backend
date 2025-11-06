import React, { useState } from "react";

export default function EditableText({ value, onChange, className }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);

  return (
    <div
      className={`${className} ${editing ? "bg-gray-100" : ""}`}
      onClick={() => setEditing(true)}
    >
      {editing ? (
        <textarea
          className="w-full border p-2 rounded"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            setEditing(false);
            onChange(text);
          }}
        />
      ) : (
        <p>{text}</p>
      )}
    </div>
  );
}
