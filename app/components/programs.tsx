"use client";

import { ArrowRight, Check } from "lucide-react";
import { useBooking } from "./booking-provider";

export function Programs() {
  const { openModal } = useBooking();
  const programs = [
    {
      title: "ОСВОБОЖДЕНИЕ ОТ КУРЕНИЯ",
      clinic: [
        "Анкетирование и подготовка к сеансу",
        "Сеанс в капсуле 90 минут: аудиостимуляция по частотам, визуализация, ароматерапия, нейро-навигация",
        "Персональный ароматический якорь для закрепления состояния"
      ],
      online: [
        "Онлайн-сессии с психологом или НЛП-специалистом",
        "Домашняя поддерживающая медитация (15 мин, доступ на месяц)"
      ]
    },
    {
      title: "КУРЕНИЕ + КОНТРОЛЬ ВЕСА",
      popular: true,
      clinic: [
        "Глубокое анкетирование по двум направлениям",
        "2 сеанса в капсуле по 90 минут: первый — против курения, второй — работа с пищевыми привычками. Аудиостимуляция, визуализация, ароматерапия",
        "Расширенный комплект домашних медитаций (доступ на месяц)"
      ],
      online: [
        "Онлайн-сессии с психологом или НЛП-специалистом",
        "Консультации с нутрициологом + персональное меню на 21 день с коррекцией",
        "Программа тренировок на 21 день + доступ на 2 месяца"
      ]
    },
    {
      title: "САХАР И УГЛЕВОДЫ",
      clinic: [
        "Анкетирование и разбор пищевых привычек",
        "Сеанс в капсуле 90 минут: снижение тяги к сладкому, аудиостимуляция, визуализация, ароматерапия"
      ],
      online: [
        "Онлайн-сессии с психологом или НЛП-специалистом",
        "Консультации с нутрициологом + персональное меню на 21 день с коррекцией",
        "Программа питания и тренировок на 21 день + доступ к тренировкам на 2 месяца",
        "Домашняя медитация (15 мин, доступ на месяц)"
      ]
    }
  ];

  return (
    <section id="programs" className="py-12 md:py-20 px-4 bg-[#302012]">
      <div className="md:animate-fadeIn">
        <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8 md:mb-16">
          <h2 id="programs-title" className="scroll-mt-32 text-3xl md:text-5xl mb-4 md:mb-6 text-[#F5F3ED]">
            Наши <span className="text-[#F5F3ED]">программы</span>
          </h2>
          <p className="text-base md:text-xl text-[#F5F3ED]/70 max-w-3xl mx-auto">
            Индивидуальный подход к каждой зависимости
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {programs.map((program, index) => (
            <div 
              key={index}
              className={`bg-white p-8 flex flex-col h-full ${program.popular ? 'ring-2 ring-[#302012] relative' : ''} hover:shadow-2xl transition-all duration-500`}
            >
              {program.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#302012] text-[#F5F3ED] px-8 py-2 text-xs tracking-widest uppercase">
                  Рекомендуем
                </div>
              )}
              
              <h3 className="text-xl mb-8 mt-2 text-[#302012] tracking-wide">{program.title}</h3>
              
              {/* Блок 1: Визит в клинику */}
              <div className="mb-6">
                <div className="text-xs tracking-widest text-[#302012]/60 mb-4 uppercase font-bold">
                  В ПАКЕТЕ
                </div>
                <ul className="space-y-3">
                  {program.clinic.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-[#302012] mt-1 flex-shrink-0" />
                      <span className="text-[#302012]/70 text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Разделитель */}
              <div className="border-t border-dashed border-[#302012]/20 my-6"></div>
              
              {/* Блок 2: Онлайн-сопровождение */}
              <div className="mt-auto mb-8">
                <div className="text-xs tracking-widest text-[#302012]/60 mb-4 uppercase font-bold">
                  ДАЛЕЕ — ПОДДЕРЖКА
                </div>
                <ul className="space-y-3">
                  {program.online.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-[#302012] mt-1 flex-shrink-0" />
                      <span className="text-[#302012]/70 text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Кнопка CTA */}
              <button onClick={openModal} className="w-full py-4 bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/80 transition-all flex items-center justify-center gap-2 group mt-auto">
                <span>Записаться</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}