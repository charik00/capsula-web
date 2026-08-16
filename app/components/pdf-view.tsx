"use client";

import { useEffect, useRef, useState } from "react";

// Показ PDF по ширине экрана (страницы-слайды одна под другой, прокрутка).
// Рендер на клиенте через pdf.js — файл остаётся PDF, ничего не конвертируем.
export function PdfView({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const pdf = await pdfjs.getDocument({ url }).promise;
        const container = containerRef.current;
        if (!container || cancelled) return;
        container.innerHTML = "";
        const cssWidth = container.clientWidth || window.innerWidth;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) return;
          const page = await pdf.getPage(i);
          const base = page.getViewport({ scale: 1 });
          const scale = (cssWidth * dpr) / base.width;
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          canvas.style.display = "block";
          canvas.style.marginBottom = "8px";
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          await page.render({ canvas, canvasContext: ctx, viewport }).promise;
          if (cancelled) return;
          container.appendChild(canvas);
          if (i === 1) setLoading(false);
        }
        if (!cancelled) setLoading(false);
      } catch (e) {
        console.error("PdfView error:", e);
        if (!cancelled) {
          setError("Не удалось показать документ");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain bg-[#F5F3ED]">
      {loading && (
        <div className="p-6 text-center text-[#302012]/60">Загрузка…</div>
      )}
      {error && <div className="p-6 text-center text-red-700">{error}</div>}
      <div
        ref={containerRef}
        className="w-full select-none"
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}
