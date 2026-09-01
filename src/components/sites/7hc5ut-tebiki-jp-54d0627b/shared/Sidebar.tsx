"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItemKey } from "@/types/tebiki";
import {
  AssignmentIcon,
  BookmarkIcon,
  ChevronRightIcon,
  CourseIcon,
  HomeIcon,
  ManualIcon,
  OrgIcon,
  PlusIcon,
  ReportIcon,
  SupportIcon,
  TagIcon,
  SiteLogo,
} from "./icons";

interface NavItem {
  key: NavItemKey;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { label: string; href: string }[];
}

const primaryNav: NavItem[] = [
  { key: "home", label: "首頁", href: "/", icon: HomeIcon },
  { key: "bookmarks", label: "書籤", href: "/bookmarks", icon: BookmarkIcon },
  { key: "courses", label: "課程", href: "/courses", icon: CourseIcon },
  {
    key: "manuals",
    label: "手冊",
    href: "/manuals",
    icon: ManualIcon,
    children: [
      { label: "發布", href: "/manuals" },
      { label: "草稿", href: "/drafts" },
      { label: "垃圾", href: "/trashes" },
    ],
  },
  { key: "tags", label: "標籤", href: "/tags", icon: TagIcon },
  { key: "assignments", label: "指派管理", href: "/assignments", icon: AssignmentIcon },
];

const secondaryNav: NavItem[] = [
  { key: "orgSettings", label: "公司設定", href: "/orgs", icon: OrgIcon },
  { key: "orgReports", label: "公司報告", href: "/reports/company", icon: ReportIcon },
];

export function Sidebar({ activeKey, role }: { activeKey: NavItemKey | null; role: string }) {
  const pathname = usePathname();
  const canCreate = role === "管理員" || role === "編輯";
  const canSeeReports = canCreate;
  const canSeeCompanySettings = role === "管理員";
  const visibleSecondaryNav = secondaryNav.filter(
    (item) => (item.key === "orgSettings" ? canSeeCompanySettings : canSeeReports)
  );
  const visiblePrimaryNav = primaryNav.filter((item) => (item.key === "assignments" ? canCreate : true));

  return (
    <aside className="hidden md:flex w-[216px] shrink-0 flex-col border-r border-tebiki-border bg-white h-screen sticky top-0">
      <div className="px-6 pt-6 pb-4">
        <Link href="/" aria-label="喜躍生醫影音訓練系統 首頁">
          <SiteLogo />
        </Link>
      </div>

      {canCreate && (
        <div className="px-4 pb-4">
          <Link
            href="/manuals/new"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-dark transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            建立
          </Link>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3">
        <ul className="space-y-0.5">
          {visiblePrimaryNav.map((item) => {
            const isActive = activeKey === item.key;
            const Icon = item.icon;
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-tebiki-bg",
                    isActive ? "text-brand font-medium" : "text-[#2B2C2F]"
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
                {item.children && isActive && (
                  <ul className="ml-8 mt-0.5 space-y-0.5 border-l border-tebiki-border pl-3">
                    {(canCreate ? item.children : item.children.filter((c) => c.href === "/manuals")).map((child) => {
                      const childActive = pathname === child.href;
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={cn(
                              "flex items-center gap-1 rounded-md px-2 py-1.5 text-sm hover:bg-tebiki-bg",
                              childActive ? "text-brand font-medium" : "text-[#5B6270]"
                            )}
                          >
                            <ChevronRightIcon className="h-3 w-3" />
                            {child.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-tebiki-border px-3 py-3">
        <ul className="space-y-0.5">
          {visibleSecondaryNav.map((item) => {
            const isActive = activeKey === item.key;
            const Icon = item.icon;
            return (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-tebiki-bg",
                    isActive ? "text-brand font-medium" : "text-[#2B2C2F]"
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-[#2B2C2F] transition-colors hover:bg-tebiki-bg"
            >
              <SupportIcon className="h-[18px] w-[18px]" />
              支援
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
