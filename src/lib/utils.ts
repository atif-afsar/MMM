import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Expense, PaymentStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in Indian Rupees (₹) with standard Indian numeric format
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Convert paise (integer) to INR rupees
 */
export function paiseToRupees(paise: number): number {
  return Math.round(paise) / 100;
}

/**
 * Convert INR rupees to paise (integer)
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round((rupees || 0) * 100);
}

/**
 * Format standard date into readable string
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

/**
 * Format date with time
 */
export function formatDateTime(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

/**
 * Derive payment status according to PRD business logic:
 * - Paid: amount_paid === total_amount
 * - Partially Paid: amount_paid > 0 && amount_paid < total_amount
 * - Pending: amount_paid === 0
 */
export function derivePaymentStatus(totalAmount: number, amountPaid: number): PaymentStatus {
  if (amountPaid >= totalAmount && totalAmount > 0) {
    return 'Paid';
  }
  if (amountPaid > 0 && amountPaid < totalAmount) {
    return 'Partially Paid';
  }
  return 'Pending';
}

/**
 * Calculate pending balance on an individual expense
 */
export function getPendingAmount(expense: Expense): number {
  return Math.max(0, expense.total_amount - expense.amount_paid);
}

/**
 * Days remaining until wedding date
 */
export function getDaysRemaining(weddingDateStr: string): number {
  const target = new Date(weddingDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
