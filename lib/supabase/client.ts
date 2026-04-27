import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bwqymhrzywfzcdzzonsd.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3cXltaHJ6eXdmemNkenpvbnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMzM5NjAsImV4cCI6MjA4NTgwOTk2MH0.27u9e9QW4vT9T6nTRg536k-QyWg5OV-BlcoSwkR6PqQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
