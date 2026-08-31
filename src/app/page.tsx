import Link from "next/link";
import { DashboardShell } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/DashboardShell";

export default function HomePage() {
  return (
    <DashboardShell activeKey="home" breadcrumb={["首頁"]}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <section className="rounded-xl border border-tebiki-border bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#2B2C2F]">新手冊</h2>
            <Link href="/manuals" className="text-sm text-tebiki-blue hover:underline">
              顯示更多 ›
            </Link>
          </div>
        </section>

        <section className="rounded-xl border border-tebiki-border bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#2B2C2F]">我的任務</h2>
            <Link href="/tasks" className="text-sm text-tebiki-blue hover:underline">
              顯示更多 ›
            </Link>
          </div>
          <p className="mt-4 text-sm text-[#8B93A1]">
            尚未創建任何任務。{" "}
            <a href="https://help.tebiki.jp" target="_blank" rel="noreferrer" className="text-tebiki-blue hover:underline">
              （幫助）
            </a>
          </p>
        </section>
      </div>

      <footer className="mt-10 flex gap-4 text-xs text-[#B0B6C0]">
        <span>©Tebiki, Inc.</span>
        <Link href="/terms" className="hover:underline">
          條款
        </Link>
        <Link href="/privacy_policy" className="hover:underline">
          隱私
        </Link>
        <a href="https://tebiki.co.jp" target="_blank" rel="noreferrer" className="hover:underline">
          關於
        </a>
      </footer>
    </DashboardShell>
  );
}
