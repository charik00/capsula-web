"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError("Неверный email или пароль");
      setIsLoading(false);
      return;
    }
    window.location.href = "/dashboard";
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
            Введите email и пароль, которые вам выдали
          </p>
        </div>

        <div className="bg-white border-2 border-[#302012] p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#302012]">
                Email
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

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#302012]">
                Пароль
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border-[#302012] text-[#302012] focus:border-[#302012]"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-4 rounded border bg-red-50 border-red-200 text-red-800">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#302012] text-[#F5F3ED] hover:bg-[#302012]/90"
            >
              {isLoading ? "Вход..." : "Войти"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
