-- ==============================================================================
-- Migration 010: Supabase Storage Bucket & Storage RLS Policies
-- Spec: Make_My_Marriage_Database_Supabase.md - Section 7
-- ==============================================================================

-- 1. Create wedding-media storage bucket (if not existing)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'wedding-media',
    'wedding-media',
    true, -- public asset read for invitation cover photos & avatars
    5242880, -- 5 MB max file size
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Storage RLS Policies
-- Storage paths convention: `<wedding_id>/<folder>/<filename>`

-- Policy: Anyone can view assets in wedding-media
DROP POLICY IF EXISTS "Public can view wedding media" ON storage.objects;
CREATE POLICY "Public can view wedding media"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'wedding-media');

-- Policy: Authenticated users can upload assets to wedding-media
DROP POLICY IF EXISTS "Authenticated users can upload wedding media" ON storage.objects;
CREATE POLICY "Authenticated users can upload wedding media"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'wedding-media'
        AND (storage.foldername(name))[1] IS NOT NULL
    );

-- Policy: Authenticated users can update own uploaded assets
DROP POLICY IF EXISTS "Authenticated users can update own wedding media" ON storage.objects;
CREATE POLICY "Authenticated users can update own wedding media"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'wedding-media' AND owner = auth.uid());

-- Policy: Authenticated users can delete own uploaded assets
DROP POLICY IF EXISTS "Authenticated users can delete own wedding media" ON storage.objects;
CREATE POLICY "Authenticated users can delete own wedding media"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'wedding-media' AND owner = auth.uid());
