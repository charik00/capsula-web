"use client";

import React, { useEffect, useState } from "react";
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
  updateMeditation,
  deleteMeditation,
  grantAccess,
  generateClientLoginLink,
  setClientCredentials,
  listAccess,
  extendAccess,
  revokeAccess,
  deleteClient,
  listMaterials,
  createMaterialUpload,
  saveMaterial,
  saveMaterialLink,
  updateMaterial,
  deleteMaterial,
} from "@/app/actions/admin";
import { ClientCard } from "./client-card";
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
interface AccessRow {
  id: string;
  user_email: string;
  meditation: string;
  expires_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [accesses, setAccesses] = useState<AccessRow[]>([]);
  const [openClient, setOpenClient] = useState<string | null>(null);
  const [extendDays, setExtendDays] = useState<Record<string, string>>({});
  const [openQ, setOpenQ] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isGranting, setIsGranting] = useState(false);
  const [isAddingClient, setIsAddingClient] = useState(false);

  const [meditationForm, setMeditationForm] = useState({
    title: "",
    description: "",
    audioFile: null as File | null,
  });

  // Библиотека материалов (видео/pdf/документы/ссылки)
  const [materials, setMaterials] = useState<
    {
      id: string;
      title: string;
      kind: string;
      url: string | null;
      description: string | null;
    }[]
  >([]);
  const [isUploadingMat, setIsUploadingMat] = useState(false);
  const [matForm, setMatForm] = useState({
    title: "",
    kind: "video",
    file: null as File | null,
    url: "",
    description: "",
  });
  const [editMatId, setEditMatId] = useState<string | null>(null);
  const [editMat, setEditMat] = useState({
    title: "",
    description: "",
    url: "",
    kind: "",
    file: null as File | null,
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
  const [credEmail, setCredEmail] = useState("");
  const [credName, setCredName] = useState("");
  const [credPass, setCredPass] = useState("");
  const [credResult, setCredResult] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [isMakingCred, setIsMakingCred] = useState(false);

  async function handleSetCredentials(e: React.FormEvent) {
    e.preventDefault();
    setIsMakingCred(true);
    setCredResult(null);
    try {
      const res = await setClientCredentials(credEmail, credPass, credName);
      if (res.success && res.email && res.password) {
        setCredResult({ email: res.email, password: res.password });
        await loadClients();
      } else {
        alert(res.error || "Ошибка");
      }
    } catch (err) {
      alert(
        "Не удалось создать доступ: " +
          (err instanceof Error ? err.message : "ошибка сессии, войдите в админку заново")
      );
    } finally {
      setIsMakingCred(false);
    }
  }

  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  function startEdit(m: Meditation) {
    setEditId(m.id);
    setEditTitle(m.title);
    setEditDesc(m.description || "");
  }

  async function saveEdit() {
    if (!editId) return;
    const res = await updateMeditation(editId, editTitle, editDesc);
    if (res.success) {
      setEditId(null);
      await loadMeditations();
    } else {
      alert(res.error || "Ошибка");
    }
  }

  async function removeMeditation(id: string, title: string) {
    if (
      !confirm(
        `Удалить медитацию «${title}»? Доступы клиентов к ней тоже исчезнут. Действие необратимо.`
      )
    )
      return;
    const res = await deleteMeditation(id);
    if (res.success) {
      await loadMeditations();
    } else {
      alert(res.error || "Ошибка");
    }
  }

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
    } catch (err) {
      alert(
        "Не удалось создать ссылку: " +
          (err instanceof Error ? err.message : "ошибка сессии, войдите в админку заново")
      );
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
          loadAccesses(),
          loadMaterials(),
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
  async function loadMaterials() {
    const res = await listMaterials();
    if (res.success)
      setMaterials(
        res.data as {
          id: string;
          title: string;
          kind: string;
          url: string | null;
          description: string | null;
        }[]
      );
  }

  function startEditMat(m: {
    id: string;
    title: string;
    kind: string;
    url: string | null;
    description: string | null;
  }) {
    setEditMatId(m.id);
    setEditMat({
      title: m.title,
      description: m.description || "",
      url: m.url || "",
      kind: m.kind,
      file: null,
    });
  }

  async function saveEditMat(id: string) {
    if (!editMat.title.trim()) {
      alert("Название не может быть пустым");
      return;
    }
    setIsUploadingMat(true);
    try {
      let newPath: string | undefined;
      if (editMat.kind !== "link" && editMat.file) {
        const prep = await createMaterialUpload(editMat.file.name);
        if (!prep.success || !prep.path || !prep.token) {
          alert(prep.error || "Не удалось подготовить загрузку");
          return;
        }
        const up = await supabase.storage
          .from("media")
          .uploadToSignedUrl(prep.path, prep.token, editMat.file, {
            contentType: editMat.file.type || "application/octet-stream",
          });
        if (up.error) {
          alert("Ошибка загрузки файла: " + up.error.message);
          return;
        }
        newPath = prep.path;
      }
      const res = await updateMaterial(
        id,
        editMat.title,
        editMat.description,
        editMat.kind === "link" ? editMat.url : undefined,
        newPath
      );
      if (res.success) {
        setEditMatId(null);
        await loadMaterials();
      } else alert(res.error || "Ошибка");
    } catch (err) {
      alert("Ошибка: " + (err instanceof Error ? err.message : "неизвестная"));
    } finally {
      setIsUploadingMat(false);
    }
  }

  async function handleSaveMaterial(e: React.FormEvent) {
    e.preventDefault();
    if (!matForm.title.trim()) {
      alert("Укажите название");
      return;
    }
    setIsUploadingMat(true);
    try {
      if (matForm.kind === "link") {
        if (!matForm.url.trim()) {
          alert("Укажите ссылку");
          return;
        }
        const res = await saveMaterialLink(
          matForm.title,
          matForm.url,
          matForm.description
        );
        if (!res.success) {
          alert(res.error || "Ошибка");
          return;
        }
      } else {
        if (!matForm.file) {
          alert("Выберите файл");
          return;
        }
        const prep = await createMaterialUpload(matForm.file.name);
        if (!prep.success || !prep.path || !prep.token) {
          alert(prep.error || "Не удалось подготовить загрузку");
          return;
        }
        const up = await supabase.storage
          .from("media")
          .uploadToSignedUrl(prep.path, prep.token, matForm.file, {
            contentType: matForm.file.type || "application/octet-stream",
          });
        if (up.error) {
          alert("Ошибка загрузки файла: " + up.error.message);
          return;
        }
        const res = await saveMaterial(
          matForm.title,
          matForm.kind,
          prep.path,
          matForm.description
        );
        if (!res.success) {
          alert(res.error || "Ошибка");
          return;
        }
      }
      setMatForm({
        title: "",
        kind: "video",
        file: null,
        url: "",
        description: "",
      });
      await loadMaterials();
    } catch (err) {
      alert("Ошибка: " + (err instanceof Error ? err.message : "неизвестная"));
    } finally {
      setIsUploadingMat(false);
    }
  }

  async function handleDeleteMaterial(id: string, title: string) {
    if (!confirm(`Удалить материал «${title}» из библиотеки?`)) return;
    const res = await deleteMaterial(id);
    if (res.success) await loadMaterials();
    else alert(res.error || "Ошибка");
  }
  async function loadClients() {
    const res = await listClients();
    if (res.success) setClients(res.data as Client[]);
  }
  async function loadAccesses() {
    const res = await listAccess();
    if (res.success) setAccesses(res.data as AccessRow[]);
  }

  async function handleExtend(id: string) {
    const days = Number(extendDays[id] || "30");
    const res = await extendAccess(id, days);
    if (res.success) {
      await loadAccesses();
    } else {
      alert(res.error || "Ошибка");
    }
  }
  async function handleRevoke(id: string, email: string) {
    if (!confirm(`Отменить доступ для ${email}?`)) return;
    const res = await revokeAccess(id);
    if (res.success) await loadAccesses();
    else alert(res.error || "Ошибка");
  }
  async function handleDeleteClient(email: string) {
    if (
      !confirm(
        `Удалить клиента ${email}? Будут удалены: его доступы, анкеты и аккаунт. Необратимо.`
      )
    )
      return;
    const res = await deleteClient(email);
    if (res.success) {
      await Promise.all([
        loadClients(),
        loadAccesses(),
        loadQuestionnaires(),
      ]);
    } else {
      alert(res.error || "Ошибка");
    }
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
    } catch (err) {
      alert(
        "Не удалось выдать доступ: " +
          (err instanceof Error ? err.message : "ошибка сессии, войдите в админку заново")
      );
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
    } catch (err) {
      alert(
        "Ошибка: " +
          (err instanceof Error ? err.message : "войдите в админку заново")
      );
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
          <TabsList className="grid w-full grid-cols-6 bg-white border-2 border-[#302012]">
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
            <TabsTrigger value="materials" className="text-[#302012]">
              Материалы
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
                  Логин и пароль клиента
                </p>
                <p className="text-sm text-[#302012]/60">
                  Создай клиенту доступ по паролю и отправь ему email +
                  пароль. С ними он может заходить в кабинет когда угодно.
                  Пароль можно оставить пустым — сгенерируется
                  автоматически. Повторный запуск меняет пароль.
                </p>
              </div>
              <form
                onSubmit={handleSetCredentials}
                className="flex flex-col sm:flex-row gap-4 sm:items-end"
              >
                <div className="flex-1 space-y-2">
                  <Label className="text-[#302012]">Имя клиента</Label>
                  <Input
                    type="text"
                    value={credName}
                    onChange={(e) => setCredName(e.target.value)}
                    className={inputCls}
                    placeholder="Имя"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-[#302012]">Email клиента *</Label>
                  <Input
                    type="email"
                    required
                    value={credEmail}
                    onChange={(e) => setCredEmail(e.target.value)}
                    className={inputCls}
                    placeholder="client@example.com"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-[#302012]">
                    Пароль (необязательно)
                  </Label>
                  <Input
                    type="text"
                    value={credPass}
                    onChange={(e) => setCredPass(e.target.value)}
                    className={inputCls}
                    placeholder="оставь пустым для авто"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isMakingCred}
                  className="bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/90"
                >
                  {isMakingCred ? "..." : "Создать доступ"}
                </Button>
              </form>
              {credResult && (
                <div className="space-y-2 border border-[#302012] rounded p-3 bg-[#F5F3ED]">
                  <p className="text-sm text-[#302012]">
                    Передай клиенту (вход на{" "}
                    <b>{`${"https://www.capsulaisrael.com/login"}`}</b>):
                  </p>
                  <p className="text-[#302012]">
                    <b>Email:</b> {credResult.email}
                  </p>
                  <p className="text-[#302012]">
                    <b>Пароль:</b> {credResult.password}
                  </p>
                  <Button
                    type="button"
                    onClick={() =>
                      navigator.clipboard?.writeText(
                        `Вход в кабинет: https://www.capsulaisrael.com/login\nEmail: ${credResult.email}\nПароль: ${credResult.password}`
                      )
                    }
                    className="bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/90"
                  >
                    Скопировать для отправки
                  </Button>
                </div>
              )}
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
                      <th className="px-6 py-4 text-left"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((c) => (
                      <React.Fragment key={c.id}>
                        <tr className="border-b border-[#302012]/20">
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenClient(
                                  openClient === c.email ? null : c.email
                                )
                              }
                              className="text-sm underline text-[#302012] hover:opacity-70 mr-4"
                            >
                              {openClient === c.email
                                ? "Скрыть карточку"
                                : "Открыть карточку"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteClient(c.email)}
                              className="text-sm underline text-red-700 hover:opacity-70"
                            >
                              Удалить
                            </button>
                          </td>
                        </tr>
                        {openClient === c.email && (
                          <tr>
                            <td colSpan={5} className="p-0">
                              <ClientCard email={c.email} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
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

            <div className="bg-white border-2 border-[#302012] rounded-lg overflow-hidden mt-6">
              <div className="px-6 py-3 bg-[#302012] text-[#F5F3ED]">
                Выданные доступы ({accesses.length})
              </div>
              {accesses.length === 0 ? (
                <div className="p-6 text-center text-[#302012]/70">
                  Доступы не выданы
                </div>
              ) : (
                <ul className="divide-y divide-[#302012]/15">
                  {accesses.map((a) => {
                    const exp = new Date(a.expires_at);
                    const active = exp.getTime() > Date.now();
                    return (
                      <li
                        key={a.id}
                        className="px-6 py-4 flex flex-col md:flex-row md:items-center gap-3 md:justify-between"
                      >
                        <div className="text-[#302012]">
                          <p className="font-medium">{a.user_email}</p>
                          <p className="text-sm text-[#302012]/60">
                            {a.meditation} · до{" "}
                            {exp.toLocaleDateString("ru-RU")}{" "}
                            {active ? (
                              <span className="text-green-700">
                                (активен)
                              </span>
                            ) : (
                              <span className="text-red-700">
                                (истёк)
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min={1}
                            value={extendDays[a.id] ?? "30"}
                            onChange={(e) =>
                              setExtendDays((p) => ({
                                ...p,
                                [a.id]: e.target.value,
                              }))
                            }
                            className={`${inputCls} w-20`}
                          />
                          <button
                            type="button"
                            onClick={() => handleExtend(a.id)}
                            className="text-sm underline text-[#302012] hover:opacity-70"
                          >
                            Продлить (дней)
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleRevoke(a.id, a.user_email)
                            }
                            className="text-sm underline text-red-700 hover:opacity-70"
                          >
                            Отменить
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
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
                    <li key={m.id} className="px-6 py-4 text-[#302012]">
                      {editId === m.id ? (
                        <div className="space-y-3">
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className={inputCls}
                            placeholder="Название"
                          />
                          <Textarea
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className={`${inputCls} min-h-[70px]`}
                            placeholder="Описание"
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              onClick={saveEdit}
                              className="bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/90"
                            >
                              Сохранить
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setEditId(null)}
                              className="bg-transparent border border-[#302012] text-[#302012] hover:bg-[#302012]/10"
                            >
                              Отмена
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium">{m.title}</p>
                            {m.description && (
                              <p className="text-sm text-[#302012]/60">
                                {m.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => startEdit(m)}
                              className="text-sm underline text-[#302012] hover:opacity-70"
                            >
                              Изменить
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                removeMeditation(m.id, m.title)
                              }
                              className="text-sm underline text-red-700 hover:opacity-70"
                            >
                              Удалить
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>

          {/* Материалы (библиотека) */}
          <TabsContent value="materials" className="mt-6">
            <div className="bg-white border-2 border-[#302012] p-8 rounded-lg">
              <p className="text-sm text-[#302012]/60 mb-4">
                Загрузите материал один раз — потом выдавайте его клиентам
                галочками в карточке клиента (вкладка «Клиенты»).
              </p>
              <form onSubmit={handleSaveMaterial} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[#302012]">Название *</Label>
                  <Input
                    type="text"
                    required
                    value={matForm.title}
                    onChange={(e) =>
                      setMatForm({ ...matForm, title: e.target.value })
                    }
                    className={inputCls}
                    placeholder="Например: Дыхательная практика"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#302012]">Короткое описание</Label>
                  <Textarea
                    value={matForm.description}
                    onChange={(e) =>
                      setMatForm({ ...matForm, description: e.target.value })
                    }
                    className={`${inputCls} min-h-[70px]`}
                    placeholder="Пара строк — о чём видео (видно клиенту в видеотеке)"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#302012]">Тип</Label>
                  <select
                    value={matForm.kind}
                    onChange={(e) =>
                      setMatForm({ ...matForm, kind: e.target.value })
                    }
                    className="w-full bg-white border border-[#302012] text-[#302012] rounded px-3 py-2 text-base"
                  >
                    <option value="video">Видео</option>
                    <option value="pdf">PDF</option>
                    <option value="document">Документ</option>
                    <option value="link">Ссылка</option>
                  </select>
                </div>
                {matForm.kind === "link" ? (
                  <div className="space-y-2">
                    <Label className="text-[#302012]">Ссылка *</Label>
                    <Input
                      type="url"
                      value={matForm.url}
                      onChange={(e) =>
                        setMatForm({ ...matForm, url: e.target.value })
                      }
                      className={inputCls}
                      placeholder="https://…"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-[#302012]">Файл *</Label>
                    <Input
                      type="file"
                      onChange={(e) =>
                        setMatForm({
                          ...matForm,
                          file: e.target.files?.[0] || null,
                        })
                      }
                      className={inputCls}
                    />
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={isUploadingMat}
                  className={btnCls}
                >
                  {isUploadingMat ? "Сохранение…" : "Добавить в библиотеку"}
                </Button>
              </form>
            </div>

            <div className="bg-white border-2 border-[#302012] rounded-lg overflow-hidden mt-6">
              <div className="px-6 py-3 bg-[#302012] text-[#F5F3ED]">
                Библиотека материалов ({materials.length})
              </div>
              {materials.length === 0 ? (
                <div className="p-6 text-center text-[#302012]/70">
                  Пока пусто
                </div>
              ) : (
                <ul className="divide-y divide-[#302012]/15">
                  {materials.map((m) => (
                    <li key={m.id} className="px-6 py-4 text-[#302012]">
                      {editMatId === m.id ? (
                        <div className="space-y-3">
                          <Input
                            value={editMat.title}
                            onChange={(e) =>
                              setEditMat({ ...editMat, title: e.target.value })
                            }
                            className={inputCls}
                            placeholder="Название"
                          />
                          <Textarea
                            value={editMat.description}
                            onChange={(e) =>
                              setEditMat({
                                ...editMat,
                                description: e.target.value,
                              })
                            }
                            className={`${inputCls} min-h-[70px]`}
                            placeholder="Короткое описание"
                          />
                          {editMat.kind === "link" ? (
                            <Input
                              type="url"
                              value={editMat.url}
                              onChange={(e) =>
                                setEditMat({ ...editMat, url: e.target.value })
                              }
                              className={inputCls}
                              placeholder="Ссылка"
                            />
                          ) : (
                            <div>
                              <p className="text-xs text-[#302012]/50 mb-1">
                                Заменить файл (по желанию):
                              </p>
                              <Input
                                type="file"
                                onChange={(e) =>
                                  setEditMat({
                                    ...editMat,
                                    file: e.target.files?.[0] || null,
                                  })
                                }
                                className={inputCls}
                              />
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              onClick={() => saveEditMat(m.id)}
                              disabled={isUploadingMat}
                              className="bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/90"
                            >
                              {isUploadingMat ? "Сохранение…" : "Сохранить"}
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setEditMatId(null)}
                              className="bg-transparent border border-[#302012] text-[#302012] hover:bg-[#302012]/10"
                            >
                              Отмена
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="text-sm text-[#302012]/60">
                              {({
                                video: "Видео",
                                pdf: "PDF",
                                document: "Документ",
                                link: "Ссылка",
                              } as Record<string, string>)[m.kind] || m.kind}
                            </span>
                            <p className="font-medium">{m.title}</p>
                            {m.description && (
                              <p className="text-sm text-[#302012]/60">
                                {m.description}
                              </p>
                            )}
                            {m.url && (
                              <a
                                href={m.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-[#302012]/70 underline break-all"
                              >
                                {m.url}
                              </a>
                            )}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => startEditMat(m)}
                              className="text-sm underline text-[#302012] hover:opacity-70"
                            >
                              Изменить
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMaterial(m.id, m.title)}
                              className="text-sm underline text-red-700 hover:opacity-70"
                            >
                              Удалить
                            </button>
                          </div>
                        </div>
                      )}
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
