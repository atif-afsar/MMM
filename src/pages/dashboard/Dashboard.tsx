import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Calendar,
  MapPin,
  Search,
  Plus,
  ArrowRight,
  Lightbulb,
  FileText,
  Eye,
  MoreHorizontal,
  Building2,
  Shirt,
  UtensilsCrossed,
  Camera,
  Flower2,
} from 'lucide-react';
import { useWedding } from '@/context/WeddingContext';
import { formatINR, formatDate, derivePaymentStatus, getDaysRemaining } from '@/lib/utils';
import type { ExpenseCategory } from '@/types';

export const Dashboard: React.FC = () => {
  const { wedding, expenses, events, budgetStats, addExpense } = useWedding();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [quickAddModal, setQuickAddModal] = useState(false);

  // Quick Add State
  const [modalTitle, setModalTitle] = useState('');
  const [modalCat, setModalCat] = useState<ExpenseCategory>('Venue');
  const [modalTotal, setModalTotal] = useState<number | ''>('');
  const [modalPaid, setModalPaid] = useState<number | ''>('');
  const [modalSide, setModalSide] = useState<'Shared' | 'Bride' | 'Groom'>('Shared');

  const daysLeft = wedding ? getDaysRemaining(wedding.wedding_date) : 0;

  // Filtered recent expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.payee_name && e.payee_name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = selectedCategory === 'all' || e.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [expenses, searchQuery, selectedCategory]);

  // Compute category breakdown
  const categoryBreakdown = useMemo(() => {
    const cats: { [key in ExpenseCategory]?: { total: number; paid: number } } = {};
    expenses.forEach((e) => {
      if (!cats[e.category]) cats[e.category] = { total: 0, paid: 0 };
      cats[e.category]!.total += e.total_amount;
      cats[e.category]!.paid += e.amount_paid;
    });
    return Object.entries(cats).map(([category, data]) => ({
      category: category as ExpenseCategory,
      total: data.total,
      paid: data.paid,
      remaining: Math.max(0, data.total - data.paid),
      percentPaid: data.total > 0 ? Math.min(100, Math.round((data.paid / data.total) * 100)) : 0,
    }));
  }, [expenses]);

  const handleCreateQuickExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle || modalTotal === '') return;

    addExpense({
      wedding_id: wedding?.id || 'wed-001',
      title: modalTitle,
      category: modalCat,
      total_amount: Number(modalTotal),
      amount_paid: Number(modalPaid || 0),
      expense_date: new Date().toISOString().split('T')[0],
      paying_side: modalSide,
    });

    setModalTitle('');
    setModalTotal('');
    setModalPaid('');
    setQuickAddModal(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Venue': return <Building2 className="w-4 h-4 text-[#0c2720]" />;
      case 'Clothing': return <Shirt className="w-4 h-4 text-[#0c2720]" />;
      case 'Catering': return <UtensilsCrossed className="w-4 h-4 text-[#0c2720]" />;
      case 'Photography': return <Camera className="w-4 h-4 text-[#0c2720]" />;
      case 'Decoration': return <Flower2 className="w-4 h-4 text-[#0c2720]" />;
      default: return <Wallet className="w-4 h-4 text-[#0c2720]" />;
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      {/* 1. Top Header Banner (Exact Stitch Style) */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div className="flex flex-col gap-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8e8e5] text-[#424845] text-xs font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#49645b]" />
              {wedding ? `${wedding.bride_name} & ${wedding.groom_name}` : 'Aarav & Aisha'}
            </span>
            <span className="text-[#58615a] text-xs">•</span>
            <span className="text-[#58615a] text-xs font-medium">
              {wedding?.wedding_date ? formatDate(wedding.wedding_date) : 'Nov 24, 2026'}
            </span>
            <span className="text-[#58615a] text-xs">•</span>
            <span className="text-[#58615a] text-xs font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#58615a]" />
              {wedding?.venue_name || 'Udaipur Palace'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#fae0a9] text-[#56441c] text-xs font-bold shadow-xs">
              <Clock className="w-3 h-3" />
              {daysLeft > 0 ? `${daysLeft} Days to Go` : 'Wedding Day!'}
            </span>
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0c2720] tracking-tight leading-tight mt-1">
            Your wedding, beautifully organized.
          </h1>
          <p className="text-base sm:text-lg text-[#58615a]">
            Everything for your big day, orchestrated with quiet luxury and clarity.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/invitation-editor"
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white text-[#1a1c1a] border border-[#e8e8e5] shadow-xs hover:bg-[#f4f4f0] transition-all text-xs font-semibold"
          >
            <Eye className="w-4 h-4 text-[#58615a]" />
            <span>Preview Invite</span>
          </Link>

          <button
            onClick={() => setQuickAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0c2720] text-white hover:bg-[#233d35] shadow-md transition-all active:scale-95 group text-xs font-semibold tracking-wide"
            type="button"
          >
            <span className="w-5 h-5 rounded-full bg-[#fae0a9]/30 flex items-center justify-center text-[#fae0a9]">
              <Plus className="w-3.5 h-3.5" />
            </span>
            <span>+ Add Expense</span>
          </button>
        </div>
      </section>

      {/* 2. Budget Summary (4 Visually Balanced Metric Sections from Stitch) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Allocation */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e8e8e5] flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#58615a] uppercase tracking-wider">
              Total Allocation
            </span>
            <div className="w-8 h-8 rounded-full bg-[#f4f4f0] flex items-center justify-center text-[#0c2720]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-stat-currency text-2xl sm:text-3xl font-bold text-[#1a1c1a] tracking-tight">
              {formatINR(budgetStats.totalBudget)}
            </div>
            <p className="text-xs text-[#58615a] mt-1">
              Allocated across {categoryBreakdown.length || 8} core celebration categories
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f4f4f0] flex items-center justify-between text-xs text-[#58615a]">
            <span>Target Cap</span>
            <span className="font-semibold text-[#0c2720]">Fixed {formatINR(budgetStats.totalBudget)}</span>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e8e8e5] flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#58615a] uppercase tracking-wider">
              Total Spent
            </span>
            <div className="w-8 h-8 rounded-full bg-[#dce5dc] flex items-center justify-center text-[#0c2720]">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-stat-currency text-2xl sm:text-3xl font-bold text-[#1a1c1a] tracking-tight">
              {formatINR(budgetStats.totalSpent)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#dce5dc] text-[#0c2720] text-[11px] font-bold">
                {budgetStats.percentageSpent}%
              </span>
              <span className="text-xs text-[#58615a]">of total ceiling committed</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f4f4f0] flex items-center gap-2">
            <div className="w-full bg-[#e8e8e5] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#0c2720] h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, budgetStats.percentageSpent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e8e8e5] flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#58615a] uppercase tracking-wider">
              Remaining Balance
            </span>
            <div className="w-8 h-8 rounded-full bg-[#f4f4f0] flex items-center justify-center text-[#49645b]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-stat-currency text-2xl sm:text-3xl font-bold text-[#0c2720] tracking-tight">
              {formatINR(budgetStats.remainingBudget)}
            </div>
            <p className="text-xs text-[#58615a] mt-1">
              {budgetStats.remainingBudget >= 0
                ? 'Healthy liquid reserve across joint accounts'
                : 'Over budget cap! Review categories'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f4f4f0] flex items-center justify-between text-xs text-[#58615a]">
            <span>Buffer Health</span>
            <span className="inline-flex items-center gap-1 font-semibold text-[#0c2720]">
              <span className="w-2 h-2 rounded-full bg-[#49645b]" />
              {budgetStats.remainingBudget >= 0 ? 'Optimal' : 'Action Required'}
            </span>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e8e8e5] flex flex-col justify-between group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-[#58615a] uppercase tracking-wider">
              Pending Dues
            </span>
            <div className="w-8 h-8 rounded-full bg-[#fae0a9] flex items-center justify-center text-[#56441c]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-stat-currency text-2xl sm:text-3xl font-bold text-[#1a1c1a] tracking-tight">
              {formatINR(budgetStats.totalPending)}
            </div>
            <p className="text-xs text-[#56441c] mt-1 flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ddc48f]" />
              Unpaid vendor balances to clear
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#f4f4f0] flex items-center justify-between text-xs text-[#58615a]">
            <span>Status:</span>
            <Link to="/expenses" className="font-semibold text-[#0c2720] hover:underline">
              View Invoices →
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Middle Section: Two-Column Layout (7 cols / 5 cols from Stitch) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Budget Progress & Category Breakdown (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-[#e8e8e5]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#f4f4f0]">
              <div>
                <span className="text-xs font-bold text-[#58615a] uppercase tracking-wider">
                  Financial Overview
                </span>
                <h2 className="font-headline text-xl font-bold text-[#0c2720] mt-0.5">
                  Category Allocation &amp; Spent
                </h2>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#eeeeeb] text-[#424845] text-xs font-semibold">
                <span>{formatINR(budgetStats.totalSpent)} of {formatINR(budgetStats.totalBudget)} Spent</span>
              </div>
            </div>

            {/* Master Progress Gauge */}
            <div className="flex flex-col gap-2 my-6 bg-[#f4f4f0] p-4 rounded-xl border border-[#e8e8e5]">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#1a1c1a] font-medium">Aggregate Commitment Ratio</span>
                <span className="text-[#0c2720] font-bold">{budgetStats.percentageSpent}%</span>
              </div>
              <div className="w-full bg-[#e8e8e5] h-3 rounded-full overflow-hidden flex">
                <div
                  className="bg-[#0c2720] h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, budgetStats.percentageSpent)}%` }}
                  title={`Paid: ${formatINR(budgetStats.totalSpent)}`}
                />
              </div>
              <div className="flex items-center justify-between pt-1 text-[11px] text-[#58615a]">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0c2720]" />
                    Disbursed ({formatINR(budgetStats.totalSpent)})
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ddc48f]" />
                    Pending ({formatINR(budgetStats.totalPending)})
                  </span>
                </div>
                <span className="font-semibold text-[#1a1c1a]">
                  {formatINR(budgetStats.remainingBudget)} Remaining
                </span>
              </div>
            </div>

            {/* Category Breakdown List */}
            <div className="flex flex-col gap-5">
              {categoryBreakdown.map((item) => (
                <div key={item.category} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-[#eeeeeb] flex items-center justify-center shrink-0">
                        {getCategoryIcon(item.category)}
                      </span>
                      <span className="font-semibold text-[#1a1c1a]">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-[#1a1c1a]">{formatINR(item.paid)}</span>
                      <span className="text-[#58615a] text-xs"> / {formatINR(item.total)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-[#eeeeeb] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#0c2720] h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.percentPaid}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-[#58615a]">
                    <span>{item.percentPaid}% Settled</span>
                    <span className="text-[#49645b] font-medium">{formatINR(item.remaining)} remaining</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Tip Banner */}
            <div className="mt-8 p-4 rounded-xl bg-[#f4f4f0] border border-[#e8e8e5] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#fae0a9] flex items-center justify-center text-[#56441c] shrink-0">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <p className="text-xs text-[#1a1c1a]">
                  Vendor settlement timeline suggests releasing Catering milestone 2 by <strong>November 10</strong>.
                </p>
              </div>
              <Link
                to="/events-tasks"
                className="text-xs font-bold text-[#0c2720] underline underline-offset-4 whitespace-nowrap hover:opacity-80 shrink-0"
              >
                View Schedule
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Celebrations & Itinerary (5 cols from Stitch) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-[#e8e8e5]">
            <div className="flex items-center justify-between pb-6 border-b border-[#f4f4f0]">
              <div>
                <span className="text-xs font-bold text-[#58615a] uppercase tracking-wider">
                  Itinerary Highlights
                </span>
                <h2 className="font-headline text-xl font-bold text-[#0c2720] mt-0.5">
                  Upcoming Celebrations
                </h2>
              </div>
              <Link
                to="/events-tasks"
                className="text-xs font-semibold text-[#58615a] hover:text-[#0c2720] transition-colors flex items-center gap-1"
              >
                <span>All Events</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="flex flex-col gap-3.5 pt-4">
              {events.slice(0, 4).map((evt, idx) => (
                <div
                  key={evt.id}
                  className="bg-[#f4f4f0] rounded-xl p-4 flex flex-col gap-2 transition-all hover:bg-[#eeeeeb] border border-[#e8e8e5]/60 relative overflow-hidden"
                >
                  {idx === 2 && (
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#fae0a9]/30 rounded-bl-full pointer-events-none" />
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${idx === 2 ? 'bg-[#0c2720]' : 'bg-[#ddc48f]'}`} />
                      <h3 className="text-sm font-bold text-[#0c2720]">{evt.name}</h3>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white text-[#424845] text-[10px] font-semibold border border-[#e8e8e5]">
                      Ceremony {idx + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[#58615a] text-xs font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(evt.event_date)}
                    </span>
                    {evt.start_time && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {evt.start_time}
                        </span>
                      </>
                    )}
                  </div>

                  {evt.venue && (
                    <div className="flex items-center justify-between text-[#58615a] text-xs pt-1 border-t border-[#e8e8e5]/50">
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-[#49645b] shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Spotlight Card */}
            <div className="mt-6 rounded-xl overflow-hidden bg-[#f4f4f0] border border-[#e8e8e5] p-3.5 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#dce5dc] flex items-center justify-center text-[#0c2720] shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#0c2720] truncate">Ceremony Rundown &amp; Digital Invite</span>
                <span className="text-[11px] text-[#58615a] truncate">Shared with VIP bridal party &amp; guests</span>
              </div>
              <Link
                to="/invitation-editor"
                className="ml-auto p-2 rounded-lg bg-white text-[#0c2720] hover:bg-[#dce5dc] transition-colors border border-[#e8e8e5]"
                title="View Invite Studio"
              >
                <Eye className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom Section - Recent Expenses Table (Detailed Ledger from Stitch) */}
      <section className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-[#e8e8e5] flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#f4f4f0]">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#58615a] uppercase tracking-wider">
              Detailed Ledger
            </span>
            <h2 className="font-headline text-xl font-bold text-[#0c2720]">
              Recent Wedding Expenses
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-[#58615a]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search payee or title..."
                className="h-9 pl-9 pr-4 rounded-xl bg-[#f4f4f0] text-[#1a1c1a] text-xs focus:outline-none focus:ring-1 focus:ring-[#0c2720] w-48 sm:w-60 border border-[#e8e8e5]"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-3 rounded-xl bg-[#f4f4f0] text-[#1a1c1a] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#0c2720] border border-[#e8e8e5]"
            >
              <option value="all">All Categories</option>
              <option value="Venue">Venue</option>
              <option value="Clothing">Clothing</option>
              <option value="Catering">Catering</option>
              <option value="Photography">Photography</option>
              <option value="Decoration">Decoration</option>
            </select>

            {/* View All link */}
            <Link
              to="/expenses"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[#0c2720] hover:bg-[#f4f4f0] text-xs font-bold transition-colors"
            >
              <span>View All ({expenses.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#f4f4f0] text-[#58615a] font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 rounded-l-xl">Expense Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Side</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f4f0]">
              {filteredExpenses.slice(0, 5).map((exp) => {
                const status = derivePaymentStatus(exp.total_amount, exp.amount_paid);

                return (
                  <tr key={exp.id} className="hover:bg-[#f4f4f0]/60 transition-colors">
                    <td className="py-4 px-4 font-semibold text-[#0c2720]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#e8e8e5] flex items-center justify-center text-[#0c2720] shrink-0">
                          {getCategoryIcon(exp.category)}
                        </div>
                        <div>
                          <span>{exp.title}</span>
                          {exp.description && (
                            <span className="block text-[#58615a] text-xs font-normal">
                              {exp.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#dce5dc] text-[#0c2720] text-[11px] font-semibold">
                        {exp.category}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#0c2720] text-white text-[10px] font-bold flex items-center justify-center">
                          {exp.paying_side[0]}
                        </div>
                        <span className="text-[#1a1c1a] font-medium text-xs">{exp.paying_side} Side</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-[#58615a] text-xs">{formatDate(exp.expense_date)}</td>

                    <td className="py-4 px-4 text-right font-stat-currency font-bold text-[#1a1c1a]">
                      {formatINR(exp.total_amount)}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          status === 'Paid'
                            ? 'bg-[#dce5dc] text-[#0c2720]'
                            : status === 'Partially Paid'
                            ? 'bg-[#fae0a9] text-[#56441c]'
                            : 'bg-[#ffdad6] text-[#ba1a1a]'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <Link
                        to="/expenses"
                        className="p-1.5 text-[#58615a] hover:text-[#0c2720] hover:bg-[#e8e8e5] rounded-lg inline-block"
                        title="Manage in Expenses"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-[#58615a] text-xs pt-2 border-t border-[#f4f4f0]">
          <span>Showing {Math.min(5, filteredExpenses.length)} of {expenses.length} tracked expenditures</span>
          <Link to="/expenses" className="text-[#0c2720] font-bold hover:underline">
            Manage Complete Ledger →
          </Link>
        </div>
      </section>

      {/* Quick Add Expense Modal */}
      {quickAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c2720]/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative flex flex-col gap-6 border border-[#e8e8e5]">
            <div className="flex items-center justify-between pb-3 border-b border-[#f4f4f0]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#dce5dc] flex items-center justify-center text-[#0c2720]">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="font-headline text-xl font-bold text-[#0c2720]">
                  Record New Expense
                </h3>
              </div>
              <button
                onClick={() => setQuickAddModal(false)}
                className="p-1 text-[#58615a] hover:text-[#1a1c1a] rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuickExpense} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#1a1c1a]">Item or Payee Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wedding Band / Sangeet DJ Retainer"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="h-10 px-3.5 rounded-xl bg-[#f4f4f0] text-sm text-[#1a1c1a] focus:outline-none focus:ring-1 focus:ring-[#0c2720] border border-[#e8e8e5]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#1a1c1a]">Category</label>
                  <select
                    value={modalCat}
                    onChange={(e) => setModalCat(e.target.value as ExpenseCategory)}
                    className="h-10 px-3 rounded-xl bg-[#f4f4f0] text-sm text-[#1a1c1a] focus:outline-none focus:ring-1 focus:ring-[#0c2720] border border-[#e8e8e5]"
                  >
                    <option value="Venue">Venue &amp; Stay</option>
                    <option value="Catering">Catering</option>
                    <option value="Clothing">Clothing &amp; Jewels</option>
                    <option value="Photography">Photography</option>
                    <option value="Decoration">Decoration &amp; Florals</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#1a1c1a]">Total Amount (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="50000"
                    value={modalTotal}
                    onChange={(e) => setModalTotal(e.target.value === '' ? '' : Number(e.target.value))}
                    className="h-10 px-3.5 rounded-xl bg-[#f4f4f0] text-sm text-[#1a1c1a] focus:outline-none focus:ring-1 focus:ring-[#0c2720] border border-[#e8e8e5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#1a1c1a]">Amount Paid (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="25000"
                    value={modalPaid}
                    onChange={(e) => setModalPaid(e.target.value === '' ? '' : Number(e.target.value))}
                    className="h-10 px-3.5 rounded-xl bg-[#f4f4f0] text-sm text-[#1a1c1a] focus:outline-none focus:ring-1 focus:ring-[#0c2720] border border-[#e8e8e5]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#1a1c1a]">Paid By Side</label>
                  <select
                    value={modalSide}
                    onChange={(e) => setModalSide(e.target.value as any)}
                    className="h-10 px-3 rounded-xl bg-[#f4f4f0] text-sm text-[#1a1c1a] focus:outline-none focus:ring-1 focus:ring-[#0c2720] border border-[#e8e8e5]"
                  >
                    <option value="Shared">Shared / Joint</option>
                    <option value="Bride">Bride's Side</option>
                    <option value="Groom">Groom's Side</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#f4f4f0]">
                <button
                  type="button"
                  onClick={() => setQuickAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#58615a] hover:text-[#1a1c1a]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0c2720] hover:bg-[#233d35] rounded-xl shadow-xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
