import Link from "next/link";
import { SiteLogo } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/icons";

export default function OrgSecurityPage() {
  return (
    <div
      className="relative flex min-h-screen items-center overflow-hidden bg-[#0F2A4A] text-white"
      style={{
        backgroundImage:
          "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.08), transparent 40%), radial-gradient(circle at 85% 75%, rgba(255,255,255,0.06), transparent 45%)",
      }}
    >
      <div className="relative z-10 mx-auto max-w-xl px-8 py-16">
        <SiteLogo className="mb-8 h-8 [&_text]:fill-white [&_path]:fill-white" />
        <h1 className="mb-4 text-4xl font-bold">找不到頁面</h1>
        <p className="mb-2 text-white/80">您要尋找的頁面已被刪除或 URL 不正確。</p>
        <p className="text-white/80">
          返回{" "}
          <Link href="/" className="underline hover:text-white">
            首頁
          </Link>
        </p>
      </div>
    </div>
  );
}
