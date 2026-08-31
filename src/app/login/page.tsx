import { SiteLogo } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/icons";
import { mockOrg } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/mock-data";
import { LoginForm } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/LoginForm";
import { getOrg } from "@/lib/queries/org";
import { CURRENT_ORG_ID } from "@/lib/current-viewer";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const org = await getOrg(CURRENT_ORG_ID).catch(() => null);
  const orgName = org?.name ?? mockOrg.name;

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col items-center justify-center px-8 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex justify-center">
            <SiteLogo className="h-9" />
          </div>

          <p className="mb-6 text-center text-sm text-[#5B6270]">{orgName} 的專屬登入頁面</p>

          <LoginForm />

          <p className="mt-4 text-center text-sm text-brand hover:underline">
            <a href="#">如果您忘記ID或密碼/無法登入</a>
          </p>
        </div>
      </div>

      <div className="relative hidden items-end overflow-hidden bg-gradient-to-br from-[#14290C] via-[#1F4610] to-[#38761D] md:flex">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <p className="relative z-10 p-10 text-2xl font-bold text-white">利用簡單的視訊手冊改變工作場所培訓</p>
      </div>
    </div>
  );
}
