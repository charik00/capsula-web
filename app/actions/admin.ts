"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ADMIN_EMAILS = ["morozovaalyonas@gmail.com"];
const SITE_URL = "https://www.capsulaisrael.com";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    throw new Error("FORBIDDEN");
  }
}

export async function listClients() {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("clients")
    .select("id, email, full_name, is_active, created_at")
    .order("created_at", { ascending: false });
  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data: data || [] };
}

export async function addClient(email: string, fullName: string) {
  await assertAdmin();
  const clean = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    return { success: false, error: "Некорректный email" };
  }
  const { error } = await supabaseAdmin
    .from("clients")
    .upsert(
      { email: clean, full_name: fullName.trim() || null, is_active: true },
      { onConflict: "email" }
    );
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function listQuestionnaires() {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("questionnaires")
    .select("id, client_email, answers, created_at")
    .order("created_at", { ascending: false });
  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data: data || [] };
}

export async function listMeditations() {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("meditations")
    .select("id, title, description")
    .order("created_at", { ascending: false });
  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data: data || [] };
}

export async function uploadMeditation(formData: FormData) {
  await assertAdmin();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const file = formData.get("file");

  if (!title || !(file instanceof File) || file.size === 0) {
    return { success: false, error: "Заполните название и выберите файл" };
  }

  const ext = file.name.split(".").pop() || "mp3";
  const path = `meditations/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("media")
    .upload(path, file, { contentType: file.type || "audio/mpeg" });

  if (uploadError) {
    return { success: false, error: "Ошибка загрузки: " + uploadError.message };
  }

  // В audio_url храним приватный путь в бакете media (не публичный URL).
  const { error: insertError } = await supabaseAdmin
    .from("meditations")
    .insert([{ title, description: description || null, audio_url: path }]);

  if (insertError) {
    return { success: false, error: "Ошибка записи: " + insertError.message };
  }
  return { success: true };
}

export async function grantAccess(
  email: string,
  meditationId: string,
  days: number
) {
  await assertAdmin();
  const clean = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    return { success: false, error: "Некорректный email" };
  }
  if (!meditationId) {
    return { success: false, error: "Выберите медитацию" };
  }
  const n = Number(days);
  if (!Number.isFinite(n) || n <= 0) {
    return { success: false, error: "Укажите срок в днях (> 0)" };
  }

  // Клиент попадает в белый список автоматически
  await supabaseAdmin
    .from("clients")
    .upsert({ email: clean, is_active: true }, { onConflict: "email" });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + n);

  const { error } = await supabaseAdmin.from("user_access").insert([
    {
      user_email: clean,
      meditation_id: meditationId,
      expires_at: expiresAt.toISOString(),
    },
  ]);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// Прямая ссылка для входа клиента (без письма, обходит лимит почты).
// Клиент попадает в белый список автоматически.
export async function generateClientLoginLink(email: string) {
  await assertAdmin();
  const clean = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    return { success: false, error: "Некорректный email" };
  }

  await supabaseAdmin
    .from("clients")
    .upsert({ email: clean, is_active: true }, { onConflict: "email" });

  // Пользователь должен существовать для magiclink
  const created = await supabaseAdmin.auth.admin.createUser({
    email: clean,
    email_confirm: true,
  });
  if (
    created.error &&
    !/already|exist|registered/i.test(created.error.message)
  ) {
    return { success: false, error: created.error.message };
  }

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: clean,
    options: { redirectTo: `${SITE_URL}/auth/confirm?next=/dashboard` },
  });

  const hashed = data?.properties?.hashed_token;
  if (error || !hashed) {
    return {
      success: false,
      error: error?.message || "Не удалось сформировать ссылку",
    };
  }

  const vtype = data?.properties?.verification_type || "magiclink";
  const link = `${SITE_URL}/auth/confirm?token_hash=${hashed}&type=${vtype}&next=/dashboard`;
  return { success: true, link };
}
