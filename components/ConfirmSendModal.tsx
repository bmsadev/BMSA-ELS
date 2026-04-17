'use client';

import { Member } from '@/types';
import { SendIcon, SpinnerIcon } from './Icons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  subject: string;
  audienceGroups: string[];
  recipients: Member[];
  isSending: boolean;
}

export default function ConfirmSendModal({
  isOpen,
  onClose,
  onConfirm,
  subject,
  audienceGroups,
  recipients,
  isSending,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-bmsa-gray-200">
          <h2 className="text-lg font-bold text-bmsa-text">Confirm Send</h2>
          <p className="text-sm text-bmsa-text-light mt-1">Review the details before sending</p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="text-xs font-semibold text-bmsa-text-light uppercase tracking-wide">Subject</label>
            <p className="mt-1 text-sm font-medium text-bmsa-text">{subject}</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-bmsa-text-light uppercase tracking-wide">Audience Groups</label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {audienceGroups.map(g => (
                <span key={g} className="badge bg-bmsa-red/10 text-bmsa-red">{g}</span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-bmsa-text-light uppercase tracking-wide">
              Recipients ({recipients.length})
            </label>
            <div className="mt-2 max-h-[200px] overflow-y-auto bg-bmsa-gray-50 rounded-lg border border-bmsa-gray-200">
              {recipients.map((r, i) => (
                <div
                  key={r.email}
                  className={`flex items-center justify-between px-3 py-2 text-sm ${
                    i !== recipients.length - 1 ? 'border-b border-bmsa-gray-200' : ''
                  }`}
                >
                  <span className="font-medium text-bmsa-text">{r.name}</span>
                  <span className="text-bmsa-text-light text-xs">{r.email}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-bmsa-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSending}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSending}
            className="btn-primary flex items-center gap-2"
          >
            {isSending ? (
              <>
                <SpinnerIcon size={16} />
                Sending...
              </>
            ) : (
              <>
                <SendIcon size={16} />
                Send to {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
