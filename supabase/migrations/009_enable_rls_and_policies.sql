-- ==============================================================================
-- Migration 009: Row Level Security (RLS) Helper Functions and Policies
-- Spec: Make_My_Marriage_Database_Supabase.md - Section 6
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Security Definer Helper Functions (Protected against recursive RLS)
-- ------------------------------------------------------------------------------

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

-- ------------------------------------------------------------------------------
-- 2. Enable RLS on all tables
-- ------------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvp_submissions ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 3. Profiles Policies
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

-- ------------------------------------------------------------------------------
-- 4. Weddings Policies
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Members can view their wedding details" ON public.weddings;
CREATE POLICY "Members can view their wedding details"
    ON public.weddings FOR SELECT
    TO authenticated
    USING (public.is_wedding_member(id));

DROP POLICY IF EXISTS "Users can create wedding as owner" ON public.weddings;
CREATE POLICY "Users can create wedding as owner"
    ON public.weddings FOR INSERT
    TO authenticated
    WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "Owners and admins can update wedding details" ON public.weddings;
CREATE POLICY "Owners and admins can update wedding details"
    ON public.weddings FOR UPDATE
    TO authenticated
    USING (public.has_wedding_role(id, ARRAY['owner', 'admin']))
    WITH CHECK (public.has_wedding_role(id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Only wedding owner can delete wedding" ON public.weddings;
CREATE POLICY "Only wedding owner can delete wedding"
    ON public.weddings FOR DELETE
    TO authenticated
    USING (owner_user_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 5. Wedding Members Policies
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Members can view member roster" ON public.wedding_members;
CREATE POLICY "Members can view member roster"
    ON public.wedding_members FOR SELECT
    TO authenticated
    USING (public.is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "Owners and admins can add members" ON public.wedding_members;
CREATE POLICY "Owners and admins can add members"
    ON public.wedding_members FOR INSERT
    TO authenticated
    WITH CHECK (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin']));

DROP POLICY IF EXISTS "Owners and admins can update members (except owner)" ON public.wedding_members;
CREATE POLICY "Owners and admins can update members (except owner)"
    ON public.wedding_members FOR UPDATE
    TO authenticated
    USING (
        public.has_wedding_role(wedding_id, ARRAY['owner', 'admin'])
        AND user_id != (SELECT owner_user_id FROM public.weddings WHERE id = wedding_id)
    )
    WITH CHECK (
        public.has_wedding_role(wedding_id, ARRAY['owner', 'admin'])
        AND user_id != (SELECT owner_user_id FROM public.weddings WHERE id = wedding_id)
    );

DROP POLICY IF EXISTS "Owners and admins can remove members (except owner)" ON public.wedding_members;
CREATE POLICY "Owners and admins can remove members (except owner)"
    ON public.wedding_members FOR DELETE
    TO authenticated
    USING (
        public.has_wedding_role(wedding_id, ARRAY['owner', 'admin'])
        AND user_id != (SELECT owner_user_id FROM public.weddings WHERE id = wedding_id)
    );

-- ------------------------------------------------------------------------------
-- 6. Expenses Policies
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Members can view expenses" ON public.expenses;
CREATE POLICY "Members can view expenses"
    ON public.expenses FOR SELECT
    TO authenticated
    USING (public.is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "Editors and above can add expenses" ON public.expenses;
CREATE POLICY "Editors and above can add expenses"
    ON public.expenses FOR INSERT
    TO authenticated
    WITH CHECK (
        public.has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'editor'])
        AND created_by = auth.uid()
    );

DROP POLICY IF EXISTS "Editors and above can update expenses" ON public.expenses;
CREATE POLICY "Editors and above can update expenses"
    ON public.expenses FOR UPDATE
    TO authenticated
    USING (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'editor']))
    WITH CHECK (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'editor']));

DROP POLICY IF EXISTS "Owners and admins can delete expenses" ON public.expenses;
CREATE POLICY "Owners and admins can delete expenses"
    ON public.expenses FOR DELETE
    TO authenticated
    USING (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin']));

-- ------------------------------------------------------------------------------
-- 7. Events Policies
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Members can view wedding events" ON public.events;
CREATE POLICY "Members can view wedding events"
    ON public.events FOR SELECT
    TO authenticated
    USING (public.is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "Public can view events for published invitations" ON public.events;
CREATE POLICY "Public can view events for published invitations"
    ON public.events FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.weddings 
            WHERE id = events.wedding_id 
              AND invitation_published = true
        )
    );

DROP POLICY IF EXISTS "Editors and above can add events" ON public.events;
CREATE POLICY "Editors and above can add events"
    ON public.events FOR INSERT
    TO authenticated
    WITH CHECK (
        public.has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'editor'])
        AND created_by = auth.uid()
    );

