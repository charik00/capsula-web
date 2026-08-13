"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { AudioPlayer } from "@/app/components/audio-player";
import {
  getMyMeditations,
  getMyMaterials,
  type MyMeditation,
  type MyFile,
} from "@/app/actions/me";
import { Headphones, Video, Flame, Youtube, FileText, X } from "lucide-react";

const VIDEO_LIBRARY_DESC =
  "Эти видео подобраны специально для клиентов программы «Отказ от курения». Обращайтесь к нужному в нужный момент — не обязательно смотреть всё сразу.";

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
        return `https://www.youtube.com/embed/${v}${list ? `?list=${list}` : ""}`;
      if (list) return `https://www.youtube.com/embed/videoseries?list=${list}`;
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

function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return u.pathname.slice(1) || null;
    if (host.endsWith("youtube.com")) {
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || null;
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] || null;
      if (u.searchParams.get("list")) return null;
      return u.searchParams.get("v");
    }
    return null;
  } catch {
    return null;
  }
}

const withAutoplay = (embed: string) =>
  embed + (embed.includes("?") ? "&" : "?") + "autoplay=1";

type TabKey =
  | "meditations"
  | "videos"
  | "triggers"
  | "videotheque"
  | "materials";

export function CabinetTabs({ greeting }: { greeting: string }) {
  const [tab, setTab] = useState<TabKey>("meditations");
  const [meds, setMeds] = useState<MyMeditation[]>([]);
  const [medAllowed, setMedAllowed] = useState(true);
  const [files, setFiles] = useState<MyFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({});
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [playing, setPlaying] = useState<string[]>([]);
  const [openText, setOpenText] = useState<MyFile | null>(null);
  const [activeProgram, setActiveProgram] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const [m, f] = await Promise.all([getMyMeditations(), getMyMaterials()]);
        setMeds(m.meditations);
        setMedAllowed(m.allowed);
        setFiles(f);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Пока открыто окно с текстом — блокируем прокрутку фона (iOS-надёжно:
  // фиксируем body и возвращаем позицию при закрытии).
  useEffect(() => {
    if (!openText) return;
    const scrollY = window.scrollY;
    const body = document.body;
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.classList.add("modal-open");
    return () => {
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
      body.classList.remove("modal-open");
      window.scrollTo(0, scrollY);
    };
  }, [openText]);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

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

  // Программа материала / медитации (для разделения курение ↔ сахар)
  const matProgram = (f: MyFile) => f.program || "both";
  const medProgram = (m: MyMeditation) => {
    const t = m.title.toLowerCase();
    if (/сахар|углевод/.test(t)) return "sugar";
    if (/курен/.test(t)) return "smoking";
    return "both";
  };
  // Какие программы реально есть у клиента
  const progSet = new Set<string>();
  meds.forEach((m) => {
    const p = medProgram(m);
    if (p !== "both") progSet.add(p);
  });
  files.forEach((f) => {
    const p = matProgram(f);
    if (p !== "both") progSet.add(p);
  });
  const programs = ["smoking", "sugar"].filter((p) => progSet.has(p));
  const showSelector = programs.length > 1;
  const active = activeProgram || programs[0] || "";
  const inProgram = (p: string) => !active || p === "both" || p === active;

  const shownMeds = meds.filter((m) => inProgram(medProgram(m)));
  const shownFiles = files.filter((f) => inProgram(matProgram(f)));

  // «Ежедневная медитация» всегда первой в списке видео
  const isDaily = (f: MyFile) =>
    f.title.trim().toLowerCase().includes("ежедневная медитация");
  const videos = shownFiles
    .filter((f) => f.kind === "video")
    .sort((a, b) => (isDaily(a) ? 0 : 1) - (isDaily(b) ? 0 : 1));
  const triggers = shownFiles.filter((f) => f.kind === "trigger");
  const youtube = shownFiles.filter(
    (f) => f.kind === "link" && !!f.url && !!embedUrl(f.url)
  );
  const docs = shownFiles.filter(
    (f) =>
      f.kind !== "video" &&
      f.kind !== "trigger" &&
      !(f.kind === "link" && f.url && embedUrl(f.url))
  );

  const PROGRAM_LABELS: Record<string, string> = {
    smoking: "Курение",
    sugar: "Сахар и углеводы",
  };

  const TABS: { key: TabKey; label: string; Icon: typeof Video }[] = [
    { key: "meditations", label: "Медитации", Icon: Headphones },
    { key: "videos", label: "Видео", Icon: Video },
    { key: "triggers", label: "Триггеры", Icon: Flame },
    { key: "videotheque", label: "Видеотека", Icon: Youtube },
    { key: "materials", label: "Материалы", Icon: FileText },
  ];

  if (loading) {
    return (
      <div className="p-10 text-center text-[#302012]/60">Загрузка…</div>
    );
  }

  const Empty = ({ text }: { text: string }) => (
    <div className="bg-white border-2 border-[#302012] p-8 rounded-lg text-center text-[#302012]/60">
      {text}
    </div>
  );

  const renderYouTube = (f: MyFile) => {
    const embed = embedUrl(f.url || "");
    if (!embed) return null;
    const ytId = youtubeId(f.url || "");
    const isPlaying = playing.includes(f.id);
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
            <span className="w-16 h-16 rounded-full bg-[#302012]/85 flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 24 24" className="w-7 h-7 fill-[#F5F3ED] ml-1">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        </button>
      );
    }
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
    <div
      className="min-h-screen"
      style={{ paddingBottom: "calc(6rem + env(safe-area-inset-bottom))" }}
    >
      <div className="mb-4 pr-16">
        <p className="text-[#302012]/70">{greeting}</p>
        <button
          onClick={signOut}
          className="text-sm text-[#302012]/60 hover:text-[#302012] underline mt-1"
        >
          Выйти
        </button>
      </div>

      {/* Переключатель программ (если куплены обе) */}
      {showSelector && (
        <div className="flex gap-2 mb-6 bg-white border-2 border-[#302012] rounded-lg p-1">
          {programs.map((p) => (
            <button
              key={p}
              onClick={() => setActiveProgram(p)}
              className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
                active === p
                  ? "bg-[#302012] text-[#F5F3ED]"
                  : "text-[#302012] hover:bg-[#302012]/10"
              }`}
            >
              {PROGRAM_LABELS[p] || p}
            </button>
          ))}
        </div>
      )}

      {/* Медитации */}
      {tab === "meditations" &&
        (!medAllowed ? (
          <Empty text="Доступ ещё не открыт. Свяжитесь с нами, чтобы получить доступ." />
        ) : shownMeds.length === 0 ? (
          <Empty text="У вас пока нет доступных медитаций" />
        ) : (
          <div className="space-y-6">
            {shownMeds.map((m) => (
              <div key={m.id}>
                <AudioPlayer meditationId={m.id} title={m.title} />
                {m.description && (
                  <p className="mt-2 text-[#302012]/70 text-sm">
                    {m.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ))}

      {/* Видео (наши) */}
      {tab === "videos" &&
        (videos.length === 0 ? (
          <Empty text="Пока нет видео" />
        ) : (
          <div className="space-y-3">
            {videos.map((f) => (
              <div
                key={f.id}
                className="bg-white border-2 border-[#302012] p-4 rounded-lg"
              >
                {videoUrls[f.id] ? (
                  <>
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="text-[#302012]">
                        <p className="font-medium">{f.title}</p>
                        {f.description && (
                          <p className="text-sm text-[#302012]/70">
                            {f.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => closeVideo(f.id)}
                        aria-label="Закрыть видео"
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
                  </>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-[#302012]">
                      <p className="font-medium">{f.title}</p>
                      {f.description && (
                        <p className="text-sm text-[#302012]/70 mt-1">
                          {f.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => playVideo(f.id)}
                      disabled={openingId === f.id}
                      className="px-4 py-2 bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/90 text-sm shrink-0"
                    >
                      {openingId === f.id ? "Загрузка…" : "Смотреть"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

      {/* Триггеры */}
      {tab === "triggers" &&
        (triggers.length === 0 ? (
          <Empty text="Пока нет триггеров" />
        ) : (
          <div className="space-y-3">
            {triggers.map((f) => (
              <button
                key={f.id}
                onClick={() => setOpenText(f)}
                className="w-full text-left bg-white border-2 border-[#302012] p-4 rounded-lg hover:bg-[#302012]/5 transition-colors"
              >
                <p className="font-medium text-[#302012]">{f.title}</p>
                {f.description && (
                  <p className="text-sm text-[#302012]/70 mt-1">
                    {f.description}
                  </p>
                )}
                <span className="text-sm text-[#302012]/50 mt-1 inline-block">
                  Открыть →
                </span>
              </button>
            ))}
          </div>
        ))}

      {/* Видеотека (YouTube) */}
      {tab === "videotheque" &&
        (youtube.length === 0 ? (
          <Empty text="Пока нет видео в видеотеке" />
        ) : (
          <div>
            <p className="text-[#302012]/70 mb-5">{VIDEO_LIBRARY_DESC}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {youtube.map((f) => (
                <div
                  key={f.id}
                  className="bg-white border-2 border-[#302012] rounded-lg overflow-hidden"
                >
                  <div className="relative w-full aspect-video bg-black">
                    {renderYouTube(f)}
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
        ))}

      {/* Материалы (документы, ссылки) */}
      {tab === "materials" &&
        (docs.length === 0 ? (
          <Empty text="Пока нет материалов" />
        ) : (
          <div className="space-y-3">
            {docs.map((f) => (
              <div
                key={f.id}
                className="bg-white border-2 border-[#302012] p-4 rounded-lg flex items-center justify-between gap-4"
              >
                <div className="text-[#302012]">
                  <p className="font-medium">{f.title}</p>
                  {f.description && (
                    <p className="text-sm text-[#302012]/70 mt-1">
                      {f.description}
                    </p>
                  )}
                </div>
                {f.body ? (
                  <button
                    onClick={() => setOpenText(f)}
                    className="px-4 py-2 bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/90 text-sm shrink-0"
                  >
                    Читать
                  </button>
                ) : f.kind === "link" && f.url ? (
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
        ))}

      {/* Модалка текста (триггер / памятка) */}
      {openText && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          style={{
            padding:
              "calc(env(safe-area-inset-top) + 1rem) 1rem calc(env(safe-area-inset-bottom) + 1rem)",
          }}
          onClick={() => setOpenText(null)}
        >
          <div
            className="bg-[#F5F3ED] w-full max-w-lg rounded-2xl max-h-full overflow-y-auto overscroll-contain shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 p-5 border-b border-[#302012]/15 sticky top-0 bg-[#F5F3ED]">
              <h3 className="text-lg font-medium text-[#302012]">
                {openText.title}
              </h3>
              <button
                onClick={() => setOpenText(null)}
                aria-label="Закрыть"
                className="text-[#302012] hover:bg-[#302012]/10 rounded-full w-8 h-8 flex items-center justify-center shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 text-[#302012] whitespace-pre-wrap leading-relaxed">
              {openText.body}
            </div>
          </div>
        </div>
      )}

      {/* Нижнее меню */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#302012] flex z-40"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] transition-colors ${
              tab === key
                ? "text-[#302012] font-medium"
                : "text-[#302012]/45 hover:text-[#302012]/70"
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
