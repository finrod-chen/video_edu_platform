import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import type { PickableUser, User } from "@/types/models";

export type UserStatus = "active" | "invited" | "disabled";

interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar_color: string;
  status: UserStatus;
  email_notifications_enabled?: number;
}

export async function getUser(userId: number): Promise<User | null> {
  const [rows] = await db.query(
    "SELECT id, name, email, role, avatar_color, email_notifications_enabled FROM users WHERE id = ?",
    [userId]
  );
  const row = (rows as UserRow[])[0];
  if (!row) return null;
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    role: row.role,
    avatarInitial: row.name.slice(0, 1),
    avatarColor: row.avatar_color,
    emailNotificationsEnabled: Boolean(row.email_notifications_enabled),
  };
}

/** Used by the sign-in callback -- disabled users must not be able to establish a new session. */
export async function getUserStatusByEmail(email: string): Promise<UserStatus | null> {
  const [rows] = await db.query("SELECT status FROM users WHERE email = ?", [email]);
  const row = (rows as UserRow[])[0];
  return row?.status ?? null;
}

export async function setEmailNotificationsEnabled(userId: number, enabled: boolean): Promise<void> {
  await db.execute("UPDATE users SET email_notifications_enabled = ? WHERE id = ?", [enabled, userId]);
}

const AVATAR_PALETTE = ["#64748B", "#0EA5E9", "#F59E0B", "#38761D", "#7C3AED", "#DB2777"];

function colorForEmail(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

// Called on every successful Google sign-in. First-time sign-in for an
// @xiyuebiomed.com.tw account auto-provisions a basic-permission ('一般')
// account -- returning sign-ins just refresh the display name and never
// touch role/status, so manually-promoted admins don't get reset.
export async function upsertUserFromGoogle({
  orgId,
  email,
  name,
}: {
  orgId: number;
  email: string;
  name: string;
}): Promise<{ id: number; role: string }> {
  const [existingRows] = await db.query(
    "SELECT id, role FROM users WHERE email = ?",
    [email]
  );
  const existing = (existingRows as UserRow[])[0];
  if (existing) {
    await db.execute("UPDATE users SET name = ? WHERE id = ?", [name, existing.id]);
    return { id: existing.id, role: existing.role };
  }

  const role = "員工";
  const [result] = await db.execute(
    "INSERT INTO users (org_id, name, email, role, avatar_color, status) VALUES (?, ?, ?, ?, ?, 'active')",
    [orgId, name, email, role, colorForEmail(email)]
  );
  const insertId = (result as ResultSetHeader).insertId;
  return { id: insertId, role };
}

export interface OrgUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarInitial: string;
  avatarColor: string;
  status: UserStatus;
}

export interface OrgUsers {
  members: PickableUser[];
  memberCount: number;
}

// Google SSO auto-provisions accounts on first sign-in -- there is no invite
// flow, so every row is effectively 'active'. Only active accounts are listed
// (used for assignment/group-membership pickers -- disabled users should
// disappear from those automatically).
export async function getOrgUsers(orgId: number): Promise<OrgUsers> {
  const [rows] = await db.query(
    "SELECT id, name, email, role, avatar_color FROM users WHERE org_id = ? AND status = 'active' ORDER BY name ASC",
    [orgId]
  );
  const users = (rows as UserRow[]).map((r) => ({
    id: String(r.id),
    name: r.name,
    email: r.email,
    role: r.role,
    avatarInitial: r.name.slice(0, 1),
    avatarColor: r.avatar_color,
  }));

  return {
    members: users,
    memberCount: users.length,
  };
}

/** For the user-management table -- shows active + disabled (invited is unused, see comment above). */
export async function getOrgUsersForManagement(orgId: number): Promise<OrgUserRow[]> {
  const [rows] = await db.query(
    `SELECT id, name, email, role, avatar_color, status FROM users
     WHERE org_id = ? AND status IN ('active','disabled')
     ORDER BY status ASC, name ASC`,
    [orgId]
  );
  return (rows as UserRow[]).map((r) => ({
    id: String(r.id),
    name: r.name,
    email: r.email,
    role: r.role,
    avatarInitial: r.name.slice(0, 1),
    avatarColor: r.avatar_color,
    status: r.status,
  }));
}

export async function countAdmins(orgId: number): Promise<number> {
  const [rows] = await db.query(
    "SELECT COUNT(*) AS count FROM users WHERE org_id = ? AND role = '管理員' AND status = 'active'",
    [orgId]
  );
  return Number((rows as RowDataPacket[])[0].count);
}

export async function setUserRole(orgId: number, userId: number, role: string): Promise<void> {
  await db.execute("UPDATE users SET role = ? WHERE id = ? AND org_id = ?", [role, userId, orgId]);
}

/** "disabled" blocks future sign-in (see auth.ts's signIn callback) and drops the user out of
 * every active-user picker (assignments/groups/etc). Historical training/quiz records are untouched. */
export async function setUserStatus(
  orgId: number,
  userId: number,
  status: "active" | "disabled"
): Promise<void> {
  await db.execute("UPDATE users SET status = ? WHERE id = ? AND org_id = ?", [status, userId, orgId]);
}
