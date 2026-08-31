import { DashboardShell } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/DashboardShell";
import { BookmarksClient } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/BookmarksClient";
import { getBookmarkedCourses, getBookmarkedManuals } from "@/lib/queries/bookmarks";
import { CURRENT_USER_ID } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const [manuals, courses] = await Promise.all([
    getBookmarkedManuals(CURRENT_USER_ID),
    getBookmarkedCourses(CURRENT_USER_ID),
  ]);

  return (
    <DashboardShell activeKey="bookmarks" breadcrumb={["書籤"]}>
      <h1 className="mb-4 text-xl font-bold text-[#2B2C2F]">書籤</h1>
      <BookmarksClient manuals={manuals} courses={courses} />
    </DashboardShell>
  );
}
