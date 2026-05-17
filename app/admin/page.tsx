"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  listClients,
  addClient,
  listQuestionnaires,
  listMeditations,
  createMeditationUpload,
  saveMeditation,
  grantAccess,
  generateClientLoginLink,
} from "@/app/actions/admin";
import { flatQuestions, getQuestionnaire } from "@/app/anketa/questions";

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  created_at: string;
}
interface Meditation {
  id: string;
  title: string;
  description: string | null;
}
interface Client {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
}
interface Questionnaire {
  id: string;
  client_email: string;
  contact: string | null;
  program: string | null;
  answers: Record<string, string | string[]>;
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [openQ, setOpenQ] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isGranting, setIsGranting] = useState(false);
  const [isAddingClient, setIsAddingClient] = useState(false);

  const [meditationForm, setMeditationForm] = useState({
    title: "",
    description: "",
    audioFile: null as File | null,
  });
  const [accessForm, setAccessForm] = useState({
    userEmail: "",
    meditationId: "",
    days: "30",
  });
  const [clientForm, setClientForm] = useState({ email: "", fullName: "" });
  const [linkEmail, setLinkEmail] = useState("");
  const [loginLink, setLoginLink] = useState("");
  const [isMakingLink, setIsMakingLink] = useState(false);

  async function handleMakeLoginLink(e: React.FormEvent) {
    e.preventDefault();
    setIsMakingLink(true);
    setLoginLink("");
    try {
      const res = await generateClientLoginLink(linkEmail);
      if (res.success && res.link) {
        setLoginLink(res.link);
      } else {
        alert(res.error || "Ошибка");
      }
    } finally {
      setIsMakingLink(false);
    }
  }

  useEffect(() => {
    async function checkAccess() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const admins = [
          "info@capsulaisrael.com",
          "morozovaalyonas@gmail.com",
        ];
        if (!user?.email || !admins.includes(user.email.toLowerCase())) {
          router.push("/admin-login");
          return;
        }
        setIsLoading(false);
        await Promise.all([
          loadLeads(),
          loadMeditations(),
          loadClients(),
          loadQuestionnaires(),
        ]);
      } catch (error) {
        console.error("Access check error:", error);
        router.push("/");
      }
    }
    checkAccess();
  }, [router]);

  async function loadLeads() {
    const { data } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    setLeads(data || []);
  }
  async function loadMeditations() {
    const res = await listMeditations();
    if (res.success) setMeditations(res.data as Meditation[]);
  }
  async function loadClients() {
    const res = await listClients();
    if (res.success) setClients(res.data as Client[]);
  }
  async function loadQuestionnaires() {
    const res = await listQuestionnaires();
    if (res.success) setQuestionnaires(res.data as Questionnaire[]);
  }

  async function handleUploadMeditation(e: React.FormEvent) {
    e.preventDefault();
    if (!meditationForm.title || !meditationForm.audioFile) {
      alert("Заполните название и выберите файл");
      return;
    }
    setIsUploading(true);
    try {
      const file = meditationForm.audioFile;
      // 1. подписанный URL для прямой загрузки в Supabase
      const prep = await createMeditationUpload(file.name);
      if (!prep.success || !prep.path || !prep.token) {
        alert(prep.error || "Не удалось подготовить загрузку");
        return;
      }
      // 2. браузер заливает файл напрямую в Storage (без лимита размера)
      const up = await supabase.storage
        .from("media")
        .uploadToSignedUrl(prep.path, prep.token, file, {
          contentType: file.type || "audio/mpeg",
        });
      if (up.error) {
        alert("Ошибка загрузки файла: " + up.error.message);
        return;
      }
      // 3. запись медитации в БД
      const saved = await saveMeditation(
        meditationForm.title,
        meditationForm.description,
        prep.path
      );
      if (saved.success) {
        alert("Медитация загружена!");
        setMeditationForm({ title: "", description: "", audioFile: null });
        await loadMeditations();
      } else {
        alert(saved.error || "Ошибка сохранения");
      }
    } catch (err) {
      alert(
        "Ошибка: " + (err instanceof Error ? err.message : "неизвестная")
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleGrantAccess(e: React.FormEvent) {
    e.preventDefault();
    setIsGranting(true);
    try {
      const res = await grantAccess(
        accessForm.userEmail,
        accessForm.meditationId,
        Number(accessForm.days)
      );
      if (res.success) {
        alert("Доступ выдан!");
        setAccessForm({ userEmail: "", meditationId: "", days: "30" });
        await loadClients();
      } else {
        alert(res.error || "Ошибка");
      }
    } finally {
      setIsGranting(false);
    }
  }

  async function handleAddClient(e: React.FormEvent) {
    e.preventDefault();
    setIsAddingClient(true);
    try {
      const res = await addClient(clientForm.email, clientForm.fullName);
      if (res.success) {
        setClientForm({ email: "", fullName: "" });
        await loadClients();
      } else {
        alert(res.error || "Ошибка");
      }
    } finally {
      setIsAddingClient(false);
    }
  }

  const formatDate = (s: string) =>
    new Date(s).toLocaleString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F3ED] flex items-center justify-center">
        <p className="text-[#302012]">Проверка доступа...</p>
      </div>
    );
  }

  const inputCls = "bg-white border-[#302012] text-[#302012]";
  const btnCls = "w-full bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/90";

  return (
    <div className="min-h-screen bg-[#F5F3ED] py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-light text-[#302012] mb-8">
          Панель управления
        </h1>

        <Tabs defaultValue="ankety" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white border-2 border-[#302012]">
            <TabsTrigger value="ankety" className="text-[#302012]">
              Анкеты
            </TabsTrigger>
            <TabsTrigger value="clients" className="text-[#302012]">
              Клиенты
            </TabsTrigger>
            <TabsTrigger value="access" className="text-[#302012]">
              Доступы
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-[#302012]">
              Медитация
            </TabsTrigger>
            <TabsTrigger value="leads" className="text-[#302012]">
              Заявки
            </TabsTrigger>
          </TabsList>

          {/* Анкеты */}
          <TabsContent value="ankety" className="mt-6">
            <div className="bg-white border-2 border-[#302012] rounded-lg overflow-hidden">
              {questionnaires.length === 0 ? (
                <div className="p-8 text-center text-[#302012]/70">
                  Нет заполненных анкет
                </div>
              ) : (
                <div className="divide-y divide-[#302012]/20">
                  {questionnaires.map((q) => (
                    <div key={q.id}>
                      <button
                        onClick={() =>
                          setOpenQ(openQ === q.id ? null : q.id)
                        }
                        className="w-full flex justify-between gap-4 px-6 py-4 text-left hover:bg-[#F5F3ED]/50"
                      >
                        <span className="text-[#302012] font-medium">
                          {q.client_email}
                          {q.program && (
                            <span className="text-[#302012]/60 font-normal">
                              {" "}
                              ·{" "}
                              {getQuestionnaire(q.program)?.title ||
                                q.program}
                            </span>
                          )}
                        </span>
                        <span className="text-[#302012]/70 whitespace-nowrap">
                          {formatDate(q.created_at)}
                        </span>
                      </button>
                      {openQ === q.id && (
                        <div className="px-6 pb-6 space-y-3">
                          {q.contact && (
                            <div>
                              <p className="text-sm text-[#302012]/60">
                                Контакт
                              </p>
                              <p className="text-[#302012]">{q.contact}</p>
                            </div>
                          )}
                          {(() => {
                            const qn = q.program
                              ? getQuestionnaire(q.program)
                              : undefined;
                            const fmt = (v: string | string[] | undefined) =>
                              Array.isArray(v)
                                ? v.join(", ")
                                : (v as string) || "";
                            if (qn) {
                              return qn.sections.map((section) => (
                                <div
                                  key={section.num}
                                  className="space-y-3"
                                >
                                  <p className="text-xs uppercase tracking-wider text-[#302012]/50 border-b border-[#302012]/15 pb-1 pt-2">
                                    {section.num}. {section.title}
                                  </p>
                                  {section.questions.map((qq) => {
                                    const val = fmt(q.answers[qq.id]);
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
                              ));
                            }
                            const map = q.program
                              ? flatQuestions(q.program)
                              : {};
                            return Object.entries(q.answers).map(
                              ([k, v]) => {
                                const val = fmt(v);
                                if (!val) return null;
                                return (
                                  <div key={k}>
                                    <p className="text-sm text-[#302012]/60">
                                      {map[k]?.label || k}
                                    </p>
                                    <p className="text-[#302012] whitespace-pre-wrap">
                                      {val}
                                    </p>
                                  </div>
                                );
                              }
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Клиенты */}
          <TabsContent value="clients" className="mt-6 space-y-6">
            <div className="bg-white border-2 border-[#302012] p-6 rounded-lg">
              <form
                onSubmit={handleAddClient}
                className="flex flex-col sm:flex-row gap-4 sm:items-end"
              >
                <div className="flex-1 space-y-2">
                  <Label className="text-[#302012]">Email клиента *</Label>
                  <Input
                    type="email"
                    required
                    value={clientForm.email}
                    onChange={(e) =>
                      setClientForm({ ...clientForm, email: e.target.value })
                    }
                    className={inputCls}
                    placeholder="client@example.com"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-[#302012]">Имя</Label>
                  <Input
                    type="text"
                    value={clientForm.fullName}
                    onChange={(e) =>
                      setClientForm({
                        ...clientForm,
                        fullName: e.target.value,
                      })
                    }
                    className={inputCls}
                    placeholder="Имя Фамилия"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isAddingClient}
                  className="bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/90"
                >
                  {isAddingClient ? "..." : "Добавить"}
                </Button>
              </form>
            </div>

            <div className="bg-white border-2 border-[#302012] p-6 rounded-lg space-y-4">
              <div>
                <p className="text-[#302012] font-medium">
                  Ссылка для входа клиента (без письма)
                </p>
                <p className="text-sm text-[#302012]/60">
                  Сгенерируй и отправь клиенту в WhatsApp/Telegram. Обходит
                  лимит почты. Ссылка одноразовая, действует ~1 час.
                </p>
              </div>
              <form
                onSubmit={handleMakeLoginLink}
                className="flex flex-col sm:flex-row gap-4 sm:items-end"
              >
                <div className="flex-1 space-y-2">
                  <Label className="text-[#302012]">Email клиента *</Label>
                  <Input
                    type="email"
                    required
                    value={linkEmail}
                    onChange={(e) => setLinkEmail(e.target.value)}
                    className={inputCls}
                    placeholder="client@example.com"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isMakingLink}
                  className="bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/90"
                >
                  {isMakingLink ? "..." : "Получить ссылку"}
                </Button>
              </form>
              {loginLink && (
                <div className="space-y-2">
                  <textarea
                    readOnly
                    value={loginLink}
                    onFocus={(e) => e.currentTarget.select()}
                    className="w-full text-xs p-3 border border-[#302012] rounded bg-[#F5F3ED] text-[#302012] break-all"
                    rows={3}
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      navigator.clipboard?.writeText(loginLink)
                    }
                    className="bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/90"
                  >
                    Скопировать ссылку
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-white border-2 border-[#302012] rounded-lg overflow-hidden">
              {clients.length === 0 ? (
                <div className="p-8 text-center text-[#302012]/70">
                  Нет клиентов
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-[#302012] text-[#F5F3ED]">
                    <tr>
                      <th className="px-6 py-4 text-left">Email</th>
                      <th className="px-6 py-4 text-left">Имя</th>
                      <th className="px-6 py-4 text-left">Активен</th>
                      <th className="px-6 py-4 text-left">Добавлен</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-[#302012]/20"
                      >
                        <td className="px-6 py-4 text-[#302012]">
                          {c.email}
                        </td>
                        <td className="px-6 py-4 text-[#302012]">
                          {c.full_name || "—"}
                        </td>
                        <td className="px-6 py-4 text-[#302012]">
                          {c.is_active ? "да" : "нет"}
                        </td>
                        <td className="px-6 py-4 text-[#302012]/70">
                          {formatDate(c.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </TabsContent>

          {/* Доступы */}
          <TabsContent value="access" className="mt-6">
            <div className="bg-white border-2 border-[#302012] p-8 rounded-lg">
              <form onSubmit={handleGrantAccess} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[#302012]">Email клиента *</Label>
                  <Input
                    type="email"
                    required
                    value={accessForm.userEmail}
                    onChange={(e) =>
                      setAccessForm({
                        ...accessForm,
                        userEmail: e.target.value,
                      })
                    }
                    className={inputCls}
                    placeholder="client@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#302012]">Медитация *</Label>
                  <Select
                    value={accessForm.meditationId}
                    onValueChange={(v) =>
                      setAccessForm({ ...accessForm, meditationId: v })
                    }
                  >
                    <SelectTrigger className={inputCls}>
                      <SelectValue placeholder="Выберите медитацию" />
                    </SelectTrigger>
                    <SelectContent>
                      {meditations.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#302012]">
                    Срок доступа (дней) *
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    required
                    value={accessForm.days}
                    onChange={(e) =>
                      setAccessForm({ ...accessForm, days: e.target.value })
                    }
                    className={inputCls}
                    placeholder="30"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isGranting}
                  className={btnCls}
                >
                  {isGranting ? "Выдача доступа..." : "Открыть доступ"}
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* Медитация */}
          <TabsContent value="upload" className="mt-6">
            <div className="bg-white border-2 border-[#302012] p-8 rounded-lg">
              <form
                onSubmit={handleUploadMeditation}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label className="text-[#302012]">Название *</Label>
                  <Input
                    type="text"
                    required
                    value={meditationForm.title}
                    onChange={(e) =>
                      setMeditationForm({
                        ...meditationForm,
                        title: e.target.value,
                      })
                    }
                    className={inputCls}
                    placeholder="Название медитации"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#302012]">Описание</Label>
                  <Textarea
                    value={meditationForm.description}
                    onChange={(e) =>
                      setMeditationForm({
                        ...meditationForm,
                        description: e.target.value,
                      })
                    }
                    className={`${inputCls} min-h-[100px]`}
                    placeholder="Описание медитации"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#302012]">Файл аудио *</Label>
                  <Input
                    type="file"
                    required
                    accept="audio/*"
                    onChange={(e) =>
                      setMeditationForm({
                        ...meditationForm,
                        audioFile: e.target.files?.[0] || null,
                      })
                    }
                    className={inputCls}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isUploading}
                  className={btnCls}
                >
                  {isUploading ? "Загрузка..." : "Загрузить медитацию"}
                </Button>
              </form>
            </div>

            <div className="bg-white border-2 border-[#302012] rounded-lg overflow-hidden mt-6">
              <div className="px-6 py-3 bg-[#302012] text-[#F5F3ED]">
                Загруженные медитации ({meditations.length})
              </div>
              {meditations.length === 0 ? (
                <div className="p-6 text-center text-[#302012]/70">
                  Пока нет медитаций
                </div>
              ) : (
                <ul className="divide-y divide-[#302012]/15">
                  {meditations.map((m) => (
                    <li
                      key={m.id}
                      className="px-6 py-3 text-[#302012]"
                    >
                      {m.title}
                      {m.description ? (
                        <span className="text-[#302012]/60">
                          {" "}
                          — {m.description}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>

          {/* Заявки */}
          <TabsContent value="leads" className="mt-6">
            <div className="bg-white border-2 border-[#302012] rounded-lg overflow-hidden">
              {leads.length === 0 ? (
                <div className="p-8 text-center text-[#302012]/70">
                  Нет заявок
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-[#302012] text-[#F5F3ED]">
                    <tr>
                      <th className="px-6 py-4 text-left">Имя</th>
                      <th className="px-6 py-4 text-left">Фамилия</th>
                      <th className="px-6 py-4 text-left">Телефон</th>
                      <th className="px-6 py-4 text-left">Дата</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="border-b border-[#302012]/20"
                      >
                        <td className="px-6 py-4 text-[#302012]">
                          {lead.first_name}
                        </td>
                        <td className="px-6 py-4 text-[#302012]">
                          {lead.last_name}
                        </td>
                        <td className="px-6 py-4 text-[#302012]">
                          {lead.phone}
                        </td>
                        <td className="px-6 py-4 text-[#302012]/70">
                          {formatDate(lead.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
