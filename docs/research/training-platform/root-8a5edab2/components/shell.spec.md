# Dashboard Shell (Sidebar + Topbar) Specification

## Overview
- Target files:
  - `src/components/sites/training-platform/shared/Sidebar.tsx`
  - `src/components/sites/training-platform/shared/Topbar.tsx`
  - `src/components/sites/training-platform/shared/DashboardShell.tsx`
- Screenshot refs: `docs/design-references/7hc5ut-tebiki-jp-54d0627b/root-8a5edab2/home-desktop.png` (and any page screenshot — shell repeats).
- Interaction model: static, click-driven navigation (real route links).

## Sidebar
- Fixed left column, `width: 216px`, full height, `border-right: 1px solid #E8EBF1` (`--tebiki-border`), background white/transparent.
- Top: `Logo` (~28px tall), left-aligned, padding ~24px.
- Below logo: full-width primary button "＋ 建立" — `bg-tebiki-blue`, white text, bold 14px, `rounded-lg` (8px), height 40px, icon (Plus) + label.
- Primary nav list (icon + label, 16px gap icon-to-label, ~40px row height, rounded-md hover bg):
  - 首頁 (HomeIcon) → `/`
  - 書籤 (BookmarkIcon) → `/bookmarks`
  - 課程 (CourseIcon) → `/courses`
  - 手冊 (ManualIcon) → `/manuals`, expandable with children when active: 發布(`/manuals`) / 草稿(`/drafts`) / 垃圾(`/trashes`)
  - 標籤 (TagIcon) → `/tags`
  - Active item: text + icon colored `text-tebiki-blue` (#1A8CFF), default `text-[#2B2C2F]`/gray-700.
- Bottom-pinned secondary nav (separated, sits at bottom of viewport height via `mt-auto`):
  - 組織設定 (OrgIcon) → `/orgs`
  - 組織報告 (ReportIcon) → `/reports/orgs`
  - 支援 (SupportIcon) → opens external help widget (render as non-navigating button in clone, `href="#"` no-op or external help link).

## Topbar
- `height: ~56px`, sits to the right of sidebar (`margin-left: 216px` or flex sibling), `border-bottom: 1px solid #E8EBF1`, white bg.
- Left: breadcrumb text (e.g. "首頁" or "首頁 › 課程"), 14px gray, plus a small link/chain icon (LinkIcon) button next to it (copy-link affordance).
- Right cluster (gap ~16px), right-aligned:
  1. Translate/language toggle icon button (square, light blue bg `bg-tebiki-blue/10`, TranslateIcon)
  2. Search input, placeholder "搜尋 tebiki", `rounded-lg`, light gray bg `bg-[#F5F6F8]`, ~280px wide, SearchIcon leading
  3. Task/calendar icon button (TaskIcon)
  4. Notification bell icon button (BellIcon)
  5. Circular avatar 32px, bold white initial letter, solid background color — **mock data**: use a generic neutral color (`bg-slate-500`) and initial "王" or "U", never the real captured name/email.

## DashboardShell
- Client-side wrapper: `<div className="flex min-h-screen bg-tebiki-bg">` containing `<Sidebar/>` then `<div className="flex-1 flex flex-col"><Topbar/><main className="flex-1 p-6">{children}</main></div>`.
- Accepts `breadcrumb: string` and `activeKey: NavItemKey` props so each page can set its own topbar breadcrumb + sidebar highlight.

## Mock data policy
- Avatar/user name/email must NEVER show the real captured values (陳思蓁 / finrodchen@xiyuebiomed.com.tw / 喜躍生醫股份有限公司). Use generic placeholders defined once in a `mockUser`/`mockOrg` object in `src/types/tebiki.ts`-adjacent mock file so every page references the same fake identity consistently.

## Responsive (best-effort, not directly observed — see BEHAVIORS.md gap)
- `md:` and up: sidebar always visible as above.
- Below `md`: collapse sidebar to an off-canvas drawer opened by a hamburger button that replaces the breadcrumb area in the topbar; standard Tailwind `hidden md:flex` / conditional drawer pattern.
