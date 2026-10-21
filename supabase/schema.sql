-- ==============================================================================
-- Make My Marriage - Complete Supabase Database Schema & RLS Setup
-- Generated from Make_My_Marriage_Database_Supabase.md specifications
-- Version: 1.1
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. Tables Creation
-- ==============================================================================

-- 2.1 Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    avatar_url TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 Weddings Table
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

-- 2.3 Wedding Members Table
CREATE TABLE IF NOT EXISTS public.wedding_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    family_side TEXT NOT NULL CHECK (family_side IN ('groom', 'bride', 'shared')),
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (wedding_id, user_id)
);

-- 2.4 Expenses Table (Paise integer calculation)
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

-- 2.5 Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    event_date DATE NOT NULL,
    start_time TEXT NULL,
    venue TEXT NULL,
    notes TEXT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.6 Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_id UUID NOT NULL REFERENCES public.weddings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NULL,
    due_date DATE NULL,
    assigned_member_id UUID NULL REFERENCES public.wedding_members(id) ON DELETE SET NULL,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (LOWER(priority) IN ('low', 'medium', 'high')),
    status TEXT NOT NULL DEFAULT 'todo' CHECK (LOWER(status) IN ('todo', 'to do', 'in_progress', 'in progress', 'completed')),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.7 Discussions Table
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

-- 2.8 Guests Table
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

-- 2.9 RSVP Submissions Table (Isolated public inbox)
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

-- ==============================================================================
-- 3. Triggers for Automatic Data Sync
-- ==============================================================================

-- Auto create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            SPLIT_PART(NEW.email, '@', 1),
            'Wedding Planner'
        ),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Auto assign wedding creator as member with role 'owner'
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

-- ==============================================================================
-- 4. Secure Public Views
-- ==============================================================================

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

GRANT SELECT ON public.public_wedding_invitations TO anon, authenticated;

