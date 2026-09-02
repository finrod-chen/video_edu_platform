import { DashboardShell } from "@/components/sites/training-platform/shared/DashboardShell";
import { MyPageClient } from "@/components/sites/training-platform/shared/MyPageClient";
import { mockUser } from "@/components/sites/training-platform/shared/mock-data";
import { getUser } from "@/lib/queries/users";
import { getCurrentUserId } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function MyPage() {
  const userId = await getCurrentUserId();
  const user = (await getUser(userId)) ?? mockUser;

  return (
    <DashboardShell activeKey={null} breadcrumb={["首頁", "我的頁面", "個人資料"]}>
      <MyPageClient user={user} />
    </DashboardShell>
  );
}
