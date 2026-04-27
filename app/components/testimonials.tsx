import { Star } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      text: "Полторы пачки в день — и в один момент я просто перестал. Всего одна процедура. Прошло три недели, и я не курю. Не тратьте время зря — это работает!",
      author: "Вадим",
      age: "",
      program: "Освобождение от курения",
      rating: 5,
    },
    {
      text: "Много лет курила по две пачки в день. Пыталась бросить много раз — никогда не получалось. Зашла сюда, вышла — и больше не зажгла ни одной сигареты. Прошло почти два месяца, даже дополнительные сеансы не понадобились.",
      author: "Наталья",
      age: "45 лет",
      program: "Освобождение от курения",
      rating: 5,
    },
    {
      text: "Курила 40 лет. Чувствовала, что организм разрушается. Пришла сюда — и с этого момента никаких сигарет. Вы благословите тот день, когда попадёте сюда. Чувствую себя чудесно.",
      author: "Людмила",
      age: "71 год",
      program: "Освобождение от курения",
      rating: 5,
    },
    {
      text: "Полтора месяца назад я пришла сюда. Минус 5 килограмм! Отёчность прошла, тело лёгкое и свежее. У меня диабет, этот путь был непростым — но оказывается, всё возможно. Вечером на работе, когда раньше срывалась, теперь чувствую себя в порядке. Очень рекомендую!",
      author: "Хагит",
      age: "",
      program: "Сахар и углеводы",
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-12 md:py-20 px-4 bg-[#302012]">
      <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 md:mb-16">
            <h2 id="testimonials-title" className="scroll-mt-32 text-3xl md:text-5xl mb-4 md:mb-6 text-[#F5F3ED]">
              Истории <span className="text-[#F5F3ED]">успеха</span>
            </h2>
            <p className="text-base md:text-xl text-[#F5F3ED]/70 max-w-3xl mx-auto">
              Реальные результаты наших клиентов
            </p>
            <p className="text-center text-xl md:text-2xl font-light mb-8 text-[#F5F3ED]">
              Уже <span className="font-medium">500+</span> клиентов в Израиле избавились от зависимости
            </p>
            <p className="md:hidden text-xs opacity-40 text-center mb-3 text-[#F5F3ED]">
              Листайте →
            </p>
          </div>

          <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-3 px-4 pb-4 scrollbar-hide -mx-4">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="snap-center shrink-0 w-[80vw] max-w-xs rounded-2xl p-5 bg-[#F5F3ED] border-2 border-[#F5F3ED] shadow-lg"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#302012] text-[#302012]" />
                  ))}
                </div>
                <p className="text-[#302012] mb-6 italic leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>
                <div>
                  <div className="text-[#302012]">{testimonial.author}</div>
                  {testimonial.age && (
                    <div className="text-sm text-[#302012]/70">{testimonial.age}</div>
                  )}
                  {"program" in testimonial && testimonial.program && (
                    <div className="text-xs text-[#302012]/60 mt-1">
                      Программа: {testimonial.program}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:grid md:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-[#F5F3ED] border-2 border-[#F5F3ED] p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#302012] text-[#302012]" />
                  ))}
                </div>
                <p className="text-[#302012] mb-6 italic leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>
                <div>
                  <div className="text-[#302012]">{testimonial.author}</div>
                  {testimonial.age && (
                    <div className="text-sm text-[#302012]/70">{testimonial.age}</div>
                  )}
                  {"program" in testimonial && testimonial.program && (
                    <div className="text-xs text-[#302012]/60 mt-1">
                      Программа: {testimonial.program}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
      </div>
    </section>
  );
}