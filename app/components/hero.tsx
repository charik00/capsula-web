"use client";

import { ArrowRight, Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";
import { useBooking } from "@/app/components/booking-provider";

export function Hero() {
  const [isMuted, setIsMuted] = useState(true);
  const mobileIframeRef = useRef<HTMLIFrameElement>(null);
  const [isDesktopMuted, setIsDesktopMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { openModal } = useBooking();

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (mobileIframeRef.current) {
      mobileIframeRef.current.src = `https://player.vimeo.com/video/1186034210?autoplay=1&loop=1&background=1&controls=0&muted=${newMuted ? 1 : 0}`;
    }
  };

  const toggleDesktopMute = () => {
    if (iframeRef.current) {
      const value = isDesktopMuted ? 1 : 0;
      iframeRef.current.contentWindow?.postMessage(
        JSON.stringify({ method: "setVolume", value }),
        "*"
      );
      setIsDesktopMuted(!isDesktopMuted);
    }
  };

  return (
    <section className="relative h-screen flex items-start md:items-center justify-center overflow-visible">
      <div className="md:hidden absolute inset-0 w-full h-full">
        <iframe
          ref={mobileIframeRef}
          src="https://player.vimeo.com/video/1186034210?autoplay=1&muted=1&loop=1&background=1&controls=0"
          className="absolute inset-0 w-full h-full object-cover"
          allow="autoplay; fullscreen"
          frameBorder="0"
          title="Капсула мобильное видео"
        />
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        <button
          onClick={toggleMute}
          className="absolute top-32 right-4 z-[999] w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm border border-white/30 flex items-center justify-center"
        >
          {isMuted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>
      </div>

      <div className="hidden md:block absolute inset-0 w-full h-full z-0 overflow-hidden">
        <iframe
          ref={iframeRef}
          src="https://player.vimeo.com/video/1160793064?background=1&autoplay=1&loop=1&byline=0&title=0"
          className="absolute"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "177.77777778vh",
            height: "56.25vw",
            minWidth: "100%",
            minHeight: "100%",
            transform: "translate(-50%, -50%)",
          }}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          title="Капсула"
        />
      </div>

      <div className="absolute inset-0 z-[1] hidden bg-black/40 md:block" />

      <button
        onClick={toggleDesktopMute}
        className="hidden md:block absolute top-40 right-8 z-[60] p-4 bg-[#F5F3ED]/20 hover:bg-[#F5F3ED]/30 border border-[#F5F3ED]/40 text-[#F5F3ED] transition-all backdrop-blur-sm"
        aria-label={isDesktopMuted ? "Включить звук" : "Выключить звук"}
      >
        {isDesktopMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </button>

      <div className="relative z-10 w-full px-6 md:px-16 lg:px-24 pt-28 md:pt-0 pb-8 md:pb-0">
        <div className="max-w-3xl md:-mt-48 w-full">
          <div className="w-16 md:w-16 h-px bg-[#F5F3ED] mb-8 md:mb-8"></div>

          <h1 className="text-[48px] md:text-5xl lg:text-7xl mb-6 md:mb-8 leading-[1.15] text-[#F5F3ED] tracking-tight font-light">
            Новая жизнь
            <br />
            без зависимости
          </h1>

          <p className="text-[22px] md:text-xl text-[#F5F3ED]/85 mb-10 md:mb-4 leading-relaxed font-normal max-w-lg">
            Освободитесь от курения, сладкого и переедания через сенсорную терапию
          </p>

          <div className="space-y-4 md:space-y-3 mb-12 md:mb-12">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-[#F5F3ED] mt-2.5 flex-shrink-0"></div>
              <p className="text-[22px] md:text-xl text-[#F5F3ED] leading-relaxed font-normal">Без боли</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-[#F5F3ED] mt-2.5 flex-shrink-0"></div>
              <p className="text-[22px] md:text-xl text-[#F5F3ED] leading-relaxed font-normal">Без ломки</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-[#F5F3ED] mt-2.5 flex-shrink-0"></div>
              <p className="text-[22px] md:text-xl text-[#F5F3ED] leading-relaxed font-normal">
                Без бесконечных попыток
              </p>
            </div>
          </div>

          <div className="hidden md:flex justify-start">
            <button
              onClick={openModal}
              className="px-10 py-5 bg-[#F5F3ED] text-[#302012] hover:bg-[#F5F3ED]/90 transition-all flex items-center justify-center gap-3 group"
            >
              <span>Записаться на консультацию</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden absolute bottom-[96px] left-1/2 -translate-x-1/2 z-[100] w-full px-6">
        <button
          onClick={openModal}
          className="w-full px-6 py-4 bg-[#F5F3ED] text-[#302012] hover:bg-[#F5F3ED]/90 transition-all flex items-center justify-center gap-3 group text-[15px]"
        >
          <span>Записаться на консультацию</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="absolute bottom-[184px] md:bottom-0 left-1/2 -translate-x-1/2 md:translate-y-1/2 z-[100] bg-[#F5F3ED] p-4 md:p-8 shadow-2xl border-2 border-[#302012]">
        <div className="text-4xl md:text-5xl mb-1 text-[#302012] text-center font-light tracking-tight">90%</div>
        <div className="text-[11px] md:text-xs text-[#302012]/70 tracking-[0.15em] uppercase text-center font-light">
          Эффективность
        </div>
      </div>
    </section>
  );
}
