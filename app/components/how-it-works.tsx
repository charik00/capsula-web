import { FadeInUp } from "./fade-in-up";

export function HowItWorks() {
  const features = [
    {
      number: "01",
      title: "Аудиостимуляция",
      description: "Альфа, тета, гамма-волны для расслабления, снятия блоков и формирования новых нейронных связей"
    },
    {
      number: "02",
      title: "Визуальные паттерны",
      description: "Направленные образы и световые импульсы, активирующие определённые зоны мозга"
    },
    {
      number: "03",
      title: "Ароматерапия",
      description: "Специально подобранные композиции, закрепляющие новые состояния через лимбическую систему"
    },
    {
      number: "04",
      title: "Медитативные сценарии",
      description: "Тексты по принципам НЛП и методик управления разумом для переписывания установок"
    }
  ];

  return (
    <section id="how-it-works" className="py-12 md:py-24 px-4 bg-[#F5F3ED] text-[#302012]">
      <FadeInUp>
        <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-5xl mb-4 md:mb-6">
            Как это <span className="text-[#302012]">работает</span>
          </h2>
          <p className="text-base md:text-xl text-[#302012] max-w-3xl mx-auto">
            Научно обоснованная методика сенсорной терапии
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="border-l-2 border-[#302012]/30 pl-6 py-4">
              <div className="text-5xl text-[#302012]/20 mb-3">{feature.number}</div>
              <h3 className="text-2xl mb-3 text-[#302012]">{feature.title}</h3>
              <p className="text-base md:text-lg text-[#302012] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href="/zaklyuchenie-capsula.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-2 border-[#302012] text-[#302012] px-6 py-3 rounded hover:bg-[#302012] hover:text-[#F5F3ED] transition-colors text-base md:text-lg"
          >
            📄 Экспертное заключение о проекте «Капсула»
          </a>
        </div>
        </div>
      </FadeInUp>
    </section>
  );
}