import Link from "next/link";
import { DashboardShell } from "@/components/sites/training-platform/shared/DashboardShell";
import { getManuals } from "@/lib/queries/manuals";
import { getAssignmentsForUser } from "@/lib/queries/assignments";
import { CURRENT_ORG_ID, getCurrentUserId } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const userId = await getCurrentUserId();
  const [manuals, myAssignments] = await Promise.all([
    getManuals(CURRENT_ORG_ID, "published"),
    getAssignmentsForUser(userId),
  ]);
  const recentManuals = manuals.slice(0, 5);
  const pendingAssignments = myAssignments.filter((a) => !a.completed);

  return (
    <DashboardShell activeKey="home" breadcrumb={["首頁"]}>
      <section className="rounded-xl border border-app-border bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#2B2C2F]">新手冊</h2>
          <Link href="/manuals" className="text-sm text-brand hover:underline">
            顯示更多 ›
          </Link>
        </div>
        {recentManuals.length === 0 ? (
          <p className="mt-4 text-sm text-[#8B93A1]">沒有數據</p>
        ) : (
          <ul className="mt-4 divide-y divide-app-border">
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

      {myAssignments.length > 0 && (
        <section className="mt-4 rounded-xl border border-app-border bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#2B2C2F]">指派給我的手冊／課程</h2>
            <span className="text-xs text-[#8B93A1]">
              待完成 {pendingAssignments.length} / 共 {myAssignments.length}
            </span>
          </div>
          {pendingAssignments.length === 0 ? (
            <p className="mt-4 text-sm text-[#8B93A1]">所有指派都已完成，做得好！</p>
          ) : (
            <ul className="mt-4 divide-y divide-app-border">
              {pendingAssignments.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                  <Link
                    href={a.scope === "course" ? `/courses/${a.courseId}` : `/manuals/${a.manualId}`}
                    className="text-brand hover:underline"
                  >
                    {a.scope === "course" ? a.courseTitle : a.manualTitle}
                  </Link>
                  <span className="text-xs text-[#8B93A1]">
                    {a.dueDate ? `期限 ${a.dueDate}` : "無期限"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <footer className="mt-10 flex gap-4 text-xs text-[#B0B6C0]">
        <span>©喜躍生醫股份有限公司</span>
      </footer>
    </DashboardShell>
  );
}
