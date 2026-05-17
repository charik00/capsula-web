"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function submitQuestionnaire(data: {
  email: string;
  contact?: string;
  program: string;
  answers: Record<string, string | string[]>;
}) {
  try {
    const email = (data.email || "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: "Укажите корректный email" };
    }
    if (!data.program) {
      return { success: false, error: "Не выбрана программа" };
    }
    if (!data.answers || Object.keys(data.answers).length === 0) {
      return { success: false, error: "Анкета пуста" };
    }

    const { error } = await supabaseAdmin.from("questionnaires").insert([
      {
        client_email: email,
        contact: data.contact?.trim() || null,
        program: data.program,
        answers: data.answers,
      },
    ]);

    if (error) {
      console.error("Questionnaire insert error:", error);
      return {
        success: false,
        error: "Не удалось сохранить анкету. Попробуйте позже.",
      };
    }

    return { success: true };
  } catch (err) {
    console.error("submitQuestionnaire exception:", err);
    return { success: false, error: "Произошла ошибка. Попробуйте позже." };
  }
}
