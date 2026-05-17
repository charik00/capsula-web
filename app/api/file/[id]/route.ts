import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const TTL = 2 * 60 * 60; // 2 часа

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }
  const email = user.email.toLowerCase();

  const { data: client } = await supabaseAdmin
    .from("clients")
    .select("is_active")
    .eq("email", email)
    .maybeSingle();
  if (!client || !client.is_active) {
    return NextResponse.json({ error: "Доступ не открыт" }, { status: 403 });
  }

  const { data: file } = await supabaseAdmin
    .from("client_files")
    .select("path, client_email")
    .eq("id", id)
    .maybeSingle();

  if (!file || file.client_email.toLowerCase() !== email) {
    return NextResponse.json({ error: "Файл не найден" }, { status: 404 });
  }

  const { data: signed, error } = await supabaseAdmin.storage
    .from("media")
    .createSignedUrl(file.path, TTL);

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
