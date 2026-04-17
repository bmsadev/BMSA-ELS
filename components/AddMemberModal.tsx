'use client';

import { useState } from 'react';
import { Member, AUDIENCE_GROUPS } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (member: Member) => Promise<void>;
}

export default function AddMemberModal({ isOpen, onClose, onAdd }: AddMemberModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [committee, setCommittee] = useState('');
  const [role, setRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsSubmitting(true);
    try {
      const newMember: Member = {
        id: uuidv4(),
        name,
        email: email.toLowerCase(),
        committee: committee.toUpperCase(),
        role,
        status: 'Active',
      };
      await onAdd(newMember);
      
      // Reset form
      setName('');
      setEmail('');
      setCommittee('');
      setRole('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-bmsa-text mb-4">Add New Member</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-bmsa-text mb-1.5">Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Full Name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-bmsa-text mb-1.5">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="Email Address"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-bmsa-text mb-1.5">Committee</label>
            <select
              value={committee}
              onChange={(e) => setCommittee(e.target.value)}
              className="input-field"
            >
              <option value="">Select Committee</option>
              {AUDIENCE_GROUPS.filter(g => g !== 'ALL' && g !== 'MEMBERS_ONLY').map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-bmsa-text mb-1.5">Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-field"
              placeholder="e.g. Member, Head, etc."
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-bmsa-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || !name || !email}
            >
              {isSubmitting ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
