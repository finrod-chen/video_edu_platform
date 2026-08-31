import { DashboardShell } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/DashboardShell";
import { MyPageClient } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/MyPageClient";
import { mockUser } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/mock-data";
import { getUser } from "@/lib/queries/users";
import { CURRENT_USER_ID } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function MyPage() {
  const user = (await getUser(CURRENT_USER_ID)) ?? mockUser;

  return (
    <DashboardShell activeKey={null} breadcrumb={["首頁", "我的頁面", "個人資料"]}>
      <MyPageClient user={user} />
    </DashboardShell>
  );
}
