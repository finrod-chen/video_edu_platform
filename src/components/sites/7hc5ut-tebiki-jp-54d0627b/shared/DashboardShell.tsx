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

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="text-[#D7DBE3]">
        <rect x="4" y="4" width="48" height="48" rx="8" strokeWidth="2" stroke="currentColor" strokeDasharray="4 4" />
        <path d="M20 34l6-8 5 6 5-7 6 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="text-sm font-medium text-[#8B93A1]">{title}</p>
      {description && <p className="text-xs text-[#B0B6C0]">{description}</p>}
    </div>
  );
}
