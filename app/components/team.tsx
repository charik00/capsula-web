"use client";

import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { useState } from "react";

export function Team() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const team = [
    {
      name: "Alexander Beliy",
      role: "Chief Technology Officer (CTO)",
      image: "/beliy.JPEG",
      initials: "AB",
      experience: "20+ лет в медиа-технологиях и производстве",
      approach: "Объединение творческого видения с технологическими инновациями",
    },
    {
      name: "Жанна Якиревич",
      role: "Психиатр, IAAP Member",
      image: "/yakirevich.jpg",
      initials: "ЖЯ",
      experience: "Более 25 лет работы с тревожными и аффективными расстройствами",
      approach: "Интеграция психиатрии и психоанализа",
    },
    {
      name: "Анна Молоко",
      role: "Профессиональная балерина, тренер",
      image: "/moloko.JPG",
      initials: "АМ",
      experience: "Сертифицированный тренер, основатель сети студий в Израиле",
      approach: "Комплексная работа с телом, дыханием и мотивацией",
    },
    {
      name: "Anastasiya Bely",
      role: "Арома-астрология, ароматерапия, глубинная психология",
      image: "/bely.jpg",
      initials: "AB",
      experience: "Эксперт проекта Capsula",
      approach: "Синтез ароматов, астрологии и психологии",
    },
    {
      name: "София Гольдберг",
      role: "Коуч по работе с зависимостями",
      image: null,
      initials: "СГ",
      experience: "12 лет практики",
      approach: "Нейроповеденческий подход",
    },
    {
      name: "Наталья Коган",
      role: "NLP-специалист",
      image: null,
      initials: "НК",
      experience: "10+ лет сопровождения клиентов",
      approach: "Переобучение поведенческих паттернов",
    },
    {
      name: "Михаил Розен",
      role: "Клинический психолог",
      image: null,
      initials: "МР",
      experience: "Работа с тревожными состояниями и срывами",
      approach: "КПТ и мотивационное интервьюирование",
    },
    {
      name: "Евгения Леви",
      role: "Специалист по пищевому поведению",
      image: null,
      initials: "ЕЛ",
      experience: "8 лет в нутри-психологии",
      approach: "Устойчивые привычки без жестких диет",
    },
    {
      name: "Кирилл Дорфман",
      role: "NLP-практик",
      image: null,
      initials: "КД",
      experience: "Групповые и индивидуальные программы",
      approach: "Работа с триггерами зависимости",
    },
    {
      name: "Ирина Волкова",
      role: "Психолог поддержки",
      image: null,
      initials: "ИВ",
      experience: "Пост-сеансовое сопровождение",
      approach: "Профилактика рецидивов",
    },
    {
      name: "Даниэль Коэн",
      role: "Клинический диетолог",
      image: null,
      initials: "ДК",
      experience: "Персональные меню и пищевые стратегии",
      approach: "Контроль веса без срывов",
    },
    {
      name: "Марина Шапиро",
      role: "Психотерапевт",
      image: null,
      initials: "МШ",
      experience: "14 лет частной практики",
      approach: "Интегративная терапия",
    },
    {
      name: "Алёна Морозова",
      role: "Директор по маркетингу",
      image: null,
      initials: "АМ",
      experience: "Развитие бренда и коммуникаций",
      approach: "Стратегия роста и позиционирования",
    },
    {
      name: "Елена Николаева",
      role: "Коуч, специалист по зависимостям",
      image: null,
      initials: "ЕН",
      experience: "20 лет работы с зависимостями",
      approach: "Метод MI, КПТ и НЛП",
    },
  ];

  return (
    <section id="team" className="py-12 md:py-20 px-4 bg-[#F5F3ED]">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8 md:mb-16">
          <h2 id="team-title" className="scroll-mt-32 text-3xl md:text-5xl mb-4 md:mb-6 text-[#302012]">
            Наши <span className="text-[#302012]">специалисты</span>
          </h2>
          <p className="text-base md:text-xl text-[#302012]/70 max-w-3xl mx-auto">
            Команда лучших израильских специалистов для вашей трансформации
          </p>
        </div>

        <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-1">
          {team.map((member, index) => (
            <div
              key={index}
              className="snap-center shrink-0 w-[80vw] max-w-xs bg-white border-2 border-[#302012] overflow-hidden shadow-lg h-[34rem] flex flex-col"
            >
              <div className="aspect-square overflow-hidden">
                {member.image ? (
                  <ImageWithFallback src={member.image} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-[#302012] bg-[#F5F3ED]">
                    {member.initials}
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl mb-2 text-[#302012]">{member.name}</h3>
                <div className="text-[#302012]/70 mb-4 text-sm">{member.role}</div>
                <p className="text-sm text-[#302012]/60 mb-3">{member.experience}</p>
                <p className="text-sm text-[#302012]/50 italic mt-auto">{member.approach}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-8 items-stretch">
          {team.map((member, index) => (
            <div
              key={index}
              className={`bg-white border-2 border-[#302012] overflow-hidden shadow-lg hover:shadow-xl transition-all h-full flex flex-col ${
                team.length === 14 && index === 12 ? "lg:col-start-2" : ""
              }`}
            >
              <div className="aspect-square overflow-hidden">
                {member.image ? (
                  <ImageWithFallback src={member.image} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-[#302012] bg-[#F5F3ED]">
                    {member.initials}
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl mb-2 text-[#302012]">{member.name}</h3>
                <div className="text-[#302012]/70 mb-4 text-sm">{member.role}</div>
                <p className="text-sm text-[#302012]/60 mb-3">{member.experience}</p>
                <button
                  className="text-sm text-[#302012]/60 underline underline-offset-2"
                  onClick={() => setExpandedIndex(index === expandedIndex ? null : index)}
                >
                  {index === expandedIndex ? "Скрыть" : "Подробнее"}
                </button>
                {index === expandedIndex && (
                  <p className="text-sm text-[#302012]/60 mt-3 italic">{member.approach}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}