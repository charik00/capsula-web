"use client";

import { useState } from "react";
import { submitLead } from "@/app/actions/submit-lead";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatPhoneInput(value: string): string {
  const phoneNumber = value.replace(/\D/g, "");
  let digits = phoneNumber;
  if (digits.length > 0 && !digits.startsWith("972")) {
    if (digits.length <= 9 && !digits.startsWith("0")) {
      digits = "972" + digits;
    } else if (digits.startsWith("0")) {
      digits = "972" + digits.slice(1);
    }
  }
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `+${digits}`;
  if (digits.length <= 5) return `+${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 8) return `+${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  return `+${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 8)}-${digits.slice(8, 12)}`;
}

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const resetLocal = () => {
    setShowForm(false);
    setSent(false);
    setName("");
    setPhone("");
    setError("");
  };

  const handleClose = () => {
    resetLocal();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmed = name.trim();
    if (!trimmed || !phone.trim()) {
      setError("Заполните имя и телефон");
      return;
    }
    setIsSubmitting(true);
    try {
      const phoneDigits = phone.replace(/\D/g, "");
      let finalPhone = phoneDigits;
      if (finalPhone.startsWith("0")) {
        finalPhone = "972" + finalPhone.slice(1);
      } else if (!finalPhone.startsWith("972") && finalPhone.length > 0) {
        finalPhone = "972" + finalPhone;
      }
      const space = trimmed.indexOf(" ");
      const firstName = space === -1 ? trimmed : trimmed.slice(0, space);
      const lastName = space === -1 ? "—" : trimmed.slice(space + 1).trim() || "—";

      const result = await submitLead({
        firstName,
        lastName,
        phone: finalPhone,
      });
      if (result.success) {
        setSent(true);
      } else {
        setError(result.error || "Не удалось отправить заявку");
      }
    } catch {
      setError("Произошла ошибка. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-2xl border border-[#F5F3ED]/15 bg-[#1C0F07] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 text-xl text-[#F5F3ED]/50 transition-colors hover:text-[#F5F3ED]"
        >
          ✕
        </button>

        {!showForm ? (
          <>
            <h3 className="mb-6 text-lg font-medium text-[#F5F3ED]">Записаться на консультацию</h3>
            <div className="flex flex-col gap-3">
              <a
                href="https://wa.clck.bar/972509234400"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-3 rounded-xl border border-[#F5F3ED]/15 bg-[#2A1507] p-4 text-[#F5F3ED] transition-colors hover:bg-[#3a2010]"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Написать в WhatsApp
              </a>

              <a
                href="tel:+972509234400"
                className="flex w-full items-center gap-3 rounded-xl border border-[#F5F3ED]/15 bg-[#2A1507] p-4 text-[#F5F3ED] transition-colors hover:bg-[#3a2010]"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .95h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                Позвонить нам
              </a>

              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="flex w-full items-center gap-3 rounded-xl border border-[#F5F3ED]/15 bg-[#2A1507] p-4 text-[#F5F3ED] transition-colors hover:bg-[#3a2010]"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,12 2,6" />
                </svg>
                Оставить заявку
              </button>
            </div>
          </>
        ) : sent ? (
          <div className="py-6 text-center">
            <div className="mb-4 text-4xl">✓</div>
            <h3 className="mb-2 text-lg font-medium text-[#F5F3ED]">Заявка отправлена!</h3>
            <p className="text-sm text-[#F5F3ED]/70">Мы свяжемся с вами в ближайшее время</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError("");
              }}
              className="mb-4 flex items-center gap-2 text-sm text-[#F5F3ED]/50 transition-colors hover:text-[#F5F3ED]"
            >
              ← Назад
            </button>
            <h3 className="mb-4 text-lg font-medium text-[#F5F3ED]">Оставить заявку</h3>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[#F5F3ED]/15 bg-[#2A1507] p-3 text-[#F5F3ED] outline-none placeholder:text-[#F5F3ED]/40 focus:border-[#F5F3ED]/40"
                required
                disabled={isSubmitting}
              />
              <input
                type="tel"
                placeholder="Ваш телефон"
                value={phone}
                onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                className="w-full rounded-xl border border-[#F5F3ED]/15 bg-[#2A1507] p-3 text-[#F5F3ED] outline-none placeholder:text-[#F5F3ED]/40 focus:border-[#F5F3ED]/40"
                required
                maxLength={18}
                disabled={isSubmitting}
              />
              {error && (
                <p className="text-sm text-red-400" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[#F5F3ED] p-3 font-medium text-[#302012] transition-colors hover:bg-[#F5F3ED]/90 disabled:opacity-60"
              >
                {isSubmitting ? "Отправка..." : "Отправить"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
