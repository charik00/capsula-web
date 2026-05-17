"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ADMIN_EMAILS = [
  "info@capsulaisrael.com",
  "morozovaalyonas@gmail.com",
];
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
    .select("id, client_email, contact, program, answers, created_at")
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

// Шаг 1: получить подписанный URL для прямой загрузки файла в Storage
// (браузер -> Supabase напрямую, без лимита размера серверных экшенов).
export async function createMeditationUpload(filename: string) {
  await assertAdmin();
  const ext = (filename.split(".").pop() || "mp3").toLowerCase();
  const path = `meditations/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const { data, error } = await supabaseAdmin.storage
    .from("media")
    .createSignedUploadUrl(path);

  if (error || !data) {
    return {
      success: false,
      error: error?.message || "Не удалось подготовить загрузку",
    };
  }
  return { success: true, path, token: data.token };
}

// Шаг 2: после успешной загрузки файла записать медитацию в БД.
export async function saveMeditation(
  title: string,
  description: string,
  path: string
) {
  await assertAdmin();
  if (!title.trim() || !path) {
    return { success: false, error: "Заполните название и выберите файл" };
  }
  const { error } = await supabaseAdmin
    .from("meditations")
    .insert([
      { title: title.trim(), description: description.trim() || null, audio_url: path },
    ]);
  if (error) {
    return { success: false, error: "Ошибка записи: " + error.message };
  }
  return { success: true };
}

export async function updateMeditation(
  id: string,
  title: string,
  description: string
) {
  await assertAdmin();
  if (!id || !title.trim()) {
    return { success: false, error: "Название не может быть пустым" };
  }
  const { error } = await supabaseAdmin
    .from("meditations")
    .update({
      title: title.trim(),
      description: description.trim() || null,
    })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteMeditation(id: string) {
  await assertAdmin();
  if (!id) return { success: false, error: "Не указана медитация" };

  // Узнаём путь к файлу, чтобы удалить и из хранилища
  const { data: med } = await supabaseAdmin
    .from("meditations")
    .select("audio_url")
    .eq("id", id)
    .maybeSingle();

  // Удаляем запись (user_access чистится каскадом по FK)
  const { error } = await supabaseAdmin
    .from("meditations")
    .delete()
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  // Удаляем файл из бакета (если это путь, а не внешний URL)
  if (med?.audio_url && !/^https?:\/\//i.test(med.audio_url)) {
    await supabaseAdmin.storage.from("media").remove([med.audio_url]);
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

// Логин+пароль для клиента. Создаёт/обновляет пользователя с паролем,
// добавляет в белый список. Возвращает email и пароль для передачи.
export async function setClientCredentials(
  email: string,
  password?: string,
  fullName?: string
) {
  await assertAdmin();
  const clean = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    return { success: false, error: "Некорректный email" };
  }
  let pass = (password || "").trim();
  if (!pass) {
    pass = "Capsula-" + Math.random().toString(36).slice(2, 8);
  }
  if (pass.length < 6) {
    return { success: false, error: "Пароль минимум 6 символов" };
  }

  const name = (fullName || "").trim();
  await supabaseAdmin
    .from("clients")
    .upsert(
      {
        email: clean,
        is_active: true,
        ...(name ? { full_name: name } : {}),
      },
      { onConflict: "email" }
    );

  const created = await supabaseAdmin.auth.admin.createUser({
    email: clean,
    password: pass,
    email_confirm: true,
  });

  if (created.error) {
    if (!/already|exist|registered/i.test(created.error.message)) {
      return { success: false, error: created.error.message };
    }
    // Уже есть — найдём и обновим пароль
    const list = await supabaseAdmin.auth.admin.listUsers();
    const u = list.data?.users?.find(
      (x) => x.email?.toLowerCase() === clean
    );
    if (!u) {
      return { success: false, error: "Не удалось найти пользователя" };
    }
    const upd = await supabaseAdmin.auth.admin.updateUserById(u.id, {
      password: pass,
      email_confirm: true,
    });
    if (upd.error) {
      return { success: false, error: upd.error.message };
    }
  }

  return { success: true, email: clean, password: pass };
}
