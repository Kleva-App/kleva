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
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { AccountSwitcher } from "@/components/AccountSwitcher";
import { AppNavSidebar, type AppNavGroup, type AppNavItem } from "@nudle/ui/app-nav";
import { useFamily } from "@/contexts/FamilyContext";

const schoolItems: AppNavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, end: true },
  { title: "My Courses", url: "/courses", icon: GraduationCap },
  { title: "Assignments", url: "/assignments", icon: ClipboardList },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Subjects", url: "/subjects", icon: BookOpen },
  { title: "Report Card", url: "/report-card", icon: FileText },
  { title: "AI Insights", url: "/insights", icon: TrendingUp },
];

const financeItems: AppNavItem[] = [
  { title: "Finance Home", url: "/finance/home", icon: Wallet },
  { title: "Marketplace", url: "/finance/marketplace", icon: Store },
  { title: "Pay fees", url: "/finance/pay", icon: CreditCard },
  { title: "Utilities", url: "/finance/utilities", icon: Zap },
  { title: "Apply", url: "/finance/apply", icon: FilePlus },
  { title: "My Applications", url: "/finance/applications", icon: FolderOpen },
];

export function AppSidebar() {
  const { isParent, isOrganization, canFinance, children, loading } = useFamily();
  const showSchoolNav = (!isParent && !isOrganization) || loading || children.length > 0;
  const applyUrl = isOrganization ? "/finance/school" : "/finance/apply";

  const financeNav = financeItems.map((item) =>
    item.title === "Apply" ? { ...item, url: applyUrl } : item,
  );

  const groups: AppNavGroup[] = [
    { items: [{ title: "Inbox", url: "/inbox", icon: MessageSquare }] },
  ];
  if (showSchoolNav) groups.push({ items: schoolItems });
  if (canFinance) groups.push({ title: "Finance", items: financeNav });

  const bottomItems: AppNavItem[] = isParent
    ? [
        { title: "Family", url: "/family", icon: Users },
        { title: "Notices", url: "/notices", icon: Bell },
      ]
    : [{ title: "Notices", url: "/notices", icon: Bell }];

  return (
    <AppNavSidebar
      header={<AccountSwitcher />}
      groups={groups}
      bottomItems={bottomItems}
      link={NavLink}
    />
  );
}
