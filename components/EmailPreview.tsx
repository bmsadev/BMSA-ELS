'use client';

import { useMemo } from 'react';
import { buildPreviewHtml } from '@/lib/emailTemplate';
import { EyeIcon, MailIcon } from './Icons';

interface Props {
  subject: string;
  bodyHtml: string;
}

export default function EmailPreview({ subject, bodyHtml }: Props) {
  const previewHtml = useMemo(() => {
    if (!subject && !bodyHtml) {
      return '';
    }
    return buildPreviewHtml(subject || 'Your Subject Line', bodyHtml || '<p>Your email content will appear here...</p>');
  }, [subject, bodyHtml]);

  return (
    <div className="card overflow-hidden h-full flex flex-col">
      <div className="px-4 py-3 border-b border-bmsa-gray-200 bg-bmsa-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <EyeIcon size={16} className="text-bmsa-text-light" />
          <h3 className="text-sm font-semibold text-bmsa-text">Live Preview</h3>
        </div>
        <span className="text-[10px] text-bmsa-text-light bg-bmsa-gray-200 px-2 py-0.5 rounded-full">
          How recipients will see it
        </span>
      </div>

      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        {previewHtml ? (
          <iframe
            srcDoc={previewHtml}
            className="w-full h-full min-h-[500px] bg-white rounded-lg shadow-sm border-0"
            title="Email Preview"
            sandbox="allow-same-origin"
          />
        ) : (
          <div className="flex items-center justify-center h-full min-h-[300px] text-bmsa-text-light">
            <div className="text-center">
              <MailIcon size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Start typing to see a live preview</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
