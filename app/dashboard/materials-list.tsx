"use client";

import { useEffect, useState } from "react";
import { getMyMaterials, type MyFile } from "@/app/actions/me";

const VIDEO_LIBRARY_DESC =
  "Эти видео подобраны специально для клиентов программы «Отказ от курения». Обращайтесь к нужному в нужный момент — не обязательно смотреть всё сразу.";

// Ссылка на YouTube/Vimeo -> адрес для встраивания плеером (iframe).
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

// ID ролика YouTube (для обложки). null для плейлистов/не-YouTube.
function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return u.pathname.slice(1) || null;
    if (host.endsWith("youtube.com")) {
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || null;
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] || null;
      if (u.searchParams.get("list")) return null; // плейлист — без одной обложки
      return u.searchParams.get("v");
    }
    return null;
  } catch {
    return null;
  }
}

const withAutoplay = (embed: string) =>
  embed + (embed.includes("?") ? "&" : "?") + "autoplay=1";

const KIND_LABELS: Record<string, string> = {
  document: "Документ",
  pdf: "PDF",
  link: "Ссылка",
};

const isVideo = (f: MyFile) =>
  f.kind === "video" || (f.kind === "link" && !!f.url && !!embedUrl(f.url));

export function MaterialsList() {
  const [files, setFiles] = useState<MyFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({});
  const [playing, setPlaying] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setFiles(await getMyMaterials());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  if (loading) return null;

  const videos = files.filter(isVideo);
  const others = files.filter((f) => !isVideo(f));
  if (videos.length === 0 && others.length === 0) return null;

  // Плеер для карточки видеотеки
  const renderPlayer = (f: MyFile) => {
    // Загруженное видео (файл)
    if (f.kind === "video") {
      if (videoUrls[f.id]) {
        return (
          <video
            src={videoUrls[f.id]}
            controls
            autoPlay
            playsInline
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
            className="absolute inset-0 w-full h-full object-contain bg-black select-none"
          />
        );
      }
      return (
        <button
          onClick={() => playVideo(f.id)}
          disabled={openingId === f.id}
          className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#302012]"
        >
          <PlayBadge loading={openingId === f.id} />
        </button>
      );
    }

    // Ссылка YouTube/Vimeo
    const embed = embedUrl(f.url || "");
    if (!embed) return null;
    const ytId = youtubeId(f.url || "");
    const isPlaying = playing.includes(f.id);

    // Одиночный YouTube-ролик: сначала обложка, по клику — плеер
    if (ytId && !isPlaying) {
      return (
        <button
          onClick={() => setPlaying((p) => [...p, f.id])}
          className="absolute inset-0 w-full h-full group"
          aria-label={`Смотреть: ${f.title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
            alt={f.title}
            className="w-full h-full object-cover"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/25 transition-colors">
            <PlayBadge />
          </span>
        </button>
      );
    }

    // Плейлист/Vimeo или уже нажали play — встроенный плеер
    return (
      <iframe
        src={isPlaying ? withAutoplay(embed) : embed}
        title={f.title}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  };

  return (
    <div className="mt-8 space-y-10">
      {/* Видеотека */}
      {videos.length > 0 && (
        <div>
          <h2 className="text-2xl font-light text-[#302012] mb-2">Видеотека</h2>
          <p className="text-[#302012]/70 mb-5 max-w-2xl">
            {VIDEO_LIBRARY_DESC}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {videos.map((f) => (
              <div
                key={f.id}
                className="bg-white border-2 border-[#302012] rounded-lg overflow-hidden"
              >
                <div className="relative w-full aspect-video bg-black">
                  {renderPlayer(f)}
                </div>
                <div className="p-4">
                  <p className="font-medium text-[#302012]">{f.title}</p>
                  {f.description && (
                    <p className="text-sm text-[#302012]/70 mt-1 whitespace-pre-wrap">
                      {f.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Материалы (документы, ссылки) */}
      {others.length > 0 && (
        <div>
          <h2 className="text-2xl font-light text-[#302012] mb-4">Материалы</h2>
          <div className="space-y-3">
            {others.map((f) => (
              <div
                key={f.id}
                className="bg-white border-2 border-[#302012] p-4 rounded-lg flex items-center justify-between gap-4"
              >
                <div className="text-[#302012]">
                  <span className="text-sm text-[#302012]/60">
                    {KIND_LABELS[f.kind] || f.kind}
                  </span>
                  <p className="font-medium">{f.title}</p>
                  {f.description && (
                    <p className="text-sm text-[#302012]/70 mt-1">
                      {f.description}
                    </p>
                  )}
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlayBadge({ loading = false }: { loading?: boolean }) {
  return (
    <span className="w-16 h-16 rounded-full bg-[#302012]/85 flex items-center justify-center shadow-lg">
      {loading ? (
        <span className="text-[#F5F3ED] text-sm">…</span>
      ) : (
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-[#F5F3ED] ml-1">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </span>
  );
}
