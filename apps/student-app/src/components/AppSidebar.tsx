import {
  LayoutDashboard,
  ClipboardList,
  BookOpen,
  TrendingUp,
  Bell,
  Calendar,
  GraduationCap,
  FileText,
  MessageSquare,
  Wallet,
  Store,
  CreditCard,
  Zap,
  FilePlus,
  FolderOpen,
  Users,
  PanelLeft,
  PanelLeftClose,
  X,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { AccountSwitcher } from "@/components/AccountSwitcher";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@nudle/ui/sidebar";
import { useFamily } from "@/contexts/FamilyContext";
import { cn } from "@/lib/utils";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "My Courses", url: "/courses", icon: GraduationCap },
  { title: "Assignments", url: "/assignments", icon: ClipboardList },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Subjects", url: "/subjects", icon: BookOpen },
  { title: "Report Card", url: "/report-card", icon: FileText },
  { title: "Inbox", url: "/inbox", icon: MessageSquare },
  { title: "AI Insights", url: "/insights", icon: TrendingUp },
];

const financeItems = [
  { title: "Finance Home", url: "/finance/home", icon: Wallet },
  { title: "Marketplace", url: "/finance/marketplace", icon: Store },
  { title: "Pay fees", url: "/finance/pay", icon: CreditCard },
  { title: "Utilities", url: "/finance/utilities", icon: Zap },
  { title: "Apply", url: "/finance/apply", icon: FilePlus },
  { title: "My Applications", url: "/finance/applications", icon: FolderOpen },
];

export function AppSidebar() {
  const { open, isMobile } = useSidebar();
  const { isParent, isInstitution, canFinance, children, loading } = useFamily();
  const showLabels = open || isMobile;
  const showSchoolNav = (!isParent && !isInstitution) || loading || children.length > 0;
  const applyUrl = isInstitution ? "/finance/school" : "/finance/apply";

  const financeNav = financeItems.map((item) =>
    item.title === "Apply" ? { ...item, url: applyUrl } : item,
  );

  const secondaryItems = isParent
    ? [
        { title: "Family", url: "/family", icon: Users },
        { title: "Notices", url: "/notices", icon: Bell },
      ]
    : [{ title: "Notices", url: "/notices", icon: Bell }];

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarContent>
        <SidebarHeader
          className={cn(
            "flex h-16 shrink-0 flex-row items-center p-0",
            showLabels ? "px-2" : "px-1",
          )}
        >
          <AccountSwitcher />
        </SidebarHeader>

        {showSchoolNav && (
          <SidebarMenu className={cn("space-y-1", showLabels ? "px-2" : "items-center px-0")}>
            {mainItems.map((item) => (
              <SidebarItem key={item.title} item={item} showLabels={showLabels} end={item.url === "/"} />
            ))}
          </SidebarMenu>
        )}

        {canFinance && (
          <>
            {showLabels ? (
              <p className="px-5 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Finance
              </p>
            ) : (
              <div className="mx-2 my-2 border-t border-sidebar-border" />
            )}
            <SidebarMenu className={cn("space-y-1", showLabels ? "px-2" : "items-center px-0")}>
              {financeNav.map((item) => (
                <SidebarItem key={item.title} item={item} showLabels={showLabels} />
              ))}
            </SidebarMenu>
          </>
        )}

        <div className="mt-auto border-t border-sidebar-border pt-2">
          <SidebarMenu className={cn("space-y-1 pb-3", showLabels ? "px-2" : "items-center px-0")}>
            {secondaryItems.map((item) => (
              <SidebarItem key={item.title} item={item} showLabels={showLabels} />
            ))}
            <SidebarCollapseItem showLabels={showLabels} />
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

function SidebarCollapseItem({ showLabels }: { showLabels: boolean }) {
  const { open, isMobile, toggleSidebar } = useSidebar();
  const Icon = isMobile ? X : open ? PanelLeftClose : PanelLeft;
  const label = isMobile ? "Close" : open ? "Collapse" : "Expand";

  return (
    <SidebarMenuItem className={showLabels ? undefined : "flex justify-center"}>
      <SidebarMenuButton
        tooltip={label}
        onClick={toggleSidebar}
        aria-label={label}
        className={cn("rounded-full", showLabels ? "px-3.5 py-2.5" : "!size-8 justify-center p-2 mx-auto")}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {showLabels && <span className="text-sm">{label}</span>}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SidebarItem({
  item,
  showLabels,
  end,
}: {
  item: { title: string; url: string; icon: typeof LayoutDashboard };
  showLabels: boolean;
  end?: boolean;
}) {
  return (
    <SidebarMenuItem className={showLabels ? undefined : "flex justify-center"}>
      <SidebarMenuButton asChild tooltip={item.title}>
        <NavLink
          to={item.url}
          end={end}
          className={cn(
            "flex items-center rounded-full transition-colors hover:bg-sidebar-accent",
            showLabels ? "gap-3 px-3.5 py-2.5" : "!size-8 justify-center p-2 mx-auto",
          )}
          activeClassName="bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-semibold shadow-sm"
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {showLabels && <span className="text-sm">{item.title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
