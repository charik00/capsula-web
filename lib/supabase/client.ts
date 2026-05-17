import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY не заданы. Проверь .env и переменные Vercel."
  );
}

// Браузерный клиент на cookie — сессия видна и серверу (SSR), и middleware.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
