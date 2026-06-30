"use client";

import { useEffect, useState } from "react";
import { getMyMaterials, type MyFile } from "@/app/actions/me";

const KIND_LABELS: Record<string, string> = {
  meditation: "Медитация",
  diet: "Диета",
  instruction: "Инструкция",
  document: "Документ",
  pdf: "PDF",
  video: "Видео",
  link: "Ссылка",
};

export function MaterialsList() {
  const [files, setFiles] = useState<MyFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        setFiles(await getMyMaterials());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Короткая подписанная ссылка на приватный файл (видео/pdf/документ)
  const getSignedUrl = async (id: string): Promise<string | null> => {
    const res = await fetch(`/api/file/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const { url } = await res.json();
    return url || null;
  };

  const openFile = async (id: string) => {
    setOpeningId(id);
    try {
      const url = await getSignedUrl(id);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      else alert("Не удалось открыть файл");
    } catch {
      alert("Ошибка сети");
    } finally {
      setOpeningId(null);
    }
  };

  const playVideo = async (id: string) => {
    setOpeningId(id);
    try {
      const url = await getSignedUrl(id);
      if (url) setVideoUrls((p) => ({ ...p, [id]: url }));
      else alert("Не удалось загрузить видео");
    } catch {
      alert("Ошибка сети");
    } finally {
      setOpeningId(null);
    }
  };

  if (loading || files.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-light text-[#302012] mb-4">Материалы</h2>
      <div className="space-y-3">
        {files.map((f) => {
          // Видео с уже загруженным плеером — показываем встроенно
          if (f.kind === "video" && videoUrls[f.id]) {
            return (
              <div
                key={f.id}
                className="bg-white border-2 border-[#302012] p-4 rounded-lg"
              >
                <div className="text-[#302012] mb-2">
                  <span className="text-sm text-[#302012]/60">Видео</span>
                  <p className="font-medium">{f.title}</p>
                </div>
                <video
                  src={videoUrls[f.id]}
                  controls
                  autoPlay
                  playsInline
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full rounded select-none"
                />
              </div>
            );
          }

          return (
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

              {f.kind === "link" && f.url ? (
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/90 text-sm shrink-0"
                >
                  Перейти
                </a>
              ) : f.kind === "video" ? (
                <button
                  onClick={() => playVideo(f.id)}
                  disabled={openingId === f.id}
                  className="px-4 py-2 bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/90 text-sm shrink-0"
                >
                  {openingId === f.id ? "Загрузка…" : "Смотреть"}
                </button>
              ) : (
                <button
                  onClick={() => openFile(f.id)}
                  disabled={openingId === f.id}
                  className="px-4 py-2 bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/90 text-sm shrink-0"
                >
                  {openingId === f.id ? "Открываю…" : "Открыть"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
