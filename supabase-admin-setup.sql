-- =====================================================
-- SETUP DATABASE UNTUK SISTEM ADMIN
-- Jalankan script ini di Supabase SQL Editor
-- =====================================================

-- 1. Buat tabel admins untuk menyimpan daftar admin
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id),
    UNIQUE(email)
);

-- 2. Enable Row Level Security (RLS) untuk tabel admins
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Hanya admin yang bisa melihat daftar admin
CREATE POLICY "Admins can view admin list" ON public.admins
    FOR SELECT USING (
        auth.uid() IN (SELECT user_id FROM public.admins)
    );

-- 4. Buat storage bucket untuk media (jika belum ada)
-- Pergi ke Storage di Supabase Dashboard dan buat bucket bernama "media"
-- Atau jalankan:
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Policy untuk storage - Allow public read
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'media');

-- 6. Policy untuk storage - Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'media' AND auth.role() = 'authenticated'
    );

-- 7. Policy untuk storage - Allow users to delete their uploads
CREATE POLICY "Authenticated users can delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'media' AND auth.role() = 'authenticated'
    );

-- =====================================================
-- CARA MENAMBAHKAN ADMIN:
-- =====================================================
-- 1. Pertama, buat user di Supabase Dashboard > Authentication > Users
-- 2. Kemudian jalankan query berikut (ganti dengan email dan user_id yang sesuai):
--
-- INSERT INTO public.admins (user_id, email)
-- VALUES ('user-uuid-dari-auth-users', 'email@example.com');
--
-- Contoh:
-- INSERT INTO public.admins (user_id, email)
-- VALUES ('123e4567-e89b-12d3-a456-426614174000', 'admin@masidan.com');
-- =====================================================

-- =====================================================
-- PASTIKAN TABEL PHOTOS, VIDEOS, DAN STORIES SUDAH ADA
-- =====================================================

-- Tabel photos (jika belum ada)
CREATE TABLE IF NOT EXISTS public.photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    src TEXT NOT NULL,
    alt TEXT DEFAULT 'Foto',
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabel videos (jika belum ada)
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    title TEXT DEFAULT 'Untitled Video',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabel stories (jika belum ada)
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author TEXT NOT NULL,
    content TEXT NOT NULL,
    author_image TEXT,
    story_images TEXT[],
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS untuk semua tabel
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang bisa melihat foto
CREATE POLICY "Anyone can view photos" ON public.photos
    FOR SELECT USING (true);

-- Policy: Hanya authenticated users yang bisa menambah/edit/hapus foto
CREATE POLICY "Authenticated users can insert photos" ON public.photos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update photos" ON public.photos
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete photos" ON public.photos
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policy: Semua orang bisa melihat video
CREATE POLICY "Anyone can view videos" ON public.videos
    FOR SELECT USING (true);

-- Policy: Hanya authenticated users yang bisa menambah/edit/hapus video
CREATE POLICY "Authenticated users can insert videos" ON public.videos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update videos" ON public.videos
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete videos" ON public.videos
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policy: Semua orang bisa melihat dan menambah cerita
CREATE POLICY "Anyone can view stories" ON public.stories
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert stories" ON public.stories
    FOR INSERT WITH CHECK (true);

-- Policy: Hanya authenticated users yang bisa menghapus cerita
CREATE POLICY "Authenticated users can delete stories" ON public.stories
    FOR DELETE USING (auth.role() = 'authenticated');