DROP POLICY IF EXISTS "Editors and above can update events" ON public.events;
CREATE POLICY "Editors and above can update events"
    ON public.events FOR UPDATE
    TO authenticated
    USING (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'editor']))
    WITH CHECK (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'editor']));

DROP POLICY IF EXISTS "Editors and above can delete events" ON public.events;
CREATE POLICY "Editors and above can delete events"
    ON public.events FOR DELETE
    TO authenticated
    USING (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'editor']));

-- ------------------------------------------------------------------------------
-- 8. Tasks Policies
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Members can view wedding tasks" ON public.tasks;
CREATE POLICY "Members can view wedding tasks"
    ON public.tasks FOR SELECT
    TO authenticated
    USING (public.is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "Editors and above can add tasks" ON public.tasks;
CREATE POLICY "Editors and above can add tasks"
    ON public.tasks FOR INSERT
    TO authenticated
    WITH CHECK (
        public.has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'editor'])
        AND created_by = auth.uid()
    );

DROP POLICY IF EXISTS "Members can update tasks" ON public.tasks;
CREATE POLICY "Members can update tasks"
    ON public.tasks FOR UPDATE
    TO authenticated
    USING (public.is_wedding_member(wedding_id))
    WITH CHECK (public.is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "Editors and above can delete tasks" ON public.tasks;
CREATE POLICY "Editors and above can delete tasks"
    ON public.tasks FOR DELETE
    TO authenticated
    USING (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'editor']));

-- ------------------------------------------------------------------------------
-- 9. Discussions Policies
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Members can view discussions" ON public.discussions;
CREATE POLICY "Members can view discussions"
    ON public.discussions FOR SELECT
    TO authenticated
    USING (public.is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "Members can add discussions" ON public.discussions;
CREATE POLICY "Members can add discussions"
    ON public.discussions FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_wedding_member(wedding_id)
        AND author_user_id = auth.uid()
    );

DROP POLICY IF EXISTS "Authors and admins can update discussions" ON public.discussions;
CREATE POLICY "Authors and admins can update discussions"
    ON public.discussions FOR UPDATE
    TO authenticated
    USING (
        author_user_id = auth.uid() 
        OR public.has_wedding_role(wedding_id, ARRAY['owner', 'admin'])
    );

DROP POLICY IF EXISTS "Authors and admins can delete discussions" ON public.discussions;
CREATE POLICY "Authors and admins can delete discussions"
    ON public.discussions FOR DELETE
    TO authenticated
    USING (
        author_user_id = auth.uid() 
        OR public.has_wedding_role(wedding_id, ARRAY['owner', 'admin'])
    );

-- ------------------------------------------------------------------------------
-- 10. Guests Policies (Strictly private to authorized wedding members)
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Members can view guests" ON public.guests;
CREATE POLICY "Members can view guests"
    ON public.guests FOR SELECT
    TO authenticated
    USING (public.is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "Editors and above can add guests" ON public.guests;
CREATE POLICY "Editors and above can add guests"
    ON public.guests FOR INSERT
    TO authenticated
    WITH CHECK (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'editor']));

DROP POLICY IF EXISTS "Editors and above can update guests" ON public.guests;
CREATE POLICY "Editors and above can update guests"
    ON public.guests FOR UPDATE
    TO authenticated
    USING (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'editor']))
    WITH CHECK (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'editor']));

DROP POLICY IF EXISTS "Editors and above can delete guests" ON public.guests;
CREATE POLICY "Editors and above can delete guests"
    ON public.guests FOR DELETE
    TO authenticated
    USING (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin', 'editor']));

-- ------------------------------------------------------------------------------
-- 11. RSVP Submissions Policies
-- ------------------------------------------------------------------------------

DROP POLICY IF EXISTS "Public can submit RSVP for published wedding" ON public.rsvp_submissions;
CREATE POLICY "Public can submit RSVP for published wedding"
    ON public.rsvp_submissions FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.weddings
            WHERE id = rsvp_submissions.wedding_id
              AND invitation_published = true
              AND rsvp_enabled = true
        )
    );

DROP POLICY IF EXISTS "Members can view RSVP submissions" ON public.rsvp_submissions;
CREATE POLICY "Members can view RSVP submissions"
    ON public.rsvp_submissions FOR SELECT
    TO authenticated
    USING (public.is_wedding_member(wedding_id));

DROP POLICY IF EXISTS "Owners and admins can delete RSVP submissions" ON public.rsvp_submissions;
CREATE POLICY "Owners and admins can delete RSVP submissions"
    ON public.rsvp_submissions FOR DELETE
    TO authenticated
    USING (public.has_wedding_role(wedding_id, ARRAY['owner', 'admin']));
