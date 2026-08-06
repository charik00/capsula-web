import { Mail, Phone } from "lucide-react";
import { Logo } from "@/app/components/logo";

export function Footer() {
  return (
    <footer className="bg-[#F5F3ED] text-[#302012]">
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          <div className="self-start -mt-8">
            <div className="mb-0 leading-none">
              <Logo className="h-32 w-auto block" />
            </div>
            <p className="-mt-4 text-[#302012]/70 text-base max-w-[200px]">
              Инновационный центр борьбы с зависимостями
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-medium">Программы</h4>
            <ul className="space-y-2 text-base text-[#302012]/70">
              <li className="hover:text-[#302012] cursor-pointer transition-colors">Освобождение от курения</li>
              <li className="hover:text-[#302012] cursor-pointer transition-colors">Сахар и углеводы</li>
              <li className="hover:text-[#302012] cursor-pointer transition-colors">Курение + вес</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-medium">О нас</h4>
            <ul className="space-y-2 text-base text-[#302012]/70">
              <li className="hover:text-[#302012] cursor-pointer transition-colors">Как это работает</li>
              <li className="hover:text-[#302012] cursor-pointer transition-colors">Наша команда</li>
              <li className="hover:text-[#302012] cursor-pointer transition-colors">Истории успеха</li>
            </ul>
          </div>

          <div className="bg-[#302012]/10 border border-[#302012]/15 rounded-2xl p-6">
            <h4 className="mb-4 text-lg font-medium">Контакты</h4>
            <ul className="space-y-3 text-base text-[#302012]/70">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+972507442250" className="hover:text-[#302012] transition-colors">050-744-2250</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+972509234400" className="hover:text-[#302012] transition-colors">050-923-4400</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+972507673400" className="hover:text-[#302012] transition-colors">050-767-3400</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:info@capsula.co.il" className="hover:text-[#302012] transition-colors">info@capsula.co.il</a>
              </li>
              <li className="flex items-start gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                  <circle cx="12" cy="9" r="2.5"/>
                </svg>
                <div>
                  <p>HaRishonim Blvd 23</p>
                  <p>Millennium Building, Entrance B</p>
                  <p>Rishon LeZion</p>
                  <p>Floor 17, office Sok</p>
                  <a href="https://waze.com/ul?q=HaRishonim%2023%2C%20Rishon%20LeZion&navigate=yes" target="_blank" rel="noopener noreferrer" className="text-base underline text-[#302012] mt-1 inline-block">
                    📍 Открыть в Waze →
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-[#302012]/10 py-4 text-center text-xs text-[#302012]/50">
        <p>© 2026 CAPSULA. Все права защищены.</p>
        <div className="flex gap-4 justify-center mt-2">
          <a href="/privacy" className="hover:opacity-100 transition-opacity">Политика конфиденциальности</a>
          <a href="/terms" className="hover:opacity-100 transition-opacity">Правила пользования</a>
          <a href="/accessibility" className="hover:opacity-100 transition-opacity">Доступность / נגישות</a>
        </div>
      </div>
    </footer>
  );
}
