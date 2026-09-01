import { auth } from "@/auth";

// Single-tenant system -- always 喜躍生醫股份有限公司 (see db/seed.sql).
export const CURRENT_ORG_ID = 1;

// Resolves the signed-in user's internal DB id from the Google SSO session.
// src/proxy.ts guarantees every non-/login route already has a session, so
// this should never actually hit the fallback in normal operation -- the
// throw exists as a defensive guard against calling it somewhere unprotected.
export async function getCurrentUserId(): Promise<number> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) {
    throw new Error("getCurrentUserId() called without an authenticated session");
  }
  return Number(id);
}
