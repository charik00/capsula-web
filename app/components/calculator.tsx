"use client";

import { useState } from "react";
import { useBooking } from "./booking-provider";

const CIGARETTES_PER_PACK = 20;

function formatCurrency(n: number): string {
  return Math.round(n).toLocaleString("ru-RU") + " ₪";
}

function getFiveYearGoalText(amount: number): string {
  if (amount <= 5000) return "купить новый смартфон";
  if (amount <= 15000) return "слетать в Европу и вернуться";
  if (amount <= 30000) return "провести отпуск всей семьёй за границей";
  if (amount <= 60000) return "купить подержанный автомобиль";
  if (amount <= 100000) return "сделать ремонт в квартире";
  return "накопить на первый взнос за жильё";
}

export function Calculator() {
  const [cigarettes, setCigarettes] = useState(20);
  const [packPrice, setPackPrice] = useState(35);
  const { openModal } = useBooking();

  const perCig = packPrice / CIGARETTES_PER_PACK;
  const perDay = perCig * cigarettes;
  const monthly = perDay * 30;
  const yearly = perDay * 365;
  const fiveYears = yearly * 5;

  return (
    <section className="pt-6 pb-4 md:pt-16 md:pb-10 px-4 bg-[#302012] text-[#F5F3ED]">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-4xl mb-3">Сколько вы тратите на курение?</h2>
          <p className="text-[#F5F3ED]/75 text-sm md:text-lg">
            Передвиньте ползунки и посмотрите, сколько можно сохранить.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 mb-4 md:mb-6">
          <div className="bg-[#3d2a1a] border border-[#F5F3ED]/20 p-3 md:p-6 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-[#F5F3ED]/80">Сигарет в день</label>
              <span className="text-base font-medium">{cigarettes} шт</span>
            </div>
            <input
              type="range"
              min={1}
              max={60}
              step={1}
              value={cigarettes}
              onChange={(e) => setCigarettes(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          <div className="bg-[#3d2a1a] border border-[#F5F3ED]/20 p-3 md:p-6 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm text-[#F5F3ED]/80">Цена пачки в ₪</label>
              <span className="text-base font-medium">{packPrice} ₪</span>
            </div>
            <input
              type="range"
              min={25}
              max={60}
              step={5}
              value={packPrice}
              onChange={(e) => setPackPrice(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
          <div className="bg-[#3d2a1a] border border-[#F5F3ED]/20 p-3 md:p-5 rounded-lg text-center">
            <div className="text-[#F5F3ED]/75 text-xs mb-1">В месяц</div>
            <div className="text-base md:text-2xl font-medium">{formatCurrency(monthly)}</div>
          </div>
          <div className="bg-[#3d2a1a] border border-[#F5F3ED]/20 p-3 md:p-5 rounded-lg text-center">
            <div className="text-[#F5F3ED]/75 text-xs mb-1">За год</div>
            <div className="text-base md:text-2xl font-medium">{formatCurrency(yearly)}</div>
          </div>
          <div className="bg-[#3d2a1a] border border-[#F5F3ED]/20 p-3 md:p-5 rounded-lg text-center">
            <div className="text-[#F5F3ED]/75 text-xs mb-1">За 5 лет</div>
            <div className="text-base md:text-2xl font-medium">{formatCurrency(fiveYears)}</div>
          </div>
        </div>

        <p className="text-sm md:text-lg mb-4 md:mb-6 text-[#F5F3ED]/90 text-center">
          На эти деньги за 5 лет можно было бы{" "}
          <span className="text-[#F5F3ED] font-medium">{getFiveYearGoalText(fiveYears)}</span>
        </p>

        <button
          onClick={openModal}
          className="inline-flex items-center justify-center w-full px-8 py-3 md:py-4 bg-[#F5F3ED] text-[#302012] hover:bg-[#F5F3ED]/90 transition-all rounded-lg text-sm md:text-base font-medium"
        >
          Хочу бросить и сэкономить — записаться на консультацию →
        </button>
      </div>
    </section>
  );
}
