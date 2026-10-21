import React, { useState, useMemo } from 'react';
import {
  Search,
  Trash2,
  Edit2,
  Plus,
  Wallet,
  Building2,
  UtensilsCrossed,
  Shirt,
  Camera,
  Flower2,
  X,
} from 'lucide-react';
import { useWedding } from '@/context/WeddingContext';
import { formatINR, formatDate, derivePaymentStatus, getPendingAmount } from '@/lib/utils';
import type { Expense, ExpenseCategory, FamilySide } from '@/types';

const CATEGORIES: ExpenseCategory[] = [
  'Venue',
  'Catering',
  'Clothing',
  'Jewellery',
  'Photography',
  'Decoration',
  'Invitations',
  'Travel & Stay',
  'Gifts',
  'Makeup & Grooming',
  'Ceremony & Rituals',
  'Miscellaneous',
];

export const ExpensesPage: React.FC = () => {
  const { expenses, addExpense, updateExpense, deleteExpense, budgetStats } = useWedding();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSide, setSelectedSide] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('Venue');
  const [formTotal, setFormTotal] = useState<number | ''>('');
  const [formPaid, setFormPaid] = useState<number | ''>('');
  const [formSide, setFormSide] = useState<FamilySide>('Shared');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formPayee, setFormPayee] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const openAddModal = () => {
    setEditingExpense(null);
    setFormTitle('');
    setFormCategory('Venue');
    setFormTotal('');
    setFormPaid('');
    setFormSide('Shared');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormPayee('');
    setFormDesc('');
    setModalOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setFormTitle(exp.title);
    setFormCategory(exp.category);
    setFormTotal(exp.total_amount);
    setFormPaid(exp.amount_paid);
    setFormSide(exp.paying_side);
    setFormDate(exp.expense_date);
    setFormPayee(exp.payee_name || '');
    setFormDesc(exp.description || '');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || formTotal === '') return;

    const total = Number(formTotal);
    const paid = Number(formPaid || 0);

    if (paid > total) {
      alert('Amount paid cannot exceed total expense amount.');
      return;
    }

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        title: formTitle,
        category: formCategory,
        total_amount: total,
        amount_paid: paid,
        paying_side: formSide,
        expense_date: formDate,
        payee_name: formPayee || undefined,
        description: formDesc || undefined,
      });
    } else {
      addExpense({
        wedding_id: 'wed-001',
        title: formTitle,
        category: formCategory,
        total_amount: total,
        amount_paid: paid,
        paying_side: formSide,
        expense_date: formDate,
        payee_name: formPayee || undefined,
        description: formDesc || undefined,
      });
    }

    setModalOpen(false);
  };

  // Filter & Sort
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        const matchesSearch =
          exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (exp.payee_name && exp.payee_name.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCat = selectedCategory === 'All' || exp.category === selectedCategory;
        const matchesSide = selectedSide === 'All' || exp.paying_side === selectedSide;

        const status = derivePaymentStatus(exp.total_amount, exp.amount_paid);
        const matchesStatus = selectedStatus === 'All' || status === selectedStatus;

        return matchesSearch && matchesCat && matchesSide && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return b.expense_date.localeCompare(a.expense_date);
        if (sortBy === 'date-asc') return a.expense_date.localeCompare(b.expense_date);
        if (sortBy === 'amount-desc') return b.total_amount - a.total_amount;
        if (sortBy === 'amount-asc') return a.total_amount - b.total_amount;
        return 0;
      });
  }, [expenses, searchQuery, selectedCategory, selectedSide, selectedStatus, sortBy]);

  // Breakdown by paying side
  const sideTotals = useMemo(() => {
    let bride = 0;
    let groom = 0;
    let shared = 0;

    expenses.forEach((e) => {
      if (e.paying_side === 'Bride') bride += e.total_amount;
      else if (e.paying_side === 'Groom') groom += e.total_amount;
      else shared += e.total_amount;
    });

    return { bride, groom, shared };
  }, [expenses]);

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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[#0c2720]">
            Detailed Expense Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#58615a]">
            Manage payments, category allocations, and family contributions with precision.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#0c2720] hover:bg-[#233d35] rounded-xl shadow-xs transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4 text-[#fae0a9]" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Top Summaries (Stitch Palette) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-[#e8e8e5] shadow-xs">
          <p className="text-[11px] font-bold text-[#58615a] uppercase tracking-wider">Total Recorded</p>
          <p className="font-stat-currency text-xl font-bold text-[#1a1c1a] mt-1">
            {formatINR(expenses.reduce((acc, curr) => acc + curr.total_amount, 0))}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e8e8e5] shadow-xs">
          <p className="text-[11px] font-bold text-[#0c2720] uppercase tracking-wider">Total Disbursed</p>
          <p className="font-stat-currency text-xl font-bold text-[#0c2720] mt-1">
            {formatINR(budgetStats.totalSpent)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e8e8e5] shadow-xs">
          <p className="text-[11px] font-bold text-[#56441c] uppercase tracking-wider">Pending Dues</p>
          <p className="font-stat-currency text-xl font-bold text-[#56441c] mt-1">
            {formatINR(budgetStats.totalPending)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e8e8e5] shadow-xs">
          <p className="text-[11px] font-bold text-[#58615a] uppercase tracking-wider">Bride / Groom / Joint</p>
          <div className="flex items-center gap-2 text-xs font-semibold mt-1">
            <span className="text-[#0c2720]">B: {formatINR(sideTotals.bride)}</span>
            <span>•</span>
            <span className="text-[#58615a]">G: {formatINR(sideTotals.groom)}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#e8e8e5] space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#58615a]" />
            <input
              type="text"
              placeholder="Search expenses by title or vendor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-[#e8e8e5] focus:outline-none focus:ring-1 focus:ring-[#0c2720] bg-[#f4f4f0]"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-[#e8e8e5] bg-[#f4f4f0] font-medium text-[#1a1c1a] focus:ring-1 focus:ring-[#0c2720]"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={selectedSide}
              onChange={(e) => setSelectedSide(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-[#e8e8e5] bg-[#f4f4f0] font-medium text-[#1a1c1a] focus:ring-1 focus:ring-[#0c2720]"
            >
              <option value="All">All Sides</option>
              <option value="Shared">Shared / Joint</option>
              <option value="Bride">Bride's Side</option>
              <option value="Groom">Groom's Side</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-[#e8e8e5] bg-[#f4f4f0] font-medium text-[#1a1c1a] focus:ring-1 focus:ring-[#0c2720]"
            >
              <option value="All">All Status</option>
              <option value="Paid">Paid Fully</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Pending">Pending</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-xl border border-[#e8e8e5] bg-[#f4f4f0] font-medium text-[#1a1c1a] focus:ring-1 focus:ring-[#0c2720]"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-[#e8e8e5] overflow-hidden shadow-xs">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <Wallet className="w-10 h-10 text-[#c1c8c4] mx-auto" />
            <p className="text-sm font-semibold text-[#1a1c1a]">No matching expenses found</p>
            <p className="text-xs text-[#58615a] max-w-sm mx-auto">
              Try adjusting your search filters or record a new expense for this wedding.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#f4f4f0] text-[#58615a] font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Expense Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Side</th>
                  <th className="py-3.5 px-4 text-right">Total Amount</th>
                  <th className="py-3.5 px-4 text-right">Paid Amount</th>
                  <th className="py-3.5 px-4 text-right">Balance Due</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4f4f0]">
                {filteredExpenses.map((exp) => {
                  const status = derivePaymentStatus(exp.total_amount, exp.amount_paid);
                  const pending = getPendingAmount(exp);

                  return (
                    <tr key={exp.id} className="hover:bg-[#f4f4f0]/60 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#0c2720]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#e8e8e5] flex items-center justify-center shrink-0">
                            {getCategoryIcon(exp.category)}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1a1c1a]">{exp.title}</p>
                            <p className="text-[11px] text-[#58615a] font-normal mt-0.5">
                              {exp.payee_name ? `Vendor: ${exp.payee_name} • ` : ''}
                              {formatDate(exp.expense_date)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#dce5dc] text-[#0c2720] text-xs font-semibold">
                          {exp.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-[#1a1c1a] text-xs">
                          {exp.paying_side} Side
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-stat-currency font-bold text-[#1a1c1a]">
                        {formatINR(exp.total_amount)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-stat-currency font-medium text-[#0c2720]">
                        {formatINR(exp.amount_paid)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-stat-currency font-medium text-[#56441c]">
                        {formatINR(pending)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            status === 'Paid'
                              ? 'bg-[#dce5dc] text-[#0c2720]'
                              : status === 'Partially Paid'
                              ? 'bg-[#fae0a9] text-[#56441c]'
                              : 'bg-[#ffdad6] text-[#ba1a1a]'
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(exp)}
                            title="Edit Expense"
                            className="p-1.5 text-[#58615a] hover:text-[#0c2720] rounded-lg hover:bg-[#e8e8e5] transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${exp.title}"?`)) {
                                deleteExpense(exp.id);
                              }
                            }}
                            title="Delete Expense"
                            className="p-1.5 text-[#58615a] hover:text-[#ba1a1a] rounded-lg hover:bg-[#ffdad6]/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c2720]/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-[#e8e8e5] animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#f4f4f0]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#dce5dc] flex items-center justify-center text-[#0c2720]">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="font-headline text-xl font-bold text-[#0c2720]">
                  {editingExpense ? 'Edit Expense Record' : 'Record New Expense'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-[#58615a] hover:text-[#1a1c1a] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1a1c1a] mb-1">
                  Expense Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Photography & Drone Retainer"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#e8e8e5] focus:outline-none focus:ring-1 focus:ring-[#0c2720] bg-[#f4f4f0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1a1c1a] mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#e8e8e5] focus:ring-1 focus:ring-[#0c2720] bg-[#f4f4f0]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1a1c1a] mb-1">
                    Paying Side *
                  </label>
                  <select
                    value={formSide}
                    onChange={(e) => setFormSide(e.target.value as FamilySide)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#e8e8e5] focus:ring-1 focus:ring-[#0c2720] bg-[#f4f4f0]"
                  >
                    <option value="Shared">Shared / Joint</option>
                    <option value="Bride">Bride's Side</option>
                    <option value="Groom">Groom's Side</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1a1c1a] mb-1">
                    Total Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="75000"
                    value={formTotal}
                    onChange={(e) => setFormTotal(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#e8e8e5] focus:ring-1 focus:ring-[#0c2720] bg-[#f4f4f0]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1a1c1a] mb-1">
                    Amount Paid (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={typeof formTotal === 'number' ? formTotal : undefined}
                    placeholder="25000"
                    value={formPaid}
                    onChange={(e) => setFormPaid(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#e8e8e5] focus:ring-1 focus:ring-[#0c2720] bg-[#f4f4f0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1a1c1a] mb-1">
                    Expense Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#e8e8e5] focus:ring-1 focus:ring-[#0c2720] bg-[#f4f4f0]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1a1c1a] mb-1">
                    Vendor / Payee
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dream Studio"
                    value={formPayee}
                    onChange={(e) => setFormPayee(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#e8e8e5] focus:ring-1 focus:ring-[#0c2720] bg-[#f4f4f0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1a1c1a] mb-1">
                  Description / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional contract notes or terms..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#e8e8e5] focus:ring-1 focus:ring-[#0c2720] bg-[#f4f4f0]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f4f4f0]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#58615a] hover:text-[#1a1c1a] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0c2720] hover:bg-[#233d35] rounded-xl shadow-xs"
                >
                  {editingExpense ? 'Save Changes' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
