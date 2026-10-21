import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Share2,
  Copy,
  Trash2,
  Edit2,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  X,
} from 'lucide-react';
import { useWedding } from '@/context/WeddingContext';
import type { Guest, InvitationStatus, RsvpStatus } from '@/types';

export const GuestsPage: React.FC = () => {
  const { guests, addGuest, updateGuest, deleteGuest, wedding } = useWedding();

  const [search, setSearch] = useState('');
  const [filterSide, setFilterSide] = useState<string>('All');
  const [filterRsvp, setFilterRsvp] = useState<string>('All');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [side, setSide] = useState<'Groom' | 'Bride' | 'Both'>('Both');
  const [inviteStatus, setInviteStatus] = useState<InvitationStatus>('Not Sent');
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>('Pending');
  const [attendees, setAttendees] = useState<number>(2);
  const [notes, setNotes] = useState('');

  const [copied, setCopied] = useState(false);

  // Statistics
  const stats = useMemo(() => {
    let totalInvited = 0;
    let confirmedAttendees = 0;
    let pendingCount = 0;
    let declinedCount = 0;

    guests.forEach((g) => {
      const count = g.attendees_count || 1;
      totalInvited += count;
      if (g.rsvp_status === 'Attending') confirmedAttendees += count;
      else if (g.rsvp_status === 'Pending') pendingCount += count;
      else declinedCount += count;
    });

    return { totalInvited, confirmedAttendees, pendingCount, declinedCount };
  }, [guests]);

  // Filtering
  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const matchSearch =
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        (g.contact_info && g.contact_info.toLowerCase().includes(search.toLowerCase()));
      const matchSide = filterSide === 'All' || g.family_side === filterSide;
      const matchRsvp = filterRsvp === 'All' || g.rsvp_status === filterRsvp;

      return matchSearch && matchSide && matchRsvp;
    });
  }, [guests, search, filterSide, filterRsvp]);

  const openAdd = () => {
    setEditingGuest(null);
    setName('');
    setContact('');
    setSide('Both');
    setInviteStatus('Not Sent');
    setRsvpStatus('Pending');
    setAttendees(2);
    setNotes('');
    setModalOpen(true);
  };

  const openEdit = (g: Guest) => {
    setEditingGuest(g);
    setName(g.name);
    setContact(g.contact_info || '');
    setSide(g.family_side);
    setInviteStatus(g.invitation_status);
    setRsvpStatus(g.rsvp_status);
    setAttendees(g.attendees_count || 1);
    setNotes(g.dietary_notes || '');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (editingGuest) {
      updateGuest(editingGuest.id, {
        name,
        contact_info: contact || undefined,
        family_side: side,
        invitation_status: inviteStatus,
        rsvp_status: rsvpStatus,
        attendees_count: attendees,
        dietary_notes: notes || undefined,
      });
    } else {
      addGuest({
        wedding_id: 'wed-001',
        name,
        contact_info: contact || undefined,
        family_side: side,
        invitation_status: inviteStatus,
        rsvp_status: rsvpStatus,
        attendees_count: attendees,
        dietary_notes: notes || undefined,
      });
    }

    setModalOpen(false);
  };

  const copyInviteLink = () => {
    if (!wedding) return;
    const url = `${window.location.origin}/invite/${wedding.invitation_slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    if (!wedding) return;
    const url = `${window.location.origin}/invite/${wedding.invitation_slug}`;
    const text = encodeURIComponent(
      `Heartiest greetings! We warmly invite you to the wedding celebrations of ${wedding.bride_name} & ${wedding.groom_name}.\nPlease view the itinerary & RSVP here: ${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-royal text-2xl sm:text-3xl font-bold text-stone-900">
            Guest List & RSVP Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Manage invitations, attendee headcount, dietary requirements, and digital RSVPs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyInviteLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-stone-500" />
            <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
          </button>

          <button
            onClick={shareWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-rose-800 hover:bg-rose-900 rounded-xl shadow-xs transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Guest</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <p className="text-[11px] font-semibold text-stone-500 uppercase">Total Guest Count</p>
          <div className="flex items-center justify-between mt-1">
            <p className="font-serif-royal text-2xl font-bold text-stone-900">{stats.totalInvited}</p>
            <Users className="w-5 h-5 text-stone-400" />
          </div>
          <p className="text-[11px] text-stone-500 mt-1">{guests.length} invitation entries</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <p className="text-[11px] font-semibold text-emerald-700 uppercase">Confirmed Attending</p>
          <div className="flex items-center justify-between mt-1">
            <p className="font-serif-royal text-2xl font-bold text-emerald-700">{stats.confirmedAttendees}</p>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Ready for catering plan</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <p className="text-[11px] font-semibold text-amber-700 uppercase">Pending RSVP</p>
          <div className="flex items-center justify-between mt-1">
            <p className="font-serif-royal text-2xl font-bold text-amber-700">{stats.pendingCount}</p>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Awaiting confirmation</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200">
          <p className="text-[11px] font-semibold text-stone-500 uppercase">Not Attending</p>
          <div className="flex items-center justify-between mt-1">
            <p className="font-serif-royal text-2xl font-bold text-stone-600">{stats.declinedCount}</p>
            <XCircle className="w-5 h-5 text-stone-400" />
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Sent polite regrets</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search guests by name or contact number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-700 bg-stone-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterSide}
            onChange={(e) => setFilterSide(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-stone-300 bg-white font-medium text-stone-700 focus:ring-2 focus:ring-rose-700"
          >
            <option value="All">All Sides</option>
            <option value="Both">Both / Mutual</option>
            <option value="Bride">Bride's Side</option>
            <option value="Groom">Groom's Side</option>
          </select>

          <select
            value={filterRsvp}
            onChange={(e) => setFilterRsvp(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-stone-300 bg-white font-medium text-stone-700 focus:ring-2 focus:ring-rose-700"
          >
            <option value="All">All RSVP Status</option>
            <option value="Attending">Attending</option>
            <option value="Pending">Pending</option>
            <option value="Not Attending">Not Attending</option>
          </select>
        </div>
      </div>

      {/* Guests Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-600 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4">Guest Details</th>
                <th className="py-3.5 px-4">Family Side</th>
                <th className="py-3.5 px-4 text-center">Invited Count</th>
                <th className="py-3.5 px-4 text-center">Invitation Status</th>
                <th className="py-3.5 px-4 text-center">RSVP Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredGuests.map((g) => (
                <tr key={g.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-stone-900">{g.name}</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {g.contact_info || 'No contact recorded'}
                      {g.dietary_notes ? ` • Note: ${g.dietary_notes}` : ''}
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-medium text-stone-700 text-xs">
                      {g.family_side}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-bold text-stone-900">
                    {g.attendees_count || 1}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        g.invitation_status === 'Shared'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : g.invitation_status === 'Viewed'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {g.invitation_status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        g.rsvp_status === 'Attending'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : g.rsvp_status === 'Pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {g.rsvp_status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(g)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-100"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove "${g.name}" from guest list?`)) deleteGuest(g.id);
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-700 rounded-md hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Guest Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif-royal text-xl font-bold text-stone-900">
                {editingGuest ? 'Edit Guest Details' : 'Add Wedding Guest'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Guest / Family Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mr. & Mrs. R.K. Mehra"
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
                    onChange={(e) => setSide(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
                  >
                    <option value="Both">Both / Mutual</option>
                    <option value="Bride">Bride's Side</option>
                    <option value="Groom">Groom's Side</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Attendees Count</label>
                  <input
                    type="number"
                    min="1"
                    value={attendees}
                    onChange={(e) => setAttendees(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Invitation Status</label>
                  <select
                    value={inviteStatus}
                    onChange={(e) => setInviteStatus(e.target.value as InvitationStatus)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
                  >
                    <option value="Not Sent">Not Sent</option>
                    <option value="Shared">Shared</option>
                    <option value="Viewed">Viewed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">RSVP Status</label>
                  <select
                    value={rsvpStatus}
                    onChange={(e) => setRsvpStatus(e.target.value as RsvpStatus)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Attending">Attending</option>
                    <option value="Not Attending">Not Attending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Phone / Email</label>
                <input
                  type="text"
                  placeholder="+91 98100 12345 or email@domain.com"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Dietary / Special Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Jain food requested, needs ground floor seating..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  Save Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
