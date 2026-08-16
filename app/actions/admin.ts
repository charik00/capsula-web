"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { extractDocText } from "@/lib/extract-text";

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

// Список выданных доступов (для управления: продлить/отменить)
export async function listAccess() {
  await assertAdmin();
  const { data: acc, error } = await supabaseAdmin
    .from("user_access")
    .select("id, user_email, meditation_id, expires_at")
    .order("expires_at", { ascending: true });
  if (error) return { success: false, error: error.message, data: [] };
  const { data: meds } = await supabaseAdmin
    .from("meditations")
    .select("id, title");
  const titles: Record<string, string> = {};
  (meds || []).forEach((m) => (titles[m.id] = m.title));
  return {
    success: true,
    data: (acc || []).map((a) => ({
      id: a.id,
      user_email: a.user_email,
      meditation: titles[a.meditation_id] || a.meditation_id,
      expires_at: a.expires_at,
    })),
  };
}

// Продлить доступ на N дней (от текущей даты окончания, либо от сейчас)
export async function extendAccess(accessId: string, days: number) {
  await assertAdmin();
  const n = Number(days);
  if (!accessId || !Number.isFinite(n) || n <= 0) {
    return { success: false, error: "Укажите срок в днях (> 0)" };
  }
  const { data: row } = await supabaseAdmin
    .from("user_access")
    .select("expires_at")
    .eq("id", accessId)
    .maybeSingle();
  if (!row) return { success: false, error: "Доступ не найден" };

  const now = Date.now();
  const current = new Date(row.expires_at).getTime();
  const base = current > now ? current : now;
  const next = new Date(base + n * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabaseAdmin
    .from("user_access")
    .update({ expires_at: next })
    .eq("id", accessId);
  if (error) return { success: false, error: error.message };
  return { success: true, expires_at: next };
}

// Отменить доступ (удалить запись)
export async function revokeAccess(accessId: string) {
  await assertAdmin();
  if (!accessId) return { success: false, error: "Не указан доступ" };
  const { error } = await supabaseAdmin
    .from("user_access")
    .delete()
    .eq("id", accessId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// Полностью удалить клиента: доступы, анкеты, запись в clients, аккаунт
export async function deleteClient(email: string) {
  await assertAdmin();
  const clean = (email || "").trim().toLowerCase();
  if (!clean) return { success: false, error: "Не указан email" };
  if (ADMIN_EMAILS.includes(clean)) {
    return { success: false, error: "Нельзя удалить админ-аккаунт" };
  }

  await supabaseAdmin.from("user_access").delete().eq("user_email", clean);
  await supabaseAdmin
    .from("questionnaires")
    .delete()
    .eq("client_email", clean);
  await supabaseAdmin.from("clients").delete().eq("email", clean);

  const list = await supabaseAdmin.auth.admin.listUsers();
  const u = list.data?.users?.find(
    (x) => x.email?.toLowerCase() === clean
  );
  if (u) await supabaseAdmin.auth.admin.deleteUser(u.id);

  return { success: true };
}

// ===== Карточка клиента: анкета, доступы, комментарии, файлы =====

export async function getClientCard(email: string) {
  await assertAdmin();
  const clean = (email || "").trim().toLowerCase();
  if (!clean) return { success: false, error: "Не указан email" };

  const [q, acc, meds, notes, files, listens, matLib, matGrants] =
    await Promise.all([
    supabaseAdmin
      .from("questionnaires")
      .select("id, program, contact, answers, created_at")
      .eq("client_email", clean)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("user_access")
      .select("id, meditation_id, expires_at")
      .eq("user_email", clean)
      .order("expires_at", { ascending: true }),
    supabaseAdmin.from("meditations").select("id, title"),
    supabaseAdmin
      .from("client_notes")
      .select("id, body, created_at")
      .eq("client_email", clean)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("client_files")
      .select("id, title, kind, url, expires_at, created_at")
      .eq("client_email", clean)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("listen_events")
      .select("meditation_id, kind, created_at")
      .eq("user_email", clean),
    supabaseAdmin
      .from("materials")
      .select("id, title, kind, url, program, created_at")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("material_access")
      .select("material_id, expires_at")
      .eq("user_email", clean),
  ]);

  const titles: Record<string, string> = {};
  (meds.data || []).forEach((m) => (titles[m.id] = m.title));

  // Сводка прослушиваний по каждой медитации
  const byMed: Record<
    string,
    { meditation: string; plays: number; completes: number; last: string | null }
  > = {};
  (listens.data || []).forEach((e) => {
    const row =
      byMed[e.meditation_id] ||
      (byMed[e.meditation_id] = {
        meditation: titles[e.meditation_id] || e.meditation_id,
        plays: 0,
        completes: 0,
        last: null,
      });
    if (e.kind === "complete") row.completes += 1;
    else row.plays += 1;
    if (!row.last || e.created_at > row.last) row.last = e.created_at;
  });
  const listenStats = Object.values(byMed).sort((a, b) =>
    (b.last || "").localeCompare(a.last || "")
  );

  return {
    success: true,
    data: {
      questionnaires: q.data || [],
      accesses: (acc.data || []).map((a) => ({
        id: a.id,
        meditation: titles[a.meditation_id] || a.meditation_id,
        expires_at: a.expires_at,
      })),
      listens: listenStats,
      materialsLibrary: matLib.data || [],
      materialGrants: matGrants.data || [],
      notes: notes.data || [],
      files: files.data || [],
    },
  };
}

export async function addClientNote(email: string, body: string) {
  await assertAdmin();
  const clean = (email || "").trim().toLowerCase();
  const text = (body || "").trim();
  if (!clean || !text) {
    return { success: false, error: "Пустой комментарий" };
  }
  const { error } = await supabaseAdmin
    .from("client_notes")
    .insert([{ client_email: clean, body: text }]);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteClientNote(id: string) {
  await assertAdmin();
  if (!id) return { success: false, error: "Нет id" };
  const { error } = await supabaseAdmin
    .from("client_notes")
    .delete()
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function createClientFileUpload(
  email: string,
  filename: string
) {
  await assertAdmin();
  const clean = (email || "").trim().toLowerCase();
  if (!clean) return { success: false, error: "Не указан email" };
  const ext = (filename.split(".").pop() || "dat").toLowerCase();
  const path = `client-files/${Date.now()}-${Math.random()
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

// Срок доступа: число дней -> дата истечения; пусто/0 -> бессрочно (null)
function daysToExpiry(days?: number): string | null {
  const n = Number(days);
  if (!Number.isFinite(n) || n <= 0) return null;
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString();
}

export async function saveClientFile(
  email: string,
  title: string,
  kind: string,
  path: string,
  days?: number
) {
  await assertAdmin();
  const clean = (email || "").trim().toLowerCase();
  if (!clean || !title.trim() || !path) {
    return { success: false, error: "Заполните название и выберите файл" };
  }
  const { error } = await supabaseAdmin.from("client_files").insert([
    {
      client_email: clean,
      title: title.trim(),
      kind: kind || "document",
      path,
      expires_at: daysToExpiry(days),
    },
  ]);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// Материал-ссылка (без файла): kind='link', хранится url
export async function saveClientLink(
  email: string,
  title: string,
  url: string,
  days?: number
) {
  await assertAdmin();
  const clean = (email || "").trim().toLowerCase();
  const link = (url || "").trim();
  if (!clean || !title.trim() || !link) {
    return { success: false, error: "Укажите название и ссылку" };
  }
  if (!/^https?:\/\//i.test(link)) {
    return {
      success: false,
      error: "Ссылка должна начинаться с http:// или https://",
    };
  }
  const { error } = await supabaseAdmin.from("client_files").insert([
    {
      client_email: clean,
      title: title.trim(),
      kind: "link",
      url: link,
      expires_at: daysToExpiry(days),
    },
  ]);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteClientFile(id: string) {
  await assertAdmin();
  if (!id) return { success: false, error: "Нет id" };
  const { data: f } = await supabaseAdmin
    .from("client_files")
    .select("path")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabaseAdmin
    .from("client_files")
    .delete()
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  if (f?.path) await supabaseAdmin.storage.from("media").remove([f.path]);
  return { success: true };
}

// Изменить срок доступа к материалу: days>0 — продлить от сейчас на N дней,
// пусто/0 — сделать бессрочным (null).
export async function setMaterialExpiry(id: string, days?: number) {
  await assertAdmin();
  if (!id) return { success: false, error: "Нет id" };
  const { error } = await supabaseAdmin
    .from("client_files")
    .update({ expires_at: daysToExpiry(days) })
    .eq("id", id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ===== Библиотека материалов (общая) + выдача клиентам галочками =====

export async function listMaterials() {
  await assertAdmin();
  const { data, error } = await supabaseAdmin
    .from("materials")
    .select("id, title, kind, url, description, program, body, created_at")
    .order("created_at", { ascending: false });
  if (error) return { success: false, error: error.message, data: [] };
  return { success: true, data: data || [] };
}

export async function createMaterialUpload(filename: string) {
  await assertAdmin();
  const ext = (filename.split(".").pop() || "dat").toLowerCase();
  const path = `materials/${Date.now()}-${Math.random()
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

export async function saveMaterial(
  title: string,
  kind: string,
  path: string,
  description?: string,
  program?: string
) {
  await assertAdmin();
  if (!title.trim() || !path) {
    return { success: false, error: "Заполните название и выберите файл" };
  }
  // Word/PDF/txt — сразу извлекаем читаемый текст (клиент читает в окне)
  const body = await extractDocText(path);
  const { error } = await supabaseAdmin.from("materials").insert([
    {
      title: title.trim(),
      kind: kind || "document",
      path,
      description: description?.trim() || null,
      program: program || "both",
      body,
    },
  ]);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function saveMaterialLink(
  title: string,
  url: string,
  description?: string,
  program?: string
) {
  await assertAdmin();
  const link = (url || "").trim();
  if (!title.trim() || !link) {
    return { success: false, error: "Укажите название и ссылку" };
  }
  if (!/^https?:\/\//i.test(link)) {
    return {
      success: false,
      error: "Ссылка должна начинаться с http:// или https://",
    };
  }
  const { error } = await supabaseAdmin.from("materials").insert([
    {
      title: title.trim(),
      kind: "link",
      url: link,
      description: description?.trim() || null,
      program: program || "both",
    },
  ]);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// Триггер — текстовый материал (без файла): kind='trigger', текст в body
export async function saveMaterialTrigger(
  title: string,
  body: string,
  program?: string,
  description?: string
) {
  await assertAdmin();
  if (!title.trim() || !body.trim()) {
    return { success: false, error: "Заполните название и текст триггера" };
  }
  const { error } = await supabaseAdmin.from("materials").insert([
    {
      title: title.trim(),
      kind: "trigger",
      body: body.trim(),
      description: description?.trim() || null,
      program: program || "both",
    },
  ]);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// Редактирование материала: название, описание, ссылка и/или новый файл
export async function updateMaterial(
  id: string,
  title: string,
  description: string,
  url?: string,
  newPath?: string,
  program?: string,
  body?: string
) {
  await assertAdmin();
  if (!id || !title.trim()) {
    return { success: false, error: "Название не может быть пустым" };
  }
  let oldPath: string | null = null;
  if (newPath) {
    const { data } = await supabaseAdmin
      .from("materials")
      .select("path")
      .eq("id", id)
      .maybeSingle();
    oldPath = data?.path || null;
  }
  const patch: Record<string, unknown> = {
    title: title.trim(),
    description: description?.trim() || null,
  };
  if (url !== undefined) patch.url = url.trim() || null;
  if (newPath) {
    patch.path = newPath;
    patch.body = await extractDocText(newPath); // заново извлекаем текст
  }
  if (program !== undefined) patch.program = program || "both";
  if (body !== undefined) patch.body = body.trim() || null;

  const { error } = await supabaseAdmin
    .from("materials")
    .update(patch)
    .eq("id", id);
  if (error) return { success: false, error: error.message };

  if (newPath && oldPath && !/^https?:\/\//i.test(oldPath)) {
    await supabaseAdmin.storage.from("media").remove([oldPath]);
  }
  return { success: true };
}

export async function deleteMaterial(id: string) {
  await assertAdmin();
  if (!id) return { success: false, error: "Нет id" };
  const { data: m } = await supabaseAdmin
    .from("materials")
    .select("path")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabaseAdmin.from("materials").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  if (m?.path && !/^https?:\/\//i.test(m.path)) {
    await supabaseAdmin.storage.from("media").remove([m.path]);
  }
  return { success: true };
}

// Выдать/обновить доступ клиента к материалу (days пусто/0 = бессрочно)
export async function grantMaterialAccess(
  email: string,
  materialId: string,
  days?: number
) {
  await assertAdmin();
  const clean = (email || "").trim().toLowerCase();
  if (!clean || !materialId) {
    return { success: false, error: "Не указан клиент или материал" };
  }
  const { error } = await supabaseAdmin.from("material_access").upsert(
    {
      user_email: clean,
      material_id: materialId,
      expires_at: daysToExpiry(days),
    },
    { onConflict: "user_email,material_id" }
  );
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function revokeMaterialAccess(email: string, materialId: string) {
  await assertAdmin();
  const clean = (email || "").trim().toLowerCase();
  if (!clean || !materialId) {
    return { success: false, error: "Не указан клиент или материал" };
  }
  const { error } = await supabaseAdmin
    .from("material_access")
    .delete()
    .eq("user_email", clean)
    .eq("material_id", materialId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// Выдать клиенту материалы разом. program: 'smoking'|'sugar' — только этой
// программы (+ общие 'both'); пусто — вообще все.
export async function grantAllMaterials(
  email: string,
  days?: number,
  program?: string
) {
  await assertAdmin();
  const clean = (email || "").trim().toLowerCase();
  if (!clean) return { success: false, error: "Не указан клиент" };
  let q = supabaseAdmin.from("materials").select("id");
  if (program === "smoking" || program === "sugar") {
    q = q.or(`program.eq.${program},program.eq.both,program.is.null`);
  }
  const { data: mats } = await q;
  const ids = (mats || []).map((m) => m.id);
  if (ids.length === 0) return { success: true };
  const expires_at = daysToExpiry(days);
  const rows = ids.map((id) => ({
    user_email: clean,
    material_id: id,
    expires_at,
  }));
  const { error } = await supabaseAdmin
    .from("material_access")
    .upsert(rows, { onConflict: "user_email,material_id" });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// Снять у клиента все материалы разом
export async function revokeAllMaterials(email: string) {
  await assertAdmin();
  const clean = (email || "").trim().toLowerCase();
  if (!clean) return { success: false, error: "Не указан клиент" };
  const { error } = await supabaseAdmin
    .from("material_access")
    .delete()
    .eq("user_email", clean);
  if (error) return { success: false, error: error.message };
  return { success: true };
}
