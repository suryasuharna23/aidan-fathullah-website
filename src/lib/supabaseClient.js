import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxkdwzjjfsrcwyswnebu.supabase.co';
const supabaseAnonKey = 'sb_publishable_V2797H0wz-agxyuYM_anng_-36YE4Ey';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
