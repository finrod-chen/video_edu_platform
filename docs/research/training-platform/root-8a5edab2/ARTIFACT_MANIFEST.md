# Artifact Manifest — tebiki (7hc5ut.tebiki.jp)

## Mocked / substituted content (per explicit user instruction)
| Real value (source tenant) | Replaced with |
|---|---|
| 喜躍生醫股份有限公司 (org name) | 示例科技股份有限公司 |
| 陳 思蓁 (profile name) | 王小明 |
| finrodchen@xiyuebiomed.com.tw | user@example.com |
| Real avatar color/initial tied to real user | Neutral slate avatar, generic initial |

All defined once in `src/components/sites/training-platform/shared/mock-data.ts` so every page stays consistent.

## Simplified / approximated assets (no AtlasCloud fallback used — not requested/approved)
- **Logo mark**: the real `<svg>` wordmark path (5230-char single `<path>`) was not traced exactly — rebuilt as a simplified bookmark+play-notch glyph in the extracted brand blue `#1A8CFF`. Not a pixel-exact trace of the original vector.
- **Login page hero photo**: original right-panel photo (person filming with phone) could not be fetched — the browser session was authenticated, so `/login` redirected to the dashboard and re-fetching it would have required logging out (extra friction / against the flow already agreed with the user). Replaced with a CSS gradient (`from-[#0F2A4A] via-[#173A5E] to-[#1A8CFF]` + dark overlay) approximating the photo's color mood, not the real photo.
- **404 page hero background**: same substitution — dark navy gradient in place of the original photographic background.
- **Sidebar/topbar icons**: rebuilt using Lucide React equivalents (Home, Bookmark, PlayCircle, BookOpen, Tag, Building2, BarChart3, etc.) rather than tracing the source app's exact 24×24 icon paths — visually equivalent generic UI icons, consistent with this template's default icon library.
- **Report chart data**: source tenant had all-zero values (empty account). Clone uses small, clearly-fictional sample numbers so the chart component is demonstrable — commented in `VisitorChart.tsx`.

## Known gaps / lower-fidelity areas
- Mobile (390px) responsive layout was **not visually verified** — the browser automation environment's window resize did not reflow the captured screenshots. Sidebar-collapses-to-drawer behavior below `md:` is an inference from common enterprise-dashboard patterns, not an observation. Recommend manual QA at real mobile viewports.
- Hover/focus micro-interactions were not individually captured (no dedicated hover sweep) — standard hover/focus affordances applied as reasonable defaults.
- Deep pages not built (route not created): `/reports/orgs/user_accesses`, `/manual_accesses`, `/course_accesses`, `/user_summaries/:id`, `/tasks`. Identified in PAGE_TOPOLOGY.md but out of scope for this pass.
- `/orgs/security` on the live tenant actually 404s (feature not enabled on that plan) — cloned faithfully as a 404-style page rather than a real security settings form.
