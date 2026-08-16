import { supabaseAdmin } from "@/lib/supabase/admin";

// Достаёт читаемый текст из загруженного документа (Word/PDF/txt) в бакете.
// Возвращает текст или null (если формат не текстовый или ничего не вышло).
export async function extractDocText(path: string): Promise<string | null> {
  const ext = path.split(".").pop()?.toLowerCase();
  if (!ext || !["docx", "pdf", "txt"].includes(ext)) return null;

  try {
    const { data, error } = await supabaseAdmin.storage
      .from("media")
      .download(path);
    if (error || !data) return null;
    const buffer = Buffer.from(await data.arrayBuffer());

    if (ext === "txt") {
      return buffer.toString("utf8").trim() || null;
    }

    if (ext === "docx") {
      const mod = await import("mammoth");
      const mammoth = (mod as { default?: typeof mod }).default ?? mod;
      const result = await mammoth.extractRawText({ buffer });
      const text = (result.value || "").replace(/\n{3,}/g, "\n\n").trim();
      return text.length > 3 ? text : null;
    }

    if (ext === "pdf") {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const res = await parser.getText();
      const text = (res.text || "")
        .replace(/-{2,}\s*\d+\s+of\s+\d+\s*-{2,}/gi, "\n\n") // метки страниц
        .replace(/\n{3,}/g, "\n\n")
        .trim();
      // если в PDF почти нет текста (презентация из картинок) — не подменяем
      return text.length > 40 ? text : null;
    }

    return null;
  } catch (e) {
    console.error("extractDocText error:", e);
    return null;
  }
}
