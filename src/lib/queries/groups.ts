import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import type { UserGroup } from "@/types/models";

interface GroupRow extends RowDataPacket {
  id: number;
  name: string;
  description: string;
}

export async function getUserGroups(orgId: number): Promise<UserGroup[]> {
  const [rows] = await db.query(
    "SELECT id, name, description FROM user_groups WHERE org_id = ? ORDER BY name ASC",
    [orgId]
  );
  return (rows as GroupRow[]).map((r) => ({
    id: String(r.id),
    name: r.name,
    description: r.description,
  }));
}

interface MemberRow extends RowDataPacket {
  user_id: number;
}

/** Only active members -- resolving a group into assignment targets shouldn't pull in disabled users. */
export async function getUserGroupMembers(groupId: number): Promise<number[]> {
  const [rows] = await db.query(
    `SELECT ugm.user_id
     FROM user_group_members ugm
     JOIN users u ON u.id = ugm.user_id
     WHERE ugm.group_id = ? AND u.status = 'active'`,
    [groupId]
  );
  return (rows as MemberRow[]).map((r) => r.user_id);
}

/** All members regardless of status -- for the group-editing checkbox list (an admin should be able to see/remove a disabled member). */
export async function getAllGroupMemberIds(groupId: number): Promise<number[]> {
  const [rows] = await db.query("SELECT user_id FROM user_group_members WHERE group_id = ?", [groupId]);
  return (rows as MemberRow[]).map((r) => r.user_id);
}

export async function createGroup(orgId: number, name: string, description: string): Promise<number> {
  const [result] = await db.execute(
    "INSERT INTO user_groups (org_id, name, description) VALUES (?, ?, ?)",
    [orgId, name, description]
  );
  return (result as ResultSetHeader).insertId;
}

export async function updateGroup(
  orgId: number,
  groupId: number,
  fields: { name?: string; description?: string }
): Promise<void> {
  const sets: string[] = [];
  const params: string[] = [];
  if (fields.name !== undefined) {
    sets.push("name = ?");
    params.push(fields.name);
  }
  if (fields.description !== undefined) {
    sets.push("description = ?");
    params.push(fields.description);
  }
  if (sets.length === 0) return;
  params.push(String(groupId), String(orgId));
  await db.execute(`UPDATE user_groups SET ${sets.join(", ")} WHERE id = ? AND org_id = ?`, params);
}

export async function deleteGroup(orgId: number, groupId: number): Promise<void> {
  await db.execute("DELETE FROM user_groups WHERE id = ? AND org_id = ?", [groupId, orgId]);
}

/** Replace-all semantics -- simplest correct way to sync a group's membership from a checkbox list. */
export async function setGroupMembers(groupId: number, userIds: number[]): Promise<void> {
  await db.execute("DELETE FROM user_group_members WHERE group_id = ?", [groupId]);
  if (userIds.length === 0) return;
  const values = userIds.map(() => "(?, ?)").join(", ");
  const params = userIds.flatMap((uid) => [groupId, uid]);
  await db.execute(`INSERT INTO user_group_members (group_id, user_id) VALUES ${values}`, params);
}
