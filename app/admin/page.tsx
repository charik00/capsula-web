"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
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

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGrantingAccess, setIsGrantingAccess] = useState(false);

  // Форма загрузки медитации
  const [meditationForm, setMeditationForm] = useState({
    title: "",
    description: "",
    audioFile: null as File | null,
  });

  // Форма выдачи доступа
  const [accessForm, setAccessForm] = useState({
    userEmail: "",
    meditationId: "",
  });

  // Проверка доступа
  useEffect(() => {
    async function checkAccess() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || user.email !== "morozovaalyonas@gmail.com") {
          router.push("/");
          return;
        }

        setIsLoading(false);
        await loadLeads();
        await loadMeditations();
      } catch (error) {
        console.error("Access check error:", error);
        router.push("/");
      }
    }

    checkAccess();
  }, [router]);

  // Загрузка заявок
  async function loadLeads() {
    setIsLoadingLeads(true);
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading leads:", error);
      } else {
        setLeads(data || []);
      }
    } catch (error) {
      console.error("Load leads exception:", error);
    } finally {
      setIsLoadingLeads(false);
    }
  }

  // Загрузка медитаций
  async function loadMeditations() {
    try {
      const { data, error } = await supabase
        .from("meditations")
        .select("id, title, description")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading meditations:", error);
      } else {
        setMeditations(data || []);
      }
    } catch (error) {
      console.error("Load meditations exception:", error);
    }
  }

  // Загрузка медитации
  async function handleUploadMeditation(e: React.FormEvent) {
    e.preventDefault();
    if (!meditationForm.title || !meditationForm.audioFile) {
      alert("Заполните все обязательные поля");
      return;
    }

    setIsUploading(true);
    try {
      // Загружаем файл в Storage
      const fileExt = meditationForm.audioFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `audio/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("audio")
        .upload(filePath, meditationForm.audioFile);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        alert("Ошибка при загрузке файла: " + uploadError.message);
        setIsUploading(false);
        return;
      }

      // Получаем публичную ссылку
      const { data: urlData } = supabase.storage.from("audio").getPublicUrl(filePath);
      const audioUrl = urlData.publicUrl;

      // Создаем запись в таблице meditations
      const { error: insertError } = await supabase.from("meditations").insert([
        {
          title: meditationForm.title,
          description: meditationForm.description || null,
          audio_url: audioUrl,
        },
      ]);

      if (insertError) {
        console.error("Insert error:", insertError);
        alert("Ошибка при создании записи: " + insertError.message);
      } else {
        alert("Медитация загружена!");
        setMeditationForm({ title: "", description: "", audioFile: null });
        await loadMeditations();
      }
    } catch (error) {
      console.error("Upload exception:", error);
      alert("Произошла ошибка при загрузке");
    } finally {
      setIsUploading(false);
    }
  }

  // Выдача доступа
  async function handleGrantAccess(e: React.FormEvent) {
    e.preventDefault();
    if (!accessForm.userEmail || !accessForm.meditationId) {
      alert("Заполните все поля");
      return;
    }

    setIsGrantingAccess(true);
    try {
      // Устанавливаем срок действия на 1 год от текущей даты
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      const { error } = await supabase.from("user_access").insert([
        {
          user_email: accessForm.userEmail,
          meditation_id: accessForm.meditationId,
          expires_at: expiresAt.toISOString(),
        },
      ]);

      if (error) {
        console.error("Grant access error:", error);
        alert("Ошибка при выдаче доступа: " + error.message);
      } else {
        alert("Доступ выдан!");
        setAccessForm({ userEmail: "", meditationId: "" });
      }
    } catch (error) {
      console.error("Grant access exception:", error);
      alert("Произошла ошибка");
    } finally {
      setIsGrantingAccess(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F3ED] flex items-center justify-center">
        <p className="text-[#302012]">Проверка доступа...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3ED] py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-light text-[#302012] mb-8">Панель управления</h1>

        <Tabs defaultValue="leads" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white border-2 border-[#302012]">
            <TabsTrigger value="leads" className="text-[#302012]">
              Заявки
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-[#302012]">
              Добавить Медитацию
            </TabsTrigger>
            <TabsTrigger value="access" className="text-[#302012]">
              Управление доступами
            </TabsTrigger>
          </TabsList>

          {/* Вкладка 1: Заявки */}
          <TabsContent value="leads" className="mt-6">
            <div className="bg-white border-2 border-[#302012] rounded-lg overflow-hidden">
              {isLoadingLeads ? (
                <div className="p-8 text-center text-[#302012]/70">Загрузка...</div>
              ) : leads.length === 0 ? (
                <div className="p-8 text-center text-[#302012]/70">Нет заявок</div>
              ) : (
                <div className="overflow-x-auto">
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
                          className="border-b border-[#302012]/20 hover:bg-[#F5F3ED]/50"
                        >
                          <td className="px-6 py-4 text-[#302012]">{lead.first_name}</td>
                          <td className="px-6 py-4 text-[#302012]">{lead.last_name}</td>
                          <td className="px-6 py-4 text-[#302012]">{lead.phone}</td>
                          <td className="px-6 py-4 text-[#302012]/70">
                            {formatDate(lead.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Вкладка 2: Добавить Медитацию */}
          <TabsContent value="upload" className="mt-6">
            <div className="bg-white border-2 border-[#302012] p-8 rounded-lg">
              <form onSubmit={handleUploadMeditation} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-[#302012]">
                    Название *
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    required
                    value={meditationForm.title}
                    onChange={(e) =>
                      setMeditationForm({ ...meditationForm, title: e.target.value })
                    }
                    className="bg-white border-[#302012] text-[#302012]"
                    placeholder="Название медитации"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[#302012]">
                    Описание
                  </Label>
                  <Textarea
                    id="description"
                    value={meditationForm.description}
                    onChange={(e) =>
                      setMeditationForm({ ...meditationForm, description: e.target.value })
                    }
                    className="bg-white border-[#302012] text-[#302012] min-h-[100px]"
                    placeholder="Описание медитации"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="audioFile" className="text-[#302012]">
                    Файл аудио *
                  </Label>
                  <Input
                    id="audioFile"
                    type="file"
                    required
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setMeditationForm({ ...meditationForm, audioFile: file });
                    }}
                    className="bg-white border-[#302012] text-[#302012]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isUploading}
                  className="w-full bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/90"
                >
                  {isUploading ? "Загрузка..." : "Загрузить медитацию"}
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* Вкладка 3: Управление доступами */}
          <TabsContent value="access" className="mt-6">
            <div className="bg-white border-2 border-[#302012] p-8 rounded-lg">
              <form onSubmit={handleGrantAccess} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="userEmail" className="text-[#302012]">
                    Email клиента *
                  </Label>
                  <Input
                    id="userEmail"
                    type="email"
                    required
                    value={accessForm.userEmail}
                    onChange={(e) =>
                      setAccessForm({ ...accessForm, userEmail: e.target.value })
                    }
                    className="bg-white border-[#302012] text-[#302012]"
                    placeholder="client@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meditationId" className="text-[#302012]">
                    Выбор медитации *
                  </Label>
                  <Select
                    value={accessForm.meditationId}
                    onValueChange={(value) =>
                      setAccessForm({ ...accessForm, meditationId: value })
                    }
                  >
                    <SelectTrigger className="bg-white border-[#302012] text-[#302012]">
                      <SelectValue placeholder="Выберите медитацию" />
                    </SelectTrigger>
                    <SelectContent>
                      {meditations.map((meditation) => (
                        <SelectItem key={meditation.id} value={meditation.id}>
                          {meditation.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={isGrantingAccess}
                  className="w-full bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/90"
                >
                  {isGrantingAccess ? "Выдача доступа..." : "Открыть доступ"}
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
