"use client";

import { ClipboardCheck, Sparkles, HeadphonesIcon } from "lucide-react";
import { useBooking } from "./booking-provider";

export function Process() {
  const { openModal } = useBooking();
  const steps = [
    {
      icon: ClipboardCheck,
      title: "Консультация",
      description: "Определяем цель и подбираем программу"
    },
    {
      icon: Sparkles,
      title: "Сеанс в капсуле",
      description: "90 минут перепрошивки сенсорных реакций"
    },
    {
      icon: HeadphonesIcon,
      title: "Поддержка и закрепление",
      description: "Медитации, рекомендации, онлайн-сессии"
    }
  ];

  return (
    <section id="process" className="py-12 md:py-20 px-4 bg-[#F5F3ED]">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-5xl mb-4 md:mb-6 text-[#302012]">
            Процесс <span className="text-[#302012]">трансформации</span>
          </h2>
          <p className="text-base md:text-xl text-[#302012]/70 max-w-3xl mx-auto">
            От первого визита до полного освобождения
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-[#302012]/20" />
          
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-[#302012] p-8 shadow-lg hover:shadow-xl transition-shadow relative z-10">
                <div className="w-16 h-16 bg-[#F5F3ED] flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-8 h-8 text-[#302012]" />
                </div>
                
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#302012] flex items-center justify-center text-[#F5F3ED] shadow-lg">
                  {index + 1}
                </div>
                
                <h3 className="text-xl text-center mb-4 text-[#F5F3ED]">{step.title}</h3>
                <p className="text-[#F5F3ED]/70 text-center">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button onClick={openModal} className="px-8 py-4 bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/80 transition-all">
            Записаться на консультацию
          </button>
        </div>
      </div>
    </section>
  );
}