import { ManualListPage } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/ManualListPage";

export const dynamic = "force-dynamic";

export default function DraftsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  return <ManualListPage breadcrumbLabel="草稿" status="draft" searchParams={searchParams} />;
}
