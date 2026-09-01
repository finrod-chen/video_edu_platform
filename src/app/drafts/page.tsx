import { ManualListPage } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/ManualListPage";
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
