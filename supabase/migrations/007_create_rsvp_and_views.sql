-- ==============================================================================
-- Migration 007: Create RSVP Submissions and Public Invitation Views
-- Spec: Make_My_Marriage_Database_Supabase.md - Section 4.8 & 6
-- ==============================================================================

-- 1. Isolated table for anonymous/public RSVP submissions
CREATE TABLE IF NOT EXISTS public.rsvp_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
    guest_name TEXT NOT NULL,
    phone TEXT NULL,
    email TEXT NULL,
    response TEXT NOT NULL CHECK (LOWER(response) IN ('attending', 'not_attending', 'not attending')),
    attendees_count INTEGER NOT NULL DEFAULT 1 CHECK (attendees_count >= 1),
    notes TEXT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.rsvp_submissions IS 'Isolated inbox for unauthenticated public RSVP responses';

-- 2. Secure public view exposing only publication-safe fields for digital invitation
CREATE OR REPLACE VIEW public.public_wedding_invitations
WITH (security_barrier = true) AS
SELECT 
    id,
    bride_name,
    groom_name,
    wedding_date,
    wedding_time,
    timezone,
    venue_name,
    venue_address,
    venue_map_url,
    cover_image_path,
    invitation_slug,
    invitation_heading,
    invitation_message,
    invitation_theme,
    rsvp_enabled,
    published_at
FROM public.weddings
WHERE invitation_published = true AND invitation_slug IS NOT NULL;

COMMENT ON VIEW public.public_wedding_invitations IS 'Safe public read view for guests viewing published invitations without exposing private budget or management fields';

-- Grant select on public invitation view to anon and authenticated
GRANT SELECT ON public.public_wedding_invitations TO anon, authenticated;
