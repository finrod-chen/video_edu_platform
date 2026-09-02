import { ManualListPage } from "@/components/sites/training-platform/shared/ManualListPage";

export const dynamic = "force-dynamic";

export default function ManualsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; folderId?: string }>;
}) {
  return <ManualListPage breadcrumbLabel="已發布手冊" status="published" searchParams={searchParams} />;
}
