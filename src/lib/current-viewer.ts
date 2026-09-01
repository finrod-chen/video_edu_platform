import { auth } from "@/auth";
import { getUser } from "@/lib/queries/users";

// Single-tenant system -- always 喜躍生醫股份有限公司 (see db/seed.sql).
export const CURRENT_ORG_ID = 1;

export const ADMIN_ROLE = "行政";

export function isAdmin(role: string | undefined | null): boolean {
  return role === ADMIN_ROLE;
}

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

// Fetches the role fresh from the DB rather than trusting the session's
// embedded role claim -- the session is a JWT that isn't reissued when an
// admin changes someone's role mid-session, so it can go stale. Anything
// gating a destructive/admin-only action should use this, not session.user.role.
export async function getCurrentUser(): Promise<{ id: number; role: string }> {
  const id = await getCurrentUserId();
  const user = await getUser(id);
  if (!user) {
    throw new Error("getCurrentUser(): authenticated user id has no matching row");
  }
  return { id, role: user.role };
}
