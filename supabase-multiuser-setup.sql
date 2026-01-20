-- =====================================================
-- SETUP DATABASE UNTUK MULTI-INDIVIDUAL MEMORIAL PLATFORM
-- Jalankan script ini di Supabase SQL Editor
-- =====================================================

-- 1. Buat tabel memorials untuk menyimpan data orang yang dikenang
CREATE TABLE IF NOT EXISTS public.memorials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    birth_date DATE,
    death_date DATE,
    birth_place TEXT,
    bio TEXT,
    quote TEXT,
    quote_author TEXT,
    profile_image TEXT,
    cover_image TEXT,
    likes TEXT[], -- Array of liked things
    dislikes TEXT[], -- Array of disliked things
    admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Update tabel photos untuk reference ke memorial
ALTER TABLE public.photos 
ADD COLUMN IF NOT EXISTS memorial_id UUID REFERENCES public.memorials(id) ON DELETE CASCADE;

-- 3. Update tabel videos untuk reference ke memorial
ALTER TABLE public.videos 
ADD COLUMN IF NOT EXISTS memorial_id UUID REFERENCES public.memorials(id) ON DELETE CASCADE;

-- 4. Update tabel stories untuk reference ke memorial
ALTER TABLE public.stories 
ADD COLUMN IF NOT EXISTS memorial_id UUID REFERENCES public.memorials(id) ON DELETE CASCADE;

-- 5. Update tabel admins untuk menyimpan nama
ALTER TABLE public.admins
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 6. Enable RLS untuk tabel memorials
ALTER TABLE public.memorials ENABLE ROW LEVEL SECURITY;

-- 7. Policy untuk memorials
-- Semua orang bisa melihat memorials yang public
CREATE POLICY "Anyone can view public memorials" ON public.memorials
    FOR SELECT USING (is_public = true);

-- Admin bisa melihat semua memorials miliknya
CREATE POLICY "Admin can view own memorials" ON public.memorials
    FOR SELECT USING (auth.uid() = admin_id);

-- Admin bisa membuat memorial baru
CREATE POLICY "Admin can create memorials" ON public.memorials
    FOR INSERT WITH CHECK (auth.uid() = admin_id);

-- Admin bisa update memorial miliknya
CREATE POLICY "Admin can update own memorials" ON public.memorials
    FOR UPDATE USING (auth.uid() = admin_id);

-- Admin bisa delete memorial miliknya
CREATE POLICY "Admin can delete own memorials" ON public.memorials
    FOR DELETE USING (auth.uid() = admin_id);

-- 8. Update policy untuk photos agar filter by memorial
DROP POLICY IF EXISTS "Anyone can view photos" ON public.photos;
CREATE POLICY "Anyone can view photos of public memorials" ON public.photos
    FOR SELECT USING (
        memorial_id IS NULL OR
        EXISTS (SELECT 1 FROM public.memorials WHERE id = memorial_id AND is_public = true)
    );

DROP POLICY IF EXISTS "Authenticated users can insert photos" ON public.photos;
CREATE POLICY "Admin can insert photos to own memorials" ON public.photos
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        (memorial_id IS NULL OR EXISTS (SELECT 1 FROM public.memorials WHERE id = memorial_id AND admin_id = auth.uid()))
    );

DROP POLICY IF EXISTS "Authenticated users can update photos" ON public.photos;
CREATE POLICY "Admin can update photos of own memorials" ON public.photos
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        (memorial_id IS NULL OR EXISTS (SELECT 1 FROM public.memorials WHERE id = memorial_id AND admin_id = auth.uid()))
    );

DROP POLICY IF EXISTS "Authenticated users can delete photos" ON public.photos;
CREATE POLICY "Admin can delete photos of own memorials" ON public.photos
    FOR DELETE USING (
        auth.role() = 'authenticated' AND
        (memorial_id IS NULL OR EXISTS (SELECT 1 FROM public.memorials WHERE id = memorial_id AND admin_id = auth.uid()))
    );

-- 9. Update policy untuk videos agar filter by memorial
DROP POLICY IF EXISTS "Anyone can view videos" ON public.videos;
CREATE POLICY "Anyone can view videos of public memorials" ON public.videos
    FOR SELECT USING (
        memorial_id IS NULL OR
        EXISTS (SELECT 1 FROM public.memorials WHERE id = memorial_id AND is_public = true)
    );

