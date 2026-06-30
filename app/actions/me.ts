"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export interface MyMeditation {
  id: string;
  title: string;
  description: string | null;
}

// Возвращает медитации, доступ к которым у клиента ещё активен.
// Сами ссылки на аудио тут НЕ отдаём — за ними идёт запрос в
// /api/meditation/[id], где формируется короткая подписанная ссылка.
export async function getMyMeditations(): Promise<{
  allowed: boolean;
  meditations: MyMeditation[];
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return { allowed: false, meditations: [] };
  const email = user.email.toLowerCase();

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("is_active")
    .eq("email", email)
    .maybeSingle();

  if (!client || !client.is_active) {
    return { allowed: false, meditations: [] };
  }

  const { data: access } = await supabaseAdmin
    .from("user_access")
    .select("meditation_id")
    .eq("user_email", email)
    .gte("expires_at", new Date().toISOString());

  const ids = (access || []).map((a) => a.meditation_id);
  if (ids.length === 0) return { allowed: true, meditations: [] };

  const { data: meditations } = await supabaseAdmin
    .from("meditations")
    .select("id, title, description")
    .in("id", ids)
    .order("created_at", { ascending: false });

  return { allowed: true, meditations: (meditations || []) as MyMeditation[] };
}

export interface MyFile {
  id: string;
  title: string;
  kind: string;
  url: string | null;
  created_at: string;
}

// Файлы клиента (диеты, инструкции, документы) для кабинета.
export async function getMyMaterials(): Promise<MyFile[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return [];
  const email = user.email.toLowerCase();

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("is_active")
    .eq("email", email)
    .maybeSingle();
  if (!client || !client.is_active) return [];

  const { data } = await supabaseAdmin
    .from("client_files")
    .select("id, title, kind, url, created_at")
    .eq("client_email", email)
    .order("created_at", { ascending: false });

  return (data || []) as MyFile[];
}
