import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { PanelLeft, PanelLeftClose, X } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./sidebar";
import { cn } from "./lib/utils";

export type AppNavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  end?: boolean;
};

export type AppNavGroup = {
  title?: string;
  items: AppNavItem[];
};

export type AppNavLinkProps = {
  to: string;
  end?: boolean;
  className?: string;
  activeClassName?: string;
  children?: React.ReactNode;
  title?: string;
  onClick?: () => void;
};

export type AppNavLink = React.ElementType;

const itemClass = (showLabels: boolean) =>
  cn(
    "flex items-center rounded-full transition-colors hover:bg-sidebar-accent",
    showLabels ? "gap-3 px-3.5 py-2.5" : "!size-8 justify-center p-2 mx-auto",
  );

const activeItemClass =
  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground font-semibold shadow-sm";

function AppNavMenuItem({
  item,
  showLabels,
  link: Link,
  onNavigate,
}: {
  item: AppNavItem;
  showLabels: boolean;
  link: AppNavLink;
  onNavigate?: () => void;
}) {
  return (
    <SidebarMenuItem className={showLabels ? undefined : "flex justify-center"}>
      <SidebarMenuButton asChild tooltip={item.title}>
        <Link
          to={item.url}
          end={item.end}
          title={item.title}
          onClick={onNavigate}
          className={itemClass(showLabels)}
          activeClassName={activeItemClass}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {showLabels && <span className="text-sm">{item.title}</span>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function AppNavCollapseItem({ showLabels }: { showLabels: boolean }) {
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

export function AppNavSidebar({
  header,
  groups,
  bottomItems = [],
  footer,
  link,
}: {
  header: React.ReactNode;
  groups: AppNavGroup[];
  bottomItems?: AppNavItem[];
  footer?: React.ReactNode;
  link: AppNavLink;
}) {
  const { open, isMobile, setOpenMobile } = useSidebar();
  const showLabels = open || isMobile;
  const visibleGroups = groups.filter((group) => group.items.length > 0);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarContent>
        <SidebarHeader
          className={cn(
            "flex h-16 shrink-0 flex-row items-center p-0",
            showLabels ? "px-2" : "px-1",
          )}
        >
          {header}
        </SidebarHeader>

        {visibleGroups.map((group, index) => (
          <div key={group.title ?? `group-${index}`}>
            {group.title ? (
              showLabels ? (
                <p className="px-5 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </p>
              ) : (
                <div className="mx-2 my-2 border-t border-sidebar-border" />
              )
            ) : null}
            <SidebarMenu className={cn("space-y-1", showLabels ? "px-2" : "items-center px-0")}>
              {group.items.map((item) => (
                <AppNavMenuItem
                  key={`${item.title}-${item.url}`}
                  item={item}
                  showLabels={showLabels}
                  link={link}
                  onNavigate={() => {
                    if (isMobile) setOpenMobile(false);
                  }}
                />
              ))}
            </SidebarMenu>
          </div>
        ))}

        <div className="mt-auto border-t border-sidebar-border pt-2">
          <SidebarMenu className={cn("space-y-1 pb-3", showLabels ? "px-2" : "items-center px-0")}>
            {bottomItems.map((item) => (
              <AppNavMenuItem
                key={`${item.title}-${item.url}`}
                item={item}
                showLabels={showLabels}
                link={link}
                onNavigate={() => {
                  if (isMobile) setOpenMobile(false);
                }}
              />
            ))}
            <AppNavCollapseItem showLabels={showLabels} />
          </SidebarMenu>
          {footer}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export function useAppNavLabels() {
  const { open, isMobile } = useSidebar();
  return open || isMobile;
}
