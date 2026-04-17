'use client';

import { useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { XIcon } from './Icons';

// Import CSS for Quill
import 'react-quill/dist/quill.snow.css';

// ReactQuill needs to be dynamically imported because it's client-side only
// @ts-ignore
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false, 
  loading: () => <div className="h-[250px] flex items-center justify-center text-bmsa-text-light text-sm bg-gray-50 border border-gray-200 rounded-md">Loading text editor...</div> 
});

export interface Attachment {
  name: string;
  type: string;
  size: number;
  content: string; // base64
}

interface Props {
  html: string;
  onChange: (html: string) => void;
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
}

export default function EmailComposer({ html, onChange, attachments, onAttachmentsChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" is too large (max 10MB)`);
        continue;
      }

      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove the data:...;base64, prefix
        };
        reader.readAsDataURL(file);
      });

      newAttachments.push({
        name: file.name,
        type: file.type,
        size: file.size,
        content: base64,
      });
    }

    onAttachmentsChange([...attachments, ...newAttachments]);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    onAttachmentsChange(attachments.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Setup Quill modules/toolbar
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'blockquote', 'code-block'],
      ['clean']
    ],
  }), []);

  return (
    <div className="card overflow-hidden">
      {/* Editor Area with React Quill */}
      <div className="email-quill-wrapper">
        <ReactQuill 
          theme="snow" 
          value={html} 
          onChange={onChange} 
          modules={modules}
          placeholder="Write your email content here. Use {{name}} to personalize..."
          className="bg-white min-h-[250px] text-[0.95rem] leading-[1.7] text-bmsa-text"
        />
      </div>

      {/* Attach Button Strip */}
      <div className="flex items-center justify-between px-4 py-2 bg-bmsa-gray-50 border-t border-bmsa-gray-200">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Attach files"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs font-medium text-bmsa-text-light hover:bg-gray-50 hover:text-bmsa-text transition-all shadow-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
          Attach File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="px-4 py-3 border-t border-bmsa-gray-200 bg-white">
          <p className="text-xs font-medium text-bmsa-text-light mb-2">
            Attachments ({attachments.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 bg-bmsa-gray-50 rounded-lg border border-bmsa-gray-200 text-xs"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-bmsa-text-light flex-shrink-0">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="text-bmsa-text max-w-[120px] truncate">{file.name}</span>
                <span className="text-bmsa-text-light">{formatSize(file.size)}</span>
                <button
                  onClick={() => removeAttachment(i)}
                  className="text-red-400 hover:text-red-600 ml-1"
                  title="Remove"
                >
                  <XIcon size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Basic overides for React Quill styling so it fits the BMSA theme */}
      <style jsx global>{`
        .email-quill-wrapper .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid #e5e7eb !important;
          background: #fdfdfd;
          font-family: inherit;
        }
        .email-quill-wrapper .ql-container {
          border: none !important;
          font-size: 0.95rem;
          font-family: inherit;
        }
        .email-quill-wrapper .ql-editor {
          min-height: 250px;
          padding: 1rem 1.25rem;
        }
        .email-quill-wrapper .ql-editor:focus {
          outline: none;
        }
        .email-quill-wrapper .ql-editor p {
          margin-bottom: 0.5rem;
        }
      `}</style>
    </div>
  );
}
