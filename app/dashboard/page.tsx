import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { CabinetTabs } from "./cabinet-tabs";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  if (
    ["info@capsulaisrael.com", "morozovaalyonas@gmail.com"].includes(
      user.email.toLowerCase()
    )
  ) {
    redirect("/admin");
  }

  const { data: clientRow } = await supabaseAdmin
    .from("clients")
    .select("full_name")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();
  const greetingName = clientRow?.full_name?.trim() || user.email;

  return (
    <div className="min-h-screen bg-[#F5F3ED]">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <h1 className="text-3xl font-light text-[#302012] mb-4">
          Личный кабинет
        </h1>
        <CabinetTabs greeting={`Добро пожаловать, ${greetingName}`} />
      </div>
    </div>
  );
}
