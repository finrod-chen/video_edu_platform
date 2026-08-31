import { OrgSettingsShell } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/OrgSettingsShell";

export default function GroupsPage() {
  return (
    <OrgSettingsShell active="使用者群組" breadcrumbExtra="使用者群組">
      <p className="mb-6 text-sm text-[#5B6270]">
        您可以對使用者群組使用存取限制功能。{" "}
        <a href="https://help.tebiki.jp" target="_blank" rel="noreferrer" className="text-tebiki-blue hover:underline">
          （幫助）
        </a>
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-tebiki-border text-left text-[#8B93A1]">
            <th className="pb-3 font-medium">使用者群組名稱</th>
            <th className="pb-3 font-medium">使用者群組描述</th>
            <th className="pb-3 font-medium">操作</th>
          </tr>
        </thead>
      </table>
      <div className="py-20 text-center text-sm text-[#8B93A1]">沒有數據</div>
      <button className="rounded-lg bg-tebiki-blue px-6 py-2.5 text-sm font-bold text-white hover:bg-tebiki-blue-dark">
        新用戶群組
      </button>
    </OrgSettingsShell>
  );
}
