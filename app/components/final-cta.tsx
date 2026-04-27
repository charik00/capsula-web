"use client";

import { ArrowRight } from "lucide-react";
import { useBooking } from "./booking-provider";

export function FinalCTA() {
  const { openModal } = useBooking();
  return (
    <section className="py-12 md:py-20 px-4 bg-[#302012] text-[#F5F3ED]">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Левая колонка - изображение */}
          <div className="order-2 md:order-1">
            <div className="relative aspect-[4/5] overflow-hidden">
              <img 
                src="/last.jpg" 
                alt="Капсула терапия" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Правая колонка - текст и CTA */}
          <div className="order-1 md:order-2 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl mb-4 md:mb-6">
              Готовы начать <span className="text-[#F5F3ED]">новую жизнь</span>?
            </h2>
            <p className="text-base md:text-xl text-[#F5F3ED]/70 mb-6 md:mb-8">
              Запишитесь на бесплатную консультацию и узнайте, как «Капсула» может помочь именно вам
            </p>
            <button onClick={openModal} className="px-8 md:px-10 py-4 md:py-5 bg-[#F5F3ED] text-[#302012] hover:bg-[#F5F3ED]/90 transition-all flex items-center justify-center gap-3 group mx-auto md:mx-0 text-sm md:text-base">
              <span>Записаться на консультацию</span>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}