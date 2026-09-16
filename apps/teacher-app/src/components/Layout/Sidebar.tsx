import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  MessageSquare,
  BarChart3,
  Calendar,
  FileText,
  X,
  Users,
  UserRound,
  UserPlus,
  BookMarked,
  Wallet,
  MessagesSquare,
  Building2,
  Shield,
  Calculator,
  Banknote,
  Sparkles,
  ClipboardCheck,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { Button } from "@nudle/ui/button";
import { ProfileMenu } from "@/components/Layout/ProfileMenu";
import { useMe } from "@/hooks/useTeacherData";
import { useSchool } from "@/contexts/SchoolContext";
import klevaMark from "@/assets/kleva-mark.svg";

const teacherItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: BookOpen, label: "Courses", path: "/courses" },
  { icon: GraduationCap, label: "Grading", path: "/grading" },
  { icon: Calendar, label: "Attendance", path: "/attendance" },
  { icon: FileText, label: "Report Cards", path: "/report-cards" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: MessageSquare, label: "Messages", path: "/messages" },
];

/** Matches source/school admin ref information architecture */
const adminGroups: {
  title: string;
  items: { icon: typeof LayoutDashboard; label: string; path: string }[];
}[] = [
  {
    title: "People",
    items: [
      { icon: GraduationCap, label: "Teachers & Staff", path: "/school/staff" },
      { icon: Users, label: "Students", path: "/school/students" },
      { icon: UserPlus, label: "Admissions", path: "/school/admissions" },
    ],
  },
  {
    title: "Learning",
    items: [
      { icon: BookMarked, label: "Academics", path: "/school/academics" },
      { icon: ClipboardCheck, label: "Attendance", path: "/school/attendance" },
    ],
  },
  {
    title: "Money",
    items: [
      { icon: Wallet, label: "Fees & Finance", path: "/school/fees" },
      { icon: Calculator, label: "Accounting", path: "/school/accounting" },
      { icon: Banknote, label: "Payroll", path: "/school/payroll" },
    ],
  },
  {
    title: "School life",
    items: [
      { icon: MessagesSquare, label: "Communication", path: "/hub" },
      { icon: FileText, label: "Reports", path: "/school/reports" },
      { icon: Sparkles, label: "Kleva Intelligence", path: "/school/intelligence" },
    ],
  },
  {
    title: "Administration",
    items: [
      { icon: Building2, label: "Schools", path: "/school/schools" },
      { icon: Shield, label: "Admins", path: "/school/admins" },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function NavItem({
  item,
  onMobileClose,
  adminStyle,
}: {
  item: { icon: typeof LayoutDashboard; label: string; path: string };
  onMobileClose: () => void;
  adminStyle?: boolean;
}) {
  return (
    <NavLink
      to={item.path}
      end={item.path === "/" || item.path === "/school"}
      onClick={onMobileClose}
      className={cn(
        "flex items-center gap-3 px-3.5 py-2.5 rounded-full transition-colors",
        adminStyle
          ? "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
      activeClassName={
        adminStyle
          ? "bg-white text-black hover:bg-white hover:text-black font-semibold shadow-sm"
          : "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-semibold shadow-sm"
      }
    >
      <item.icon className="h-4 w-4" />
      <span className="text-sm">{item.label}</span>
    </NavLink>
  );
}

export const Sidebar = ({ isOpen, mobileOpen, onMobileClose }: SidebarProps) => {
  const { data: me } = useMe();
  const { activeSchool } = useSchool();
  const isSchoolAdmin = me?.roles?.includes("school_admin") ?? false;
  const isTeacher = me?.roles?.includes("teacher") ?? false;
  const showTeacherNav = isTeacher || !isSchoolAdmin;
  const name = me?.profile?.full_name || me?.email || "Educator";

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onMobileClose} />
      )}

      <aside
        className={cn(
          "w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-200",
          !mobileOpen && "-translate-x-full lg:translate-x-0",
          mobileOpen && "translate-x-0",
          !isOpen && "lg:-translate-x-full",
        )}
      >
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={klevaMark} alt="Kleva" className="h-8 w-8 shrink-0" />
            <div>
              <p className="text-sm font-semibold tracking-tight">Kleva</p>
              <p className="text-xs text-muted-foreground">
                {isSchoolAdmin ? "School Administrator" : "Teacher"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onMobileClose} className="lg:hidden rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 px-3 space-y-4 overflow-y-auto pb-4">
          {showTeacherNav && (
            <div className="space-y-1">
              {isSchoolAdmin && (
                <p className="px-3.5 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Teaching
                </p>
              )}
              {teacherItems.map((item) => (
                <NavItem key={item.path} item={item} onMobileClose={onMobileClose} />
              ))}
            </div>
          )}

          {isSchoolAdmin &&
            adminGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <p className="px-3.5 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </p>
                {group.items.map((item) => (
                  <NavItem
                    key={item.path}
                    item={item}
                    onMobileClose={onMobileClose}
                    adminStyle
                  />
                ))}
              </div>
            ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-2">
          {isSchoolAdmin && (
            <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-muted/50">
              <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0">
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{name}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {activeSchool?.name || "No school selected"}
                </p>
              </div>
            </div>
          )}
          <ProfileMenu variant="sidebar" align="start" side="top" />
        </div>
      </aside>
    </>
  );
};
