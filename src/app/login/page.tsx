"use client";

import { useState } from "react";
import { TebikiLogo } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/icons";
import { mockOrg } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/mock-data";
import { EyeIcon, EyeOffIcon } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/icons";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col items-center justify-center px-8 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex justify-center">
            <TebikiLogo className="h-9" />
          </div>

          <p className="mb-6 text-center text-sm text-[#5B6270]">{mockOrg.name} 的專屬登入頁面</p>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="login-id" className="mb-1 block text-sm font-bold text-[#2B2C2F]">
                登入 ID
              </label>
              <input
                id="login-id"
                type="text"
                placeholder="輸入您的電子郵件地址或 ID"
                className="w-full rounded-lg border border-tebiki-border px-3 py-2.5 text-sm placeholder:text-[#B0B6C0] focus:outline-none focus:ring-2 focus:ring-tebiki-blue/40"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="mb-1 block text-sm font-bold text-[#2B2C2F]">
                密碼
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="w-full rounded-lg border border-tebiki-border px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-tebiki-blue/40"
                />
                <button
                  type="button"
                  aria-label="顯示密碼"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B93A1]"
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-tebiki-blue py-2.5 text-sm font-bold text-white hover:bg-tebiki-blue-dark"
            >
              登入
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-tebiki-blue hover:underline">
            <a href="#">如果您忘記ID或密碼/無法登入</a>
          </p>
        </div>
      </div>

      <div className="relative hidden items-end overflow-hidden bg-gradient-to-br from-[#0F2A4A] via-[#173A5E] to-[#1A8CFF] md:flex">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <p className="relative z-10 p-10 text-2xl font-bold text-white">利用簡單的視訊手冊改變工作場所培訓</p>
      </div>
    </div>
  );
}
