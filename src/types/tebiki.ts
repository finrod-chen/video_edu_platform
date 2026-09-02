export interface TebikiUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarInitial: string;
  avatarColor: string;
}

export interface TebikiOrg {
  name: string;
  planType: string;
  videoQuality: string;
  translationLanguage: string;
}

export type ManualStatus = "published" | "draft" | "trashed";

export interface TebikiManual {
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

export interface TebikiManualStep {
  id: string;
  manualId: string;
  position: number;
  title: string;
  videoPath: string | null;
  thumbnailPath: string | null;
  durationSeconds: number | null;
  captionsVtt: string | null;
  captionStatus: CaptionStatus;
  editData: ManualStepEditData | null;
}

export interface TebikiFolder {
  id: string;
  name: string;
  parentId: string | null;
}

export interface TebikiCourse {
  id: string;
  title: string;
  status?: ManualStatus;
  hasBeenPublished?: boolean;
}

export interface TebikiCourseManual {
  manualId: string;
  title: string;
  position: number;
}

export interface TebikiTask {
  id: string;
  title: string;
  dueDate?: string;
  done: boolean;
}

export interface TebikiAssignment {
  id: string;
  manualId: string;
  manualTitle: string;
  assignedByName: string;
  dueDate: string | null;
  note: string | null;
  createdAt: string;
  targetCount: number;
  completedCount: number;
}

export interface TebikiMyAssignment {
  id: string;
  manualId: string;
  manualTitle: string;
  dueDate: string | null;
  completed: boolean;
}

export type QuizScope = "manual" | "course";

export interface TebikiQuiz {
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

export interface TebikiQuizChoice {
  id: string;
  label: string;
  isCorrect?: boolean;
}

export interface TebikiQuizQuestion {
  id: string;
  quizId: string;
  position: number;
  prompt: string;
  choices: TebikiQuizChoice[];
}

export interface TebikiQuizAttempt {
  id: string;
  quizId: string;
  score: number;
  passed: boolean;
  submittedAt: string;
}

export interface TebikiTag {
  id: string;
  name: string;
  manualCount: number;
}

export interface TebikiUserGroup {
  id: string;
  name: string;
  description: string;
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

export interface RankingEntry {
  id: string;
  label: string;
  value: number;
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
