"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { submitLead } from "@/app/actions/submit-lead";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingModal({ open, onOpenChange }: BookingModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const formatPhoneNumber = (value: string) => {
    // Удаляем все нецифровые символы
    const phoneNumber = value.replace(/\D/g, "");
    
    // Форматируем как +972-XX-XXX-XXXX (израильский формат)
    // Если начинается не с 972, добавляем префикс
    let digits = phoneNumber;
    if (digits.length > 0 && !digits.startsWith("972")) {
      // Если пользователь вводит номер без кода страны, добавляем 972
      if (digits.length <= 9 && !digits.startsWith("0")) {
        digits = "972" + digits;
      } else if (digits.startsWith("0")) {
        // Если начинается с 0, заменяем на 972
        digits = "972" + digits.slice(1);
      }
    }
    
    if (digits.length === 0) return "";
    if (digits.length <= 3) return `+${digits}`;
    if (digits.length <= 5) return `+${digits.slice(0, 3)}-${digits.slice(3)}`;
    if (digits.length <= 8) return `+${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
    return `+${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 8)}-${digits.slice(8, 12)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const phoneDigits = formData.phone.replace(/\D/g, "");
      // Убеждаемся, что номер начинается с 972
      let finalPhone = phoneDigits;
      if (finalPhone.startsWith("0")) {
        finalPhone = "972" + finalPhone.slice(1);
      } else if (!finalPhone.startsWith("972") && finalPhone.length > 0) {
        finalPhone = "972" + finalPhone;
      }

      const result = await submitLead({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: finalPhone,
      });

      if (result.success) {
        setIsSuccess(true);
        // Очищаем форму
        setFormData({ firstName: "", lastName: "", phone: "" });
        // Закрываем модальное окно через 2 секунды
        setTimeout(() => {
          setIsSuccess(false);
          onOpenChange(false);
        }, 2000);
      } else {
        console.error("Form submission error:", result.error);
        setError(result.error || "Произошла ошибка при отправке формы");
      }
    } catch (err) {
      console.error("Form submission exception:", err);
      setError("Произошла ошибка при отправке формы. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsSuccess(false);
      setError("");
      setFormData({ firstName: "", lastName: "", phone: "" });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#F5F3ED] border-2 border-[#302012]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#302012]">
            Записаться на консультацию
          </DialogTitle>
          <DialogDescription className="text-[#302012]/70">
            Заполните форму, и мы свяжемся с вами в ближайшее время
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-8 text-center">
            <div className="text-4xl mb-4">✓</div>
            <p className="text-xl text-[#302012] font-medium">
              Спасибо, мы свяжемся с вами!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-[#302012]">
                Имя *
              </Label>
              <Input
                id="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="bg-white border-[#302012] text-[#302012] focus:border-[#302012]"
                placeholder="Введите ваше имя"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-[#302012]">
                Фамилия *
              </Label>
              <Input
                id="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="bg-white border-[#302012] text-[#302012] focus:border-[#302012]"
                placeholder="Введите вашу фамилию"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[#302012]">
                Телефон *
              </Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handlePhoneChange}
                className="bg-white border-[#302012] text-[#302012] focus:border-[#302012]"
                placeholder="+972-XX-XXX-XXXX"
                maxLength={17}
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/90 mt-6"
            >
              {isSubmitting ? "Отправка..." : "Отправить"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
