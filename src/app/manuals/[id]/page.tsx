import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/DashboardShell";
import { ManualViewerClient } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/manuals/ManualViewerClient";
import { getManualById, getManualSteps } from "@/lib/queries/manuals";
import { CURRENT_ORG_ID } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function ManualViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const manualId = Number(id);
  const [manual, steps] = await Promise.all([
    getManualById(CURRENT_ORG_ID, manualId),
    getManualSteps(manualId),
  ]);

  if (!manual) notFound();

  return (
    <DashboardShell activeKey="manuals" breadcrumb={["首頁", "手冊", manual.title]}>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#2B2C2F]">{manual.title}</h1>
        <Link href={`/manuals/${manual.id}/edit`} className="text-sm text-brand hover:underline">
          編輯手冊
        </Link>
      </div>
      {manual.description && <p className="mb-4 text-sm text-[#5B6270]">{manual.description}</p>}
      <ManualViewerClient manual={manual} steps={steps} />
    </DashboardShell>
  );
}
