import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { manualCompletedExpr } from "@/lib/queries/completion";
import type { Assignment, MyAssignment } from "@/types/models";

interface AssignmentRow extends RowDataPacket {
  id: number;
  manual_id: number;
  manual_title: string;
  assigned_by_name: string;
  due_date: string | null;
  note: string | null;
  created_at: string;
  target_count: number;
  completed_count: number;
}

export async function getAssignmentsForOrg(orgId: number): Promise<Assignment[]> {
  const [rows] = await db.query(
    `SELECT a.id, a.manual_id, m.title AS manual_title, u.name AS assigned_by_name,
            a.due_date, a.note, a.created_at,
            COUNT(at.user_id) AS target_count,
            SUM(CASE WHEN at.user_id IS NOT NULL AND ${manualCompletedExpr("a.manual_id", "at.user_id")}
                     THEN 1 ELSE 0 END) AS completed_count
     FROM assignments a
     JOIN manuals m ON m.id = a.manual_id
     JOIN users u ON u.id = a.assigned_by
     LEFT JOIN assignment_targets at ON at.assignment_id = a.id
     WHERE a.org_id = ?
     GROUP BY a.id, a.manual_id, m.title, u.name, a.due_date, a.note, a.created_at
     ORDER BY a.created_at DESC`,
    [orgId]
  );
  return (rows as AssignmentRow[]).map((r) => ({
    id: String(r.id),
    manualId: String(r.manual_id),
    manualTitle: r.manual_title,
    assignedByName: r.assigned_by_name,
    dueDate: r.due_date,
    note: r.note,
    createdAt: r.created_at,
    targetCount: Number(r.target_count),
    completedCount: Number(r.completed_count),
  }));
}

interface MyAssignmentRow extends RowDataPacket {
  id: number;
  manual_id: number;
  manual_title: string;
  due_date: string | null;
  completed: number;
}

export async function getAssignmentsForUser(userId: number): Promise<MyAssignment[]> {
  const [rows] = await db.query(
    `SELECT a.id, a.manual_id, m.title AS manual_title, a.due_date,
            ${manualCompletedExpr("a.manual_id", "at.user_id")} AS completed
     FROM assignment_targets at
     JOIN assignments a ON a.id = at.assignment_id
     JOIN manuals m ON m.id = a.manual_id
     WHERE at.user_id = ?
     ORDER BY (a.due_date IS NULL) ASC, a.due_date ASC, a.created_at DESC`,
    [userId]
  );
  return (rows as MyAssignmentRow[]).map((r) => ({
    id: String(r.id),
    manualId: String(r.manual_id),
    manualTitle: r.manual_title,
    dueDate: r.due_date,
    completed: Boolean(r.completed),
  }));
}

export async function createAssignment(
  orgId: number,
  manualId: number,
  assignedBy: number,
  userIds: number[],
  dueDate: string | null,
  note: string | null
): Promise<number> {
  const [result] = await db.execute(
    "INSERT INTO assignments (org_id, manual_id, assigned_by, due_date, note) VALUES (?, ?, ?, ?, ?)",
    [orgId, manualId, assignedBy, dueDate, note]
  );
  const assignmentId = (result as ResultSetHeader).insertId;

  if (userIds.length > 0) {
    const values = userIds.map(() => "(?, ?)").join(", ");
    const params = userIds.flatMap((uid) => [assignmentId, uid]);
    await db.execute(
      `INSERT IGNORE INTO assignment_targets (assignment_id, user_id) VALUES ${values}`,
      params
    );
  }

  return assignmentId;
}

export async function markAssignmentEmailSent(assignmentId: number, userId: number): Promise<void> {
  await db.execute(
    "UPDATE assignment_targets SET email_sent_at = CURRENT_TIMESTAMP WHERE assignment_id = ? AND user_id = ?",
    [assignmentId, userId]
  );
}

interface AssignmentTargetEmailRow extends RowDataPacket {
  id: number;
  email: string;
  name: string;
}

export async function getAssignmentTargetContacts(
  assignmentId: number
): Promise<{ userId: number; email: string; name: string }[]> {
  const [rows] = await db.query(
    `SELECT u.id, u.email, u.name
     FROM assignment_targets at
     JOIN users u ON u.id = at.user_id
     WHERE at.assignment_id = ?`,
    [assignmentId]
  );
  return (rows as AssignmentTargetEmailRow[]).map((r) => ({
    userId: r.id,
    email: r.email,
    name: r.name,
  }));
}
