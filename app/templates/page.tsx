'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import TemplateCard from '@/components/TemplateCard';
import { TemplateIcon } from '@/components/Icons';
import { EmailTemplate } from '@/types';

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => setTemplates(data.templates || []))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleLoad = (template: EmailTemplate) => {
    sessionStorage.setItem('bmsa_load_template', JSON.stringify(template));
    router.push('/dashboard');
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTemplates(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-bmsa-gray-50">
        <Sidebar />

        <main className="flex-1 ml-[260px] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-bmsa-text">Email Templates</h1>
              <p className="text-sm text-bmsa-text-light mt-0.5">Save and reuse email compositions</p>
            </div>
            <span className="text-sm text-bmsa-text-light">
              {templates.length} template{templates.length !== 1 ? 's' : ''} saved
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-bmsa-red border-t-transparent rounded-full animate-spin" />
            </div>
          ) : templates.length === 0 ? (
            <div className="card py-20 text-center text-bmsa-text-light">
              <TemplateIcon size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No templates saved yet</p>
              <p className="text-xs mt-1">Save a template from the Compose page</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onLoad={handleLoad}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
