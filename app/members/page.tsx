'use client';

import { useState, useEffect, useRef } from 'react';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import MemberTable from '@/components/MemberTable';
import AddMemberModal from '@/components/AddMemberModal';
import { UploadIcon, CheckIcon, AlertIcon, InboxIcon, UsersIcon } from '@/components/Icons';
import { Member } from '@/types';

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [previewMembers, setPreviewMembers] = useState<Member[] | null>(null);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members', { cache: 'no-store', next: { revalidate: 0 } });
      const data = await res.json();
      setMembers(data.members || []);
    } catch {
      showToast('Failed to load members', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      showToast('Please upload an Excel file (.xlsx)', 'error');
      return;
    }

    setIsUploading(true);
    setUploadErrors([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.errors && data.errors.length > 0) {
        setUploadErrors(data.errors);
      }

      if (data.preview) {
        setPreviewMembers(data.preview);
      } else if (data.members) {
        setMembers(data.members);
        showToast(`${data.added || 0} members imported successfully`, 'success');
      }
    } catch {
      showToast('Failed to upload file', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const confirmUpload = async () => {
    if (!previewMembers) return;

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: previewMembers, confirm: true }),
      });

      const data = await res.json();
      setMembers(data.members || []);
      setPreviewMembers(null);
      showToast(`${previewMembers.length} members imported`, 'success');
    } catch {
      showToast('Failed to confirm upload', 'error');
    }
  };

  const handleAddMember = async (newMember: Member) => {
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members: [newMember], confirm: true }),
      });

      if (!res.ok) throw new Error('Failed to add member');

      const data = await res.json();
      setMembers(data.members || []);
      showToast('Member added successfully', 'success');
    } catch (err) {
      showToast('Failed to add member', 'error');
      throw err; // Re-throw to let the modal know it failed
    }
  };

  const handleEdit = async (member: Member) => {
    try {
      const res = await fetch(`/api/members/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member),
      });

      if (res.ok) {
        setMembers(prev => prev.map(m => m.id === member.id ? member : m));
        showToast('Member updated', 'success');
      }
    } catch {
      showToast('Failed to update member', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });

      if (res.ok) {
        setMembers(prev => prev.filter(m => m.id !== id));
        showToast('Member removed', 'success');
      }
    } catch {
      showToast('Failed to remove member', 'error');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const activeCount = members.filter(m => m.status === 'Active').length;
  const inactiveCount = members.filter(m => m.status === 'Inactive').length;

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-bmsa-gray-50">
        <Sidebar />

        <main className="flex-1 ml-[260px] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-bmsa-text">Members</h1>
              <p className="text-sm text-bmsa-text-light mt-0.5">Manage your BMSA member directory</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowAddModal(true)} 
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <UsersIcon size={16} /> 
                Add Member
              </button>
              <div className="flex gap-2">
                <span className="badge badge-active">{activeCount} Active</span>
                <span className="badge badge-inactive">{inactiveCount} Inactive</span>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <div
            className={`card p-6 mb-6 border-2 border-dashed transition-all duration-200 cursor-pointer ${
              isDragging
                ? 'border-bmsa-red bg-bmsa-red/5'
                : 'border-bmsa-gray-300 hover:border-bmsa-red/50'
            }`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
                e.target.value = '';
              }}
            />
            <div className="text-center">
              <UploadIcon size={32} className="mx-auto mb-2 text-bmsa-text-light" />
              <p className="text-sm font-medium text-bmsa-text">
                {isUploading ? 'Uploading...' : 'Drop Excel file here or click to upload'}
              </p>
              <p className="text-xs text-bmsa-text-light mt-1">
                Expected columns: Name, Email (+ optional: Committee, Role, Status)
              </p>
            </div>
          </div>

          {/* Upload Errors */}
          {uploadErrors.length > 0 && (
            <div className="card p-4 mb-6 bg-amber-50 border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertIcon size={16} className="text-amber-700" />
                <h3 className="text-sm font-semibold text-amber-700">Upload Warnings</h3>
              </div>
              <ul className="text-xs text-amber-600 space-y-1">
                {uploadErrors.map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview */}
          {previewMembers && (
            <div className="card p-4 mb-6 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-blue-700">
                  Preview: {previewMembers.length} members to import
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => setPreviewMembers(null)} className="btn-secondary text-xs py-1.5">
                    Cancel
                  </button>
                  <button onClick={confirmUpload} className="btn-primary text-xs py-1.5 flex items-center gap-1">
                    <CheckIcon size={14} /> Confirm Import
                  </button>
                </div>
              </div>
              <div className="max-h-[200px] overflow-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1.5 px-2">Name</th>
                      <th className="text-left py-1.5 px-2">Email</th>
                      <th className="text-left py-1.5 px-2">Committee</th>
                      <th className="text-left py-1.5 px-2">Role</th>
                      <th className="text-left py-1.5 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewMembers.slice(0, 20).map((m, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-1.5 px-2">{m.name}</td>
                        <td className="py-1.5 px-2">{m.email}</td>
                        <td className="py-1.5 px-2">{m.committee}</td>
                        <td className="py-1.5 px-2">{m.role}</td>
                        <td className="py-1.5 px-2">{m.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewMembers.length > 20 && (
                  <p className="text-xs text-blue-600 p-2">...and {previewMembers.length - 20} more</p>
                )}
              </div>
            </div>
          )}

          {/* Member Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-bmsa-red border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <MemberTable members={members} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </main>

        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium toast-enter ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {toast.message}
          </div>
        )}

        <AddMemberModal 
          isOpen={showAddModal} 
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddMember}
        />
      </div>
    </AuthGuard>
  );
}
