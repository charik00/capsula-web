"use client";

import { useEffect, useState, use } from "react";

// Просмотр материала (PDF) в отдельном окне: без панели скачивания
// (#toolbar=0) и без контекстного меню. Ссылку на файл берём через
// /api/file/[id], который проверяет доступ клиента.
export default function MaterialViewer({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/file/${id}`, { cache: "no-store" });
        if (!res.ok) {
          const b = await res.json().catch(() => ({}));
          setError(b.error || "Не удалось открыть материал");
          return;
        }
        const data = await res.json();
        setUrl(data.url ? `${data.url}#toolbar=0&navpanes=0` : null);
      } catch {
        setError("Ошибка сети");
      }
    })();
  }, [id]);

  return (
    <div
      className="fixed inset-0 bg-[#302012] select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {error ? (
        <div className="flex items-center justify-center h-full text-[#F5F3ED] p-6 text-center">
          {error}
        </div>
      ) : url ? (
        <iframe
          src={url}
          title="Просмотр материала"
          className="w-full h-full border-0"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-[#F5F3ED]">
          Загрузка…
        </div>
      )}
    </div>
  );
}
