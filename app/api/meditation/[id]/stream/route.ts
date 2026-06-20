import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Стримим аудио ЧЕРЕЗ свой домен (а не напрямую с supabase.co).
// Зачем: для браузера файл становится «своим» — его не режут
// блокировщики рекламы / приватные браузеры / VPN, и не мешает
// защита от слежки. Range-запросы пробрасываем как есть — без них
// Safari на iPhone не воспроизводит и не перематывает аудио.
export const runtime = "nodejs";

const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 час

function contentTypeFor(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "mp3":
      return "audio/mpeg";
    case "wav":
      return "audio/wav";
    case "m4a":
    case "mp4":
      return "audio/mp4";
    case "ogg":
      return "audio/ogg";
    case "aac":
      return "audio/aac";
    default:
      return "audio/mpeg";
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1. Сессия
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return new NextResponse("Не авторизован", { status: 401 });
  }
  const email = user.email.toLowerCase();

  // 2. Белый список клиентов
  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("is_active")
    .eq("email", email)
    .maybeSingle();
  if (!client || !client.is_active) {
    return new NextResponse("Доступ не открыт", { status: 403 });
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
    return new NextResponse("Доступ к медитации истёк или не выдан", {
      status: 403,
    });
  }

  // 4. Путь к файлу
  const { data: meditation } = await supabaseAdmin
    .from("meditations")
    .select("audio_url")
    .eq("id", id)
    .maybeSingle();
  if (!meditation || !meditation.audio_url) {
    return new NextResponse("Медитация не найдена", { status: 404 });
  }

  // 5. Источник: легаси-URL или приватный путь в бакете
  let sourceUrl: string;
  if (/^https?:\/\//i.test(meditation.audio_url)) {
    sourceUrl = meditation.audio_url;
  } else {
    const { data: signed, error } = await supabaseAdmin.storage
      .from("media")
      .createSignedUrl(meditation.audio_url, SIGNED_URL_TTL_SECONDS);
    if (error || !signed) {
      return new NextResponse("Не удалось получить файл", { status: 500 });
    }
    sourceUrl = signed.signedUrl;
  }

  // 6. Тянем файл из хранилища, пробрасывая Range клиента
  const range = request.headers.get("range");
  const upstream = await fetch(sourceUrl, {
    headers: range ? { Range: range } : {},
    // не кэшируем на стороне сервера
    cache: "no-store",
  });

  if (!upstream.ok && upstream.status !== 206) {
    return new NextResponse("Не удалось загрузить файл", {
      status: 502,
    });
  }

  // 7. Отдаём поток клиенту с правильными заголовками для <audio>
  const headers = new Headers();
  headers.set("Content-Type", contentTypeFor(meditation.audio_url));
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "private, no-store");
  for (const h of ["content-length", "content-range"]) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status, // 200 или 206 (частичный контент)
    headers,
  });
}
