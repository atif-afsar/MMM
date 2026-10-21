-- ==============================================================================
-- Migration 008: Create Performance & Query Indexes
-- Spec: Make_My_Marriage_Database_Supabase.md - Section 5
-- ==============================================================================

-- Weddings indexes
CREATE INDEX IF NOT EXISTS idx_weddings_owner_user_id 
    ON public.weddings (owner_user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_weddings_invitation_slug 
    ON public.weddings (invitation_slug) 
    WHERE invitation_slug IS NOT NULL;

-- Wedding members indexes
CREATE INDEX IF NOT EXISTS idx_wedding_members_user_id 
    ON public.wedding_members (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_wedding_members_wedding_user 
    ON public.wedding_members (wedding_id, user_id);

-- Expenses indexes
CREATE INDEX IF NOT EXISTS idx_expenses_wedding_date 
    ON public.expenses (wedding_id, expense_date DESC);

CREATE INDEX IF NOT EXISTS idx_expenses_wedding_category 
    ON public.expenses (wedding_id, category);

CREATE INDEX IF NOT EXISTS idx_expenses_wedding_paying_side 
    ON public.expenses (wedding_id, paying_side);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_wedding_date 
    ON public.events (wedding_id, event_date);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_wedding_status_due 
    ON public.tasks (wedding_id, status, due_date);

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_member 
    ON public.tasks (assigned_member_id);

-- Discussions indexes
CREATE INDEX IF NOT EXISTS idx_discussions_wedding_created 
    ON public.discussions (wedding_id, created_at DESC);

-- Guests indexes
CREATE INDEX IF NOT EXISTS idx_guests_wedding_rsvp 
    ON public.guests (wedding_id, rsvp_status);

-- RSVP submissions indexes
CREATE INDEX IF NOT EXISTS idx_rsvp_submissions_wedding_submitted 
    ON public.rsvp_submissions (wedding_id, submitted_at DESC);
