"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Loader2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";

interface AudioPlayerProps {
  meditationId: string;
  title: string;
}

export function AudioPlayer({ meditationId, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const srcLoadedRef = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      // Позиция на экране блокировки (прогресс-бар системного плеера)
      if (
        "mediaSession" in navigator &&
        navigator.mediaSession.setPositionState &&
        audio.duration &&
        isFinite(audio.duration)
      ) {
        try {
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            position: audio.currentTime,
            playbackRate: audio.playbackRate || 1,
          });
        } catch {}
      }
    };
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setIsBuffering(false);
      if ("mediaSession" in navigator)
        navigator.mediaSession.playbackState = "none";
    };
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
      if ("mediaSession" in navigator)
        navigator.mediaSession.playbackState = "playing";
    };
    const handlePause = () => {
      setIsPlaying(false);
      if ("mediaSession" in navigator)
        navigator.mediaSession.playbackState = "paused";
    };
    const handleCanPlay = () => setIsBuffering(false);
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("canplaythrough", handleCanPlay);
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("canplaythrough", handleCanPlay);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const resolveSrc = async (): Promise<boolean> => {
    if (srcLoadedRef.current) return true;
    setIsResolving(true);
    setError(null);
    try {
      const res = await fetch(`/api/meditation/${meditationId}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Не удалось загрузить медитацию");
        return false;
      }
      const { url } = await res.json();
      const audio = audioRef.current;
      if (!audio || !url) {
        setError("Не удалось загрузить медитацию");
        return false;
      }
      audio.src = url;
      srcLoadedRef.current = true;
      return true;
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
      return false;
    } finally {
      setIsResolving(false);
    }
  };

  // Media Session: фоновое воспроизведение при погасшем экране +
  // управление с экрана блокировки (название, обложка, play/pause,
  // перемотка ±10 сек). Вызываем при старте — iOS требует, чтобы это
  // происходило в рамках пользовательского запуска воспроизведения.
  const setupMediaSession = () => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator))
      return;
    const audio = audioRef.current;
    if (!audio) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist: "Капсула",
      album: "Медитация",
      artwork: [
        {
          src: "/meditation-cover.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    });

    const move = (delta: number) => {
      audio.currentTime = Math.max(
        0,
        Math.min(audio.duration || 0, audio.currentTime + delta)
      );
      setCurrentTime(audio.currentTime);
    };

    navigator.mediaSession.setActionHandler("play", () => {
      audio.play().catch(() => {});
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      audio.pause();
    });
    navigator.mediaSession.setActionHandler("seekbackward", (d) =>
      move(-(d.seekOffset || 10))
    );
    navigator.mediaSession.setActionHandler("seekforward", (d) =>
      move(d.seekOffset || 10)
    );
    try {
      navigator.mediaSession.setActionHandler("seekto", (d) => {
        if (d.seekTime != null) {
          audio.currentTime = d.seekTime;
          setCurrentTime(d.seekTime);
        }
      });
    } catch {}
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    setIsBuffering(true);
    const ok = await resolveSrc();
    if (!ok) {
      setIsBuffering(false);
      return;
    }
    try {
      await audio.play();
      setIsPlaying(true);
      setupMediaSession();
      // буферизация снимется по событию "playing"
    } catch {
      setIsBuffering(false);
      setError("Не удалось начать воспроизведение");
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (audio && srcLoadedRef.current) {
      audio.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(value[0] === 0);
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (audio && srcLoadedRef.current) {
      audio.currentTime = Math.max(
        0,
        Math.min(audio.duration || 0, audio.currentTime + seconds)
      );
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="bg-white border-2 border-[#302012] p-6 rounded-lg shadow-lg select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <audio
        ref={audioRef}
        preload="none"
        controlsList="nodownload noplaybackrate"
        onContextMenu={(e) => e.preventDefault()}
      />

      <div className="mb-4">
        <h3 className="text-lg font-medium text-[#302012] mb-1">{title}</h3>
        {(isResolving || isBuffering) && !error && (
          <p className="text-sm text-[#302012]/60">Загрузка медитации…</p>
        )}
        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>

      <div className="mb-4">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
          className="w-full [&_[data-slot=slider-track]]:bg-[#302012]/25 [&_[data-slot=slider-range]]:bg-[#302012] [&_[data-slot=slider-thumb]]:bg-[#302012] [&_[data-slot=slider-thumb]]:border-[#302012]"
        />
        <div className="flex justify-between text-sm text-[#302012]/70 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => skip(-10)}
            className="text-[#302012] hover:bg-[#302012]/10"
          >
            <SkipBack className="w-5 h-5" />
          </Button>
          <Button
            onClick={togglePlay}
            disabled={isResolving || isBuffering}
            className="bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/90 w-12 h-12 rounded-full"
          >
            {isResolving || isBuffering ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => skip(10)}
            className="text-[#302012] hover:bg-[#302012]/10"
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end max-w-[200px]">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="text-[#302012] hover:bg-[#302012]/10"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-full [&_[data-slot=slider-track]]:bg-[#302012]/25 [&_[data-slot=slider-range]]:bg-[#302012] [&_[data-slot=slider-thumb]]:bg-[#302012] [&_[data-slot=slider-thumb]]:border-[#302012]"
          />
        </div>
      </div>
    </div>
  );
}
