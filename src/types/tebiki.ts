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
  updatedBy: string;
  updatedAt: string;
  tags: string[];
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
}

export interface TebikiCourseFolder {
  id: string;
  name: string;
  parentId: string | null;
}

export interface TebikiCourse {
  id: string;
  title: string;
  folderId: string | null;
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

export type NavItemKey =
  | "home"
  | "bookmarks"
  | "courses"
  | "manuals"
  | "tags"
  | "orgSettings"
  | "orgReports";
