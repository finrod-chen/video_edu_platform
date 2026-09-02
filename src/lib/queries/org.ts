import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import type { Org } from "@/types/models";

interface OrgRow extends RowDataPacket {
  name: string;
  plan_type: string;
  video_quality: string;
  translation_language: string;
}

export async function getOrg(orgId: number): Promise<Org | null> {
  const [rows] = await db.query(
    "SELECT name, plan_type, video_quality, translation_language FROM organizations WHERE id = ?",
    [orgId]
  );
  const row = (rows as OrgRow[])[0];
  if (!row) return null;
  return {
    name: row.name,
    planType: row.plan_type,
    videoQuality: row.video_quality,
    translationLanguage: row.translation_language,
  };
}
