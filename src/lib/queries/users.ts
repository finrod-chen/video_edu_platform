import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import type { TebikiUser } from "@/types/tebiki";

interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar_color: string;
  status: "active" | "invited";
}

export async function getUser(userId: number): Promise<TebikiUser | null> {
  const [rows] = await db.query(
    "SELECT id, name, email, role, avatar_color FROM users WHERE id = ?",
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
  };
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

export interface OrgUsers {
  members: TebikiUser[];
  memberCount: number;
}

// Google SSO auto-provisions accounts on first sign-in -- there is no invite
// flow, so every row is effectively 'active'. Only active accounts are listed.
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
