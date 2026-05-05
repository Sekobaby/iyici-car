import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// SADECE Anon Key kullan frontend'de
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service Role Key'i SİL veya comment'e al
// export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey); ❌ KALDIR
