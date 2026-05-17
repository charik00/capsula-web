"use client";

import { useEffect, useState } from "react";
import { getMyMaterials, type MyFile } from "@/app/actions/me";

const KIND_LABELS: Record<string, string> = {
  meditation: "Медитация",
  diet: "Диета",
  instruction: "Инструкция",
  document: "Документ",
};

export function MaterialsList() {
  const [files, setFiles] = useState<MyFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setFiles(await getMyMaterials());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openFile = async (id: string) => {
    setOpeningId(id);
    try {
      const res = await fetch(`/api/file/${id}`, { cache: "no-store" });
      if (!res.ok) {
        alert("Не удалось открыть файл");
        return;
      }
      const { url } = await res.json();
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      alert("Ошибка сети");
    } finally {
      setOpeningId(null);
    }
  };

  if (loading || files.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-light text-[#302012] mb-4">
        Материалы
      </h2>
      <div className="space-y-3">
        {files.map((f) => (
          <div
            key={f.id}
            className="bg-white border-2 border-[#302012] p-4 rounded-lg flex items-center justify-between gap-4"
          >
            <div className="text-[#302012]">
              <span className="text-sm text-[#302012]/60">
                {KIND_LABELS[f.kind] || f.kind}
              </span>
              <p className="font-medium">{f.title}</p>
            </div>
            <button
              onClick={() => openFile(f.id)}
              disabled={openingId === f.id}
              className="px-4 py-2 bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/90 text-sm shrink-0"
            >
              {openingId === f.id ? "Открываю…" : "Открыть"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