DROP POLICY IF EXISTS "Authenticated users can insert videos" ON public.videos;
CREATE POLICY "Admin can insert videos to own memorials" ON public.videos
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND
        (memorial_id IS NULL OR EXISTS (SELECT 1 FROM public.memorials WHERE id = memorial_id AND admin_id = auth.uid()))
    );

DROP POLICY IF EXISTS "Authenticated users can update videos" ON public.videos;
CREATE POLICY "Admin can update videos of own memorials" ON public.videos
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND
        (memorial_id IS NULL OR EXISTS (SELECT 1 FROM public.memorials WHERE id = memorial_id AND admin_id = auth.uid()))
    );

DROP POLICY IF EXISTS "Authenticated users can delete videos" ON public.videos;
CREATE POLICY "Admin can delete videos of own memorials" ON public.videos
    FOR DELETE USING (
        auth.role() = 'authenticated' AND
        (memorial_id IS NULL OR EXISTS (SELECT 1 FROM public.memorials WHERE id = memorial_id AND admin_id = auth.uid()))
    );

-- 10. Update policy untuk stories agar filter by memorial
DROP POLICY IF EXISTS "Anyone can view stories" ON public.stories;
CREATE POLICY "Anyone can view stories of public memorials" ON public.stories
    FOR SELECT USING (
        memorial_id IS NULL OR
        EXISTS (SELECT 1 FROM public.memorials WHERE id = memorial_id AND is_public = true)
    );

DROP POLICY IF EXISTS "Anyone can insert stories" ON public.stories;
CREATE POLICY "Anyone can insert stories to public memorials" ON public.stories
    FOR INSERT WITH CHECK (
        memorial_id IS NULL OR
        EXISTS (SELECT 1 FROM public.memorials WHERE id = memorial_id AND is_public = true)
    );

DROP POLICY IF EXISTS "Authenticated users can delete stories" ON public.stories;
CREATE POLICY "Admin can delete stories of own memorials" ON public.stories
    FOR DELETE USING (
        auth.role() = 'authenticated' AND
        (memorial_id IS NULL OR EXISTS (SELECT 1 FROM public.memorials WHERE id = memorial_id AND admin_id = auth.uid()))
    );

-- 11. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_memorials_slug ON public.memorials(slug);
CREATE INDEX IF NOT EXISTS idx_memorials_admin_id ON public.memorials(admin_id);
CREATE INDEX IF NOT EXISTS idx_memorials_is_public ON public.memorials(is_public);
CREATE INDEX IF NOT EXISTS idx_photos_memorial_id ON public.photos(memorial_id);
CREATE INDEX IF NOT EXISTS idx_videos_memorial_id ON public.videos(memorial_id);
CREATE INDEX IF NOT EXISTS idx_stories_memorial_id ON public.stories(memorial_id);

-- 12. Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Convert to lowercase and replace spaces with hyphens
    base_slug := lower(regexp_replace(name, '[^a-zA-Z0-9\s]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    
    final_slug := base_slug;
    
    -- Check if slug exists and append number if needed
    WHILE EXISTS (SELECT 1 FROM public.memorials WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CONTOH: Cara membuat memorial baru
-- =====================================================
-- INSERT INTO public.memorials (
--     slug, name, birth_date, death_date, birth_place, bio, quote, quote_author,
--     profile_image, cover_image, likes, dislikes, admin_id, is_public
-- ) VALUES (
--     'mas-idan',
--     'Mas Idan',
--     '1990-01-01',
--     '2024-12-01',
--     'Jawa, Indonesia',
--     'Mas Idan adalah sosok yang penuh kehangatan dan kebijaksanaan...',
--     'Setiap orang ada masanya, setiap masa ada Aidannya.',
--     'Mas Idan',
--     'https://example.com/profile.jpg',
--     'https://example.com/cover.jpg',
--     ARRAY['Kopi di pagi hari', 'Membaca buku', 'Mendengarkan musik', 'Jalan-jalan alam'],
--     ARRAY['Ketidakjujuran', 'Kebisingan berlebihan', 'Makanan terlalu pedas', 'Kemacetan'],
--     'user-uuid-dari-auth',
--     true
-- );
