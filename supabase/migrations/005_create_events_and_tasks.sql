-- ==============================================================================
-- Migration 005: Create Events and Tasks Tables
-- Spec: Make_My_Marriage_Database_Supabase.md - Sections 4.5 & 4.6
-- ==============================================================================

-- 1. Events Table
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

COMMENT ON TABLE public.events IS 'Ceremonies, rituals, and schedule of the wedding (Haldi, Mehendi, Sangeet, Wedding, Reception)';

-- 2. Tasks Table
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

COMMENT ON TABLE public.tasks IS 'Checklists, planning milestones, and assignments for wedding party';
