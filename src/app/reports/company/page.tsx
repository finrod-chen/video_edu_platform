import { DashboardShell } from "@/components/sites/training-platform/shared/DashboardShell";
import { mockOrg } from "@/components/sites/training-platform/shared/mock-data";
import { VisitorChart } from "@/components/sites/training-platform/root-8a5edab2/VisitorChart";
import { TrainingProgressSearch } from "@/components/sites/training-platform/shared/TrainingProgressSearch";
import { getOrg } from "@/lib/queries/org";
import {
  getAcknowledgmentStats,
  getAssignmentStats,
  getQuizStats,
  getReportSummary,
  getVisitorSeries,
} from "@/lib/queries/reports";
import { CURRENT_ORG_ID, requireEditor } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

const PERIOD_OPTIONS = [
  { value: "7", label: "近 7 天" },
  { value: "30", label: "近 30 天" },
  { value: "90", label: "近 90 天" },
  { value: "month", label: "本月" },
] as const;

function resolveDays(period: string | undefined): number {
  if (period === "month") return new Date().getDate();
  const n = Number(period);
  return PERIOD_OPTIONS.some((p) => p.value === period) && Number.isFinite(n) ? n : 30;
}

export default async function CompanyReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  await requireEditor();
  const { period } = await searchParams;
  const days = resolveDays(period);
  const periodValue = period && PERIOD_OPTIONS.some((p) => p.value === period) ? period : "30";

  const [org, summary, series, ackStats, quizStats, assignmentStats] = await Promise.all([
    getOrg(CURRENT_ORG_ID),
    getReportSummary(CURRENT_ORG_ID),
    getVisitorSeries(CURRENT_ORG_ID, days),
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
    <DashboardShell activeKey="orgReports" breadcrumb={["首頁", "進度追蹤"]}>
      <h1 className="mb-6 text-xl font-bold text-[#2B2C2F]">進度追蹤</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <section className="rounded-xl border border-app-border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-[#2B2C2F]">獨立訪客和觀看時間</h2>
              <form method="get" className="flex items-center gap-2">
                <select
                  name="period"
                  defaultValue={periodValue}
                  className="rounded-lg border border-app-border px-3 py-1.5 text-sm"
                >
                  {PERIOD_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded-lg border border-app-border px-3 py-1.5 text-sm text-[#5B6270] hover:bg-app-bg"
                >
                  套用
                </button>
              </form>
            </div>
            <div className="flex justify-between text-xs text-[#8B93A1]">
              <span>獨立訪客</span>
              <span>觀看時間</span>
            </div>
            <VisitorChart series={series} />
          </section>

          <section className="rounded-xl border border-app-border bg-white p-6">
            <h2 className="mb-1 text-base font-bold text-[#2B2C2F]">搜尋訓練進度</h2>
            <p className="mb-4 text-sm text-[#8B93A1]">搜尋課程或手冊來查看進度。</p>
            <TrainingProgressSearch />
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
