"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "./icons";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
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
  );
}
