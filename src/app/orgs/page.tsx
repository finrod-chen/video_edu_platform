import { OrgSettingsShell } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/OrgSettingsShell";
import { mockOrg } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/mock-data";

const fields = [
  { label: "公司/部門名稱", value: mockOrg.name },
  { label: "計劃類型", value: mockOrg.planType },
  { label: "視訊品質", value: mockOrg.videoQuality },
  { label: "翻譯語言", value: mockOrg.translationLanguage },
  { label: "技術詞典", value: "CSV 尚未上傳。" },
];

export default function OrgInfoPage() {
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
      <button className="mt-8 rounded-lg bg-tebiki-blue px-6 py-2.5 text-sm font-bold text-white hover:bg-tebiki-blue-dark">
        編輯組織資訊
      </button>
    </OrgSettingsShell>
  );
}
