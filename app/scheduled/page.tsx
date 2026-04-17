'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import { ClockIcon, CalendarIcon } from '@/components/Icons';
import { ScheduledEmail } from '@/types';

export default function ScheduledPage() {
  const [scheduled, setScheduled] = useState<ScheduledEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    fetch('/api/scheduled', { cache: 'no-store', next: { revalidate: 0 } })
      .then(res => res.json())
      .then(data => setScheduled(data.scheduled || []))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this scheduled email?')) return;

    try {
      const res = await fetch(`/api/scheduled/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setScheduled(prev => prev.filter(s => s.id !== id));
        showToast('Scheduled email cancelled', 'success');
      }
    } catch {
      showToast('Failed to cancel', 'error');
    }
  };

  const pendingEmails = scheduled.filter(s => s.status === 'pending');

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-bmsa-gray-50">
        <Sidebar />

        <main className="flex-1 ml-[260px] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-bmsa-text">Scheduled Emails</h1>
              <p className="text-sm text-bmsa-text-light mt-0.5">View and manage your email queue</p>
            </div>
            <span className="badge bg-bmsa-gold/15 text-bmsa-gold-dark text-sm">
              {pendingEmails.length} pending
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-bmsa-red border-t-transparent rounded-full animate-spin" />
            </div>
          ) : scheduled.length === 0 ? (
            <div className="card py-20 text-center text-bmsa-text-light">
              <ClockIcon size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No scheduled emails</p>
              <p className="text-xs mt-1">Schedule an email from the Compose page</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduled.map(email => (
                <div key={email.id} className="card p-5 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-bmsa-text truncate">{email.subject}</h3>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-bmsa-text-light flex items-center gap-1">
                        <CalendarIcon size={12} />
                        {new Date(email.scheduled_at).toLocaleString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <div className="flex gap-1">
                        {email.audience_groups.map(g => (
                          <span key={g} className="badge bg-bmsa-red/10 text-bmsa-red text-[10px]">{g}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    {email.status === 'pending' ? (
                      <>
                        <span className="badge bg-amber-100 text-amber-700">Pending</span>
                        <button
                          onClick={() => handleCancel(email.id)}
                          className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : email.status === 'sent' ? (
                      <span className="badge badge-active">Sent</span>
                    ) : (
                      <span className="badge badge-inactive">Cancelled</span>
                    )}
                  </div>
                </div>
              ))}
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
