import { ManualListPage } from "@/components/sites/training-platform/shared/ManualListPage";
import { requireEditor } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function DraftsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; folderId?: string }>;
}) {
  await requireEditor();
  return <ManualListPage breadcrumbLabel="草稿" status="draft" searchParams={searchParams} />;
}
