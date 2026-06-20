import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Логируем прослушивания: 'play' — клиент начал слушать, 'complete' —
// дослушал до конца. Видно потом в админке (карточка клиента).
// kind берём из query (?kind=complete), чтобы работал navigator.sendBeacon.
export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const email = user.email.toLowerCase();

  // Привязываем событие только к тем, кому эта медитация выдавалась
  const { data: access } = await supabaseAdmin
    .from("user_access")
    .select("id")
    .eq("user_email", email)
    .eq("meditation_id", id)
    .maybeSingle();
  if (!access) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const kindParam = new URL(request.url).searchParams.get("kind");
  const kind = kindParam === "complete" ? "complete" : "play";

  await supabaseAdmin
    .from("listen_events")
    .insert([{ user_email: email, meditation_id: id, kind }]);

  return NextResponse.json({ ok: true });
}
