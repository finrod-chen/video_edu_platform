import { DashboardShell } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/DashboardShell";
import { NewManualForm } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/manuals/NewManualForm";

export default function NewManualPage() {
  return (
    <DashboardShell activeKey="manuals" breadcrumb={["首頁", "手冊", "新增"]}>
      <h1 className="mb-6 text-xl font-bold text-[#2B2C2F]">新增手冊</h1>
      <div className="rounded-xl border border-tebiki-border bg-white p-6">
        <NewManualForm />
      </div>
    </DashboardShell>
  );
}
