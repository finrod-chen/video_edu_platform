import type { RowDataPacket } from "mysql2";
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
