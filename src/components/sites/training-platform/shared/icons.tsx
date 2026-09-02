import { cn } from "@/lib/utils";

export function SiteLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 172 30"
      className={cn("h-7 w-auto", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="喜躍生醫影音訓練系統"
    >
      {/* original mark: a training-manual page with a folded corner + play button */}
      <path
        d="M6 1h9l6 6v18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2Z"
        fill="#38761D"
      />
      <path d="M15 1l6 6h-4a2 2 0 0 1-2-2V1Z" fill="#5C9A3A" />
      <path d="M10.5 12.5 18 17l-7.5 4.5v-9Z" fill="#fff" />
      <text x="34" y="21" fontFamily="Noto Sans JP, sans-serif" fontWeight="700" fontSize="13" fill="#1A2733">
        喜躍生醫影音訓練系統
      </text>
    </svg>
  );
}

export {
  Home as HomeIcon,
  Bookmark as BookmarkIcon,
  PlayCircle as CourseIcon,
  BookOpen as ManualIcon,
  Tag as TagIcon,
  Building2 as OrgIcon,
  BarChart3 as ReportIcon,
  HelpCircle as SupportIcon,
  Search as SearchIcon,
  Bell as BellIcon,
  CalendarCheck2 as TaskIcon,
  Languages as TranslateIcon,
  Plus as PlusIcon,
  ChevronRight as ChevronRightIcon,
  ChevronDown as ChevronDownIcon,
  Link2 as LinkIcon,
  FileX2 as EmptyStateIcon,
  Folder as FolderIcon,
  Users as UsersIcon,
  Shield as ShieldIcon,
  Download as DownloadIcon,
  ArrowUpDown as SortIcon,
  Lock as LockIcon,
  Mail as MailIcon,
  User as UserIcon,
  LogOut as LogOutIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  ClipboardList as AssignmentIcon,
  ListChecks as QuizIcon,
} from "lucide-react";
