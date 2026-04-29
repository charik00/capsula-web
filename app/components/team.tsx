"use client";

import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { useState } from "react";

export function Team() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const getImagePositionClass = (name: string) => {
    switch (name) {
      case "Алекс Белый":
        return "object-[center_8%]";
      case "Анастасия Бели":
        return "object-[center_10%]";
      case "Наталья Кравченко":
        return "object-[center_9%]";
      case "Анна Молоко":
        return "object-[center_10%]";
      case "Жана Якиревич":
      case "Цадок Элла":
      case "Елена Николаева":
      case "Рами Михаэли":
        return "object-[center_18%]";
      default:
        return "object-[center_20%]";
    }
  };

  const team = [
    {
      name: "Алёна Морозова",
      role: "Директор по маркетингу",
      image: null,
      initials: "АМ",
      experience: "Директор по маркетингу",
      approach: "Стратегия развития и коммуникаций проекта",
    },
    {
      name: "Жана Якиревич",
      role: "Ведущий психотерапевт, психолог, психоаналитик, медиатор",
      image: "/Якиревич.jpg",
      initials: "ЖЯ",
      experience: "Консультант проекта, 25 лет работы с тревожными и аффективными расстройствами",
      approach: "Помогает дойти до корня проблемы и отпустить деструктивные сценарии",
    },
    {
      name: "Самуил Горелик",
      role: "Профессор, научный консультант проекта",
      image: null,
      initials: "СГ",
      experience:
        "Доктор наук, профессор Университета ИТМО (Санкт-Петербург). 50 лет в науке: математические методы обработки медицинской информации, искусственный интеллект, мониторинг метаболизма и когнитивных функций человека.",
      approach:
        "Автор публикаций в международных рецензируемых научных изданиях, участник конференций по нейротехнологиям. Обеспечивает «Капсуле» научную основу и академическую достоверность: экспертиза по воздействию волн на когнитивные процессы подтверждает, что метод наших программ опирается на науку.",
    },
    {
      name: "Алекс Белый",
      role: "Технический директор, видеограф",
      image: "/beliy.JPEG",
      initials: "AB",
      experience: "Более 20 лет в медиатехнологиях и международных проектах",
      approach: "Создает надежную техническую основу, чтобы каждый сеанс был безупречным",
    },
    {
      name: "Анастасия Бели",
      role: "Цифровой психолог, аромотерапевт",
      image: "/bely.jpg",
      initials: "АБ",
      experience: "Специалист проекта Capsula",
      approach: "Синтез цифровой психологии и аромаподхода",
    },
    {
      name: "Наталья Кравченко",
      role: "Клинический психолог, психотерапевт",
      image: "/Наталья.JPG",
      initials: "НК",
      experience:
        "12 лет работы с тревожными состояниями, психической травмой и ПТСР, психосоматикой, прокрастинацией, а также с личными и семейными отношениями. Магистр психологии (НЮПУ им. К.Д. Ушинского), психоаналитический диплом Института глубинной психологии, лицензия клинического психолога.",
      approach:
        "Работает методом Символдрама и психодинамического подхода. В «Капсуле» помогает с зависимостями и созависимыми отношениями — бережно и глубоко, с фокусом на причины, а не симптомы. Тема зависимостей для неё личная — и это даёт её работе особую чуткость и понимание.",
    },
    {
      name: "Алиса Роках",
      role: "НЛП специалист",
      image: null,
      initials: "АР",
      experience: "13 лет работы с зависимостями, КПТ-подход",
      approach: "Создает структуру и опору там, где раньше был хаос",
    },
    {
      name: "Цадок Элла",
      role: "Тренер НЛП, мастер против зависимостей",
      image: "/yakirevich.jpg",
      initials: "ЦЭ",
      experience: "5 лет практики в реабилитационных центрах, мастер-тренер НЛП",
      approach: "Помогает найти внутреннюю цель и выстроить путь к устойчивым переменам",
    },
    {
      name: "Анна Данилов",
      role: "Тренер НЛП",
      image: null,
      initials: "АД",
      experience: "14 лет работы с людьми, коуч и NLP-супервизор",
      approach: "Через визуализацию и когнитивные техники помогает переписать ограничивающие сценарии",
    },
    {
      name: "Гай Штольц",
      role: "Коуч",
      image: null,
      initials: "ГШ",
      experience: "Коуч",
      approach: "Поддержка в закреплении новых привычек",
    },
    {
      name: "Анна Молоко",
      role: "Тренер",
      image: "/moloko.JPG",
      initials: "АМ",
      experience: "Профессиональная балерина, международный диплом, сертифицированный тренер",
      approach: "Возвращает мотивацию к движению и помогает телу стать союзником",
    },
    {
      name: "Марго",
      role: "Нутрициолог",
      image: "/margo.jpeg",
      initials: "М",
      experience: "7 лет практики, специалист по пищевому поведению",
      approach: "Работа с биохимией зависимости и снижением тяги без жестких ограничений",
    },
    {
      name: "Рами Михаэли",
      role: "Руководитель проекта",
      image: "/Рами.jpg",
      initials: "РМ",
      experience: "Управление проектами, коучинг, НЛП, специализация по зависимостям",
      approach: "Создал Capsula с фокусом на реальные изменения в жизни людей",
    },
    {
      name: "Елена Николаева",
      role: "Коуч, специалист по зависимостям",
      image: "/nikolaeva.jpg",
      initials: "ЕН",
      experience: "20 лет работы с зависимостями",
      approach: "Методы мотивационного интервьюирования, КПТ и НЛП",
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
                  <ImageWithFallback
                    src={member.image}
                    alt={member.name}
                    className={`w-full h-full object-cover ${getImagePositionClass(member.name)}`}
                  />
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
                  <ImageWithFallback
                    src={member.image}
                    alt={member.name}
                    className={`w-full h-full object-cover ${getImagePositionClass(member.name)}`}
                  />
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