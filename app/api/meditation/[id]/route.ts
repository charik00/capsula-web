import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const SIGNED_URL_TTL_SECONDS = 2 * 60 * 60; // 2 часа

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1. Сессия
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  const email = user.email.toLowerCase();

  // 2. Белый список клиентов
  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("is_active")
    .eq("email", email)
    .maybeSingle();

  if (!client || !client.is_active) {
    return NextResponse.json({ error: "Доступ не открыт" }, { status: 403 });
  }

  // 3. Доступ к этой медитации не просрочен
  const { data: access } = await supabaseAdmin
    .from("user_access")
    .select("expires_at")
    .eq("user_email", email)
    .eq("meditation_id", id)
    .gte("expires_at", new Date().toISOString())
    .maybeSingle();

  if (!access) {
    return NextResponse.json(
      { error: "Доступ к медитации истёк или не выдан" },
      { status: 403 }
    );
  }

  // 4. Путь к файлу
  const { data: meditation } = await supabaseAdmin
    .from("meditations")
    .select("audio_url")
    .eq("id", id)
    .maybeSingle();

  if (!meditation || !meditation.audio_url) {
    return NextResponse.json({ error: "Медитация не найдена" }, { status: 404 });
  }

  // Легаси: если в БД лежит полный публичный URL — отдаём как есть.
  if (/^https?:\/\//i.test(meditation.audio_url)) {
    return NextResponse.json({ url: meditation.audio_url });
  }

  // Новый приватный путь в бакете media -> короткая подписанная ссылка
  const { data: signed, error } = await supabaseAdmin.storage
    .from("media")
    .createSignedUrl(meditation.audio_url, SIGNED_URL_TTL_SECONDS);

  if (error || !signed) {
    return NextResponse.json(
      { error: "Не удалось сформировать ссылку" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { url: signed.signedUrl },
    { headers: { "Cache-Control": "no-store" } }
  );
}
