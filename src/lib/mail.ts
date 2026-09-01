import nodemailer from "nodemailer";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;
  const user = process.env.GMAIL_SMTP_USER;
  const pass = process.env.GMAIL_SMTP_PASSWORD;
  if (!user || !pass) {
    throw new Error("GMAIL_SMTP_USER / GMAIL_SMTP_PASSWORD not configured");
  }
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user, pass },
  });
  return transporter;
}

export interface AssignmentEmailParams {
  to: string;
  manualTitle: string;
  dueDate: string | null;
  assignedByName: string;
  note: string | null;
}

/**
 * Best-effort send -- callers should catch and log rather than fail the
 * whole assignment-creation request if Gmail SMTP env vars are missing
 * or the send fails (there is no retry/queue infrastructure in this app).
 */
export async function sendAssignmentEmail({
  to,
  manualTitle,
  dueDate,
  assignedByName,
  note,
}: AssignmentEmailParams): Promise<void> {
  const baseUrl = process.env.AUTH_URL ?? "";
  const link = `${baseUrl}/manuals`;
  const dueLine = dueDate ? `期限：${dueDate}` : "期限：無";
  const noteLine = note ? `\n備註：${note}` : "";

  await getTransporter().sendMail({
    from: process.env.GMAIL_SMTP_FROM || process.env.GMAIL_SMTP_USER,
    to,
    subject: `[喜躍生醫影音訓練系統] 新指派：${manualTitle}`,
    text: `${assignedByName} 指派您研讀手冊「${manualTitle}」。\n${dueLine}${noteLine}\n\n請至系統完成學習：${link}`,
  });
}
