-- ==============================================================================
-- Migration 002: Create Weddings Table
-- Spec: Make_My_Marriage_Database_Supabase.md - Section 4.2
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.weddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bride_name TEXT NOT NULL,
    groom_name TEXT NOT NULL,
    wedding_date DATE NULL,
    wedding_time TEXT NULL,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    venue_name TEXT NULL,
    venue_address TEXT NULL,
    venue_map_url TEXT NULL,
    total_budget_paise BIGINT NOT NULL DEFAULT 0 CHECK (total_budget_paise >= 0),
    cover_image_path TEXT NULL,
    invitation_slug TEXT UNIQUE NULL,
    invitation_published BOOLEAN NOT NULL DEFAULT false,
    rsvp_enabled BOOLEAN NOT NULL DEFAULT true,
    invitation_heading TEXT NULL,
    invitation_message TEXT NULL,
    invitation_theme JSONB NOT NULL DEFAULT '{}'::jsonb,
    published_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT valid_invitation_slug CHECK (invitation_slug IS NULL OR invitation_slug ~ '^[a-z0-9-]+$')
);

COMMENT ON TABLE public.weddings IS 'Primary wedding record tracking couple info, venue, target budget (in paise), and invitation configuration';
COMMENT ON COLUMN public.weddings.total_budget_paise IS 'Target budget stored as integer paise (e.g. ₹35,00,000 is 350000000 paise)';
COMMENT ON COLUMN public.weddings.invitation_slug IS 'URL slug for the public invitation (e.g. ananya-and-rohan)';
