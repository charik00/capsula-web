import { supabaseAdmin } from "@/lib/supabase/admin";

// Достаёт читаемый текст из загруженного документа (Word/PDF/txt) в бакете.
// Возвращает текст или null (если формат не текстовый или ничего не вышло).
// Только Word (.docx) и .txt превращаем в текст. PDF НЕ трогаем — он
// показывается как есть (слайды по ширине экрана в кабинете).
export async function extractDocText(path: string): Promise<string | null> {
  const ext = path.split(".").pop()?.toLowerCase();
  if (!ext || !["docx", "txt"].includes(ext)) return null;

  try {
    const { data, error } = await supabaseAdmin.storage
      .from("media")
      .download(path);
    if (error || !data) return null;
    const buffer = Buffer.from(await data.arrayBuffer());

    if (ext === "txt") {
      return buffer.toString("utf8").trim() || null;
    }

    // docx
    const mod = await import("mammoth");
    const mammoth = (mod as { default?: typeof mod }).default ?? mod;
    const result = await mammoth.extractRawText({ buffer });
    const text = (result.value || "").replace(/\n{3,}/g, "\n\n").trim();
    return text.length > 3 ? text : null;
  } catch (e) {
    console.error("extractDocText error:", e);
    return null;
  }
}
