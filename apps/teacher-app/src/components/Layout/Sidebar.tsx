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
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
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
  onToggleCollapse: () => void;
}

function NavItem({
  item,
  onMobileClose,
  adminStyle,
  showLabels,
}: {
  item: { icon: typeof LayoutDashboard; label: string; path: string };
  onMobileClose: () => void;
  adminStyle?: boolean;
  showLabels: boolean;
}) {
  return (
    <NavLink
      to={item.path}
      end={item.path === "/" || item.path === "/school"}
      onClick={onMobileClose}
      title={item.label}
      className={cn(
        "flex items-center rounded-full transition-colors",
        showLabels ? "gap-3 px-3.5 py-2.5" : "justify-center size-10 mx-auto",
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
      <item.icon className="h-4 w-4 shrink-0" />
      {showLabels && <span className="text-sm">{item.label}</span>}
    </NavLink>
  );
}

export const Sidebar = ({
  isOpen,
  mobileOpen,
  onMobileClose,
  onToggleCollapse,
}: SidebarProps) => {
  const { data: me } = useMe();
  const { activeSchool } = useSchool();
  const isSchoolAdmin = me?.roles?.includes("school_admin") ?? false;
  const isTeacher = me?.roles?.includes("teacher") ?? false;
  const showTeacherNav = isTeacher || !isSchoolAdmin;
  // Icon rail on desktop when collapsed; mobile drawer always shows labels
  const showLabels = isOpen || mobileOpen;

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onMobileClose} />
      )}

      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-200",
          // Mobile: full-width drawer
          "w-64",
          !mobileOpen && "-translate-x-full lg:translate-x-0",
          mobileOpen && "translate-x-0",
          // Desktop: expand vs icon rail
          isOpen ? "lg:w-64" : "lg:w-16",
        )}
      >
        <div className={cn("flex items-center", showLabels ? "p-5 gap-2.5" : "justify-center p-3")}>
          <img src={klevaMark} alt="Kleva" className="h-8 w-8 shrink-0" />
          {showLabels && (
            <div className="min-w-0">
              <p className="text-sm font-semibold tracking-tight">Kleva</p>
              <p className="text-xs text-muted-foreground">
                {isSchoolAdmin ? "School Administrator" : "Teacher"}
              </p>
            </div>
          )}
        </div>

        <nav
          className={cn(
            "flex-1 overflow-y-auto pb-4 space-y-4",
            showLabels ? "px-3" : "px-2",
          )}
        >
          {showTeacherNav && (
            <div className="space-y-1">
              {isSchoolAdmin && showLabels && (
                <p className="px-3.5 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Teaching
                </p>
              )}
              {teacherItems.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  onMobileClose={onMobileClose}
                  showLabels={showLabels}
                />
              ))}
            </div>
          )}

          {isSchoolAdmin && (
            <>
              <div className="space-y-1">
                <NavItem
                  item={{ icon: LayoutDashboard, label: "Dashboard", path: "/school" }}
                  onMobileClose={onMobileClose}
                  adminStyle
                  showLabels={showLabels}
                />
              </div>
              {adminGroups.map((group) => (
                <div key={group.title} className="space-y-1">
                  {showLabels ? (
                    <p className="px-3.5 pt-1 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.title}
                    </p>
                  ) : (
                    <div className="mx-2 my-1 border-t border-sidebar-border" />
                  )}
                  {group.items.map((item) => (
                    <NavItem
                      key={item.path}
                      item={item}
                      onMobileClose={onMobileClose}
                      adminStyle
                      showLabels={showLabels}
                    />
                  ))}
                </div>
              ))}
            </>
          )}
        </nav>

        <div
          className={cn(
            "mt-auto border-t border-sidebar-border space-y-1",
            showLabels ? "p-3" : "p-2",
          )}
        >
          <button
            type="button"
            onClick={() => {
              if (mobileOpen) onMobileClose();
              else onToggleCollapse();
            }}
            title={mobileOpen ? "Close" : isOpen ? "Collapse" : "Expand"}
            className={cn(
              "flex items-center rounded-full text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
              showLabels ? "w-full gap-3 px-3.5 py-2.5" : "justify-center size-10 mx-auto",
            )}
            aria-label={mobileOpen ? "Close" : isOpen ? "Collapse" : "Expand"}
          >
            {mobileOpen ? (
              <X className="h-4 w-4 shrink-0" />
            ) : isOpen ? (
              <PanelLeftClose className="h-4 w-4 shrink-0" />
            ) : (
              <PanelLeft className="h-4 w-4 shrink-0" />
            )}
            {showLabels && (
              <span className="text-sm">
                {mobileOpen ? "Close" : isOpen ? "Collapse" : "Expand"}
              </span>
            )}
          </button>
          <div className={cn(!showLabels && "flex justify-center")}>
            <ProfileMenu
              variant={showLabels ? "sidebar" : "avatar"}
              align="start"
              side="top"
              subtitle={
                isSchoolAdmin
                  ? activeSchool?.name || "No school selected"
                  : undefined
              }
            />
          </div>
        </div>
      </aside>
    </>
  );
};
