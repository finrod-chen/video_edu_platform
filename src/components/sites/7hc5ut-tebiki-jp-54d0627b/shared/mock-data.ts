import type { TebikiOrg, TebikiUser } from "@/types/tebiki";

// Real tenant data (陳思蓁 / finrodchen@xiyuebiomed.com.tw / 喜躍生醫股份有限公司)
// intentionally replaced with generic placeholders — see PAGE_TOPOLOGY.md "Content sensitivity".
export const mockUser: TebikiUser = {
  id: "u_demo01",
  name: "王小明",
  email: "user@example.com",
  role: "行政",
  avatarInitial: "王",
  avatarColor: "#64748B",
};

export const mockOrg: TebikiOrg = {
  name: "示例科技股份有限公司",
  planType: "入口 計劃",
  videoQuality: "始終保持高品質",
  translationLanguage: "所有語言",
};
