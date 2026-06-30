"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { getQuestionnaire } from "@/app/anketa/questions";
import {
  getClientCard,
  addClientNote,
  deleteClientNote,
  createClientFileUpload,
  saveClientFile,
  saveClientLink,
  deleteClientFile,
  extendAccess,
  revokeAccess,
} from "@/app/actions/admin";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";

interface Card {
  questionnaires: {
    id: string;
    program: string | null;
    contact: string | null;
    answers: Record<string, string | string[]>;
    created_at: string;
  }[];
  accesses: { id: string; meditation: string; expires_at: string }[];
  listens: {
    meditation: string;
    plays: number;
    completes: number;
    last: string | null;
  }[];
  notes: { id: string; body: string; created_at: string }[];
  files: {
    id: string;
    title: string;
    kind: string;
    url: string | null;
    created_at: string;
  }[];
}

const KIND_LABELS: Record<string, string> = {
  meditation: "Медитация",
  diet: "Диета",
  instruction: "Инструкция",
  document: "Документ",
  pdf: "PDF",
  video: "Видео",
  link: "Ссылка",
};

const inputCls = "bg-white border-[#302012] text-[#302012] text-base";

export function ClientCard({ email }: { email: string }) {
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [fileTitle, setFileTitle] = useState("");
  const [fileKind, setFileKind] = useState("diet");
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [extDays, setExtDays] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getClientCard(email);
    if (res.success && res.data) setCard(res.data as Card);
    setLoading(false);
  }, [email]);

  useEffect(() => {
    load();
  }, [load]);

  const fmtDate = (s: string) =>
    new Date(s).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  async function handleAddNote() {
    if (!note.trim()) return;
    setBusy(true);
    try {
      const res = await addClientNote(email, note);
      if (res.success) {
        setNote("");
        await load();
      } else alert(res.error || "Ошибка");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  }

  async function handleUploadFile(e: React.FormEvent) {
    e.preventDefault();

    // Ссылка — без файла, сохраняем url
    if (fileKind === "link") {
      if (!fileTitle.trim() || !fileUrl.trim()) {
        alert("Укажите название и ссылку");
        return;
      }
      setBusy(true);
      try {
        const res = await saveClientLink(email, fileTitle, fileUrl);
        if (res.success) {
          setFileTitle("");
          setFileUrl("");
          await load();
        } else alert(res.error || "Ошибка");
      } catch (e) {
        alert(e instanceof Error ? e.message : "Ошибка");
      } finally {
        setBusy(false);
      }
      return;
    }

    if (!fileTitle.trim() || !fileObj) {
      alert("Укажите название и выберите файл");
      return;
    }
    setBusy(true);
    try {
      const prep = await createClientFileUpload(email, fileObj.name);
      if (!prep.success || !prep.path || !prep.token) {
        alert(prep.error || "Ошибка подготовки");
        return;
      }
      const up = await supabase.storage
        .from("media")
        .uploadToSignedUrl(prep.path, prep.token, fileObj);
      if (up.error) {
        alert("Ошибка загрузки: " + up.error.message);
        return;
      }
      const saved = await saveClientFile(
        email,
        fileTitle,
        fileKind,
        prep.path
      );
      if (saved.success) {
        setFileTitle("");
        setFileObj(null);
        await load();
      } else alert(saved.error || "Ошибка сохранения");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setBusy(false);
    }
  }

  async function handleExtend(id: string) {
    const d = Number(extDays[id] || "30");
    const res = await extendAccess(id, d);
    if (res.success) await load();
    else alert(res.error || "Ошибка");
  }

  if (loading) {
    return (
      <div className="p-6 text-[#302012]/60">Загрузка карточки…</div>
    );
  }
  if (!card) {
    return <div className="p-6 text-red-700">Не удалось загрузить</div>;
  }

  return (
    <div className="p-6 space-y-8 bg-[#F5F3ED]">
      {/* Анкета */}
      <section>
        <h3 className="text-lg font-medium text-[#302012] mb-3">
          Анкета
        </h3>
        {card.questionnaires.length === 0 ? (
          <p className="text-[#302012]/60 text-sm">Анкета не заполнена</p>
        ) : (
          card.questionnaires.map((q) => {
            const qn = q.program ? getQuestionnaire(q.program) : undefined;
            return (
              <div
                key={q.id}
                className="bg-white border border-[#302012]/30 rounded p-4 mb-3 space-y-3"
              >
                <p className="text-sm text-[#302012]/60">
                  {qn?.title || q.program || "Анкета"} ·{" "}
                  {fmtDate(q.created_at)}
                  {q.contact ? ` · ${q.contact}` : ""}
                </p>
                {qn
                  ? qn.sections.map((s) => (
                      <div key={s.num} className="space-y-2">
                        <p className="text-xs uppercase tracking-wider text-[#302012]/50 border-b border-[#302012]/15 pb-1">
                          {s.num}. {s.title}
                        </p>
                        {s.questions.map((qq) => {
                          const v = q.answers[qq.id];
                          const val = Array.isArray(v)
                            ? v.join(", ")
                            : v || "";
                          return (
                            <div key={qq.id}>
                              <p className="text-sm text-[#302012]/60">
                                {qq.label}
                              </p>
                              <p className="text-[#302012] whitespace-pre-wrap">
                                {val || "—"}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    ))
                  : Object.entries(q.answers).map(([k, v]) => (
                      <div key={k}>
                        <p className="text-sm text-[#302012]/60">{k}</p>
                        <p className="text-[#302012]">
                          {Array.isArray(v) ? v.join(", ") : v}
                        </p>
                      </div>
                    ))}
              </div>
            );
          })
        )}
      </section>

      {/* Доступы */}
      <section>
        <h3 className="text-lg font-medium text-[#302012] mb-3">
          Доступы
        </h3>
        {card.accesses.length === 0 ? (
          <p className="text-[#302012]/60 text-sm">Доступы не выданы</p>
        ) : (
          <ul className="space-y-2">
            {card.accesses.map((a) => {
              const exp = new Date(a.expires_at);
              const active = exp.getTime() > Date.now();
              return (
                <li
                  key={a.id}
                  className="bg-white border border-[#302012]/30 rounded p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between"
                >
                  <span className="text-[#302012] text-sm">
                    {a.meditation} · до{" "}
                    {exp.toLocaleDateString("ru-RU")}{" "}
                    {active ? (
                      <span className="text-green-700">(активен)</span>
                    ) : (
                      <span className="text-red-700">(истёк)</span>
                    )}
                  </span>
                  <span className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      value={extDays[a.id] ?? "30"}
                      onChange={(e) =>
                        setExtDays((p) => ({
                          ...p,
                          [a.id]: e.target.value,
                        }))
                      }
                      className={`${inputCls} w-20`}
                    />
                    <button
                      type="button"
                      onClick={() => handleExtend(a.id)}
                      className="text-sm underline text-[#302012]"
                    >
                      Продлить
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm("Отменить доступ?")) return;
                        const r = await revokeAccess(a.id);
                        if (r.success) await load();
                        else alert(r.error || "Ошибка");
                      }}
                      className="text-sm underline text-red-700"
                    >
                      Отменить
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Прослушивания */}
      <section>
        <h3 className="text-lg font-medium text-[#302012] mb-3">
          Прослушивания медитаций
        </h3>
        {card.listens.length === 0 ? (
          <p className="text-[#302012]/60 text-sm">Пока не слушали</p>
        ) : (
          <ul className="space-y-2">
            {card.listens.map((l) => (
              <li
                key={l.meditation}
                className="bg-white border border-[#302012]/30 rounded p-3"
              >
                <p className="text-[#302012] text-sm">
                  <b>{l.meditation}</b>
                </p>
                <p className="text-[#302012]/70 text-sm mt-1">
                  Прослушиваний: <b>{l.plays}</b> · дослушал до конца:{" "}
                  <b>{l.completes}</b>
                  {l.last ? (
                    <span className="text-[#302012]/50">
                      {" "}
                      · последний раз: {fmtDate(l.last)}
                    </span>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Файлы */}
      <section>
        <h3 className="text-lg font-medium text-[#302012] mb-3">
          Файлы (диеты, инструкции, документы)
        </h3>
        <form
          onSubmit={handleUploadFile}
          className="bg-white border border-[#302012]/30 rounded p-4 space-y-3 mb-3"
        >
          <Input
            value={fileTitle}
            onChange={(e) => setFileTitle(e.target.value)}
            className={inputCls}
            placeholder="Название (например: Диета на неделю)"
          />
          <select
            value={fileKind}
            onChange={(e) => setFileKind(e.target.value)}
            className="w-full bg-white border border-[#302012] text-[#302012] rounded px-3 py-2 text-base"
          >
            <option value="diet">Диета</option>
            <option value="instruction">Инструкция</option>
            <option value="document">Документ</option>
            <option value="pdf">PDF</option>
            <option value="video">Видео</option>
            <option value="meditation">Медитация</option>
            <option value="link">Ссылка</option>
          </select>
          {fileKind === "link" ? (
            <Input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className={inputCls}
              placeholder="https://… (ссылка на видео, статью и т.п.)"
            />
          ) : (
            <Input
              type="file"
              onChange={(e) => setFileObj(e.target.files?.[0] || null)}
              className={inputCls}
            />
          )}
          <Button
            type="submit"
            disabled={busy}
            className="bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/90"
          >
            {busy
              ? "Сохранение…"
              : fileKind === "link"
              ? "Добавить ссылку"
              : "Загрузить файл"}
          </Button>
        </form>
        {card.files.length === 0 ? (
          <p className="text-[#302012]/60 text-sm">Файлов нет</p>
        ) : (
          <ul className="space-y-2">
            {card.files.map((f) => (
              <li
                key={f.id}
                className="bg-white border border-[#302012]/30 rounded p-3 flex items-center justify-between gap-3"
              >
                <span className="text-[#302012] text-sm">
                  <b>{KIND_LABELS[f.kind] || f.kind}:</b> {f.title}{" "}
                  <span className="text-[#302012]/50">
                    · {fmtDate(f.created_at)}
                  </span>
                  {f.kind === "link" && f.url ? (
                    <>
                      <br />
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#302012]/70 underline break-all"
                      >
                        {f.url}
                      </a>
                    </>
                  ) : null}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm(`Удалить «${f.title}»?`)) return;
                    const r = await deleteClientFile(f.id);
                    if (r.success) await load();
                    else alert(r.error || "Ошибка");
                  }}
                  className="text-sm underline text-red-700 shrink-0"
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Комментарии специалистов */}
      <section>
        <h3 className="text-lg font-medium text-[#302012] mb-3">
          Комментарии специалистов
        </h3>
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={`${inputCls} min-h-[60px] flex-1`}
            placeholder="Заметка по клиенту (видна только специалистам)"
          />
          <Button
            type="button"
            onClick={handleAddNote}
            disabled={busy}
            className="bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/90 self-start"
          >
            Добавить
          </Button>
        </div>
        {card.notes.length === 0 ? (
          <p className="text-[#302012]/60 text-sm">Комментариев нет</p>
        ) : (
          <ul className="space-y-2">
            {card.notes.map((n) => (
              <li
                key={n.id}
                className="bg-white border border-[#302012]/30 rounded p-3"
              >
                <div className="flex justify-between gap-3">
                  <p className="text-[#302012] whitespace-pre-wrap">
                    {n.body}
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm("Удалить комментарий?")) return;
                      const r = await deleteClientNote(n.id);
                      if (r.success) await load();
                      else alert(r.error || "Ошибка");
                    }}
                    className="text-sm underline text-red-700 shrink-0"
                  >
                    Удалить
                  </button>
                </div>
                <p className="text-xs text-[#302012]/50 mt-1">
                  {fmtDate(n.created_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
