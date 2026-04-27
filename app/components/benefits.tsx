import { FadeInUp } from "./fade-in-up";

export function Benefits() {
  const benefits = [
    {
      number: "01",
      title: "90 минут на основной сеанс",
      description: "Один визит в клинику — полный цикл работы с подсознанием"
    },
    {
      number: "02",
      title: "Без медикаментов, гипноза и кодировок",
      description: "Высокотехнологичная сенсорная система, а не устаревшие методы"
    },
    {
      number: "03",
      title: "Научный подход — сенсорная нейротерапия",
      description: "Доказанная эффективность работы с нейронными связями"
    },
    {
      number: "04",
      title: "Поддержка командой специалистов",
      description: "Психологи, NLP-специалисты, диетологи — комплексный подход"
    },
    {
      number: "05",
      title: "90% эффективность — устойчивый результат",
      description: "Большинство клиентов навсегда избавляются от зависимости"
    },
    {
      number: "06",
      title: "Работа с причиной — меняем реакцию мозга",
      description: "Устраняем корень проблемы, а не симптомы"
    }
  ];

  return (
    <section className="py-12 md:py-20 px-4 bg-[#F5F3ED]">
      <FadeInUp>
        <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-5xl mb-4 md:mb-6 text-[#302012]">
            Почему <span className="text-[#302012]">это работает</span>
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
          {benefits.map((benefit, index) => {
            const iconMap: { [key: string]: string } = {
              "01": "/icon1.png",
              "02": "/icon2.png",
              "03": "/icon3.png",
              "04": "/icon4.png",
              "05": "/icon5.png",
              "06": "/icon6.png"
            };
            const iconSrc = iconMap[benefit.number];
            
            return (
              <div key={index} className="flex gap-6">
                {iconSrc ? (
                  <div className="w-16 h-16 rounded-full bg-[#302012]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img src={iconSrc} alt={benefit.title} className="w-16 h-16 object-cover" />
                  </div>
                ) : (
                  <div className="text-6xl text-[#302012]/20 leading-none flex-shrink-0">
                    {benefit.number}
                  </div>
                )}
                <div>
                  <h3 className="text-xl mb-3 text-[#302012] leading-tight">{benefit.title}</h3>
                  <p className="text-base text-[#302012]/90 leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </FadeInUp>
    </section>
  );
}