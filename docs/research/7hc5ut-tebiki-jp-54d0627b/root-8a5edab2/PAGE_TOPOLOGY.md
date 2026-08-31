# Page Topology — tebiki (7hc5ut.tebiki.jp)

## Scope note
Target is tebiki, a Japanese SaaS "video manual / SOP training" platform. The
cloned account (喜躍生醫股份有限公司) is a real tenant. Per explicit user
instruction, all real employee names, emails, avatars, and company name are
replaced with **generic mock data** in the clone. Structure/UI/behavior is
real; PII/business content is mocked.

## Routes discovered (authenticated app)

| Path | Section | Notes |
|---|---|---|
| `/login` | Login | Pre-auth. Split screen: form left, photo+headline right. |
| `/` | 首頁 Home | Dashboard: "新手冊" panel + "我的任務" side panel. Empty states. |
| `/bookmarks` | 書籤 Bookmarks | Tabs: 手冊(0) / 課程(0). Empty state. |
| `/courses` | 課程 Courses | Tabs: 資料夾(0) / 課程(0) / 手動的(3). Empty folder state. |
| `/manuals` | 手冊 > 發布 Manuals (published) | Keyword search + sort control. Empty state ("沒有數據"). |
| `/drafts` | 手冊 > 草稿 Drafts | Same shell as /manuals, draft filter. |
| `/trashes` | 手冊 > 垃圾 Trash | Same shell, trash filter. |
| `/tags` | 標籤 Tags | Search + "新標籤" button + table (名稱/手冊數量/操作). Empty. |
| `/orgs` | 組織設定 > 組織 Org info | Tab bar: 組織/使用者管理/使用者群組/安全/下載. Read-only field list + "編輯組織資訊" button. |
| `/org/users` | 組織設定 > 使用者管理 | Not deep-inspected (lower priority). |
| `/groups` | 組織設定 > 使用者群組 | Not deep-inspected. |
| `/orgs/security` | 組織設定 > 安全 | Not deep-inspected. |
| `/exports` | 組織設定 > 下載 | Not deep-inspected. |
| `/reports/orgs` | 組織報告 Org reports | Line chart (訪客/觀看時間), summary stat card (時數/課程/手冊/使用者=1), 3 ranking panels w/ "顯示更多". |
| `/reports/orgs/user_accesses`, `/manual_accesses`, `/course_accesses`, `/user_summaries/:id` | Report detail drilldowns | Lower priority — stub/skip unless time allows. |
| `/mypage` | 帳戶設定 > 個人資料 Profile | Tabs: 輪廓/電子郵件通知/密碼. Avatar circle + field list + "編輯個人資料" button. |
| `/tasks` | 任務 Tasks | Reached via "顯示更多" on home widget. Lower priority. |

## Shared shell (present on every authenticated page)
- **Sidebar** (`<aside>`): fixed left, width 216px, `border-right: 1px solid #E8EBF1`, transparent bg (renders white over page bg).
  - Logo "tebiki" (blue book-page icon + wordmark) top.
  - "＋ 建立" primary button (blue, full-width, rounded 8px).
  - Primary nav: 首頁 / 書籤 / 課程 / 手冊(expandable: 發布/草稿/垃圾) / 標籤.
  - Bottom-pinned secondary nav: 組織設定 / 組織報告 / 支援.
  - Active item: blue text + blue icon.
- **Topbar** (`<header>`): left margin 216px (sits beside sidebar), breadcrumb left (e.g. "首頁 › 課程" + link icon), right cluster: language/translate toggle icon, search input "搜尋 tebiki", calendar/task icon, bell (notifications), circular avatar (orange bg, white initial letter — **mock this to a generic initial/color**).

## Interaction model
- Static, click-driven navigation (SPA-style route changes via sidebar/topbar links). No scroll-driven animation observed on these admin pages.
- No auto-cycling carousels, no parallax, no scroll-snap.
- Tab bars (手冊 sub-nav, 組織設定 sub-nav, mypage sub-nav) are click-to-switch, standard route changes (not client-only state) — each is a distinct href.
- Report page line chart appears to be an SVG/canvas chart library rendering (values flat at 0 for this empty tenant).

## Responsive
- Window resize to 390px did not visibly reflow content in this environment (desktop layout persisted in screenshot) — could not conclusively verify mobile breakpoint behavior via automation. Treat mobile layout as **best-effort inference**: collapse sidebar to a hamburger/off-canvas drawer below ~768px (standard enterprise dashboard pattern), stack topbar search, follow Tailwind `md:` conventions. Flag this as a known gap for manual QA.

## Content sensitivity
- Real PII observed: profile name "陳 思蓁", email "finrodchen@xiyuebiomed.com.tw", org name "喜躍生醫股份有限公司". **All replaced with mock placeholders** (e.g. "王小明" / "user@example.com" / "示例科技股份有限公司") in the built clone per user instruction.
- All list/table pages in this tenant are empty (no manuals, courses, tags, bookmarks) — clone empty states faithfully; add 2-3 rows of obviously-fake sample data only where it materially helps demonstrate a table/list component's populated state (clearly fictional, non-real-looking).
