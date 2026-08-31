import Link from "next/link";
import { DashboardShell } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/DashboardShell";
import { getManuals } from "@/lib/queries/manuals";
import { getTasks } from "@/lib/queries/tasks";
import { CURRENT_ORG_ID, CURRENT_USER_ID } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [manuals, tasks] = await Promise.all([
    getManuals(CURRENT_ORG_ID, "published"),
    getTasks(CURRENT_USER_ID),
  ]);
  const recentManuals = manuals.slice(0, 5);
  const openTasks = tasks.filter((t) => !t.done);

  return (
    <DashboardShell activeKey="home" breadcrumb={["首頁"]}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <section className="rounded-xl border border-tebiki-border bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#2B2C2F]">新手冊</h2>
            <Link href="/manuals" className="text-sm text-brand hover:underline">
              顯示更多 ›
            </Link>
          </div>
          {recentManuals.length === 0 ? (
            <p className="mt-4 text-sm text-[#8B93A1]">沒有數據</p>
          ) : (
            <ul className="mt-4 divide-y divide-tebiki-border">
              {recentManuals.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-2.5 text-sm">
                  <Link href="/manuals" className="text-[#2B2C2F] hover:text-brand">
                    {m.title}
                  </Link>
                  <span className="text-xs text-[#8B93A1]">{m.updatedBy}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-tebiki-border bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#2B2C2F]">我的任務</h2>
            <Link href="/tasks" className="text-sm text-brand hover:underline">
              顯示更多 ›
            </Link>
          </div>
          {openTasks.length === 0 ? (
            <p className="mt-4 text-sm text-[#8B93A1]">
              尚未創建任何任務。{" "}
              <a href="#" target="_blank" rel="noreferrer" className="text-brand hover:underline">
                （幫助）
              </a>
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {openTasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between text-sm">
                  <span className="text-[#2B2C2F]">{t.title}</span>
                  {t.dueDate && <span className="text-xs text-[#8B93A1]">{t.dueDate}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <footer className="mt-10 flex gap-4 text-xs text-[#B0B6C0]">
        <span>©喜躍生醫股份有限公司</span>
        <Link href="/terms" className="hover:underline">
          條款
        </Link>
        <Link href="/privacy_policy" className="hover:underline">
          隱私
        </Link>
        <a href="#" target="_blank" rel="noreferrer" className="hover:underline">
          關於
        </a>
      </footer>
    </DashboardShell>
  );
}
