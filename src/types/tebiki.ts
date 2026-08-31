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

export interface TebikiManual {
  id: string;
  title: string;
  updatedBy: string;
  updatedAt: string;
  tags: string[];
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
