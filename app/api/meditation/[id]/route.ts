import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

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

  // 4. Путь к файлу — проверяем, что медитация существует
  const { data: meditation } = await supabaseAdmin
    .from("meditations")
    .select("audio_url")
    .eq("id", id)
    .maybeSingle();

  if (!meditation || !meditation.audio_url) {
    return NextResponse.json({ error: "Медитация не найдена" }, { status: 404 });
  }

  // Отдаём ссылку на стрим ЧЕРЕЗ наш домен, а не прямой URL supabase.co.
  // Так файл для браузера «свой» — его не блокируют блокировщики/приватные
  // браузеры, и работают range-запросы (перемотка на iPhone).
  return NextResponse.json(
    { url: `/api/meditation/${id}/stream` },
    { headers: { "Cache-Control": "no-store" } }
  );
}
