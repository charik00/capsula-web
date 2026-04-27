"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useBooking } from "./booking-provider";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { openModal } = useBooking();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#302012]/80 backdrop-blur-md border-b border-[#F5F3ED]/10">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/logo%20light.svg"
            alt="CAPSULA"
            className="hidden md:block h-28 w-auto"
          />
          <img
            src="/logo%20light.svg"
            alt="CAPSULA"
            className="md:hidden h-24 w-auto"
          />
        </div>
        
        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-8 items-center">
          <button onClick={() => scrollToSection("about")} className="text-[#F5F3ED] hover:text-[#F5F3ED]/60 transition-colors">
            О методе
          </button>
          <button onClick={() => scrollToSection("programs")} className="text-[#F5F3ED] hover:text-[#F5F3ED]/60 transition-colors">
            Программы
          </button>
          <button onClick={() => scrollToSection("team")} className="text-[#F5F3ED] hover:text-[#F5F3ED]/60 transition-colors">
            Специалисты
          </button>
          <button onClick={openModal} className="px-8 py-3 bg-[#F5F3ED] text-[#302012] hover:bg-[#F5F3ED]/80 transition-all">
            Записаться
          </button>
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-[#F5F3ED] p-2 mr-3"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className="md:hidden bg-[#302012] border-t border-[#F5F3ED]/10">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <button onClick={() => scrollToSection("about-solution")} className="text-[#F5F3ED] hover:text-[#F5F3ED]/60 transition-colors text-left py-2">
              О методе
            </button>
            <button onClick={() => scrollToSection("programs")} className="text-[#F5F3ED] hover:text-[#F5F3ED]/60 transition-colors text-left py-2">
              Программы
            </button>
            <button onClick={() => scrollToSection("team")} className="text-[#F5F3ED] hover:text-[#F5F3ED]/60 transition-colors text-left py-2">
              Специалисты
            </button>
            <button onClick={openModal} className="px-8 py-3 bg-[#F5F3ED] text-[#302012] hover:bg-[#F5F3ED]/80 transition-all text-center">
              Записаться
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}