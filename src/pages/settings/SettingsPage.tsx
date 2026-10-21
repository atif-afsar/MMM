import React, { useState } from 'react';
import {
  CheckCircle2,
  Database,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useWedding } from '@/context/WeddingContext';
import { useAuth } from '@/context/AuthContext';
import { formatINR } from '@/lib/utils';

export const SettingsPage: React.FC = () => {
  const { wedding, updateWedding } = useWedding();
  const { isConfigured } = useAuth();

  const [saved, setSaved] = useState(false);

  if (!wedding) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-serif-royal text-2xl sm:text-3xl font-bold text-stone-900">
          Wedding Settings & Configuration
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Manage wedding workspace parameters, target budget, and backend integrations.
        </p>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Wedding settings saved successfully!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-6">
        <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
          <h2 className="font-serif-royal text-xl font-bold text-stone-900">
            Wedding Parameters
          </h2>
          <span className="text-xs font-semibold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            Workspace: {wedding.id}
          </span>
        </div>

        {/* Budget Setting */}
        <div className="p-4 rounded-xl bg-stone-50/80 border border-stone-200 space-y-3">
          <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider">
            Total Wedding Target Budget (₹ INR) *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 font-serif-royal font-bold">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="10000"
                required
                value={wedding.total_budget}
                onChange={(e) => updateWedding({ total_budget: Number(e.target.value) })}
                className="w-full pl-8 pr-4 py-2.5 text-base font-bold text-stone-900 rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700 bg-white"
              />
            </div>
            <div className="text-xs text-stone-500">
              Formatted: <strong className="text-stone-900 font-serif-royal text-base">{formatINR(wedding.total_budget)}</strong>
              <p className="text-[11px] text-stone-400">Total expenditure limit for calculations</p>
            </div>
          </div>
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

        {/* Date & Time */}
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

        {/* Venue Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Main Venue Name *</label>
            <input
              type="text"
              required
              value={wedding.venue_name}
              onChange={(e) => updateWedding({ venue_name: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Full Venue Address *</label>
            <input
              type="text"
              required
              value={wedding.venue_address}
              onChange={(e) => updateWedding({ venue_address: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Google Maps URL</label>
            <input
              type="url"
              value={wedding.venue_map_url || ''}
              onChange={(e) => updateWedding({ venue_map_url: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={wedding.rsvp_enabled}
              onChange={(e) => updateWedding({ rsvp_enabled: e.target.checked })}
              className="w-4 h-4 rounded text-rose-800 focus:ring-rose-700"
            />
            <span className="text-xs font-semibold text-stone-800">
              Enable Public RSVP Submissions
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={wedding.invitation_published}
              onChange={(e) => updateWedding({ invitation_published: e.target.checked })}
              className="w-4 h-4 rounded text-rose-800 focus:ring-rose-700"
            />
            <span className="text-xs font-semibold text-stone-800">
              Publish Invitation to Public URL
            </span>
          </label>
        </div>

        <div className="flex justify-end pt-4 border-t border-stone-100">
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-bold text-white bg-rose-800 hover:bg-rose-900 rounded-xl shadow-xs"
          >
            Save All Settings
          </button>
        </div>
      </form>

      {/* Supabase Connection Setup Panel */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-stone-700" />
            <h3 className="font-serif-royal text-lg font-bold text-stone-900">
              Supabase Backend Status
            </h3>
          </div>
          {isConfigured ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Local Preview Mode
            </span>
          )}
        </div>

        <p className="text-xs text-stone-600 leading-relaxed">
          The database schema with Row Level Security (RLS) is located at <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-800 font-mono">supabase/schema.sql</code>.
          To connect your Supabase project:
        </p>

        <ol className="list-decimal list-inside text-xs text-stone-600 space-y-1.5 pl-2">
          <li>Create a free project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-rose-700 underline font-semibold">supabase.com</a>.</li>
          <li>Run the script in <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-800 font-mono">supabase/schema.sql</code> inside the Supabase SQL Editor.</li>
          <li>Copy your <strong>Project URL</strong> and <strong>Anon Key</strong> into a <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-800 font-mono">.env</code> file based on <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-800 font-mono">.env.example</code>.</li>
        </ol>
      </div>
    </div>
  );
};
