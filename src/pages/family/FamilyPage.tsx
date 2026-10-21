import React, { useState } from 'react';
import { Plus, Phone, Trash2, X } from 'lucide-react';
import { useWedding } from '@/context/WeddingContext';

export const FamilyPage: React.FC = () => {
  const { familyMembers, addFamilyMember, deleteFamilyMember, wedding } = useWedding();

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [side, setSide] = useState<'Bride' | 'Groom'>('Bride');
  const [role, setRole] = useState('');
  const [contact, setContact] = useState('');

  const brideFamily = familyMembers.filter((m) => m.family_side === 'Bride');
  const groomFamily = familyMembers.filter((m) => m.family_side === 'Groom');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) return;

    addFamilyMember({
      wedding_id: 'wed-001',
      name,
      family_side: side,
      role,
      contact_info: contact || undefined,
    });

    setName('');
    setRole('');
    setContact('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-royal text-2xl sm:text-3xl font-bold text-stone-900">
            Family Workspace & Directory
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Coordinate trusted family coordinators, immediate relatives, and key roles.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-rose-800 hover:bg-rose-900 rounded-xl shadow-xs transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Family Member</span>
        </button>
      </div>

      {/* Two-Side Grid: Bride's Side & Groom's Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bride's Side Column */}
        <div className="bg-white rounded-xl border border-rose-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-rose-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-600 inline-block" />
              <h2 className="font-serif-royal text-xl font-bold text-rose-950">
                Bride's Family Side ({wedding?.bride_name || 'Bride'})
              </h2>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
              {brideFamily.length} Members
            </span>
          </div>

          <div className="space-y-3">
            {brideFamily.map((member) => (
              <div
                key={member.id}
                className="p-3.5 rounded-lg bg-rose-50/40 border border-rose-100 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-stone-900">{member.name}</p>
                  <p className="text-xs font-medium text-rose-800">{member.role}</p>
                  {member.contact_info && (
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                      <Phone className="w-3 h-3 text-stone-400" />
                      <span>{member.contact_info}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Remove ${member.name}?`)) deleteFamilyMember(member.id);
                  }}
                  className="p-1.5 text-stone-400 hover:text-rose-700 rounded-md hover:bg-rose-100/50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Groom's Side Column */}
        <div className="bg-white rounded-xl border border-amber-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-600 inline-block" />
              <h2 className="font-serif-royal text-xl font-bold text-amber-950">
                Groom's Family Side ({wedding?.groom_name || 'Groom'})
              </h2>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {groomFamily.length} Members
            </span>
          </div>

          <div className="space-y-3">
            {groomFamily.map((member) => (
              <div
                key={member.id}
                className="p-3.5 rounded-lg bg-amber-50/40 border border-amber-100 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-stone-900">{member.name}</p>
                  <p className="text-xs font-medium text-amber-800">{member.role}</p>
                  {member.contact_info && (
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                      <Phone className="w-3 h-3 text-stone-400" />
                      <span>{member.contact_info}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Remove ${member.name}?`)) deleteFamilyMember(member.id);
                  }}
                  className="p-1.5 text-stone-400 hover:text-rose-700 rounded-md hover:bg-rose-100/50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Family Member Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif-royal text-xl font-bold text-stone-900">Add Family Member</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Family Side *</label>
                  <select
                    value={side}
                    onChange={(e) => setSide(e.target.value as 'Bride' | 'Groom')}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
                  >
                    <option value="Bride">Bride's Side</option>
                    <option value="Groom">Groom's Side</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Role / Relationship *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sister of Bride"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-800 hover:bg-rose-900 rounded-lg shadow-sm"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
