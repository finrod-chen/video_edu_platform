import Link from "next/link";
import { cn } from "@/lib/utils";

export interface PageTab {
  label: string;
  href: string;
  active: boolean;
}

export function PageTabs({ tabs }: { tabs: PageTab[] }) {
  return (
    <div className="flex gap-6 border-b border-app-border">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "-mb-px border-b-2 px-1 pb-3 text-sm transition-colors",
            tab.active
              ? "border-brand font-medium text-brand"
              : "border-transparent text-[#5B6270] hover:text-[#2B2C2F]"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
