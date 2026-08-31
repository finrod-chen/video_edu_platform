import type { RowDataPacket } from "mysql2";
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

export interface OrgUsers {
  members: (TebikiUser & { status: "active" | "invited" })[];
  memberCount: number;
  inviteCount: number;
}

export async function getOrgUsers(orgId: number): Promise<OrgUsers> {
  const [rows] = await db.query(
    "SELECT id, name, email, role, avatar_color, status FROM users WHERE org_id = ? ORDER BY status ASC, name ASC",
    [orgId]
  );
  const users = (rows as UserRow[]).map((r) => ({
    id: String(r.id),
    name: r.name,
    email: r.email,
    role: r.role,
    avatarInitial: r.name.slice(0, 1),
    avatarColor: r.avatar_color,
    status: r.status,
  }));

  return {
    members: users,
    memberCount: users.filter((u) => u.status === "active").length,
    inviteCount: users.filter((u) => u.status === "invited").length,
  };
}
