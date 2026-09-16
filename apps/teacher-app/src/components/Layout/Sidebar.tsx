import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  MessageSquare,
  BarChart3,
  Calendar,
  FileText,
  Users,
  UserPlus,
  BookMarked,
  Wallet,
  Building2,
  Shield,
  Calculator,
  Banknote,
  Sparkles,
  ClipboardCheck,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { AppNavSidebar, type AppNavGroup, useAppNavLabels } from "@nudle/ui/app-nav";
import { useMe } from "@/hooks/useTeacherData";
import { cn } from "@/lib/utils";
import klevaMark from "@/assets/kleva-mark.svg";

const teacherItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, end: true },
  { title: "Courses", url: "/courses", icon: BookOpen },
  { title: "Grading", url: "/grading", icon: GraduationCap },
  { title: "Attendance", url: "/attendance", icon: Calendar },
  { title: "Report Cards", url: "/report-cards", icon: FileText },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const adminGroups: AppNavGroup[] = [
  {
    title: "People",
    items: [
      { title: "Teachers & Staff", url: "/school/staff", icon: GraduationCap },
      { title: "Students", url: "/school/students", icon: Users },
      { title: "Admissions", url: "/school/admissions", icon: UserPlus },
    ],
  },
  {
    title: "Learning",
    items: [
      { title: "Academics", url: "/school/academics", icon: BookMarked },
      { title: "Attendance", url: "/school/attendance", icon: ClipboardCheck },
    ],
  },
  {
    title: "Money",
    items: [
      { title: "Fees & Finance", url: "/school/fees", icon: Wallet },
      { title: "Accounting", url: "/school/accounting", icon: Calculator },
      { title: "Payroll", url: "/school/payroll", icon: Banknote },
    ],
  },
  {
    title: "School life",
    items: [
      { title: "Inbox", url: "/inbox", icon: MessageSquare },
      { title: "Reports", url: "/school/reports", icon: FileText },
      { title: "Kleva Intelligence", url: "/school/intelligence", icon: Sparkles },
    ],
  },
  {
    title: "Administration",
    items: [
      { title: "Schools", url: "/school/schools", icon: Building2 },
      { title: "Admins", url: "/school/admins", icon: Shield },
    ],
  },
];

function BrandHeader() {
  const showLabels = useAppNavLabels();
  const { data: me } = useMe();
  const isSchoolAdmin = me?.roles?.includes("school_admin") ?? false;

  return (
    <div
      className={cn(
        "flex w-full items-center gap-2 rounded-xl px-2 py-1.5",
        !showLabels && "justify-center px-0",
      )}
    >
      <img src={klevaMark} alt="Kleva" className="h-8 w-8 shrink-0" />
      {showLabels && (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight tracking-tight">Kleva</p>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {isSchoolAdmin ? "School Administrator" : "Teacher"}
          </p>
        </div>
      )}
    </div>
  );
}

export const Sidebar = () => {
  const { data: me } = useMe();
  const isSchoolAdmin = me?.roles?.includes("school_admin") ?? false;
  const isTeacher = me?.roles?.includes("teacher") ?? false;
  const showTeacherNav = isTeacher || !isSchoolAdmin;

  const groups: AppNavGroup[] = [];

  if (showTeacherNav) {
    groups.push({
      title: isSchoolAdmin ? "Teaching" : undefined,
      items: isSchoolAdmin
        ? teacherItems
        : [...teacherItems, { title: "Inbox", url: "/inbox", icon: MessageSquare }],
    });
  }

  if (isSchoolAdmin) {
    groups.push({
      items: [{ title: "Dashboard", url: "/school", icon: LayoutDashboard, end: true }],
    });
    groups.push(...adminGroups);
  }

  return <AppNavSidebar header={<BrandHeader />} groups={groups} link={NavLink} />;
};
