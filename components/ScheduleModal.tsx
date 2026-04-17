'use client';

import { useState } from 'react';
import { ClockIcon } from './Icons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (scheduledAt: string) => void;
}

export default function ScheduleModal({ isOpen, onClose, onSchedule }: Props) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!date || !time) return;
    const scheduledAt = new Date(`${date}T${time}`).toISOString();
    onSchedule(scheduledAt);
    setDate('');
    setTime('');
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-bmsa-gray-200">
          <h2 className="text-lg font-bold text-bmsa-text">Schedule Send</h2>
          <p className="text-sm text-bmsa-text-light mt-1">Pick a future date and time</p>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-bmsa-text mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              min={today}
              onChange={e => setDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-bmsa-text mb-1.5">Time</label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="input-field"
            />
          </div>
          {date && time && (
            <div className="bg-bmsa-gold/10 border border-bmsa-gold/30 rounded-lg px-4 py-3">
              <p className="text-sm text-bmsa-text">
                Email will be sent on{' '}
                <strong className="text-bmsa-red">
                  {new Date(`${date}T${time}`).toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </strong>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-bmsa-gray-200 flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!date || !time}
            className="btn-gold flex items-center gap-2 disabled:opacity-50"
          >
            <ClockIcon size={16} />
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
