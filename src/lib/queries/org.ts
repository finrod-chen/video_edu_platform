import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import type { Org } from "@/types/models";

interface OrgRow extends RowDataPacket {
  name: string;
  plan_type: string;
}

export async function getOrg(orgId: number): Promise<Org | null> {
  const [rows] = await db.query("SELECT name, plan_type FROM organizations WHERE id = ?", [orgId]);
  const row = (rows as OrgRow[])[0];
  if (!row) return null;
  return {
    name: row.name,
    planType: row.plan_type,
  };
}