-- ==============================================================================
-- 5. Indexes
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_weddings_owner_user_id ON public.weddings (owner_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_weddings_invitation_slug ON public.weddings (invitation_slug) WHERE invitation_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wedding_members_user_id ON public.wedding_members (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_wedding_members_wedding_user ON public.wedding_members (wedding_id, user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_wedding_date ON public.expenses (wedding_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_wedding_category ON public.expenses (wedding_id, category);
CREATE INDEX IF NOT EXISTS idx_expenses_wedding_paying_side ON public.expenses (wedding_id, paying_side);
CREATE INDEX IF NOT EXISTS idx_events_wedding_date ON public.events (wedding_id, event_date);
CREATE INDEX IF NOT EXISTS idx_tasks_wedding_status_due ON public.tasks (wedding_id, status, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_member ON public.tasks (assigned_member_id);
CREATE INDEX IF NOT EXISTS idx_discussions_wedding_created ON public.discussions (wedding_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guests_wedding_rsvp ON public.guests (wedding_id, rsvp_status);
CREATE INDEX IF NOT EXISTS idx_rsvp_submissions_wedding_submitted ON public.rsvp_submissions (wedding_id, submitted_at DESC);

-- ==============================================================================
-- 6. Helper Functions for RLS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.is_wedding_member(lookup_wedding_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.wedding_members
        WHERE wedding_id = lookup_wedding_id
          AND user_id = auth.uid()
    );
$$;

CREATE OR REPLACE FUNCTION public.has_wedding_role(lookup_wedding_id UUID, allowed_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.wedding_members
        WHERE wedding_id = lookup_wedding_id
          AND user_id = auth.uid()
          AND role = ANY(allowed_roles)
    );
$$;

CREATE OR REPLACE FUNCTION public.is_wedding_owner(lookup_wedding_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.weddings
        WHERE id = lookup_wedding_id
          AND owner_user_id = auth.uid()
    );
$$;

GRANT EXECUTE ON FUNCTION public.is_wedding_member(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_wedding_role(UUID, TEXT[]) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_wedding_owner(UUID) TO authenticated, anon;

-- ==============================================================================
-- 7. Enable Row Level Security (RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvp_submissions ENABLE ROW LEVEL SECURITY;

-- 7.1 Profiles Policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- 7.2 Weddings Policies
DROP POLICY IF EXISTS "Members can view their wedding details" ON public.weddings;
CREATE POLICY "Members can view their wedding details" ON public.weddings FOR SELECT TO authenticated USING (public.is_wedding_member(id));

DROP POLICY IF EXISTS "Users can create wedding as owner" ON public.weddings;
CREATE POLICY "Users can create wedding as owner" ON public.weddings FOR INSERT TO authenticated WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "Owners and admins can update wedding details" ON public.weddings;
CREATE POLICY "Owners and admins can update wedding details" ON public.weddings FOR UPDATE TO authenticated USING (public.has_wedding_role(id, ARRAY['owner', 'admin'])) WITH CHECK (public.has_wedding_role(id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Only wedding owner can delete wedding" ON public.weddings;
CREATE POLICY "Only wedding owner can delete wedding" ON public.weddings FOR DELETE TO authenticated USING (owner_user_id = auth.uid());

-- 7.3 Wedding Members Policies
DROP POLICY IF EXISTS "Members can view member roster" ON public.wedding_members;
CREATE POLICY "Members can view member roster" ON public.wedding_members FOR SELECT TO authenticated USING (public.is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "Owners and admins can add members" ON public.wedding_members;
CREATE POLICY "Owners and admins can add members" ON public.wedding_members FOR INSERT TO authenticated WITH CHECK (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Owners and admins can update members (except owner)" ON public.wedding_members;
CREATE POLICY "Owners and admins can update members (except owner)" ON public.wedding_members FOR UPDATE TO authenticated 
    USING (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin']) AND user_id != (SELECT owner_user_id FROM public.weddings WHERE id = wedding_id))
    WITH CHECK (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin']) AND user_id != (SELECT owner_user_id FROM public.weddings WHERE id = wedding_id));

DROP POLICY IF EXISTS "Owners and admins can remove members (except owner)" ON public.wedding_members;
CREATE POLICY "Owners and admins can remove members (except owner)" ON public.wedding_members FOR DELETE TO authenticated 
    USING (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin']) AND user_id != (SELECT owner_user_id FROM public.weddings WHERE id = wedding_id));

-- 7.4 Expenses Policies
DROP POLICY IF EXISTS "Members can view expenses" ON public.expenses;
CREATE POLICY "Members can view expenses" ON public.expenses FOR SELECT TO authenticated USING (public.is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "Editors and above can add expenses" ON public.expenses;
CREATE POLICY "Editors and above can add expenses" ON public.expenses FOR INSERT TO authenticated 
    WITH CHECK (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'editor']) AND created_by = auth.uid());

DROP POLICY IF EXISTS "Editors and above can update expenses" ON public.expenses;
CREATE POLICY "Editors and above can update expenses" ON public.expenses FOR UPDATE TO authenticated 
    USING (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'editor']))
    WITH CHECK (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'editor']));

DROP POLICY IF EXISTS "Owners and admins can delete expenses" ON public.expenses;
CREATE POLICY "Owners and admins can delete expenses" ON public.expenses FOR DELETE TO authenticated 
    USING (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin']));

-- 7.5 Events Policies
DROP POLICY IF EXISTS "Members can view wedding events" ON public.events;
CREATE POLICY "Members can view wedding events" ON public.events FOR SELECT TO authenticated USING (public.is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "Public can view events for published invitations" ON public.events;
CREATE POLICY "Public can view events for published invitations" ON public.events FOR SELECT TO anon, authenticated
    USING (EXISTS (SELECT 1 FROM public.weddings WHERE id = events.wedding_id AND invitation_published = true));

DROP POLICY IF EXISTS "Editors and above can add events" ON public.events;
CREATE POLICY "Editors and above can add events" ON public.events FOR INSERT TO authenticated 
    WITH CHECK (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'editor']) AND created_by = auth.uid());

DROP POLICY IF EXISTS "Editors and above can update events" ON public.events;
CREATE POLICY "Editors and above can update events" ON public.events FOR UPDATE TO authenticated 
    USING (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'editor']))
    WITH CHECK (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'editor']));

DROP POLICY IF EXISTS "Editors and above can delete events" ON public.events;
CREATE POLICY "Editors and above can delete events" ON public.events FOR DELETE TO authenticated 
    USING (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'editor']));

-- 7.6 Tasks Policies
DROP POLICY IF EXISTS "Members can view wedding tasks" ON public.tasks;
CREATE POLICY "Members can view wedding tasks" ON public.tasks FOR SELECT TO authenticated USING (public.is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "Editors and above can add tasks" ON public.tasks;
CREATE POLICY "Editors and above can add tasks" ON public.tasks FOR INSERT TO authenticated 
    WITH CHECK (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'editor']) AND created_by = auth.uid());

DROP POLICY IF EXISTS "Members can update tasks" ON public.tasks;
CREATE POLICY "Members can update tasks" ON public.tasks FOR UPDATE TO authenticated 
    USING (public.is_wedding_member(wedding_id))
    WITH CHECK (public.is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "Editors and above can delete tasks" ON public.tasks;
CREATE POLICY "Editors and above can delete tasks" ON public.tasks FOR DELETE TO authenticated 
    USING (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'editor']));

-- 7.7 Discussions Policies
DROP POLICY IF EXISTS "Members can view discussions" ON public.discussions;
CREATE POLICY "Members can view discussions" ON public.discussions FOR SELECT TO authenticated USING (public.is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "Members can add discussions" ON public.discussions;
CREATE POLICY "Members can add discussions" ON public.discussions FOR INSERT TO authenticated 
    WITH CHECK (public.is_wedding_member(wedding_id) AND author_user_id = auth.uid());

DROP POLICY IF EXISTS "Authors and admins can update discussions" ON public.discussions;
CREATE POLICY "Authors and admins can update discussions" ON public.discussions FOR UPDATE TO authenticated 
    USING (author_user_id = auth.uid() OR public.has_wedding_role(wedding_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Authors and admins can delete discussions" ON public.discussions;
CREATE POLICY "Authors and admins can delete discussions" ON public.discussions FOR DELETE TO authenticated 
    USING (author_user_id = auth.uid() OR public.has_wedding_role(wedding_id, ARRAY['owner', 'admin']));

-- 7.8 Guests Policies
DROP POLICY IF EXISTS "Members can view guests" ON public.guests;
CREATE POLICY "Members can view guests" ON public.guests FOR SELECT TO authenticated USING (public.is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "Editors and above can add guests" ON public.guests;
CREATE POLICY "Editors and above can add guests" ON public.guests FOR INSERT TO authenticated 
    WITH CHECK (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'editor']));

DROP POLICY IF EXISTS "Editors and above can update guests" ON public.guests;
CREATE POLICY "Editors and above can update guests" ON public.guests FOR UPDATE TO authenticated 
    USING (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'editor']))
    WITH CHECK (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'editor']));

