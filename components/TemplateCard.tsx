'use client';

import { EmailTemplate } from '@/types';
import { TrashIcon } from './Icons';

interface Props {
  template: EmailTemplate;
  onLoad: (template: EmailTemplate) => void;
  onDelete: (id: string) => void;
}

export default function TemplateCard({ template, onLoad, onDelete }: Props) {
  const handleDelete = () => {
    if (window.confirm(`Delete template "${template.name}"?`)) {
      onDelete(template.id);
    }
  };

  return (
    <div className="card card-hover p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-bmsa-text truncate">{template.name}</h3>
          <p className="text-xs text-bmsa-text-light mt-0.5">
            Subject: {template.subject || 'No subject'}
          </p>
        </div>
      </div>

      {/* Preview snippet */}
      <div className="bg-bmsa-gray-50 rounded-lg p-3 border border-bmsa-gray-200">
        <div
          className="text-xs text-bmsa-text-light line-clamp-3 max-h-[60px] overflow-hidden"
          dangerouslySetInnerHTML={{
            __html: template.html_body || '<em>Empty template</em>',
          }}
        />
      </div>

      {/* Meta */}
      <p className="text-[10px] text-bmsa-text-light">
        Created {template.created_at ? new Date(template.created_at).toLocaleDateString() : 'recently'}
      </p>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onLoad(template)}
          className="btn-primary text-xs py-2 flex-1"
        >
          Load Template
        </button>
        <button
          onClick={handleDelete}
          className="p-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors shadow-sm ml-2 inline-flex items-center justify-center"
          title="Delete"
        >
          <TrashIcon size={16} />
        </button>
      </div>
    </div>
  );
}
