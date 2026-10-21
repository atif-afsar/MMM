import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MobileNav, MobileBottomBar } from './MobileNav';
import { useWedding } from '@/context/WeddingContext';
import type { ExpenseCategory, FamilySide } from '@/types';
import { X, Wallet } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickExpenseOpen, setQuickExpenseOpen] = useState(false);
  const { addExpense } = useWedding();

  // Quick Expense Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Venue');
  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [amountPaid, setAmountPaid] = useState<number | ''>('');
  const [payingSide, setPayingSide] = useState<FamilySide>('Shared');
  const [payeeName, setPayeeName] = useState('');

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || totalAmount === '') return;

    addExpense({
      wedding_id: 'wed-001',
      title,
      category,
      total_amount: Number(totalAmount),
      amount_paid: Number(amountPaid || 0),
      expense_date: new Date().toISOString().split('T')[0],
      paying_side: payingSide,
      payee_name: payeeName || undefined,
    });

    // Reset & close
    setTitle('');
    setTotalAmount('');
    setAmountPaid('');
    setPayeeName('');
    setQuickExpenseOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f9f9f6] flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Drawer */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenQuickExpense={() => setQuickExpenseOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          <Outlet />
        </main>

        <MobileBottomBar onOpenQuickExpense={() => setQuickExpenseOpen(true)} />
      </div>

      {/* Quick Add Expense Modal */}
      {quickExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c2720]/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[#e8e8e5]">
            <div className="flex items-center justify-between pb-4 border-b border-[#f4f4f0]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#dce5dc] flex items-center justify-center text-[#0c2720]">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="font-headline text-xl font-bold text-[#0c2720]">
                  Record New Expense
                </h3>
              </div>
              <button
                onClick={() => setQuickExpenseOpen(false)}
                className="p-1 text-[#58615a] hover:text-[#1a1c1a] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1a1c1a] mb-1">
                  Expense Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mandap Floral Decoration"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#e8e8e5] focus:outline-none focus:ring-1 focus:ring-[#0c2720] bg-[#f4f4f0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1a1c1a] mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#e8e8e5] focus:ring-1 focus:ring-[#0c2720] bg-[#f4f4f0]"
                  >
                    <option value="Venue">Venue</option>
                    <option value="Catering">Catering</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Jewellery">Jewellery</option>
                    <option value="Photography">Photography</option>
                    <option value="Decoration">Decoration</option>
                    <option value="Invitations">Invitations</option>
                    <option value="Travel & Stay">Travel & Stay</option>
                    <option value="Gifts">Gifts</option>
                    <option value="Makeup & Grooming">Makeup & Grooming</option>
                    <option value="Ceremony & Rituals">Ceremony & Rituals</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1a1c1a] mb-1">
                    Paying Side *
                  </label>
                  <select
                    value={payingSide}
                    onChange={(e) => setPayingSide(e.target.value as FamilySide)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#e8e8e5] focus:ring-1 focus:ring-[#0c2720] bg-[#f4f4f0]"
                  >
                    <option value="Shared">Shared / Both</option>
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
                    placeholder="50000"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value === '' ? '' : Number(e.target.value))}
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
                    max={typeof totalAmount === 'number' ? totalAmount : undefined}
                    placeholder="25000"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#e8e8e5] focus:ring-1 focus:ring-[#0c2720] bg-[#f4f4f0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1a1c1a] mb-1">
                  Vendor / Payee Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Royal Decorators"
                  value={payeeName}
                  onChange={(e) => setPayeeName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#e8e8e5] focus:ring-1 focus:ring-[#0c2720] bg-[#f4f4f0]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#f4f4f0]">
                <button
                  type="button"
                  onClick={() => setQuickExpenseOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#58615a] hover:text-[#1a1c1a] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0c2720] hover:bg-[#233d35] rounded-xl shadow-xs"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
