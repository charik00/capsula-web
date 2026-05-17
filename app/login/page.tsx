"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });

      if (error) {
        console.error("Login error:", error);
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({
          type: "success",
          text: "Проверьте вашу почту! Мы отправили вам ссылку для входа.",
        });
      }
    } catch (err) {
      console.error("Login exception:", err);
      setMessage({ type: "error", text: "Произошла ошибка. Попробуйте позже." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3ED] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <Image
              src="/logo2.svg"
              alt="CAPSULA"
              width={400}
              height={160}
              className="h-32 w-auto"
            />
          </div>
          <h1 className="text-3xl font-light text-[#302012] mb-2">
            Вход в личный кабинет
          </h1>
          <p className="text-[#302012]/70">
            Введите email для получения ссылки входа
          </p>
        </div>

        <div className="bg-white border-2 border-[#302012] p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#302012]">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-[#302012] text-[#302012] focus:border-[#302012]"
                placeholder="your@email.com"
                disabled={isLoading}
              />
            </div>

            {message && (
              <div
                className={`p-4 rounded border ${
                  message.type === "success"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-red-50 border-red-200 text-red-800"
                }`}
              >
                {message.text}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/90"
            >
              {isLoading ? "Отправка..." : "Отправить ссылку для входа"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
