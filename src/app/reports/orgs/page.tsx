import { DashboardShell } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/DashboardShell";
import { mockOrg } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/mock-data";
import { SearchIcon } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/icons";
import { VisitorChart } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/root-8a5edab2/VisitorChart";

const stats = [
  { label: "手動觀看時間", value: "0", suffix: "h" },
  { label: "課程", value: "0" },
  { label: "手冊", value: "0" },
  { label: "使用者", value: "1" },
];

const rankings = [
  { title: "用戶訪問排名", href: "/reports/orgs/user_accesses" },
  { title: "手動訪問排名", href: "/reports/orgs/manual_accesses" },
  { title: "課程訪問排名", href: "/reports/orgs/course_accesses" },
];

export default function OrgReportsPage() {
  return (
    <DashboardShell activeKey="orgReports" breadcrumb={["首頁", "組織報告"]}>
      <h1 className="mb-6 flex items-center gap-2 text-xl font-bold text-[#2B2C2F]">
        組織報告
        <a href="https://help.tebiki.jp" target="_blank" rel="noreferrer" className="text-sm font-normal text-tebiki-blue hover:underline">
          （幫助）
        </a>
      </h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <section className="rounded-xl border border-tebiki-border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-[#2B2C2F]">獨立訪客和觀看時間</h2>
              <span className="text-xs text-[#8B93A1]">週期：2026/8/1 - 2026/8/30</span>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <select className="rounded-lg border border-tebiki-border px-3 py-1.5 text-sm">
                <option>所有人</option>
              </select>
              <select className="rounded-lg border border-tebiki-border px-3 py-1.5 text-sm">
                <option>本月</option>
              </select>
            </div>
            <div className="flex justify-between text-xs text-[#8B93A1]">
              <span>獨立訪客</span>
              <span>觀看時間</span>
            </div>
            <VisitorChart />
          </section>

          <section className="rounded-xl border border-tebiki-border bg-white p-6">
            <h2 className="mb-1 text-base font-bold text-[#2B2C2F]">搜尋學習進度</h2>
            <p className="mb-4 text-sm text-[#8B93A1]">搜尋課程或相關資料夾來管理進度。</p>
            <label className="relative flex items-center">
              <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-[#8B93A1]" />
              <input
                type="search"
                placeholder="輸入相關資料夾名稱或課程標題"
                className="w-full rounded-lg border border-tebiki-border py-2 pl-9 pr-24 text-sm placeholder:text-[#B0B6C0] focus:outline-none focus:ring-2 focus:ring-tebiki-blue/40"
              />
              <button className="absolute right-2 rounded-md bg-tebiki-bg px-3 py-1 text-xs font-medium text-[#5B6270]">進階搜尋</button>
            </label>
            <p className="mt-6 mb-2 text-sm font-medium text-[#2B2C2F]">搜尋紀錄</p>
            <div className="flex justify-between border-t border-tebiki-border pt-3 text-xs text-[#8B93A1]">
              <span>資料夾/課程</span>
              <span>使用者/使用者群組</span>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-tebiki-border bg-white p-6">
            <p className="mb-1 text-sm font-bold text-[#2B2C2F]">{mockOrg.name}</p>
            <p className="mb-4 text-xs text-[#8B93A1]">週期：所有時間</p>
            <div className="grid grid-cols-2 gap-y-4 text-center">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-emerald-500">
                    {s.value}
                    {s.suffix && <span className="text-sm">{s.suffix}</span>}
                  </p>
                  <p className="text-xs text-[#8B93A1]">{s.label}</p>
                </div>
              ))}
            </div>
          </section>

          {rankings.map((r) => (
            <section key={r.title} className="rounded-xl border border-tebiki-border bg-white p-6">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#2B2C2F]">{r.title}</h3>
              </div>
              <p className="mb-3 text-xs text-[#8B93A1]">期限：2026.08.01 - 2026.08.30</p>
              <a href={r.href} className="text-sm text-tebiki-blue hover:underline">
                顯示更多 ›
              </a>
            </section>
          ))}
        </aside>
      </div>
    </DashboardShell>
  );
}
