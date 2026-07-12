"use client";

import { useEffect, useState } from "react";
import { getMyMaterials, type MyFile } from "@/app/actions/me";

// Ссылка на YouTube/Vimeo -> адрес для встраивания плеером (iframe).
// Возвращает null, если это обычная ссылка (не видеохостинг).
function embedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host.endsWith("youtube.com")) {
      const list = u.searchParams.get("list");
      if (u.pathname.startsWith("/embed/")) return url;
      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.split("/")[2];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      const v = u.searchParams.get("v");
      if (v)
        return `https://www.youtube.com/embed/${v}${
          list ? `?list=${list}` : ""
        }`;
      if (list)
        return `https://www.youtube.com/embed/videoseries?list=${list}`;
      return null;
    }
    if (host.endsWith("vimeo.com")) {
      const m = u.pathname.match(/\/(\d+)/);
      return m ? `https://player.vimeo.com/video/${m[1]}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

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

  const closeVideo = (id: string) =>
    setVideoUrls((p) => {
      const next = { ...p };
      delete next[id];
      return next;
    });

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
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="text-[#302012]">
                    <span className="text-sm text-[#302012]/60">Видео</span>
                    <p className="font-medium">{f.title}</p>
                  </div>
                  <button
                    onClick={() => closeVideo(f.id)}
                    aria-label="Закрыть видео"
                    title="Закрыть"
                    className="text-[#302012] hover:bg-[#302012]/10 rounded-full w-8 h-8 flex items-center justify-center shrink-0 text-xl leading-none"
                  >
                    ✕
                  </button>
                </div>
                <video
                  src={videoUrls[f.id]}
                  controls
                  autoPlay
                  playsInline
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                  className="block mx-auto max-h-[70vh] max-w-full rounded select-none"
                />
              </div>
            );
          }

          // Ссылка на YouTube/Vimeo — встроенный плеер (обложка + плей)
          if (f.kind === "link" && f.url) {
            const embed = embedUrl(f.url);
            if (embed) {
              return (
                <div
                  key={f.id}
                  className="bg-white border-2 border-[#302012] p-4 rounded-lg"
                >
                  <div className="text-[#302012] mb-2">
                    <span className="text-sm text-[#302012]/60">Видео</span>
                    <p className="font-medium">{f.title}</p>
                  </div>
                  <div className="max-w-2xl mx-auto">
                    <div className="relative w-full aspect-video rounded overflow-hidden bg-black">
                      <iframe
                        src={embed}
                        title={f.title}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </div>
              );
            }
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
                <a
                  href={`/dashboard/view/${f.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/90 text-sm shrink-0"
                >
                  Открыть
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
