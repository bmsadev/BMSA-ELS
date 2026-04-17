'use client';

import { useState, useMemo } from 'react';
import { Member, AUDIENCE_GROUPS } from '@/types';
import { InboxIcon, TrashIcon } from './Icons';

interface Props {
  members: Member[];
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
}

export default function MemberTable({ members, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filterCommittee, setFilterCommittee] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Member | null>(null);

  const committees = useMemo(() => {
    const set = new Set([
      ...AUDIENCE_GROUPS.filter(g => g !== 'ALL' && g !== 'MEMBERS_ONLY' && g !== 'TO'),
      ...members.map(m => m.committee)
    ]);
    return Array.from(set).sort();
  }, [members]);

  const roles = useMemo(() => {
    const set = new Set(members.map(m => m.role).filter(Boolean));
    set.add('TO');
    set.add('Member');
    return Array.from(set).sort();
  }, [members]);

  const filtered = useMemo(() => {
    return members.filter(m => {
      const matchesSearch = !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase());
      const matchesCommittee = !filterCommittee || m.committee === filterCommittee;
      const matchesRole = !filterRole || m.role === filterRole;
      const matchesStatus = !filterStatus || m.status === filterStatus;
      return matchesSearch && matchesCommittee && matchesRole && matchesStatus;
    });
  }, [members, search, filterCommittee, filterRole, filterStatus]);

  const startEdit = (member: Member) => {
    setEditingId(member.id);
    setEditForm({ ...member });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (editForm) {
      onEdit(editForm);
      cancelEdit();
    }
  };

  const confirmDelete = (id: string, name: string) => {
    if (window.confirm(`Remove ${name} from the member list?`)) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field"
          />
        </div>
        <select
          value={filterCommittee}
          onChange={e => setFilterCommittee(e.target.value)}
          className="input-field w-auto min-w-[150px]"
        >
          <option value="">All Committees</option>
          {committees.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          className="input-field w-auto min-w-[130px]"
        >
          <option value="">All Roles</option>
          {roles.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="input-field w-auto min-w-[130px]"
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Results count */}
      <p className="text-xs text-bmsa-text-light">
        Showing {filtered.length} of {members.length} members
      </p>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bmsa-gray-200 bg-bmsa-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-bmsa-text">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-bmsa-text">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-bmsa-text">Committee</th>
                <th className="text-left py-3 px-4 font-semibold text-bmsa-text">Role</th>
                <th className="text-left py-3 px-4 font-semibold text-bmsa-text">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-bmsa-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-bmsa-text-light">
                    <InboxIcon size={32} className="mx-auto mb-2 opacity-30" />
                    <p>No members found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b border-bmsa-gray-100 hover:bg-bmsa-gray-50 transition-colors"
                  >
                    {editingId === member.id && editForm ? (
                      <>
                        <td className="py-2 px-4">
                          <input
                            className="input-field text-sm py-1.5"
                            value={editForm.name}
                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input
                            className="input-field text-sm py-1.5"
                            value={editForm.email}
                            onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input
                            className="input-field text-sm py-1.5"
                            value={editForm.committee}
                            onChange={e => setEditForm({ ...editForm, committee: e.target.value.toUpperCase() })}
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input
                            className="input-field text-sm py-1.5"
                            value={editForm.role}
                            onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                          />
                        </td>
                        <td className="py-2 px-4">
                          <select
                            className="input-field text-sm py-1.5"
                            value={editForm.status}
                            onChange={e => setEditForm({ ...editForm, status: e.target.value as 'Active' | 'Inactive' })}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </td>
                        <td className="py-2 px-4 text-right">
                          <div className="flex gap-1 justify-end">
                            <button onClick={saveEdit} className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 transition-colors">
                              Save
                            </button>
                            <button onClick={cancelEdit} className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-300 transition-colors">
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4 font-medium text-bmsa-text">{member.name}</td>
                        <td className="py-3 px-4 text-bmsa-text-light">{member.email}</td>
                        <td className="py-3 px-4">
                          <span className="badge bg-bmsa-red/10 text-bmsa-red">
                            {member.committee}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-bmsa-text-light">{member.role}</td>
                        <td className="py-3 px-4">
                          <span className={member.status === 'Active' ? 'badge badge-active' : 'badge badge-inactive'}>
                            {member.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => startEdit(member)}
                              className="px-3 py-1.5 text-xs font-medium text-bmsa-text-light hover:text-bmsa-red hover:bg-bmsa-red/5 rounded-lg transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => confirmDelete(member.id, member.name)}
                              className="p-1.5 bg-red-500 text-white hover:bg-red-600 rounded-md transition-colors shadow-sm ml-2 inline-flex"
                              title="Remove"
                            >
                              <TrashIcon size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
