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
      image: "/alena.JPG",
      initials: "АМ",
      experience: "Стратегия, маркетинг, развитие продукта",
      approach: "Алена — директор по маркетингу проекта «Капсула». Имеет образование в области юриспруденции, экономики и маркетинга. Отвечает за стратегию развития, позиционирование бренда и построение пути клиента от первого касания до результата. В «Капсулу» пришла с убеждением, что инновационный продукт заслуживает такого же сильного маркетинга — чтобы как можно больше людей нашли путь к свободе от зависимостей.",
    },
    {
      name: "Жана Якиревич",
      role: "Психиатр",
      image: "/Якиревич.jpg",
      initials: "ЖЯ",
      experience: "25+ лет работы с тревогой и депрессией",
      approach: "Жанна — психиатр с более чем 25-летним стажем работы с тревожными, аффективными и психотическими расстройствами. Специализировалась в больнице Бэер-Яков, получила углублённую подготовку в психотерапии в Университете Тель-Авива. Является юнгианским психоаналитиком и членом международного сообщества IAAP. В центре «Капсула» работает с тревожными расстройствами и депрессией.",
    },
    {
      name: "Самуил Горелик",
      role: "Профессор, научный консультант проекта",
      image: "/samuil.JPG",
      initials: "СГ",
      experience: "Профессор, 50 лет в нейронауках",
      approach: "Доктор наук, профессор Университета ИТМО (Санкт-Петербург). 50 лет в науке — математические методы обработки медицинской информации, искусственный интеллект, исследования в области мониторинга метаболизма и когнитивных функций. Обеспечивает «Капсуле» научную основу и академическую достоверность.",
    },
    {
      name: "Алекс Белый",
      role: "Технический директор",
      image: "/beliy.JPEG",
      initials: "АБ",
      experience: "20+ лет в медиатехнологиях и международных проектах",
      approach: "Александр — технический директор проекта «Капсула». Более 20 лет в медиатехнологиях и производстве. Руководил международными проектами, разрабатывал запатентованные инструменты и внедрял масштабируемые системы. Образование — бакалавр в области управления персоналом и бизнес-менеджмента (Sapir College). В проект пришёл с убеждением, что передовые технологии и трансформирующая терапия способны создать нечто исключительное.",
    },
    {
      name: "Анастасия Бели",
      role: "Арома-астролог, ароматерапевт",
      image: "/bely.jpg",
      initials: "АБ",
      experience: "Авторский метод работы с подсознанием через ароматы",
      approach: "Анастасия — арома-астролог и ароматерапевт, эксперт проекта «Капсула». Обучалась у мастеров в Индии и в ведущих школах мира. Использует авторский метод, где ароматы соединяются с астрологией и психологией. Через работу с подсознанием помогает переписать внутренние программы, освободиться от ограничений и зависимостей.",
    },
    {
      name: "Наталья Кравченко",
      role: "Клинический психолог, психотерапевт",
      image: "/Наталья.JPG",
      initials: "НК",
      experience: "12 лет работы с травмой и зависимостями",
      approach: "12 лет работы с тревожными состояниями, психической травмой и ПТСР, психосоматикой, прокрастинацией, личными и семейными отношениями. Магистр психологии (НЮПУ им. К.Д. Ушинского), клинический психолог. Работает методом Символдрама. В «Капсуле» помогает с зависимостями и созависимыми отношениями — бережно и глубоко.",
    },
    {
      name: "Алиса Роках",
      role: "КПТ-терапевт, коуч по зависимостям",
      image: "/alice.JPG",
      initials: "АР",
      experience: "13 лет работы с зависимостями",
      approach: "Специалист с 13-летним опытом работы терапевтом по зависимостям. Обучалась в колледже «Йозмот» по программе интегративного коучинга и консультирования (CBT & NLP). Работает с химическими, пищевыми и поведенческими зависимостями, утратой мотивации и стрессом. Её главное отличие — личный путь: сама прошла через кризис и восстановление.",
    },
    {
      name: "Цадок Элла",
      role: "Тренер НЛП, консультант по зависимостям",
      image: "/yakirevich.jpg",
      initials: "ЦЭ",
      experience: "5 лет в реабилитации и работе с зависимостями",
      approach: "Элла — специалист с 5-летним опытом работы с зависимыми и созависимыми. Обучалась в колледже «Йозмот», получила звание мастер-тренера НЛП. Прошла подготовку в Центральном «Джерелло» как консультант по зависимостям. Её главная особенность — авторские техники, отточенные на практике работы в реабилитационном центре.",
    },
    {
      name: "Анна Данилов",
      role: "Тренер НЛП",
      image: "/danilov.JPG",
      initials: "АД",
      experience: "14 лет работы с людьми, коуч и НЛП-супервизор",
      approach: "Через визуализацию и когнитивные техники помогает переписать ограничивающие сценарии.",
    },
    {
      name: "Гай Штольц",
      role: "Мастер-коуч, КПТ-терапевт",
      image: "/gay.JPG",
      initials: "ГШ",
      experience: "30 лет работы с людьми и трансформацией личности",
      approach: "30 лет опыта лидерства и работы с людьми. Мастер-коуч Израильской ассоциации коучей, NLP мастер и тренер, КПТ-терапевт. Основатель центра трансформации личности «Терапия души». В «Капсуле» работает с убеждением, что настоящие изменения начинаются с трансформации восприятия, личности и смысла жизни.",
    },
    {
      name: "Анна Молоко",
      role: "Тренер, балетмейстер",
      image: "/moloko.JPG",
      initials: "АМ",
      experience: "Снижение веса и мотивация через движение",
      approach: "Сертифицированный тренер с международным дипломом артистки балета, специализация на здоровье спины, растяжке и боди-балете. Сертифицированный тренер по методике Кристофера Харрисона, основатель сети студий в Израиле. В «Капсуле» помогает с мотивацией, снижением веса и повышением качества жизни.",
    },
    {
      name: "Марго",
      role: "Нутрициолог",
      image: "/margo.jpeg",
      initials: "М",
      experience: "7 лет, восстановление пищевого поведения",
      approach: "Нутрициолог с 7-летним опытом. Окончила факультет нутрициологии РУДН, Nutrition Coach Certification (American Fitness Academy). В «Капсуле» работает с тягой к сахару и никотину через восполнение прекурсоров нейромедиаторов и стабилизацию уровня глюкозы. Помогает выйти из зависимости без жёстких ограничений.",
    },
    {
      name: "Елена Николаева",
      role: "Коуч, специалист по зависимостям",
      image: "/nikolaeva.jpg",
      initials: "ЕН",
      experience: "20 лет работы с зависимостями",
      approach: "Елена работает с зависимостями уже 20 лет. Проходила обучение в Байт Бэрль, в школе «Апельсин», а также в Управлении по борьбе с наркотиками. Применяет метод мотивационного интервьюирования, КПТ, коучинг и НЛП. Специализируется на химической и алкогольной зависимости.",
    },
    {
      name: "Рами Михаэли",
      role: "Руководитель проекта",
      image: "/Рами.jpg",
      initials: "РМ",
      experience: "Коучинг, НЛП, специализация по зависимостям",
      approach: "Рами — руководитель проекта «Капсула». Получил образование в Финансовом университете при Правительстве Российской Федерации по направлению управления проектами, а также прошёл обучение коучингу в колледже «Йозмот». Его мотивацию отражает мысль из Талмуда: «Кто спасает одну душу — спасает целый мир».",
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

              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-base mb-1 text-[#302012]">{member.name}</h3>
                <div className="text-[#302012]/70 mb-3 text-sm">{member.role}</div>
                <button
                  className="text-sm text-[#302012]/60 underline underline-offset-2 text-left"
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