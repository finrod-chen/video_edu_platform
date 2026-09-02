import { DashboardShell } from "@/components/sites/training-platform/shared/DashboardShell";
import { mockOrg } from "@/components/sites/training-platform/shared/mock-data";
import { SearchIcon } from "@/components/sites/training-platform/shared/icons";
import { VisitorChart } from "@/components/sites/training-platform/root-8a5edab2/VisitorChart";
import { getOrg } from "@/lib/queries/org";
import {
  getAcknowledgmentStats,
  getAssignmentStats,
  getQuizStats,
  getReportSummary,
  getUserAccessRanking,
  getVisitorSeries,
} from "@/lib/queries/reports";
import { CURRENT_ORG_ID, requireEditor } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function CompanyReportsPage() {
  await requireEditor();
  const [org, summary, series, userRanking, ackStats, quizStats, assignmentStats] = await Promise.all([
    getOrg(CURRENT_ORG_ID),
    getReportSummary(CURRENT_ORG_ID),
    getVisitorSeries(CURRENT_ORG_ID, 30),
    getUserAccessRanking(CURRENT_ORG_ID),
    getAcknowledgmentStats(CURRENT_ORG_ID),
    getQuizStats(CURRENT_ORG_ID),
    getAssignmentStats(CURRENT_ORG_ID),
  ]);

  const stats = [
    { label: "手動觀看時間", value: String(summary.manualWatchHours), suffix: "h" },
    { label: "課程", value: String(summary.courseCount) },
    { label: "手冊", value: String(summary.manualCount) },
    { label: "使用者", value: String(summary.userCount) },
    { label: "已瞭解率", value: String(ackStats.rate), suffix: "%" },
  ];

  return (
    <DashboardShell activeKey="orgReports" breadcrumb={["首頁", "公司報告"]}>
      <h1 className="mb-6 flex items-center gap-2 text-xl font-bold text-[#2B2C2F]">
        公司報告
        <a href="#" target="_blank" rel="noreferrer" className="text-sm font-normal text-brand hover:underline">
          （幫助）
        </a>
      </h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <section className="rounded-xl border border-app-border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-[#2B2C2F]">獨立訪客和觀看時間</h2>
            </div>
            <div className="mb-4 flex items-center justify-between">
              <select className="rounded-lg border border-app-border px-3 py-1.5 text-sm">
                <option>所有人</option>
              </select>
              <select className="rounded-lg border border-app-border px-3 py-1.5 text-sm">
                <option>本月</option>
              </select>
            </div>
            <div className="flex justify-between text-xs text-[#8B93A1]">
              <span>獨立訪客</span>
              <span>觀看時間</span>
            </div>
            <VisitorChart series={series} />
          </section>

          <section className="rounded-xl border border-app-border bg-white p-6">
            <h2 className="mb-1 text-base font-bold text-[#2B2C2F]">搜尋學習進度</h2>
            <p className="mb-4 text-sm text-[#8B93A1]">搜尋課程或相關資料夾來管理進度。</p>
            <label className="relative flex items-center">
              <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-[#8B93A1]" />
              <input
                type="search"
                placeholder="輸入相關資料夾名稱或課程標題"
                className="w-full rounded-lg border border-app-border py-2 pl-9 pr-24 text-sm placeholder:text-[#B0B6C0] focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
              <button className="absolute right-2 rounded-md bg-app-bg px-3 py-1 text-xs font-medium text-[#5B6270]">進階搜尋</button>
            </label>
            <p className="mt-6 mb-2 text-sm font-medium text-[#2B2C2F]">搜尋紀錄</p>
            <div className="flex justify-between border-t border-app-border pt-3 text-xs text-[#8B93A1]">
              <span>資料夾/課程</span>
              <span>使用者/使用者群組</span>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-app-border bg-white p-6">
            <p className="mb-1 text-sm font-bold text-[#2B2C2F]">{org?.name ?? mockOrg.name}</p>
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

          <section className="rounded-xl border border-app-border bg-white p-6">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#2B2C2F]">用戶訪問排名</h3>
            </div>
            {userRanking.length > 0 ? (
              <ul className="mb-1 space-y-1.5 text-sm">
                {userRanking.map((r) => (
                  <li key={r.id} className="flex items-center justify-between">
                    <span className="text-[#2B2C2F]">{r.label}</span>
                    <span className="text-[#8B93A1]">{r.value}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[#8B93A1]">沒有數據</p>
            )}
          </section>

          <section className="rounded-xl border border-app-border bg-white p-6">
            <h3 className="mb-3 text-sm font-bold text-[#2B2C2F]">測驗通過率</h3>
            {quizStats.attemptCount > 0 ? (
              <div className="grid grid-cols-2 gap-y-3 text-center">
                <div>
                  <p className="text-2xl font-bold text-emerald-500">{quizStats.passRate}%</p>
                  <p className="text-xs text-[#8B93A1]">通過率</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-500">{quizStats.averageScore}</p>
                  <p className="text-xs text-[#8B93A1]">平均分數</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#8B93A1]">沒有數據</p>
            )}
          </section>

          <section className="rounded-xl border border-app-border bg-white p-6">
            <h3 className="mb-3 text-sm font-bold text-[#2B2C2F]">指派完成度</h3>
            {assignmentStats.totalCount > 0 ? (
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-[#2B2C2F]">已完成</span>
                  <span className="text-[#8B93A1]">
                    {assignmentStats.completedCount}/{assignmentStats.totalCount}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-[#2B2C2F]">逾期未完成</span>
                  <span className={assignmentStats.overdueCount > 0 ? "text-red-600" : "text-[#8B93A1]"}>
                    {assignmentStats.overdueCount}
                  </span>
                </li>
              </ul>
            ) : (
              <p className="text-xs text-[#8B93A1]">沒有數據</p>
            )}
          </section>
        </aside>
      </div>
    </DashboardShell>
  );
}
