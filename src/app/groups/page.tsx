import { OrgSettingsShell } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/OrgSettingsShell";
import { getUserGroups } from "@/lib/queries/groups";
import { CURRENT_ORG_ID } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  const groups = await getUserGroups(CURRENT_ORG_ID);

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
        {groups.length > 0 && (
          <tbody>
            {groups.map((g) => (
              <tr key={g.id} className="border-b border-tebiki-border">
                <td className="py-3 text-[#2B2C2F]">{g.name}</td>
                <td className="py-3 text-[#5B6270]">{g.description || "—"}</td>
                <td className="py-3 text-[#8B93A1]">···</td>
              </tr>
            ))}
          </tbody>
        )}
      </table>
      {groups.length === 0 && <div className="py-20 text-center text-sm text-[#8B93A1]">沒有數據</div>}
      <button className="mt-6 rounded-lg bg-tebiki-blue px-6 py-2.5 text-sm font-bold text-white hover:bg-tebiki-blue-dark">
        新用戶群組
      </button>
    </OrgSettingsShell>
  );
}
