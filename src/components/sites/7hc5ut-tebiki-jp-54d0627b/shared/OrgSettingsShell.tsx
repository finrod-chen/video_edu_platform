import { DashboardShell } from "./DashboardShell";
import { PageTabs } from "./PageTabs";

const tabs = [
  { label: "公司", href: "/orgs" },
  { label: "使用者管理", href: "/org/users" },
  { label: "使用者群組", href: "/groups" },
  { label: "下載", href: "/exports" },
];

export function OrgSettingsShell({
  active,
  breadcrumbExtra,
  children,
}: {
  active: string;
  breadcrumbExtra: string;
  children: React.ReactNode;
}) {
  return (
    <DashboardShell activeKey="orgSettings" breadcrumb={["首頁", "公司", breadcrumbExtra]}>
      <div className="rounded-xl border border-tebiki-border bg-white">
        <div className="px-6 pt-4">
          <PageTabs tabs={tabs.map((t) => ({ ...t, active: t.label === active }))} />
        </div>
        <div className="p-6">{children}</div>
      </div>
    </DashboardShell>
  );
}
