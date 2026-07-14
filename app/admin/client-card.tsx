"use client";

import { useEffect, useState, useCallback } from "react";
import { getQuestionnaire } from "@/app/anketa/questions";
import {
  getClientCard,
  addClientNote,
  deleteClientNote,
  extendAccess,
  revokeAccess,
  grantMaterialAccess,
  revokeMaterialAccess,
  grantAllMaterials,
  revokeAllMaterials,
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
  materialsLibrary: {
    id: string;
    title: string;
    kind: string;
    url: string | null;
  }[];
  materialGrants: { material_id: string; expires_at: string | null }[];
  notes: { id: string; body: string; created_at: string }[];
}

const KIND_LABELS: Record<string, string> = {
  video: "Видео",
  pdf: "PDF",
  document: "Документ",
  link: "Ссылка",
};

const inputCls = "bg-white border-[#302012] text-[#302012] text-base";

export function ClientCard({ email }: { email: string }) {
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [extDays, setExtDays] = useState<Record<string, string>>({});
  const [matDays, setMatDays] = useState<Record<string, string>>({});
  const [bulkDays, setBulkDays] = useState("");

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

  async function handleExtend(id: string) {
    const d = Number(extDays[id] || "30");
    const res = await extendAccess(id, d);
    if (res.success) await load();
    else alert(res.error || "Ошибка");
  }

  // Выдать/обновить материал клиенту (days пусто/undefined = бессрочно)
  async function grantMat(materialId: string, days?: number) {
    const res = await grantMaterialAccess(email, materialId, days);
    if (res.success) await load();
    else alert(res.error || "Ошибка");
  }

  async function toggleMat(materialId: string, granted: boolean) {
    const res = granted
      ? await revokeMaterialAccess(email, materialId)
      : await grantMaterialAccess(
          email,
          materialId,
          matDays[materialId] ? Number(matDays[materialId]) : undefined
        );
    if (res.success) await load();
    else alert(res.error || "Ошибка");
  }

  // «Отметить все»: выдать/снять все материалы разом (общий срок)
  async function toggleAllMat(allGranted: boolean) {
    const res = allGranted
      ? await revokeAllMaterials(email)
      : await grantAllMaterials(
          email,
          bulkDays ? Number(bulkDays) : undefined
        );
    if (res.success) await load();
    else alert(res.error || "Ошибка");
  }

  // Применить срок ко ВСЕМ материалам в любой момент (выдаёт недостающие
  // и обновляет срок у уже выданных). Пусто = сделать всем бессрочно.
  async function applyBulkDays() {
    const res = await grantAllMaterials(
      email,
      bulkDays ? Number(bulkDays) : undefined
    );
    if (res.success) await load();
    else alert(res.error || "Ошибка");
  }

  if (loading) {
    return <div className="p-6 text-[#302012]/60">Загрузка карточки…</div>;
  }
  if (!card) {
    return <div className="p-6 text-red-700">Не удалось загрузить</div>;
  }

  return (
    <div className="p-6 space-y-8 bg-[#F5F3ED]">
      {/* Анкета */}
      <section>
        <h3 className="text-lg font-medium text-[#302012] mb-3">Анкета</h3>
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
                  {qn?.title || q.program || "Анкета"} · {fmtDate(q.created_at)}
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
                          const val = Array.isArray(v) ? v.join(", ") : v || "";
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

      {/* Доступы к медитациям */}
      <section>
        <h3 className="text-lg font-medium text-[#302012] mb-3">
          Доступы к медитациям
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
                    {a.meditation} · до {exp.toLocaleDateString("ru-RU")}{" "}
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
                        setExtDays((p) => ({ ...p, [a.id]: e.target.value }))
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

      {/* Материалы — выдача из библиотеки галочками */}
      <section>
        <h3 className="text-lg font-medium text-[#302012] mb-3">Материалы</h3>
        {card.materialsLibrary.length === 0 ? (
          <p className="text-[#302012]/60 text-sm">
            В библиотеке нет материалов. Добавьте их во вкладке «Материалы».
          </p>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-3 bg-white border border-[#302012]/30 rounded p-3">
              <label className="flex items-center gap-2 text-sm text-[#302012] cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={card.materialsLibrary.every((m) =>
                    card.materialGrants.some((g) => g.material_id === m.id)
                  )}
                  onChange={(e) => toggleAllMat(!e.target.checked)}
                  className="w-4 h-4"
                />
                Отметить все
              </label>
              <span className="flex items-center gap-2 text-sm text-[#302012]/70">
                Срок:
                <Input
                  type="number"
                  min={1}
                  value={bulkDays}
                  onChange={(e) => setBulkDays(e.target.value)}
                  className={`${inputCls} w-24`}
                  placeholder="дней"
                />
                <button
                  type="button"
                  onClick={applyBulkDays}
                  className="text-sm underline text-[#302012] font-medium whitespace-nowrap"
                >
                  Задать срок всем
                </button>
                <span className="text-[#302012]/50">пусто = бессрочно</span>
              </span>
            </div>
            <ul className="space-y-2">
            {card.materialsLibrary.map((m) => {
              const grant = card.materialGrants.find(
                (g) => g.material_id === m.id
              );
              const granted = !!grant;
              return (
                <li
                  key={m.id}
                  className="bg-white border border-[#302012]/30 rounded p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <label className="flex items-start gap-2 text-[#302012] text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={granted}
                      onChange={() => toggleMat(m.id, granted)}
                      className="w-4 h-4 mt-0.5 shrink-0"
                    />
                    <span>
                      <b>{KIND_LABELS[m.kind] || m.kind}:</b> {m.title}
                      {granted &&
                        (grant?.expires_at ? (
                          new Date(grant.expires_at).getTime() > Date.now() ? (
                            <span className="text-green-700 text-xs">
                              {" "}
                              · до{" "}
                              {new Date(grant.expires_at).toLocaleDateString(
                                "ru-RU"
                              )}
                            </span>
                          ) : (
                            <span className="text-red-700 text-xs">
                              {" "}
                              · срок истёк
                            </span>
                          )
                        ) : (
                          <span className="text-[#302012]/50 text-xs">
                            {" "}
                            · бессрочно
                          </span>
                        ))}
                    </span>
                  </label>
                  {granted && (
                    <span className="flex items-center gap-2 shrink-0">
                      <Input
                        type="number"
                        min={1}
                        value={matDays[m.id] ?? ""}
                        onChange={(e) =>
                          setMatDays((p) => ({ ...p, [m.id]: e.target.value }))
                        }
                        className={`${inputCls} w-20`}
                        placeholder="дней"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const d = Number(matDays[m.id]);
                          if (!d || d <= 0) {
                            alert("Укажите число дней");
                            return;
                          }
                          grantMat(m.id, d);
                        }}
                        className="text-sm underline text-[#302012]"
                      >
                        Срок
                      </button>
                      <button
                        type="button"
                        onClick={() => grantMat(m.id)}
                        className="text-sm underline text-[#302012]/70"
                      >
                        Бессрочно
                      </button>
                    </span>
                  )}
                </li>
              );
            })}
            </ul>
          </>
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
                  <p className="text-[#302012] whitespace-pre-wrap">{n.body}</p>
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
