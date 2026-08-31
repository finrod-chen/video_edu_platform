import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import type { TebikiTask } from "@/types/tebiki";

interface TaskRow extends RowDataPacket {
  id: number;
  title: string;
  due_date: string | null;
  done: number;
}

export async function getTasks(userId: number): Promise<TebikiTask[]> {
  const [rows] = await db.query(
    "SELECT id, title, due_date, done FROM tasks WHERE user_id = ? ORDER BY done ASC, due_date ASC",
    [userId]
  );
  return (rows as TaskRow[]).map((r) => ({
    id: String(r.id),
    title: r.title,
    dueDate: r.due_date ?? undefined,
    done: Boolean(r.done),
  }));
}
