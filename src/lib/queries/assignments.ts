import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { manualCompletedExpr, isCourseComplete } from "@/lib/queries/completion";
import type { Assignment, AssignmentScope, MyAssignment } from "@/types/models";

interface ManualAssignmentRow extends RowDataPacket {
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

interface CourseAssignmentRow extends RowDataPacket {
  id: number;
  course_id: number;
  course_title: string;
  assigned_by_name: string;
  due_date: string | null;
  note: string | null;
  created_at: string;
}

export async function getAssignmentsForOrg(orgId: number): Promise<Assignment[]> {
  const [manualRows] = await db.query(
    `SELECT a.id, a.manual_id, m.title AS manual_title, u.name AS assigned_by_name,
            a.due_date, a.note, a.created_at,
            COUNT(at.user_id) AS target_count,
            SUM(CASE WHEN at.user_id IS NOT NULL AND ${manualCompletedExpr("a.manual_id", "at.user_id")}
                     THEN 1 ELSE 0 END) AS completed_count
     FROM assignments a
     JOIN manuals m ON m.id = a.manual_id
     JOIN users u ON u.id = a.assigned_by
     LEFT JOIN assignment_targets at ON at.assignment_id = a.id
     WHERE a.org_id = ? AND a.scope = 'manual'
     GROUP BY a.id, a.manual_id, m.title, u.name, a.due_date, a.note, a.created_at
     ORDER BY a.created_at DESC`,
    [orgId]
  );
  const manualAssignments: Assignment[] = (manualRows as ManualAssignmentRow[]).map((r) => ({
    id: String(r.id),
    scope: "manual",
    manualId: String(r.manual_id),
    manualTitle: r.manual_title,
    courseId: null,
    courseTitle: null,
    assignedByName: r.assigned_by_name,
    dueDate: r.due_date,
    note: r.note,
    createdAt: r.created_at,
    targetCount: Number(r.target_count),
    completedCount: Number(r.completed_count),
  }));

  const [courseRows] = await db.query(
    `SELECT a.id, a.course_id, c.title AS course_title, u.name AS assigned_by_name,
            a.due_date, a.note, a.created_at
     FROM assignments a
     JOIN courses c ON c.id = a.course_id
     JOIN users u ON u.id = a.assigned_by
     WHERE a.org_id = ? AND a.scope = 'course'
     ORDER BY a.created_at DESC`,
    [orgId]
  );
  const courseAssignments: Assignment[] = await Promise.all(
    (courseRows as CourseAssignmentRow[]).map(async (r) => {
      const [targetRows] = await db.query(
        "SELECT user_id FROM assignment_targets WHERE assignment_id = ?",
        [r.id]
      );
      const targetUserIds = (targetRows as RowDataPacket[]).map((t) => t.user_id as number);
      const completions = await Promise.all(
        targetUserIds.map((uid) => isCourseComplete(r.course_id, uid))
      );
      return {
        id: String(r.id),
        scope: "course" as const,
        manualId: null,
        manualTitle: null,
        courseId: String(r.course_id),
        courseTitle: r.course_title,
        assignedByName: r.assigned_by_name,
        dueDate: r.due_date,
        note: r.note,
        createdAt: r.created_at,
        targetCount: targetUserIds.length,
        completedCount: completions.filter(Boolean).length,
      };
    })
  );

  return [...manualAssignments, ...courseAssignments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

interface MyManualAssignmentRow extends RowDataPacket {
  id: number;
  manual_id: number;
  manual_title: string;
  due_date: string | null;
  completed: number;
}

interface MyCourseAssignmentRow extends RowDataPacket {
  id: number;
  course_id: number;
  course_title: string;
  due_date: string | null;
}

export async function getAssignmentsForUser(userId: number): Promise<MyAssignment[]> {
  const [manualRows] = await db.query(
    `SELECT a.id, a.manual_id, m.title AS manual_title, a.due_date,
            ${manualCompletedExpr("a.manual_id", "at.user_id")} AS completed
     FROM assignment_targets at
     JOIN assignments a ON a.id = at.assignment_id AND a.scope = 'manual'
     JOIN manuals m ON m.id = a.manual_id
     WHERE at.user_id = ?
     ORDER BY (a.due_date IS NULL) ASC, a.due_date ASC, a.created_at DESC`,
    [userId]
  );
  const manualAssignments: MyAssignment[] = (manualRows as MyManualAssignmentRow[]).map((r) => ({
    id: String(r.id),
    scope: "manual",
    manualId: String(r.manual_id),
    manualTitle: r.manual_title,
    courseId: null,
    courseTitle: null,
    dueDate: r.due_date,
    completed: Boolean(r.completed),
  }));

  const [courseRows] = await db.query(
    `SELECT a.id, a.course_id, c.title AS course_title, a.due_date
     FROM assignment_targets at
     JOIN assignments a ON a.id = at.assignment_id AND a.scope = 'course'
     JOIN courses c ON c.id = a.course_id
     WHERE at.user_id = ?
     ORDER BY (a.due_date IS NULL) ASC, a.due_date ASC, a.created_at DESC`,
    [userId]
  );
  const courseAssignments: MyAssignment[] = await Promise.all(
    (courseRows as MyCourseAssignmentRow[]).map(async (r) => ({
      id: String(r.id),
      scope: "course" as const,
      manualId: null,
      manualTitle: null,
      courseId: String(r.course_id),
      courseTitle: r.course_title,
      dueDate: r.due_date,
      completed: await isCourseComplete(r.course_id, userId),
    }))
  );

  return [...manualAssignments, ...courseAssignments];
}

export async function createAssignment(
  orgId: number,
  target: { scope: AssignmentScope; manualId: number | null; courseId: number | null },
  assignedBy: number,
  userIds: number[],
  dueDate: string | null,
  note: string | null
): Promise<number> {
  const [result] = await db.execute(
    "INSERT INTO assignments (org_id, scope, manual_id, course_id, assigned_by, due_date, note) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [orgId, target.scope, target.manualId, target.courseId, assignedBy, dueDate, note]
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
  email_notifications_enabled: number;
}

export async function getAssignmentTargetContacts(
  assignmentId: number
): Promise<{ userId: number; email: string; name: string; emailNotificationsEnabled: boolean }[]> {
  const [rows] = await db.query(
    `SELECT u.id, u.email, u.name, u.email_notifications_enabled
     FROM assignment_targets at
     JOIN users u ON u.id = at.user_id
     WHERE at.assignment_id = ?`,
    [assignmentId]
  );
  return (rows as AssignmentTargetEmailRow[]).map((r) => ({
    userId: r.id,
    email: r.email,
    name: r.name,
    emailNotificationsEnabled: Boolean(r.email_notifications_enabled),
  }));
}
