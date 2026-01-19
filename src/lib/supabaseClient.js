import { createClient } from '@supabase/supabase-js';

// PENTING: Ganti dengan kredensial Supabase Anda yang benar
// Anda bisa menemukan ini di: Supabase Dashboard > Project Settings > API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wxkdwzjjfsrcwyswnebu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4a2R3empqZnNyY3d5c3duZWJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4ODI5MzcsImV4cCI6MjA4MzQ1ODkzN30.ZaroPtHOO31Ohu3KO2jRJ6xjG4ZvOIXdVzD_zUYqP0U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});