import { cn } from "@/lib/utils";

export function TebikiLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 91 28"
      className={cn("h-7 w-auto", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="tebiki"
    >
      {/* simplified page/bookmark mark — brand color only, not a traced original asset */}
      <path
        d="M3 2.5A2.5 2.5 0 0 1 5.5 0h9A2.5 2.5 0 0 1 17 2.5v21.36a1.2 1.2 0 0 1-1.87 1L10 20.8l-5.13 3.97a1.2 1.2 0 0 1-1.87-1V2.5Z"
        fill="#1A8CFF"
      />
      <path d="M9.3 7.2 13 10l-3.7 2.8V7.2Z" fill="#fff" />
      <text x="24" y="20" fontFamily="Noto Sans JP, sans-serif" fontWeight="700" fontSize="17" fill="#1A2733">
        tebiki
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
} from "lucide-react";
