import { NextResponse } from "next/server";
import {
  createAssignment,
  getAssignmentsForOrg,
  getAssignmentTargetContacts,
  markAssignmentEmailSent,
} from "@/lib/queries/assignments";
import { getManualById } from "@/lib/queries/manuals";
import { getCourseById } from "@/lib/queries/courses";
import { getUserGroupMembers } from "@/lib/queries/groups";
import { getUser } from "@/lib/queries/users";
import { CURRENT_ORG_ID, getCurrentUser, isEditorOrAbove } from "@/lib/current-viewer";
import { sendAssignmentEmail } from "@/lib/mail";
import type { AssignmentScope } from "@/types/models";

export async function GET() {
  const { role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可查看指派清單" }, { status: 403 });
  }
  const assignments = await getAssignmentsForOrg(CURRENT_ORG_ID);
  return NextResponse.json(assignments);
}

export async function POST(request: Request) {
  const { id: assignedBy, role } = await getCurrentUser();
  if (!isEditorOrAbove(role)) {
    return NextResponse.json({ error: "僅限編輯以上權限帳號可建立指派" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const scope: AssignmentScope = body?.scope === "course" ? "course" : "manual";
  const manualId =
    scope === "manual" && typeof body?.manualId === "number" ? body.manualId : null;
  const courseId =
    scope === "course" && typeof body?.courseId === "number" ? body.courseId : null;
  const userIds = Array.isArray(body?.userIds)
    ? body.userIds.filter((v: unknown): v is number => typeof v === "number")
    : [];
  const groupIds = Array.isArray(body?.groupIds)
    ? body.groupIds.filter((v: unknown): v is number => typeof v === "number")
    : [];
  const dueDate = typeof body?.dueDate === "string" && body.dueDate ? body.dueDate : null;
  const note = typeof body?.note === "string" && body.note.trim() ? body.note.trim() : null;

  if ((scope === "manual" && !manualId) || (scope === "course" && !courseId)) {
    return NextResponse.json({ error: "manualId/courseId is required for the given scope" }, { status: 400 });
  }

  let title: string;
  if (scope === "manual") {
    const manual = await getManualById(CURRENT_ORG_ID, manualId!);
    if (!manual) return NextResponse.json({ error: "manual not found" }, { status: 404 });
    title = manual.title;
  } else {
    const course = await getCourseById(CURRENT_ORG_ID, courseId!);
    if (!course) return NextResponse.json({ error: "course not found" }, { status: 404 });
    title = course.title;
  }

  const groupMemberLists = await Promise.all(groupIds.map((gid: number) => getUserGroupMembers(gid)));
  const resolvedUserIds = [...new Set([...userIds, ...groupMemberLists.flat()])];

  if (resolvedUserIds.length === 0) {
    return NextResponse.json({ error: "at least one target user or group is required" }, { status: 400 });
  }

  const assignmentId = await createAssignment(
    CURRENT_ORG_ID,
    { scope, manualId, courseId },
    assignedBy,
    resolvedUserIds,
    dueDate,
    note
  );

  const assigner = await getUser(assignedBy);
  const contacts = await getAssignmentTargetContacts(assignmentId);
  const failedEmails: string[] = [];
  for (const contact of contacts) {
    if (!contact.emailNotificationsEnabled) continue;
    try {
      await sendAssignmentEmail({
        to: contact.email,
        scope,
        title,
        dueDate,
        assignedByName: assigner?.name ?? "系統",
        note,
      });
      await markAssignmentEmailSent(assignmentId, contact.userId);
    } catch (err) {
      console.error(`[assignments] failed to send email to ${contact.email}:`, err);
      failedEmails.push(contact.email);
    }
  }

  return NextResponse.json({ id: assignmentId, failedEmails }, { status: 201 });
}