DROP POLICY IF EXISTS "Editors and above can delete guests" ON public.guests;
CREATE POLICY "Editors and above can delete guests" ON public.guests FOR DELETE TO authenticated 
    USING (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'editor']));

-- 7.9 RSVP Submissions Policies
DROP POLICY IF EXISTS "Public can submit RSVP for published wedding" ON public.rsvp_submissions;
CREATE POLICY "Public can submit RSVP for published wedding" ON public.rsvp_submissions FOR INSERT TO anon, authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.weddings
            WHERE id = rsvp_submissions.wedding_id
              AND invitation_published = true
              AND rsvp_enabled = true
        )
    );

DROP POLICY IF EXISTS "Members can view RSVP submissions" ON public.rsvp_submissions;
CREATE POLICY "Members can view RSVP submissions" ON public.rsvp_submissions FOR SELECT TO authenticated 
    USING (public.is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "Owners and admins can delete RSVP submissions" ON public.rsvp_submissions;
CREATE POLICY "Owners and admins can delete RSVP submissions" ON public.rsvp_submissions FOR DELETE TO authenticated 
    USING (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin']));

-- ==============================================================================
-- 8. Storage Setup & Policies
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'wedding-media',
    'wedding-media',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

DROP POLICY IF EXISTS "Public can view wedding media" ON storage.objects;
CREATE POLICY "Public can view wedding media" ON storage.objects FOR SELECT TO anon, authenticated
    USING (bucket_id = 'wedding-media');

DROP POLICY IF EXISTS "Authenticated users can upload wedding media" ON storage.objects;
CREATE POLICY "Authenticated users can upload wedding media" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'wedding-media');

DROP POLICY IF EXISTS "Authenticated users can update own wedding media" ON storage.objects;
CREATE POLICY "Authenticated users can update own wedding media" ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'wedding-media' AND owner = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can delete own wedding media" ON storage.objects;
CREATE POLICY "Authenticated users can delete own wedding media" ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'wedding-media' AND owner = auth.uid());
