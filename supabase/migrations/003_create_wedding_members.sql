-- ==============================================================================
-- Migration 003: Create Wedding Members Table
-- Spec: Make_My_Marriage_Database_Supabase.md - Section 4.3
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.wedding_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    family_side TEXT NOT NULL CHECK (family_side IN ('groom', 'bride', 'shared')),
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (wedding_id, user_id)
);

COMMENT ON TABLE public.wedding_members IS 'User access authorization, role assignments, and family-side affiliation for each wedding';

-- Trigger: Automatically add the wedding owner as a member with role 'owner'
CREATE OR REPLACE FUNCTION public.handle_wedding_owner_membership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.wedding_members (wedding_id, user_id, family_side, role)
    VALUES (NEW.id, NEW.owner_user_id, 'shared', 'owner')
    ON CONFLICT (wedding_id, user_id) 
    DO UPDATE SET role = 'owner';
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_wedding_created_add_owner ON public.weddings;
CREATE TRIGGER on_wedding_created_add_owner
    AFTER INSERT ON public.weddings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_wedding_owner_membership();
