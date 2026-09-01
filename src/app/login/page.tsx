import { SiteLogo } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/icons";
import { mockOrg } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/mock-data";
import { GoogleSignInButton } from "@/components/sites/7hc5ut-tebiki-jp-54d0627b/shared/GoogleSignInButton";
import { getOrg } from "@/lib/queries/org";
import { CURRENT_ORG_ID } from "@/lib/current-viewer";
import { ALLOWED_GOOGLE_DOMAIN } from "@/auth";

export const dynamic = "force-dynamic";

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: `僅限 @${ALLOWED_GOOGLE_DOMAIN} 網域帳號登入，請改用公司 Google 帳號。`,
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [org, params] = await Promise.all([
    getOrg(CURRENT_ORG_ID).catch(() => null),
    searchParams,
  ]);
  const orgName = org?.name ?? mockOrg.name;
  const errorMessage = params.error ? (ERROR_MESSAGES[params.error] ?? "登入失敗，請再試一次。") : null;

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col items-center justify-center px-8 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex justify-center">
            <SiteLogo className="h-9" />
          </div>

          <p className="mb-2 text-center text-sm text-[#5B6270]">{orgName} 的專屬登入頁面</p>
          <p className="mb-6 text-center text-xs text-[#8B93A1]">
            僅限 @{ALLOWED_GOOGLE_DOMAIN} 網域的 Google 帳號登入
          </p>

          {errorMessage && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
              {errorMessage}
            </p>
          )}

          <GoogleSignInButton />
        </div>
      </div>

      <div className="relative hidden items-end overflow-hidden bg-gradient-to-br from-[#14290C] via-[#1F4610] to-[#38761D] md:flex">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <p className="relative z-10 p-10 text-2xl font-bold text-white">利用簡單的視訊手冊改變工作場所培訓</p>
      </div>
    </div>
  );
}
