import React from 'react';
import { Menu, Share2, Sparkles, Plus } from 'lucide-react';
import { useWedding } from '@/context/WeddingContext';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  onOpenQuickExpense?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu, onOpenQuickExpense }) => {
  const { wedding } = useWedding();

  const handleShareWhatsApp = () => {
    if (!wedding) return;
    const url = `${window.location.origin}/invite/${wedding.invitation_slug}`;
    const text = encodeURIComponent(
      `Join us in celebrating the wedding of ${wedding.bride_name} & ${wedding.groom_name}!\nView the itinerary & RSVP here: ${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#f9f9f6]/90 backdrop-blur-xl border-b border-[#e8e8e5] px-4 sm:px-8 flex items-center justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      {/* Left section: mobile hamburger & title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-[#424845] hover:text-[#1a1c1a] hover:bg-[#e8e8e5] rounded-xl transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <span className="font-headline text-lg font-bold text-[#0c2720] tracking-tight hidden sm:inline">
            Make My Marriage
          </span>
          {wedding && (
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#dce5dc] text-[#0c2720] text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#49645b]"></span>
              {wedding.bride_name} & {wedding.groom_name}
            </span>
          )}
        </div>
      </div>

      {/* Right section: Quick actions */}
      <div className="flex items-center gap-3">
        {/* WhatsApp Share */}
        {wedding?.invitation_published && (
          <button
            onClick={handleShareWhatsApp}
            title="Share invitation via WhatsApp"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#0c2720] bg-[#dce5dc] hover:bg-[#c9d8c9] transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
        )}

        {/* Live Invite button */}
        {wedding && (
          <a
            href={`/invite/${wedding.invitation_slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#56441c] bg-[#fae0a9] hover:bg-[#f5d796] transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Invite</span>
          </a>
        )}

        {/* Primary CTA: + Add Expense */}
        {onOpenQuickExpense && (
          <button
            onClick={onOpenQuickExpense}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0c2720] text-white hover:bg-[#233d35] shadow-sm transition-all active:scale-95 group text-xs font-semibold tracking-wide"
          >
            <span className="w-4 h-4 rounded-full bg-[#fae0a9]/30 flex items-center justify-center text-[#fae0a9]">
              <Plus className="w-3 h-3" />
            </span>
            <span>+ Add Expense</span>
          </button>
        )}
      </div>
    </header>
  );
};
