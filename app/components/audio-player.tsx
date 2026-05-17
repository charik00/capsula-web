"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);
  const srcLoadedRef = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
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

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    const ok = await resolveSrc();
    if (!ok) return;
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
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
        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>

      <div className="mb-4">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
          className="w-full"
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
            disabled={isResolving}
            className="bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/90 w-12 h-12 rounded-full"
          >
            {isResolving ? (
              <span className="text-xs">...</span>
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
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
