import React, { useState } from 'react';
import {
  Share2,
  Copy,
  ExternalLink,
  Eye,
  CheckCircle2,
  Calendar,
  MapPin,
  Heart,
} from 'lucide-react';
import { useWedding } from '@/context/WeddingContext';
import { formatDate } from '@/lib/utils';

export const InvitationEditorPage: React.FC = () => {
  const { wedding, updateWedding, events } = useWedding();

  const [copied, setCopied] = useState(false);
  const [saveAlert, setSaveAlert] = useState(false);

  if (!wedding) return null;

  const publicUrl = `${window.location.origin}/invite/${wedding.invitation_slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Heartfelt Invitation to the Wedding of ${wedding.bride_name} & ${wedding.groom_name}!\nView the ceremony details & RSVP here: ${publicUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveAlert(true);
    setTimeout(() => setSaveAlert(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-royal text-2xl sm:text-3xl font-bold text-stone-900">
            Digital Invitation Studio
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Customize your live wedding invitation and generate a unique shareable WhatsApp link.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700"
          >
            <Copy className="w-3.5 h-3.5 text-stone-500" />
            <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-900 shadow-xs"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Public Page</span>
          </a>
        </div>
      </div>

      {saveAlert && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Invitation settings updated and saved successfully!</span>
        </div>
      )}

      {/* Split Grid: Editor on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Form (7 cols) */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6"
        >
          {/* Status Bar */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-stone-900">Publication Status</p>
              <p className="text-[11px] text-stone-500">
                {wedding.invitation_published
                  ? 'Your invitation is live and publicly accessible via URL slug.'
                  : 'Currently in draft mode. Only visible to you.'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={wedding.invitation_published}
                onChange={(e) => updateWedding({ invitation_published: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-800"></div>
            </label>
          </div>

          {/* Couple Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Bride's Name *</label>
              <input
                type="text"
                required
                value={wedding.bride_name}
                onChange={(e) => updateWedding({ bride_name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Groom's Name *</label>
              <input
                type="text"
                required
                value={wedding.groom_name}
                onChange={(e) => updateWedding({ groom_name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
              />
            </div>
          </div>

          {/* Wedding Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Wedding Date *</label>
              <input
                type="date"
                required
                value={wedding.wedding_date}
                onChange={(e) => updateWedding({ wedding_date: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Auspicious Time</label>
              <input
                type="time"
                value={wedding.wedding_time || ''}
                onChange={(e) => updateWedding({ wedding_time: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
              />
            </div>
          </div>

          {/* Venue & Location */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Venue Name *</label>
              <input
                type="text"
                required
                placeholder="The Leela Palace"
                value={wedding.venue_name}
                onChange={(e) => updateWedding({ venue_name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Full Address *</label>
              <input
                type="text"
                required
                placeholder="Chanakyapuri, New Delhi"
                value={wedding.venue_address}
                onChange={(e) => updateWedding({ venue_address: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Google Maps Link</label>
              <input
                type="url"
                placeholder="https://maps.google.com/?q=..."
                value={wedding.venue_map_url || ''}
                onChange={(e) => updateWedding({ venue_map_url: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
              />
            </div>
          </div>

          {/* Welcome Message */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Welcome Invitation Message</label>
            <textarea
              rows={3}
              value={wedding.welcome_message || ''}
              onChange={(e) => updateWedding({ welcome_message: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
            />
          </div>

          {/* Slug & RSVP Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Unique URL Slug *</label>
              <div className="flex items-center">
                <span className="px-3 py-2 text-xs bg-stone-100 text-stone-500 rounded-l-lg border border-r-0 border-stone-300">
                  /invite/
                </span>
                <input
                  type="text"
                  required
                  value={wedding.invitation_slug}
                  onChange={(e) =>
                    updateWedding({
                      invitation_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-r-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
                />
              </div>
            </div>

            <div className="pt-5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wedding.rsvp_enabled}
                  onChange={(e) => updateWedding({ rsvp_enabled: e.target.checked })}
                  className="w-4 h-4 rounded text-rose-800 focus:ring-rose-700"
                />
                <span className="text-xs font-semibold text-stone-700">
                  Enable Guest RSVP Form
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-stone-100">
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-rose-800 hover:bg-rose-900 rounded-xl shadow-xs"
            >
              Save Invitation Details
            </button>
          </div>
        </form>

        {/* Live Mobile Device Mockup Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-stone-500">
            <Eye className="w-4 h-4" />
            <span>Live Mobile Preview</span>
          </div>

          {/* Smartphone Frame */}
          <div className="w-full max-w-[340px] rounded-[2.5rem] p-3 bg-stone-900 shadow-2xl border-4 border-stone-800">
            {/* Screen Inner */}
            <div className="rounded-[2rem] overflow-hidden bg-gradient-to-b from-[#faf5ee] via-[#fffbf5] to-[#f5efe6] text-stone-900 min-h-[580px] max-h-[620px] overflow-y-auto p-4 border border-amber-200/50 space-y-4 text-center">
              {/* Floral top ornament */}
              <div className="text-amber-700 text-xs tracking-widest font-serif-royal">
                ✧ ॐ श्री गणेशाय नमः ✧
              </div>

              {/* Royal Seal */}
              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-rose-800 to-amber-700 flex items-center justify-center text-white shadow-md">
                <Heart className="w-7 h-7 text-amber-200" />
              </div>

              {/* Couple Names */}
              <div>
                <p className="text-[10px] tracking-widest uppercase font-semibold text-rose-800">
                  Together With Their Families
                </p>
                <h2 className="font-serif-royal text-2xl font-bold text-stone-900 mt-1">
                  {wedding.bride_name}
                </h2>
                <p className="font-serif-royal text-base text-amber-700 italic font-semibold">&</p>
                <h2 className="font-serif-royal text-2xl font-bold text-stone-900">
                  {wedding.groom_name}
                </h2>
              </div>

              {/* Welcome text */}
              <p className="text-[11px] text-stone-600 italic px-2">
                "{wedding.welcome_message || 'Invite you to celebrate their wedding'}"
              </p>

              {/* Date & Venue Box */}
              <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-amber-200/70 text-xs space-y-2">
                <div className="flex items-center justify-center gap-1.5 font-bold text-rose-900">
                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  <span>{formatDate(wedding.wedding_date)}</span>
                  {wedding.wedding_time && <span>• {wedding.wedding_time}</span>}
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-600">
                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{wedding.venue_name}</span>
                </div>
              </div>

              {/* Ceremony snippet */}
              <div className="pt-2 text-left space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 text-center">
                  Wedding Ceremonies
                </p>
                {events.slice(0, 3).map((evt) => (
                  <div key={evt.id} className="p-2 rounded-lg bg-white/70 border border-stone-200/60 text-[11px]">
                    <p className="font-bold text-stone-900">{evt.name}</p>
                    <p className="text-[10px] text-stone-500">{formatDate(evt.event_date)} {evt.start_time ? `• ${evt.start_time}` : ''}</p>
                  </div>
                ))}
              </div>

              {/* RSVP Mock Button */}
              {wedding.rsvp_enabled && (
                <div className="pt-2">
                  <div className="w-full py-2 rounded-lg bg-rose-800 text-white text-xs font-bold shadow-xs">
                    RSVP to Attend
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
