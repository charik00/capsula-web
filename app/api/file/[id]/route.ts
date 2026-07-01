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

  // Материал выдан этому клиенту?
  const { data: access } = await supabaseAdmin
    .from("material_access")
    .select("expires_at")
    .eq("user_email", email)
    .eq("material_id", id)
    .maybeSingle();

  if (!access) {
    return NextResponse.json({ error: "Материал не выдан" }, { status: 403 });
  }
  if (access.expires_at && new Date(access.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "Срок доступа к материалу истёк" },
      { status: 403 }
    );
  }

  const { data: material } = await supabaseAdmin
    .from("materials")
    .select("path")
    .eq("id", id)
    .maybeSingle();

  if (!material || !material.path) {
    return NextResponse.json({ error: "Файл не найден" }, { status: 404 });
  }

  const { data: signed, error } = await supabaseAdmin.storage
    .from("media")
    .createSignedUrl(material.path, TTL);

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
