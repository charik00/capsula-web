"use client";

import { useEffect, useState } from "react";

interface BIPEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: string }>;
}

// Регистрирует service worker и показывает баннер установки приложения:
// Android — кнопка «Установить» (нативный запрос), iPhone — подсказка
// «Поделиться → На экран Домой».
export function PWA() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    if (localStorage.getItem("pwa-dismissed")) return;

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onBIP);

    const ua = navigator.userAgent || "";
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    const nav = navigator as Navigator & { standalone?: boolean };
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      nav.standalone === true;
    if (isIOS && !standalone) {
      setIosHint(true);
      setShow(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", onBIP);
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem("pwa-dismissed", "1");
    } catch {}
  };

  const install = async () => {
    if (deferred) {
      deferred.prompt();
      await deferred.userChoice.catch(() => {});
      setDeferred(null);
    }
    dismiss();
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-[60] max-w-md mx-auto bg-[#302012] text-[#F5F3ED] rounded-xl shadow-xl p-4 flex items-center gap-3">
      <div className="flex-1 text-sm leading-snug">
        {iosHint ? (
          <>
            Установите Capsula как приложение: нажмите{" "}
            <b>Поделиться</b> ⬆️ → <b>«На экран Домой»</b>.
          </>
        ) : (
          <>Установить Capsula как приложение на телефон?</>
        )}
      </div>
      {!iosHint && deferred && (
        <button
          onClick={install}
          className="shrink-0 bg-[#F5F3ED] text-[#302012] text-sm px-3 py-1.5 rounded font-medium hover:opacity-90"
        >
          Установить
        </button>
      )}
      <button
        onClick={dismiss}
        aria-label="Закрыть"
        className="shrink-0 text-[#F5F3ED]/70 hover:text-[#F5F3ED] px-1 text-lg leading-none"
      >
        ✕
      </button>
    </div>
  );
}
