// components/TiptapEditor.jsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('URL của ảnh:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const url = window.prompt('URL:');
    if (url === null) {
      return;
    }
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="border-b border-gray-200 p-3 flex flex-wrap gap-1">
      {/* Text formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('bold') ? 'bg-gray-200' : ''
        }`}
        title="In đậm"
      >
        <span className="font-bold">B</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('italic') ? 'bg-gray-200' : ''
        }`}
        title="In nghiêng"
      >
        <span className="italic">I</span>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('strike') ? 'bg-gray-200' : ''
        }`}
        title="Gạch ngang"
      >
        <span className="line-through">S</span>
      </button>

      {/* Headings */}
      <button
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('paragraph') ? 'bg-gray-200' : ''
        }`}
        title="Đoạn văn"
      >
        P
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''
        }`}
        title="Tiêu đề 1"
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''
        }`}
        title="Tiêu đề 2"
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''
        }`}
        title="Tiêu đề 3"
      >
        H3
      </button>

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('bulletList') ? 'bg-gray-200' : ''
        }`}
        title="Danh sách không thứ tự"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('orderedList') ? 'bg-gray-200' : ''
        }`}
        title="Danh sách có thứ tự"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Text align */}
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''
        }`}
        title="Căn trái"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''
        }`}
        title="Căn giữa"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''
        }`}
        title="Căn phải"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>

      {/* Links and Images */}
      <button
        onClick={setLink}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('link') ? 'bg-gray-200' : ''
        }`}
        title="Chèn liên kết"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.101 1.1" />
        </svg>
      </button>
      <button
        onClick={addImage}
        className="p-2 rounded hover:bg-gray-100"
        title="Chèn ảnh"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Block elements */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('blockquote') ? 'bg-gray-200' : ''
        }`}
        title="Trích dẫn"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      </button>

      {/* Code */}
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded hover:bg-gray-100 ${
          editor.isActive('codeBlock') ? 'bg-gray-200' : ''
        }`}
        title="Khối code"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </button>

      {/* Undo/Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        className="p-2 rounded hover:bg-gray-100"
        title="Hoàn tác"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        className="p-2 rounded hover:bg-gray-100"
        title="Làm lại"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  );
};

const TiptapEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Bắt đầu viết nội dung của bạn...',
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <MenuBar editor={editor} />
      <EditorContent 
        editor={editor} 
        className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-4 min-h-[400px] max-h-[600px] overflow-y-auto"
      />
    </div>
  );
};

export default TiptapEditor;