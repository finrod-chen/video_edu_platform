import { ManualListPage } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/ManualListPage";

export const dynamic = "force-dynamic";

export default function TrashesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return <ManualListPage breadcrumbLabel="垃圾" status="trashed" searchParams={searchParams} />;
}
