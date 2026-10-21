import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Share2,
  CheckCircle2,
  Heart,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useWedding } from '@/context/WeddingContext';
import { formatDate, getDaysRemaining } from '@/lib/utils';

export const PublicInvitationPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { wedding, events, submitPublicRsvp } = useWedding();

  // RSVP Form State
  const [guestName, setGuestName] = useState('');
  const [attendees, setAttendees] = useState(2);
  const [response, setResponse] = useState<'Attending' | 'Not Attending'>('Attending');
  const [notes, setNotes] = useState('');
  const [rsvpSubmitted, setRsvpSubmitted] = useState(false);

  // Validate slug and published status
  if (!wedding || wedding.invitation_slug !== slug || !wedding.invitation_published) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-800 mb-4">
          <Heart className="w-8 h-8" />
        </div>
        <h1 className="font-serif-royal text-2xl font-bold text-stone-900">
          Invitation Not Available
        </h1>
        <p className="text-xs text-stone-500 mt-2 max-w-sm">
          This wedding invitation is either currently unpublished or the link is incorrect. Please check with the wedding hosts.
        </p>
        <Link
          to="/"
          className="mt-6 px-4 py-2 text-xs font-bold text-rose-900 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200"
        >
          Return to Workspace
        </Link>
      </div>
    );
  }

  const daysLeft = getDaysRemaining(wedding.wedding_date);

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    submitPublicRsvp(guestName.trim(), attendees, response, notes.trim() || undefined);
    setRsvpSubmitted(true);

    if (response === 'Attending') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#80182a', '#c59b27', '#f7e7a9', '#e11d48'],
      });
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Heartfelt Invitation to the Wedding of ${wedding.bride_name} & ${wedding.groom_name}!\nView the itinerary & RSVP here: ${window.location.href}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#faf6f0] text-stone-900 selection:bg-rose-200 selection:text-rose-950 font-sans">
      {/* Decorative Traditional Indian Wedding Top Header Banner */}
      <div className="bg-[#80182a] text-amber-200 py-3 text-center text-xs tracking-widest uppercase font-semibold border-b border-amber-500/30">
        <span>✧ ॐ श्री गणेशाय नमः ✧</span>
      </div>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-10">
        {/* Royal Crest & Hero Invitation Header */}
        <section className="text-center space-y-6 pt-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-[#80182a] to-[#a3243a] p-1 shadow-xl flex items-center justify-center">
            <div className="w-full h-full rounded-full border border-amber-300/40 flex items-center justify-center text-amber-200">
              <Heart className="w-9 h-9 fill-amber-300/20" />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs sm:text-sm font-semibold tracking-widest text-[#80182a] uppercase">
              Cordially Invite You to Celebrate The Wedding Of
            </p>
            <h1 className="font-serif-royal text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 leading-tight">
              {wedding.bride_name}
            </h1>
            <p className="font-serif-royal text-2xl sm:text-3xl text-amber-800 italic font-medium my-1">
              &
            </p>
            <h1 className="font-serif-royal text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 leading-tight">
              {wedding.groom_name}
            </h1>
          </div>

          {wedding.welcome_message && (
            <p className="font-serif-royal text-base sm:text-lg text-stone-700 italic max-w-lg mx-auto leading-relaxed px-4">
              "{wedding.welcome_message}"
            </p>
          )}

          {/* Countdown Pill */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/90 border border-amber-300/70 shadow-xs text-xs font-semibold text-stone-800">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>
              {daysLeft > 0 ? `${daysLeft} Days to the Auspicious Day` : 'The Auspicious Wedding Day!'}
            </span>
          </div>
        </section>

        {/* Date, Time & Venue Card */}
        <section className="bg-white/90 backdrop-blur-xs rounded-2xl border border-amber-200 shadow-sm p-6 sm:p-8 space-y-6 text-center">
          <div className="space-y-1">
            <span className="text-[11px] font-bold tracking-widest uppercase text-amber-800">
              When & Where
            </span>
            <h2 className="font-serif-royal text-2xl sm:text-3xl font-bold text-stone-900">
              The Wedding Celebration
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 flex flex-col items-center justify-center space-y-1">
              <Calendar className="w-6 h-6 text-[#80182a] mb-1" />
              <p className="font-serif-royal text-lg font-bold text-stone-900">
                {formatDate(wedding.wedding_date)}
              </p>
              {wedding.wedding_time && (
                <div className="flex items-center gap-1 text-xs text-stone-600">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Auspicious Time: {wedding.wedding_time}</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 flex flex-col items-center justify-center space-y-1">
              <MapPin className="w-6 h-6 text-[#80182a] mb-1" />
              <p className="font-serif-royal text-lg font-bold text-stone-900 truncate max-w-full">
                {wedding.venue_name}
              </p>
              <p className="text-xs text-stone-600 line-clamp-2 px-2">
                {wedding.venue_address}
              </p>
            </div>
          </div>

          {wedding.venue_map_url && (
            <a
              href={wedding.venue_map_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-amber-950 bg-amber-200/80 hover:bg-amber-300 rounded-lg transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Get Driving Directions (Google Maps)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </section>

        {/* Ceremonies & Events Itinerary */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold tracking-widest uppercase text-amber-800">
              Program Details
            </span>
            <h2 className="font-serif-royal text-2xl sm:text-3xl font-bold text-stone-900">
              Ceremonies & Itinerary
            </h2>
          </div>

          <div className="space-y-3">
            {events.map((evt, idx) => (
              <div
                key={evt.id}
                className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 flex items-start gap-4 shadow-xs"
              >
                <div className="text-center px-3 py-1.5 rounded-lg bg-[#80182a] text-white shrink-0 min-w-12">
                  <p className="text-[10px] font-bold uppercase leading-none">
                    {new Date(evt.event_date).toLocaleString('en-US', { month: 'short' })}
                  </p>
                  <p className="font-serif-royal text-xl font-bold leading-tight">
                    {new Date(evt.event_date).getDate()}
                  </p>
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
                    Ceremony {idx + 1}
                  </span>
                  <h3 className="font-serif-royal text-lg font-bold text-stone-900 mt-1">
                    {evt.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1">
                    {evt.start_time && (
                      <span className="flex items-center gap-1 text-[#80182a] font-semibold">
                        <Clock className="w-3 h-3" />
                        {evt.start_time}
                      </span>
                    )}
                    {evt.venue && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {evt.venue}
                      </span>
                    )}
                  </div>
                  {evt.notes && (
                    <p className="text-xs text-stone-600 italic mt-2 pt-2 border-t border-stone-100">
                      "{evt.notes}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Public RSVP Section */}
        {wedding.rsvp_enabled && (
          <section className="bg-white rounded-2xl border border-amber-300 shadow-md p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-1">
              <span className="text-[11px] font-bold tracking-widest uppercase text-amber-800">
                Honor Us With Your Presence
              </span>
              <h2 className="font-serif-royal text-2xl sm:text-3xl font-bold text-stone-900">
                Kindly Respond / RSVP
              </h2>
              <p className="text-xs text-stone-500">
                Please let us know if you will be able to celebrate with us.
              </p>
            </div>

            {rsvpSubmitted ? (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-serif-royal text-xl font-bold text-emerald-900">
                  Thank You, {guestName}!
                </h3>
                <p className="text-xs text-emerald-800">
                  Your response ({response}) has been recorded with the couple and their family.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="space-y-4 max-w-md mx-auto">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh & Sunita Verma"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-[#80182a]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Will You Attend?
                    </label>
                    <select
                      value={response}
                      onChange={(e) => setResponse(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-[#80182a]"
                    >
                      <option value="Attending">Joyfully Accept</option>
                      <option value="Not Attending">Regretfully Decline</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Number of Guests
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={attendees}
                      onChange={(e) => setAttendees(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-[#80182a]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Dietary Wishes / Message for the Couple
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Pure Vegetarian, congratulations from the Bangalore family!"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-[#80182a]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 text-sm font-bold text-white bg-[#80182a] hover:bg-[#681020] rounded-xl shadow-md transition-transform active:scale-95"
                >
                  Confirm RSVP
                </button>
              </form>
            )}
          </section>
        )}

        {/* Share Invitation Bar */}
        <section className="text-center pt-4 pb-8 space-y-3">
          <button
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Invitation via WhatsApp</span>
          </button>
          <p className="text-[11px] text-stone-400">
            Make My Marriage • Private Digital Wedding Invitation
          </p>
        </section>
      </main>
    </div>
  );
};
