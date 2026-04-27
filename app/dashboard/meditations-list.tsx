"use client";

import { useEffect, useState } from "react";
import { AudioPlayer } from "@/app/components/audio-player";
import { supabase } from "@/lib/supabase/client";

interface Meditation {
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
  duration: number | null;
  created_at: string;
}

interface MeditationsListProps {
  userEmail: string;
}

export function MeditationsList({ userEmail }: MeditationsListProps) {
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMeditations() {
      try {
        setIsLoading(true);
        setError(null);

        // Получаем доступные медитации для пользователя
        const { data: userAccess, error: accessError } = await supabase
          .from("user_access")
          .select("meditation_id, expires_at")
          .eq("user_email", userEmail)
          .gte("expires_at", new Date().toISOString());

        if (accessError) {
          console.error("Error fetching user access:", accessError);
          setError("Ошибка при загрузке доступа к медитациям");
          return;
        }

        if (!userAccess || userAccess.length === 0) {
          setMeditations([]);
          return;
        }

        // Получаем медитации по ID
        const meditationIds = userAccess.map((access) => access.meditation_id);

        const { data: meditationsData, error: meditationsError } = await supabase
          .from("meditations")
          .select("*")
          .in("id", meditationIds)
          .order("created_at", { ascending: false });

        if (meditationsError) {
          console.error("Error fetching meditations:", meditationsError);
          setError("Ошибка при загрузке медитаций");
          return;
        }

        // Получаем публичные URL для аудио файлов из Storage
        const meditationsWithUrls = await Promise.all(
          (meditationsData || []).map(async (meditation) => {
            if (meditation.audio_url) {
              // Если это путь в Storage, получаем публичный URL
              if (meditation.audio_url.startsWith("audio/")) {
                const { data } = supabase.storage
                  .from("audio")
                  .getPublicUrl(meditation.audio_url);
                return {
                  ...meditation,
                  audio_url: data.publicUrl,
                };
              }
              // Если это уже полный URL, оставляем как есть
              return meditation;
            }
            return meditation;
          })
        );

        setMeditations(meditationsWithUrls);
      } catch (err) {
        console.error("Fetch meditations exception:", err);
        setError("Произошла ошибка при загрузке данных");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMeditations();
  }, [userEmail]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-[#302012]/70">Загрузка медитаций...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 p-6 rounded-lg">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (meditations.length === 0) {
    return (
      <div className="bg-white border-2 border-[#302012] p-8 rounded-lg text-center">
        <p className="text-[#302012]/70 text-lg">
          У вас пока нет доступа к медитациям
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-sm text-[#302012]/70 hover:text-[#302012] transition-colors"
        >
          Выйти
        </button>
      </div>

      <div className="space-y-6">
        {meditations.map((meditation) => (
          <div key={meditation.id}>
            <AudioPlayer
              src={meditation.audio_url}
              title={meditation.title}
            />
            {meditation.description && (
              <p className="mt-2 text-[#302012]/70 text-sm">
                {meditation.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
