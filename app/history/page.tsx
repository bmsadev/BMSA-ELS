'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import { DownloadIcon, InboxIcon, TrashIcon } from '@/components/Icons';
import { HistoryEntry } from '@/types';

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetch('/api/history', { cache: 'no-store', next: { revalidate: 0 } })
      .then(res => res.json())
      .then(data => setHistory(data.history || []))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const exportCSV = () => {
    const headers = ['Date', 'Subject', 'Audience Groups', 'Recipients', 'Status'];
    const rows = history.map(h => [
      h.sent_at ? new Date(h.sent_at).toLocaleString() : '',
      `"${h.subject}"`,
      `"${h.audience_groups.join(', ')}"`,
      h.recipient_count,
      h.status,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bmsa-email-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearHistory = async () => {
    if (!window.confirm('Are you sure you want to permanently delete ALL history? This cannot be undone.')) return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/history', { method: 'DELETE' });
      if (res.ok) setHistory([]);
      else alert('Failed to clear history');
    } catch (e) {
      console.error(e);
      alert('Error clearing history');
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this email from history?')) return;
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (res.ok) setHistory(prev => prev.filter(h => h.id !== id));
      else alert('Failed to delete entry');
    } catch (e) {
      console.error(e);
      alert('Error deleting entry');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <span className="badge badge-active">Sent</span>;
      case 'queued':
        return <span className="badge bg-blue-100 text-blue-700">Queued</span>;
      case 'error':
        return <span className="badge badge-inactive">Error</span>;
      default:
        return <span className="badge bg-gray-100 text-gray-600">{status}</span>;
    }
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-bmsa-gray-50">
        <Sidebar />

        <main className="flex-1 ml-[260px] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-bmsa-text">Sent History</h1>
              <p className="text-sm text-bmsa-text-light mt-0.5">Track all emails sent through the dashboard</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={clearHistory} 
                disabled={history.length === 0 || isDeleting} 
                className="btn-secondary text-sm flex items-center gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                Clear History
              </button>
              <button onClick={exportCSV} disabled={history.length === 0} className="btn-secondary text-sm flex items-center gap-1.5">
                <DownloadIcon size={14} /> Export CSV
              </button>
            </div>
          </div>

          <div className="card overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-3 border-bmsa-red border-t-transparent rounded-full animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <div className="py-20 text-center text-bmsa-text-light">
                <InboxIcon size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No emails sent yet</p>
                <p className="text-xs mt-1">Emails you send will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-bmsa-gray-200 bg-bmsa-gray-50">
                      <th className="text-left py-3 px-4 font-semibold text-bmsa-text">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-bmsa-text">Subject</th>
                      <th className="text-left py-3 px-4 font-semibold text-bmsa-text">Audience</th>
                      <th className="text-left py-3 px-4 font-semibold text-bmsa-text">Recipients</th>
                      <th className="text-left py-3 px-4 font-semibold text-bmsa-text">Status</th>
                      <th className="text-center py-3 px-4 font-semibold text-bmsa-text w-16">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(entry => (
                      <tr key={entry.id} className="border-b border-bmsa-gray-100 hover:bg-bmsa-gray-50 transition-colors">
                        <td className="py-3 px-4 text-bmsa-text-light text-xs">
                          {entry.sent_at ? new Date(entry.sent_at).toLocaleString() : '-'}
                        </td>
                        <td className="py-3 px-4 font-medium text-bmsa-text">{entry.subject}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {entry.audience_groups.map(g => (
                              <span key={g} className="badge bg-bmsa-red/10 text-bmsa-red">{g}</span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-bmsa-text font-medium">{entry.recipient_count}</td>
                        <td className="py-3 px-4">{getStatusBadge(entry.status)}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className="p-1.5 bg-red-500 text-white hover:bg-red-600 rounded-md transition-colors shadow-sm inline-flex"
                            title="Delete"
                          >
                            <TrashIcon size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
