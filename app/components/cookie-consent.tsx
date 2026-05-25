"use client";

import { useState, useEffect } from "react";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookie-consent");
    if (!accepted) setShow(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-6 md:right-auto md:max-w-lg z-[200] bg-[#F5F3ED] border-2 border-[#302012] shadow-2xl p-6">
      <p className="text-sm text-[#302012]/80 leading-relaxed mb-4">
        Мы используем файлы cookie для улучшения работы сайта, персонализации контента и анализа трафика. Продолжая использовать сайт, вы соглашаетесь с нашей{" "}
        <a href="/privacy" className="underline text-[#302012]">
          политикой конфиденциальности
        </a>
        .
      </p>
      <div className="flex gap-3">
        <button
          onClick={accept}
          className="flex-1 px-4 py-2 bg-[#302012] text-[#F5F3ED] text-sm hover:bg-[#302012]/80 transition-all"
        >
          Принять все
        </button>
        <button
          onClick={accept}
          className="flex-1 px-4 py-2 border border-[#302012] text-[#302012] text-sm hover:bg-[#302012]/10 transition-all"
        >
          Только необходимые
        </button>
      </div>
    </div>
  );
}
