import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUser } from "@/lib/queries/users";

// Single-tenant system -- always 喜躍生醫股份有限公司 (see db/seed.sql).
export const CURRENT_ORG_ID = 1;

export const ROLE_ADMIN = "管理員";
export const ROLE_EDITOR = "編輯";
export const ROLE_EMPLOYEE = "員工";

export function isAdmin(role: string | undefined | null): boolean {
  return role === ROLE_ADMIN;
}

export function isEditorOrAbove(role: string | undefined | null): boolean {
  return role === ROLE_ADMIN || role === ROLE_EDITOR;
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
//
// Wrapped in React's cache() so multiple calls within the same request
// (e.g. DashboardShell fetching it for the sidebar, and the page itself
// fetching it again for a requireEditor()/requireAdmin() guard) only hit
// the DB once.
export const getCurrentUser = cache(async (): Promise<{ id: number; role: string }> => {
  const id = await getCurrentUserId();
  const user = await getUser(id);
  if (!user) {
    throw new Error("getCurrentUser(): authenticated user id has no matching row");
  }
  return { id, role: user.role };
});

// Page-level guards ONLY (Server Components rendering a page.tsx) -- they
// call redirect(), which fetch() from client code would silently follow
// and return HTML for, not a JSON error. API Route Handlers must instead
// inline-check `isAdmin`/`isEditorOrAbove` and return a 403 NextResponse
// (see the existing DELETE handlers under src/app/api/ for the pattern).
// Redirect (not a 403 page) so an employee clicking a stale link or typing
// a URL directly just lands somewhere useful.
export async function requireEditor(): Promise<{ id: number; role: string }> {
  const user = await getCurrentUser();
  if (!isEditorOrAbove(user.role)) {
    redirect("/manuals");
  }
  return user;
}

export async function requireAdmin(): Promise<{ id: number; role: string }> {
  const user = await getCurrentUser();
  if (!isAdmin(user.role)) {
    redirect("/manuals");
  }
  return user;
}
