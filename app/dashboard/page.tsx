'use client';

import { useState, useEffect, useCallback } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import EmailComposer, { Attachment } from '@/components/EmailComposer';
import EmailPreview from '@/components/EmailPreview';
import AudienceSelector from '@/components/AudienceSelector';
import { getFilteredRecipients } from '@/lib/audience';
import ConfirmSendModal from '@/components/ConfirmSendModal';
import ScheduleModal from '@/components/ScheduleModal';
import { SaveIcon, TestIcon, ClockIcon, SendIcon } from '@/components/Icons';
import { Member, AudienceGroup } from '@/types';

export default function DashboardPage() {
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<AudienceGroup[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Load template from sessionStorage (if coming from Templates page)
  useEffect(() => {
    const saved = sessionStorage.getItem('bmsa_load_template');
    if (saved) {
      try {
        const template = JSON.parse(saved);
        setSubject(template.subject || '');
        setBodyHtml(template.html_body || '');
      } catch {}
      sessionStorage.removeItem('bmsa_load_template');
    }
  }, []);

  // Fetch members
  useEffect(() => {
    fetch('/api/members')
      .then(res => res.json())
      .then(data => setMembers(data.members || []))
      .catch(err => console.error('Failed to fetch members:', err));
  }, []);

  const activeMembers = members.filter(m => m.status === 'Active');
  const recipients = getFilteredRecipients(selectedGroups, activeMembers);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSend = async () => {
    setIsSending(true);
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          bodyHtml,
          audienceGroups: selectedGroups,
          attachments,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(`Successfully sent to ${data.sentCount} recipients`, 'success');
        setShowConfirmModal(false);
        setSubject('');
        setBodyHtml('');
        setSelectedGroups([]);
        setAttachments([]);
      } else {
        showToast(data.error || 'Failed to send', 'error');
      }
    } catch {
      showToast('Connection error. Please try again.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendTest = async () => {
    if (!subject) {
      showToast('Please enter a subject line first', 'error');
      return;
    }
    try {
      const res = await fetch('/api/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, bodyHtml, attachments }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(`Test email sent to ${data.sentTo || 'your sender address'}. Check your inbox!`, 'success');
      } else {
        showToast(data.error || 'Failed to send test', 'error');
      }
    } catch {
      showToast('Connection error', 'error');
    }
  };

  const handleSchedule = async (scheduledAt: string) => {
    try {
      const res = await fetch('/api/scheduled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          bodyHtml,
          audienceGroups: selectedGroups,
          scheduledAt,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Email scheduled successfully', 'success');
        setShowScheduleModal(false);
      } else {
        showToast(data.error || 'Failed to schedule', 'error');
      }
    } catch {
      showToast('Connection error', 'error');
    }
  };

  const handleSaveTemplate = async () => {
    const name = prompt('Enter a name for this template:');
    if (!name) return;

    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, subject, html_body: bodyHtml }),
      });

      if (res.ok) {
        showToast('Template saved', 'success');
      } else {
        showToast('Failed to save template', 'error');
      }
    } catch {
      showToast('Connection error', 'error');
    }
  };

  const canSend = subject.trim() && bodyHtml.trim() && selectedGroups.length > 0 && recipients.length > 0;

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-bmsa-gray-50">
        <Sidebar />

        <main className="flex-1 ml-[260px] p-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-bmsa-text">Compose Email</h1>
              <p className="text-sm text-bmsa-text-light mt-0.5">Create and send emails to BMSA members</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleSaveTemplate} disabled={!subject && !bodyHtml} className="btn-secondary text-sm py-2 flex items-center gap-1.5">
                <SaveIcon size={14} /> Save Template
              </button>
              <button onClick={handleSendTest} disabled={!subject} className="btn-secondary text-sm py-2 flex items-center gap-1.5">
                <TestIcon size={14} /> Send Test
              </button>
              <button
                onClick={() => setShowScheduleModal(true)}
                disabled={!canSend}
                className="btn-gold text-sm py-2 flex items-center gap-1.5"
              >
                <ClockIcon size={14} /> Schedule
              </button>
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={!canSend}
                className="btn-primary text-sm py-2 flex items-center gap-1.5"
              >
                <SendIcon size={14} /> Send ({recipients.length})
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Left Column - Compose */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-bmsa-text mb-1.5">Subject Line</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="input-field text-base"
                />
              </div>

              <AudienceSelector
                selectedGroups={selectedGroups}
                onSelectionChange={setSelectedGroups}
                members={members}
              />

              <div>
                <label className="block text-sm font-semibold text-bmsa-text mb-1.5">Email Body</label>
                <EmailComposer html={bodyHtml} onChange={setBodyHtml} attachments={attachments} onAttachmentsChange={setAttachments} />
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="xl:sticky xl:top-6 xl:self-start">
              <EmailPreview subject={subject} bodyHtml={bodyHtml} />
            </div>
          </div>
        </main>

        <ConfirmSendModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleSend}
          subject={subject}
          audienceGroups={selectedGroups}
          recipients={recipients}
          isSending={isSending}
        />

        <ScheduleModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          onSchedule={handleSchedule}
        />

        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium toast-enter ${
              toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
