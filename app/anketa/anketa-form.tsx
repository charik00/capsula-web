"use client";

import { useMemo, useState } from "react";
import {
  QUESTIONNAIRES,
  getQuestionnaire,
  type Question,
} from "./questions";
import { submitQuestionnaire } from "@/app/actions/submit-questionnaire";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";

type AnswerValue = string | string[];

// Необязательные вопросы: «другое» (доп. поля), помеченные «по желанию»
// и метафорические/неоднозначные. Всё остальное — обязательно.
const OPTIONAL_IDS = new Set<string>([
  "triggers_other",
  "benefit_other",
  "hard_emotions_other",
  "food_triggers_other",
  "trigger_foods_other",
  "eating_emotions_other",
  "env_factors_other",
  "medications",
  "cigarette_voice",
  "craving_voice",
  "quit_attempts",
  "past_attempts",
]);

const isRequired = (id: string) => !OPTIONAL_IDS.has(id);

export function AnketaForm() {
  const [program, setProgram] = useState<string>("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questionnaire = useMemo(
    () => getQuestionnaire(program),
    [program]
  );

  const setAnswer = (id: string, value: AnswerValue) =>
    setAnswers((prev) => ({ ...prev, [id]: value }));

  const toggleCheckbox = (id: string, opt: string) => {
    setAnswers((prev) => {
      const cur = Array.isArray(prev[id]) ? (prev[id] as string[]) : [];
      const next = cur.includes(opt)
        ? cur.filter((v) => v !== opt)
        : [...cur, opt];
      return { ...prev, [id]: next };
    });
  };

  const isEmpty = (v: AnswerValue | undefined) =>
    v === undefined ||
    (typeof v === "string" && !v.trim()) ||
    (Array.isArray(v) && v.length === 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!questionnaire) {
      setError("Выберите программу");
      return;
    }
    if (!email.trim()) {
      setError("Укажите ваш email");
      return;
    }
    if (!contact.trim()) {
      setError("Укажите номер телефона или Telegram");
      return;
    }
    for (const section of questionnaire.sections) {
      for (const q of section.questions) {
        if (isRequired(q.id) && isEmpty(answers[q.id])) {
          setError(`Заполните обязательное поле: «${q.label}»`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    const res = await submitQuestionnaire({
      email,
      contact,
      program: questionnaire.key,
      answers,
    });
    setIsSubmitting(false);

    if (res.success) {
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setError(res.error || "Ошибка при отправке");
    }
  };

  if (done) {
    return (
      <div className="bg-white border-2 border-[#302012] p-8 rounded-lg text-center">
        <h2 className="text-2xl font-light text-[#302012] mb-2">
          Спасибо! Анкета отправлена.
        </h2>
        <p className="text-[#302012]/70">
          Желаем вам удачи! У вас все получится!
        </p>
      </div>
    );
  }

  const inputCls =
    "bg-white border-[#302012] text-[#302012] focus:border-[#302012]";

  const renderQuestion = (q: Question) => (
    <div key={q.id} className="space-y-2">
      <Label className="text-[#302012] leading-snug">
        {q.label}
        {isRequired(q.id) ? " *" : ""}
      </Label>
      {q.hint && (
        <p className="text-xs text-[#302012]/50 italic">{q.hint}</p>
      )}

      {q.type === "textarea" && (
        <Textarea
          value={(answers[q.id] as string) || ""}
          onChange={(e) => setAnswer(q.id, e.target.value)}
          className={`${inputCls} min-h-[90px]`}
        />
      )}

      {(q.type === "text" || q.type === "number") && (
        <Input
          type={q.type === "number" ? "number" : "text"}
          min={q.min}
          max={q.max}
          value={(answers[q.id] as string) || ""}
          onChange={(e) => setAnswer(q.id, e.target.value)}
          className={inputCls}
        />
      )}

      {q.type === "radio" && (
        <div className="flex flex-wrap gap-2 pt-1">
          {q.options?.map((opt) => {
            const active = answers[q.id] === opt;
            return (
              <button
                type="button"
                key={opt}
                onClick={() => setAnswer(q.id, opt)}
                className={`px-4 py-2 border text-sm transition-colors ${
                  active
                    ? "border-[#302012] bg-[#302012] text-[#F5F3ED]"
                    : "border-[#302012]/40 text-[#302012] hover:border-[#302012]"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {q.type === "checkbox" && (
        <div className="flex flex-wrap gap-2 pt-1">
          {q.options?.map((opt) => {
            const arr = Array.isArray(answers[q.id])
              ? (answers[q.id] as string[])
              : [];
            const active = arr.includes(opt);
            return (
              <button
                type="button"
                key={opt}
                onClick={() => toggleCheckbox(q.id, opt)}
                className={`px-4 py-2 border text-sm transition-colors ${
                  active
                    ? "border-[#302012] bg-[#302012] text-[#F5F3ED]"
                    : "border-[#302012]/40 text-[#302012] hover:border-[#302012]"
                }`}
              >
                {active ? "✓ " : ""}
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {q.type === "scale" && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
            const active = Number(answers[q.id]) >= n;
            return (
              <button
                type="button"
                key={n}
                onClick={() => setAnswer(q.id, String(n))}
                className={`w-10 h-10 border text-sm transition-colors ${
                  active
                    ? "border-[#302012] bg-[#302012] text-[#F5F3ED]"
                    : "border-[#302012]/40 text-[#302012] hover:border-[#302012]"
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Выбор программы */}
      <div className="bg-white border-2 border-[#302012] p-6 rounded-lg space-y-3">
        <Label className="text-[#302012]">Выберите программу *</Label>
        <div className="flex flex-wrap gap-3">
          {QUESTIONNAIRES.map((qn) => (
            <button
              type="button"
              key={qn.key}
              onClick={() => {
                setProgram(qn.key);
                setAnswers({});
              }}
              className={`px-5 py-3 border text-sm transition-colors ${
                program === qn.key
                  ? "border-[#302012] bg-[#302012] text-[#F5F3ED]"
                  : "border-[#302012]/40 text-[#302012] hover:border-[#302012]"
              }`}
            >
              {qn.title}
            </button>
          ))}
        </div>
      </div>

      {questionnaire && (
        <>
          {questionnaire.sections.map((section) => (
            <div
              key={section.num}
              className="bg-white border-2 border-[#302012] p-6 rounded-lg space-y-6"
            >
              <div className="border-b border-[#302012]/20 pb-3">
                <p className="text-xs text-[#302012]/50 tracking-widest">
                  {section.num}
                </p>
                <h2 className="text-xl font-light text-[#302012]">
                  {section.title}
                </h2>
                {section.subtitle && (
                  <p className="text-xs text-[#302012]/50 uppercase tracking-wider">
                    {section.subtitle}
                  </p>
                )}
              </div>
              {section.questions.map(renderQuestion)}
            </div>
          ))}

          {/* Контакты */}
          <div className="bg-white border-2 border-[#302012] p-6 rounded-lg space-y-4">
            <div className="space-y-2">
              <Label className="text-[#302012]">Ваш email *</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                placeholder="example@mail.com"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#302012]">
                Номер телефона / Telegram *
              </Label>
              <Input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className={inputCls}
                placeholder="+972 ... или @username"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/90"
          >
            {isSubmitting ? "Отправка..." : "Отправить анкету"}
          </Button>
        </>
      )}
    </form>
  );
}
