import React, { useState } from 'react';
import { MessageSquareText, Megaphone, CheckCircle2, Send } from 'lucide-react';
import { useWedding } from '@/context/WeddingContext';
import { formatDateTime } from '@/lib/utils';
import type { DiscussionType } from '@/types';

export const DiscussionsPage: React.FC = () => {
  const { discussions, addDiscussion, updateDiscussionStatus } = useWedding();

  const [type, setType] = useState<DiscussionType>('Announcement');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('Wedding Organizer');

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    addDiscussion({
      wedding_id: 'wed-001',
      author_name: authorName || 'Wedding Organizer',
      title: title.trim() || undefined,
      content: content.trim(),
      entry_type: type,
      status: type === 'Decision' ? 'Open' : undefined,
    });

    setTitle('');
    setContent('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-serif-royal text-2xl sm:text-3xl font-bold text-stone-900">
          Family Discussions & Key Decisions
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Share broadcast announcements, resolve important decisions, and keep family notes centralized.
        </p>
      </div>

      {/* Composer Card */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <span className="text-xs font-semibold text-stone-700">Post an Entry:</span>
          <div className="flex items-center gap-1.5">
            {(['Announcement', 'Discussion', 'Decision'] as DiscussionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  type === t
                    ? t === 'Announcement'
                      ? 'bg-rose-100 text-rose-800'
                      : t === 'Decision'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-stone-200 text-stone-900'
                    : 'text-stone-500 hover:bg-stone-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handlePost} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Title / Topic (e.g. Sangeet dress theme)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700 bg-stone-50/50"
            />
            <input
              type="text"
              placeholder="Your Name (Author)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700 bg-stone-50/50"
            />
          </div>

          <textarea
            required
            rows={3}
            placeholder={
              type === 'Decision'
                ? 'Describe the proposal or decision (e.g. Selecting between 2 catering packages)...'
                : 'Share details or updates for both families...'
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:ring-2 focus:ring-rose-700 bg-stone-50/50"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-rose-800 hover:bg-rose-900 rounded-lg shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post {type}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {discussions.map((entry) => (
          <div
            key={entry.id}
            className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={`p-2 rounded-lg ${
                    entry.entry_type === 'Announcement'
                      ? 'bg-rose-100 text-rose-800'
                      : entry.entry_type === 'Decision'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {entry.entry_type === 'Announcement' ? (
                    <Megaphone className="w-4 h-4" />
                  ) : entry.entry_type === 'Decision' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <MessageSquareText className="w-4 h-4" />
                  )}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900">{entry.author_name}</span>
                    <span className="text-[10px] text-stone-400">•</span>
                    <span className="text-[11px] text-stone-500">{formatDateTime(entry.created_at)}</span>
                  </div>
                  {entry.title && (
                    <h3 className="font-serif-royal text-base font-bold text-stone-900 mt-0.5">
                      {entry.title}
                    </h3>
                  )}
                </div>
              </div>

              {entry.entry_type === 'Decision' && (
                <button
                  onClick={() =>
                    updateDiscussionStatus(
                      entry.id,
                      entry.status === 'Decided' ? 'Open' : 'Decided'
                    )
                  }
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                    entry.status === 'Decided'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  {entry.status === 'Decided' ? '✓ Decided' : '○ Open Decision'}
                </button>
              )}
            </div>

            <p className="text-xs sm:text-sm text-stone-700 whitespace-pre-wrap leading-relaxed pl-10">
              {entry.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
