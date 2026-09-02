export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarInitial: string;
  avatarColor: string;
  emailNotificationsEnabled: boolean;
}

/** Lighter-weight shape for target pickers (assignments, group membership) -- no need for the viewer-only email-pref field. */
export interface PickableUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarInitial: string;
  avatarColor: string;
}

export interface Org {
  name: string;
  planType: string;
}

export type ManualStatus = "published" | "draft" | "trashed";

export interface Manual {
  id: string;
  title: string;
  description?: string;
  status?: ManualStatus;
  hasBeenPublished?: boolean;
  folderId?: string | null;
  updatedBy: string;
  updatedAt: string;
  tags: string[];
}

export type CaptionStatus = "none" | "pending" | "done" | "failed";

export type ManualStepAnnotationType = "text" | "arrow" | "rect" | "blur";

export interface ManualStepAnnotation {
  id: string;
  type: ManualStepAnnotationType;
  startTime: number;
  endTime: number;
  /** All four are percentages (0-100) of the video's rendered box, so they stay correct at any player size. */
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  color?: string;
}

export interface ManualStepEditData {
  rotation?: 0 | 90 | 180 | 270;
  /** Ordered ranges (seconds) to keep; playback skips everything outside these. Empty/undefined = play the whole video. */
  trimRanges?: { start: number; end: number }[];
  /** Pause playback for `duration` seconds once playback reaches `time`. */
  freezeFrames?: { time: number; duration: number }[];
  annotations?: ManualStepAnnotation[];
}

export type StepMediaType = "video" | "image";

export interface ManualStep {
  id: string;
  manualId: string;
  position: number;
  title: string;
  mediaType: StepMediaType;
  videoPath: string | null;
  imagePath: string | null;
  thumbnailPath: string | null;
  durationSeconds: number | null;
  captionsVtt: string | null;
  captionStatus: CaptionStatus;
  editData: ManualStepEditData | null;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}

export interface Course {
  id: string;
  title: string;
  status?: ManualStatus;
  hasBeenPublished?: boolean;
}

export interface CourseManual {
  manualId: string;
  title: string;
  position: number;
}

export type AssignmentScope = "manual" | "course";

export interface Assignment {
  id: string;
  scope: AssignmentScope;
  manualId: string | null;
  manualTitle: string | null;
  courseId: string | null;
  courseTitle: string | null;
  assignedByName: string;
  dueDate: string | null;
  note: string | null;
  createdAt: string;
  targetCount: number;
  completedCount: number;
}

export interface MyAssignment {
  id: string;
  scope: AssignmentScope;
  manualId: string | null;
  manualTitle: string | null;
  courseId: string | null;
  courseTitle: string | null;
  dueDate: string | null;
  completed: boolean;
}

export type QuizScope = "manual" | "course";

export interface Quiz {
  id: string;
  scope: QuizScope;
  manualId: string | null;
  courseId: string | null;
  title: string;
  passScore: number;
  status: ManualStatus;
  hasBeenPublished: boolean;
  updatedAt: string;
}

export interface QuizChoice {
  id: string;
  label: string;
  isCorrect?: boolean;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  position: number;
  prompt: string;
  choices: QuizChoice[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  score: number;
  passed: boolean;
  submittedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  manualCount: number;
}

export interface ManualAttachment {
  id: string;
  manualId: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

export interface UserGroup {
  id: string;
  name: string;
  description: string;
}

export interface UserGroupWithMembers extends UserGroup {
  memberIds: string[];
}

export interface ReportSummary {
  manualWatchHours: number;
  courseCount: number;
  manualCount: number;
  userCount: number;
}

export interface VisitorDataPoint {
  date: string;
  visitors: number;
  watchHours: number;
}


export interface AcknowledgmentStats {
  acknowledgedCount: number;
  possibleCount: number;
  rate: number;
}

export interface QuizStats {
  attemptCount: number;
  passRate: number;
  averageScore: number;
}

export interface AssignmentStats {
  totalCount: number;
  completedCount: number;
  overdueCount: number;
}

export type NavItemKey =
  | "home"
  | "bookmarks"
  | "courses"
  | "manuals"
  | "tags"
  | "assignments"
  | "quizzes"
  | "orgSettings"
  | "orgReports";
