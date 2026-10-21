-- ==============================================================================
-- Migration 004: Create Expenses Table
-- Spec: Make_My_Marriage_Database_Supabase.md - Section 4.4
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NULL,
    category TEXT NOT NULL,
    total_amount_paise BIGINT NOT NULL CHECK (total_amount_paise >= 0),
    amount_paid_paise BIGINT NOT NULL DEFAULT 0 CHECK (amount_paid_paise >= 0),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    paying_side TEXT NOT NULL CHECK (LOWER(paying_side) IN ('groom', 'bride', 'shared')),
    payee_name TEXT NULL,
    due_date DATE NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT check_paid_not_exceed_total CHECK (amount_paid_paise <= total_amount_paise)
);

COMMENT ON TABLE public.expenses IS 'Tracks wedding expenditures, vendors, payments, and balances in integer paise';
COMMENT ON COLUMN public.expenses.total_amount_paise IS 'Total cost in integer paise (₹100 = 10000 paise)';
COMMENT ON COLUMN public.expenses.amount_paid_paise IS 'Amount already paid in integer paise';
