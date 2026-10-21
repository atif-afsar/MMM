-- ==============================================================================
-- Migration 006: Create Discussions and Guests Tables
-- Spec: Make_My_Marriage_Database_Supabase.md - Sections 4.7 & 4.8
-- ==============================================================================

-- 1. Discussions Table
CREATE TABLE IF NOT EXISTS public.discussions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
    author_user_id UUID NOT NULL REFERENCES auth.users(id),
    title TEXT NULL,
    content TEXT NOT NULL,
    entry_type TEXT NOT NULL DEFAULT 'discussion' CHECK (LOWER(entry_type) IN ('announcement', 'discussion', 'decision')),
    decision_status TEXT NULL CHECK (decision_status IS NULL OR LOWER(decision_status) IN ('open', 'decided')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.discussions IS 'Shared workspace notices, deliberations, and formal decisions for both families';

-- 2. Guests Table
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NULL,
    email TEXT NULL,
    family_side TEXT NOT NULL DEFAULT 'shared' CHECK (LOWER(family_side) IN ('groom', 'bride', 'shared', 'both')),
    invitation_status TEXT NOT NULL DEFAULT 'not_sent' CHECK (LOWER(invitation_status) IN ('not_sent', 'not sent', 'shared', 'viewed')),
    rsvp_status TEXT NOT NULL DEFAULT 'pending' CHECK (LOWER(rsvp_status) IN ('pending', 'attending', 'not_attending', 'not attending')),
    attendees_count INTEGER NOT NULL DEFAULT 1 CHECK (attendees_count >= 1),
    dietary_notes TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.guests IS 'Private guest management record with invitation sharing and RSVP status';
