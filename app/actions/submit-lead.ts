"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitLead(data: {
  firstName: string;
  lastName: string;
  phone: string;
}) {
  try {
    // Создаем серверный клиент Supabase
    const supabase = await createClient();
    
    // Валидация данных
    if (!data.firstName || !data.lastName || !data.phone) {
      console.error("Validation error: Missing required fields", data);
      return {
        success: false,
        error: "Все поля обязательны для заполнения",
      };
    }

    // Проверка формата телефона (минимум 9 цифр после +972, всего минимум 12)
    const phoneDigits = data.phone.replace(/\D/g, "");
    if (!phoneDigits.startsWith("972")) {
      console.error("Phone validation error: Phone must start with 972", phoneDigits);
      return {
        success: false,
        error: "Номер телефона должен начинаться с +972",
      };
    }
    if (phoneDigits.length < 12) {
      console.error("Phone validation error: Phone too short", phoneDigits);
      return {
        success: false,
        error: "Некорректный номер телефона",
      };
    }

    // Подготавливаем данные для вставки
    const insertData = {
      first_name: data.firstName,
      last_name: data.lastName,
      phone: phoneDigits,
      // created_at будет автоматически установлен через default now()
    };

    console.log("Inserting lead data:", insertData);
    console.log("Attempting to insert into 'leads' table...");

    // Вставляем данные в таблицу leads
    const { data: insertedData, error } = await supabase
      .from("leads")
      .insert([insertData])
      .select();

    if (error) {
      console.error("Supabase Error:", error);
      console.error("Supabase Error Details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return {
        success: false,
        error: "Ошибка при сохранении данных. Попробуйте позже.",
      };
    }

    console.log("Lead successfully inserted:", insertedData);
    return {
      success: true,
    };
  } catch (error) {
    console.error("Submit lead exception:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    return {
      success: false,
      error: "Произошла ошибка. Попробуйте позже.",
    };
  }
}
