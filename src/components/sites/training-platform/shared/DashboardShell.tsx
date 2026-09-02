import type { NavItemKey } from "@/types/models";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { getCurrentUser } from "@/lib/current-viewer";

export async function DashboardShell({
  activeKey,
  breadcrumb,
  children,
}: {
  activeKey: NavItemKey | null;
  breadcrumb: string[];
  children: React.ReactNode;
}) {
  const { role } = await getCurrentUser();

  return (
    <div className="flex min-h-screen bg-app-bg">
      <Sidebar activeKey={activeKey} role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar breadcrumb={breadcrumb} />
        <main className="min-w-0 flex-1 overflow-x-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
}

export { EmptyState } from "./EmptyState";
