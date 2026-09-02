import type { Org, User } from "@/types/models";

// Fallback data used only when the DB is unreachable (see src/lib/db.ts).
// Individual employee identity stays a generic placeholder — real staff
// accounts belong in the users table (db/seed.sql), not hardcoded here.
export const mockUser: User = {
  id: "u_demo01",
  name: "王小明",
  email: "user@example.com",
  role: "行政",
  avatarInitial: "王",
  avatarColor: "#64748B",
};

// This is the real, authorized organization this system is built for
// (see PAGE_TOPOLOGY.md "Content sensitivity" for the earlier decision
// history — this app is now the company's own internal tool, not a
// public-facing clone, so the real org name is appropriate here).
export const mockOrg: Org = {
  name: "喜躍生醫股份有限公司",
  planType: "內部訓練系統",
  videoQuality: "始終保持高品質",
  translationLanguage: "繁體中文",
};
