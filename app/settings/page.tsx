'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';

export default function SettingsPage() {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store', next: { revalidate: 0 } })
      .then(res => res.json())
      .then(data => {
        setSenderName(data.sender_name || '');
        setSenderEmail(data.sender_email || '');
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_name: senderName, sender_email: senderEmail }),
      });

      if (res.ok) {
        showToast('Settings saved', 'success');
      } else {
        showToast('Failed to save settings', 'error');
      }
    } catch {
      showToast('Connection error', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-bmsa-gray-50">
        <Sidebar />

        <main className="flex-1 ml-[260px] p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-bmsa-text">Settings</h1>
            <p className="text-sm text-bmsa-text-light mt-0.5">Configure email sender details</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-bmsa-red border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="max-w-xl space-y-6">
              <div className="card p-6 space-y-5">
                <h2 className="text-lg font-semibold text-bmsa-text">Email Sender</h2>

                <div>
                  <label className="block text-sm font-medium text-bmsa-text mb-1.5">Sender Name</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={e => setSenderName(e.target.value)}
                    placeholder="e.g. BMSA"
                    className="input-field"
                  />
                  <p className="text-xs text-bmsa-text-light mt-1">This name appears in the &quot;From&quot; field</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-bmsa-text mb-1.5">Sender Email</label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={e => setSenderEmail(e.target.value)}
                    placeholder="e.g. bmsa@example.com"
                    className="input-field"
                  />
                  <p className="text-xs text-bmsa-text-light mt-1">Must be verified in your Brevo account</p>
                </div>

                <button onClick={handleSave} disabled={isSaving} className="btn-primary">
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>

              <div className="card p-6 space-y-3">
                <h2 className="text-lg font-semibold text-bmsa-text">Environment Variables</h2>
                <p className="text-sm text-bmsa-text-light">
                  These are configured in your <code className="bg-bmsa-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">.env.local</code> file:
                </p>
                <div className="bg-bmsa-gray-50 rounded-lg p-4 font-mono text-xs space-y-1.5">
                  <p><span className="text-bmsa-red">BREVO_API_KEY</span>=your-api-key</p>
                  <p><span className="text-bmsa-red">PRESIDENT_PASSWORD</span>=your-password</p>
                  <p><span className="text-bmsa-red">AUTH_SECRET</span>=random-secret-string</p>
                  <p><span className="text-bmsa-red">NEXT_PUBLIC_SUPABASE_URL</span>=https://your-project.supabase.co</p>
                  <p><span className="text-bmsa-red">SUPABASE_SERVICE_ROLE_KEY</span>=your-service-key</p>
                </div>
              </div>
            </div>
          )}
        </main>

        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium toast-enter ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {toast.message}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
