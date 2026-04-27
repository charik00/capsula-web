export function About() {
  return (
    <section id="about" className="py-12 md:py-20 px-4 bg-[#302012] text-[#F5F3ED]">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-5xl mb-4 md:mb-6">
            Один сеанс. <span className="text-[#F5F3ED]">Результат навсегда.</span>
          </h2>
          <p className="text-xl md:text-2xl text-[#F5F3ED]/70 max-w-3xl mx-auto">
            Без таблеток. Без кодирования. Без срывов.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-20 items-center mb-32">
          <div className="order-2 md:order-1">
            <div className="w-16 h-px bg-[#F5F3ED] mb-8"></div>
            <h2 className="text-5xl md:text-6xl mb-8 text-[#F5F3ED] tracking-tight leading-tight">
              Вы устали <br/>
              <span className="text-[#F5F3ED]/85">бороться</span>
            </h2>
            
            <div className="space-y-8 mb-12">
              <div>
                <p className="text-2xl text-[#F5F3ED] leading-relaxed mb-2">
                  Каждый раз обещаете себе:
                </p>
                <p className="text-xl text-[#F5F3ED]/85 leading-relaxed pl-6 border-l-2 border-[#F5F3ED]/20">
                  завтра не курю, с понедельника без сладкого, 
                  с нового месяца на диете.
                </p>
              </div>
              
              <div className="bg-[#302012] p-8 -ml-8">
                <p className="text-xl text-[#F5F3ED] leading-relaxed">
                  Но <span className="text-[#F5F3ED] font-medium">стресс, тревога, усталость</span> — и всё возвращается.
                </p>
              </div>
              
              <p className="text-lg text-[#F5F3ED] leading-relaxed">
                И вместе с ними чувство вины, раздражения, стыда.
              </p>
            </div>
            
            <div className="bg-[#F5F3ED] p-10 border-l-4 border-black">
              <p className="text-xl text-[#302012] italic leading-relaxed">
                &ldquo;Не потому что вы слабы.<br/>
                <span className="text-2xl not-italic font-light">Потому что мозг просто не умеет по-другому.&rdquo;</span>
              </p>
            </div>
          </div>
          
          <div className="relative order-1 md:order-2">
            <div className="aspect-[3/4] overflow-hidden">
              <img 
                src="/slide2.png"
                alt="Борьба с зависимостью"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div id="about-solution" className="grid md:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <img 
              src="/slide3.png"
              alt="Капсула терапия"
              className="w-full h-auto"
            />
          </div>

          <div>
            <div className="w-16 h-px bg-[#F5F3ED] mb-8"></div>
            <h3 className="text-[1.75rem] md:text-4xl mb-10 text-[#F5F3ED] tracking-tight leading-tight">
              Наше решение —<br/>
              <span className="text-[#F5F3ED]">«Капсула»</span>
            </h3>
            
            <div className="space-y-8">
              <div className="bg-[#F5F3ED] p-8 -mr-8 border-r-4 border-black">
                <p className="text-2xl text-[#302012] leading-relaxed">
                  Мы <span className="font-light">не боремся</span> с привычкой.<br/>
                  Мы <span className="font-medium">меняем реакцию мозга.</span>
                </p>
              </div>
              
              <div className="pl-6 border-l-2 border-[#F5F3ED]/30">
                <p className="text-xl text-[#F5F3ED]/85 leading-relaxed mb-4">
                  <span className="text-[#F5F3ED] font-medium">90 минут в «Капсуле»</span> — и подсознание перестает связывать стресс с сигаретой или едой.
                </p>
                <p className="text-lg text-[#F5F3ED]/85 leading-relaxed">
                  Вместо тяги появляется лёгкость, спокойствие и ощущение контроля.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}