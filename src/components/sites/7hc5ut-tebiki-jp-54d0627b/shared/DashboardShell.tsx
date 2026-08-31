import type { NavItemKey } from "@/types/tebiki";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function DashboardShell({
  activeKey,
  breadcrumb,
  children,
}: {
  activeKey: NavItemKey | null;
  breadcrumb: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-tebiki-bg">
      <Sidebar activeKey={activeKey} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar breadcrumb={breadcrumb} />
        <main className="min-w-0 flex-1 overflow-x-auto px-6 py-6">{children}</main>
      </div>
    </div>
  );
}

export { EmptyState } from "./EmptyState";
