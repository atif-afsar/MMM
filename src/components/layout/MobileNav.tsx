import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  CalendarDays,
  Users,
  UserCheck,
  Mail,
  Settings,
  MessageSquareText,
  X,
  Sparkles,
} from 'lucide-react';
import { useWedding } from '@/context/WeddingContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { wedding } = useWedding();

  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Expenses', path: '/expenses', icon: Wallet },
    { label: 'Events & Tasks', path: '/events-tasks', icon: CalendarDays },
    { label: 'Family Space', path: '/family', icon: Users },
    { label: 'Discussions & Notes', path: '/discussions', icon: MessageSquareText },
    { label: 'Guests & RSVP', path: '/guests', icon: UserCheck },
    { label: 'Invitation Studio', path: '/invitation-editor', icon: Mail },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0c2720]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 bg-[#f9f9f6] shadow-2xl flex flex-col z-10 border-r border-[#e8e8e5]">
        <div className="p-4 border-b border-[#e8e8e5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0c2720] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-[#fae0a9]" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-[#0c2720] text-sm">Make My Marriage</h2>
              <p className="text-[10px] text-[#58615a] uppercase tracking-wider font-semibold">Wedding Suite</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#58615a] hover:text-[#1a1c1a] rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {wedding && (
          <div className="p-3 mx-3 mt-3 rounded-xl bg-white border border-[#e8e8e5] text-xs">
            <span className="font-bold text-[#0c2720] uppercase tracking-wider text-[10px]">
              Active Wedding
            </span>
            <p className="font-headline font-bold text-[#1a1c1a] text-sm mt-0.5">
              {wedding.bride_name} &amp; {wedding.groom_name}
            </p>
          </div>
        )}

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#dce5dc] text-[#0c2720]'
                      : 'text-[#424845] hover:text-[#1a1c1a] hover:bg-[#e8e8e5]'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export const MobileBottomBar: React.FC<{ onOpenQuickExpense?: () => void }> = ({ onOpenQuickExpense }) => {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-[#f9f9f6]/95 backdrop-blur-md border-t border-[#e8e8e5] px-2 py-1.5 flex items-center justify-around z-30">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 p-1 text-[11px] font-semibold transition-colors ${
            isActive ? 'text-[#0c2720]' : 'text-[#58615a] hover:text-[#1a1c1a]'
          }`
        }
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Overview</span>
      </NavLink>

      <NavLink
        to="/expenses"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 p-1 text-[11px] font-semibold transition-colors ${
            isActive ? 'text-[#0c2720]' : 'text-[#58615a] hover:text-[#1a1c1a]'
          }`
        }
      >
        <Wallet className="w-5 h-5" />
        <span>Expenses</span>
      </NavLink>

      {/* Floating Center Action */}
      {onOpenQuickExpense && (
        <button
          onClick={onOpenQuickExpense}
          className="flex flex-col items-center -mt-5 bg-[#0c2720] text-white rounded-full p-3 shadow-lg active:scale-95 transition-transform"
          aria-label="Quick Add Expense"
        >
          <span className="text-xl font-bold leading-none text-[#fae0a9]">+</span>
        </button>
      )}

      <NavLink
        to="/events-tasks"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 p-1 text-[11px] font-semibold transition-colors ${
            isActive ? 'text-[#0c2720]' : 'text-[#58615a] hover:text-[#1a1c1a]'
          }`
        }
      >
        <CalendarDays className="w-5 h-5" />
        <span>Events</span>
      </NavLink>

      <NavLink
        to="/guests"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 p-1 text-[11px] font-semibold transition-colors ${
            isActive ? 'text-[#0c2720]' : 'text-[#58615a] hover:text-[#1a1c1a]'
          }`
        }
      >
        <UserCheck className="w-5 h-5" />
        <span>Guests</span>
      </NavLink>
    </nav>
  );
};
