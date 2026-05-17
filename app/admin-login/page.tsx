"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

export default function AdminLoginPage() {
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
    window.location.href = "/admin";
  };

  return (
    <div className="min-h-screen bg-[#F5F3ED] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-light text-[#302012] mb-6 text-center">
          Вход для администратора
        </h1>
        <div className="bg-white border-2 border-[#302012] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[#302012]">Email</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-[#302012] text-[#302012]"
                placeholder="info@capsulaisrael.com"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#302012]">Пароль</Label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border-[#302012] text-[#302012]"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="p-3 rounded border bg-red-50 border-red-200 text-red-800 text-sm">
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
