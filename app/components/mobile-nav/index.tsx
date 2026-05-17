"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useBooking } from "@/app/components/booking-provider";

type SectionId = "home" | "programs" | "testimonials" | "team";

const NAV_ITEMS: Array<{
  id: SectionId;
  label: string;
  href: string;
  icon: ReactNode;
}> = [
  {
    id: "home",
    label: "Главная",
    href: "#",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M3 10.5L12 3l9 7.5" />
        <path d="M5 9.5V20h14V9.5" />
      </svg>
    ),
  },
  {
    id: "programs",
    label: "Программы",
    href: "#programs-title",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M7 3h10" />
        <path d="M9 3v5l-2 3v9h10v-9l-2-3V3" />
        <path d="M9 11h6" />
      </svg>
    ),
  },
  {
    id: "testimonials",
    label: "Отзывы",
    href: "#testimonials-title",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M12 3l2.9 5.88 6.5.95-4.7 4.58 1.1 6.49L12 18l-5.8 3.05 1.1-6.49-4.7-4.58 6.5-.95L12 3z" />
      </svg>
    ),
  },
  {
    id: "team",
    label: "Команда",
    href: "#team-title",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="10" r="2.5" />
        <path d="M3.5 19c0-3 2.3-5 5.5-5s5.5 2 5.5 5" />
        <path d="M14.5 19c.2-2.2 1.9-3.8 4.5-3.8 1 0 1.9.2 2.5.6" />
      </svg>
    ),
  },
];

export function MobileNav() {
  const [activeSection, setActiveSection] = useState<SectionId>("home");
  const { openModal } = useBooking();
  const pathname = usePathname();

  useEffect(() => {
    const sections: Array<{ id: SectionId; element: HTMLElement | null }> = ["programs", "testimonials", "team"]
      .map((id) => ({ id: id as SectionId, element: document.getElementById(id) }))
      .filter((item): item is { id: SectionId; element: HTMLElement } => Boolean(item.element));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          const matched = sections.find((section) => section.element === visible.target);
          if (matched) setActiveSection(matched.id);
          return;
        }

        if (window.scrollY < 120) {
          setActiveSection("home");
        }
      },
      { threshold: [0.25, 0.5, 0.75], rootMargin: "-20% 0px -45% 0px" }
    );

    sections.forEach((section) => {
      if (section.element) observer.observe(section.element);
    });

    return () => observer.disconnect();
  }, []);

  const navClass = useMemo(
    () => "md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1C0F07]/95 backdrop-blur-md border-t border-[#F5F3ED]/10 h-16",
    []
  );

  // Нижняя панель только на главной. На анкете/кабинете/входе она не
  // нужна и при открытой клавиатуре «прыгает» на середину экрана.
  if (pathname !== "/") return null;

  const scrollToTarget = (href: string, id: SectionId) => {
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActiveSection("home");
      return;
    }

    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  };

  return (
    <nav className={navClass}>
      <ul className="grid h-full grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => scrollToTarget(item.href, item.id)}
                className={`flex h-full w-full flex-col items-center justify-center gap-0.5 transition-colors ${
                  isActive ? "text-[#F5F3ED]" : "text-[#F5F3ED]/50"
                }`}
                aria-label={item.label}
              >
                {item.icon}
                <span className="text-[9px] leading-none">{item.label}</span>
              </button>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={openModal}
            className="flex h-full w-full flex-col items-center justify-center gap-0.5 text-[#F5F3ED]/50 transition-colors hover:text-[#F5F3ED]"
            aria-label="Связаться"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.07 9.81 19.8 19.8 0 0 1 0 1.13 2 2 0 0 1 2 .95h3a2 2 0 0 1 2 1.72c.12.95.35 1.88.68 2.77a2 2 0 0 1-.45 2.11L6.1 8.91a16 16 0 0 0 9 9l1.35-1.35a2 2 0 0 1 2.11-.45c.89.33 1.82.56 2.77.68a2 2 0 0 1 1.67 2.13z" />
            </svg>
            <span className="text-[9px] leading-none">Связаться</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
