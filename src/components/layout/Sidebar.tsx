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
  ExternalLink,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useWedding } from '@/context/WeddingContext';
import { useAuth } from '@/context/AuthContext';
import { getDaysRemaining } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const { wedding } = useWedding();
  const { user, signOut } = useAuth();

  const daysLeft = wedding ? getDaysRemaining(wedding.wedding_date) : 0;

  const navItems = [
    { label: 'Overview', path: '/', icon: LayoutDashboard },
    { label: 'Expenses', path: '/expenses', icon: Wallet },
    { label: 'Events & Tasks', path: '/events-tasks', icon: CalendarDays },
    { label: 'Family Space', path: '/family', icon: Users },
    { label: 'Guests', path: '/guests', icon: UserCheck },
    { label: 'Invitation', path: '/invitation-editor', icon: Mail },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-[#f4f4f0] border-r border-[#e8e8e5] min-h-screen shrink-0 shadow-[0_1px_8px_rgba(0,0,0,0.04)] justify-between py-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0c2720] to-[#233d35] flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-5 h-5 text-[#fae0a9]" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline text-lg font-bold text-[#0c2720] tracking-tight leading-tight">
              Make My Marriage
            </span>
            <span className="text-[10px] text-[#58615a] uppercase tracking-widest font-bold">
              Wedding Suite
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#dce5dc] text-[#0c2720]'
                      : 'text-[#424845] hover:bg-[#e8e8e5] hover:text-[#1a1c1a]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Live Invitation Link */}
        {wedding && (
          <div className="pt-2 px-1">
            <a
              href={`/invite/${wedding.invitation_slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#0c2720] bg-white hover:bg-[#e8e8e5] border border-[#e8e8e5] shadow-xs transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#49645b] animate-pulse" />
                <span>Live Digital Invite</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#58615a]" />
            </a>
          </div>
        )}
      </div>

      {/* Bottom Profile & Couple Pill (Stitch Style) */}
      <div className="bg-white rounded-xl p-3.5 shadow-sm border border-[#e8e8e5] flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#0c2720] text-[#fae0a9] font-bold flex items-center justify-center text-xs shrink-0">
              {wedding ? wedding.bride_name[0] + wedding.groom_name[0] : 'MM'}
            </div>
            <div className="flex flex-col truncate">
              <span className="font-headline text-xs font-bold text-[#1a1c1a] truncate">
                {wedding ? `${wedding.bride_name} & ${wedding.groom_name}` : 'Aarav & Aisha'}
              </span>
              <span className="text-[10px] text-[#58615a] truncate">
                {wedding?.wedding_date || 'Nov 24, 2026'}
              </span>
            </div>
          </div>

          <span className="text-[10px] bg-[#fae0a9] text-[#56441c] px-2 py-0.5 rounded-full font-bold shrink-0">
            {daysLeft > 0 ? `${daysLeft}d left` : 'Today!'}
          </span>
        </div>

        <div className="pt-2 border-t border-[#f4f4f0] flex items-center justify-between text-[11px] text-[#58615a]">
          <span className="truncate">{user?.email || 'Wedding Admin'}</span>
          <button
            onClick={() => signOut()}
            title="Sign Out"
            className="p-1 text-[#58615a] hover:text-[#ba1a1a] rounded transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
