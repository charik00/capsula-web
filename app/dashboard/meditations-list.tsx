"use client";

import { useEffect, useState } from "react";
import { AudioPlayer } from "@/app/components/audio-player";
import { supabase } from "@/lib/supabase/client";
import { getMyMeditations, type MyMeditation } from "@/app/actions/me";

export function MeditationsList() {
  const [meditations, setMeditations] = useState<MyMeditation[]>([]);
  const [allowed, setAllowed] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res = await getMyMeditations();
        setAllowed(res.allowed);
        setMeditations(res.meditations);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-[#302012]/70">Загрузка...</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="bg-white border-2 border-[#302012] p-8 rounded-lg text-center">
        <p className="text-[#302012]/70 text-lg">
          Доступ ещё не открыт. Свяжитесь с нами, чтобы получить доступ.
        </p>
        <button
          onClick={handleSignOut}
          className="mt-4 text-sm text-[#302012]/70 hover:text-[#302012]"
        >
          Выйти
        </button>
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

      {meditations.length === 0 ? (
        <div className="bg-white border-2 border-[#302012] p-8 rounded-lg text-center">
          <p className="text-[#302012]/70 text-lg">
            У вас пока нет доступных медитаций
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {meditations.map((m) => (
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
      )}
    </div>
  );
}
