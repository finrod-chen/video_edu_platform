import { ManualListPage } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/ManualListPage";

export const dynamic = "force-dynamic";

export default function ManualsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return <ManualListPage breadcrumbLabel="已發布手冊" status="published" searchParams={searchParams} />;
}
