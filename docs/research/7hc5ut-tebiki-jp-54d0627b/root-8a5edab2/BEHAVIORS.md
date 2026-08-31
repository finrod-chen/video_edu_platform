# Behaviors — tebiki (7hc5ut.tebiki.jp)

## Global
- Font: `"Noto Sans JP", sans-serif` throughout (verified via computed style on body and buttons).
- No smooth-scroll library detected (`.lenis` etc. not present) — this is a data-dense CRUD app, not a scroll site.
- No scroll-triggered header changes — topbar is always in fixed position beside the sidebar, no shrink/shadow-on-scroll observed.
- No entrance animations observed on section load (dashboard cards render statically).

## Navigation
- **Trigger:** click on sidebar/topbar links.
- **Behavior:** full route change (each nav item has a real `href`), active item styled with blue text/icon color (`rgb(26,140,255)` / `#1A8CFF`) vs default black/gray.
- Sub-tab bars (manuals 發布/草稿/垃圾, org settings 組織/使用者管理/使用者群組/安全/下載, mypage 輪廓/電子郵件通知/密碼) are horizontal tab strips with an active-tab underline (blue, ~2px) — same click-to-navigate model, not JS-only tab switching.

## Buttons
- Primary button (e.g. "＋ 建立", "編輯組織資訊", "編輯個人資料"): solid blue `#1A8CFF` background, white text, `border-radius: 8px`, bold 14px label, height 40px.
- No hover-state diff captured live (would require dedicated hover sweep) — apply a standard subtle darken/opacity-90 on hover as a reasonable default; not verified against source.

## Avatar
- Circular avatar top-right: solid color background (observed orange in this tenant, likely deterministic per-user color) with a single white bold letter (surname initial). **Mocked** to a neutral placeholder color/initial in the clone.

## Empty states
- Consistent pattern across 書籤/課程/手冊/標籤: centered dashed-icon illustration + gray "沒有數據" / "未找到資料夾" / "此資料夾尚無任何子資料夾。" caption text, vertically centered in the content area.

## Known gaps (not exhaustively verified — flagged for QA pass)
- Hover/focus states on buttons, inputs, and nav items were not individually captured via a dedicated hover sweep.
- Mobile breakpoint behavior could not be visually confirmed (window resize did not reflow in this automation environment) — sidebar-collapse assumption is inference, not observation.
- Deep sub-pages (使用者管理, 使用者群組, 安全, 下載, report drilldowns, /tasks) were identified by route but not visually inspected in detail — lower priority, build as simple stubs consistent with the shell unless expanded later.
