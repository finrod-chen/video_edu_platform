import { OrgSettingsShell } from "@/components/sites/training-platform/shared/OrgSettingsShell";
import { BatchCaptionsButton } from "@/components/sites/training-platform/shared/BatchCaptionsButton";
import { getOrg } from "@/lib/queries/org";
import { getStepsNeedingCaptions } from "@/lib/queries/manuals";
import { CURRENT_ORG_ID, requireAdmin } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function OrgInfoPage() {
  await requireAdmin();
  const [org, captionBacklog] = await Promise.all([
    getOrg(CURRENT_ORG_ID),
    getStepsNeedingCaptions(CURRENT_ORG_ID),
  ]);

  const fields = [
    { label: "公司/部門名稱", value: org?.name ?? "—" },
    { label: "計劃類型", value: org?.planType ?? "—" },
    { label: "技術詞典", value: "CSV 尚未上傳。" },
  ];

  return (
    <OrgSettingsShell active="公司" breadcrumbExtra="設定">
      <div className="divide-y divide-app-border">
        {fields.map((f) => (
          <div key={f.label} className="py-4 first:pt-0">
            <p className="mb-1 text-sm font-bold text-[#2B2C2F]">{f.label}</p>
            <p className="text-sm text-[#5B6270]">{f.value}</p>
          </div>
        ))}
      </div>

      {captionBacklog.length > 0 && (
        <div className="mt-8 border-t border-app-border pt-6">
          <p className="mb-2 text-sm font-bold text-[#2B2C2F]">字幕維護</p>
          <BatchCaptionsButton pendingCount={captionBacklog.length} />
        </div>
      )}
    </OrgSettingsShell>
  );
}
