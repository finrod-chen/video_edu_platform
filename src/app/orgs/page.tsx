import { OrgSettingsShell } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/OrgSettingsShell";
import { getOrg } from "@/lib/queries/org";
import { CURRENT_ORG_ID } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function OrgInfoPage() {
  const org = await getOrg(CURRENT_ORG_ID);

  const fields = [
    { label: "公司/部門名稱", value: org?.name ?? "—" },
    { label: "計劃類型", value: org?.planType ?? "—" },
    { label: "視訊品質", value: org?.videoQuality ?? "—" },
    { label: "翻譯語言", value: org?.translationLanguage ?? "—" },
    { label: "技術詞典", value: "CSV 尚未上傳。" },
  ];

  return (
    <OrgSettingsShell active="組織" breadcrumbExtra="設定">
      <div className="divide-y divide-tebiki-border">
        {fields.map((f) => (
          <div key={f.label} className="py-4 first:pt-0">
            <p className="mb-1 text-sm font-bold text-[#2B2C2F]">{f.label}</p>
            <p className="text-sm text-[#5B6270]">{f.value}</p>
          </div>
        ))}
      </div>
      <button className="mt-8 rounded-lg bg-brand px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-dark">
        編輯組織資訊
      </button>
    </OrgSettingsShell>
  );
}
