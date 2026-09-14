import { Check, ChevronsUpDown, UserPlus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@nudle/ui/dropdown-menu";
import { useSidebar } from "@nudle/ui/sidebar";
import { useFamily } from "@/contexts/FamilyContext";
import { useMe, type LinkedChild } from "@/hooks/use-me";
import { dummySchoolForId, type DummySchool } from "@/lib/dummy-schools";
import { cn } from "@/lib/utils";

function SchoolMark({
  school,
  className,
}: {
  school: DummySchool;
  className?: string;
}) {
  return (
    <img
      src={school.logo}
      alt=""
      title={`${school.name}, ${school.city}`}
      className={cn("size-8 shrink-0", className)}
    />
  );
}

export function AccountSwitcher({ className }: { className?: string }) {
  const navigate = useNavigate();
  const { isParent, isInstitution, children, activeChild, setActiveChild } = useFamily();
  const { data: me } = useMe();
  const { open, isMobile, setOpenMobile } = useSidebar();
  const showLabels = open || isMobile;

  const school = dummySchoolForId(isParent ? activeChild?.id : me?.id);
  const parentName = me?.profile?.full_name || me?.email || (isInstitution ? "Institution" : "Parent");
  const title = isInstitution
    ? me?.profile?.full_name || "Institution"
    : isParent
      ? (activeChild?.name ?? "Select a student")
      : me?.profile?.full_name || "Student";
  const subtitle = isInstitution
    ? "Institution account"
    : isParent && !activeChild
      ? children.length
        ? "Choose a student"
        : "No students linked"
      : `${school.name} · ${school.city}`;

  const go = (path: string) => {
    if (isMobile) setOpenMobile(false);
    navigate(path);
  };

  const triggerInner = (
    <>
      <SchoolMark school={school} />
      {showLabels && (
        <>
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-sm font-semibold leading-tight tracking-tight">
              {title}
            </span>
            <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
              {subtitle}
            </span>
          </span>
          {isParent && <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
        </>
      )}
    </>
  );

  const triggerClass = cn(
    "flex min-w-0 items-center rounded-lg outline-none transition-colors",
    "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
    showLabels ? "w-full gap-2.5 px-1.5 py-1.5" : "size-10 justify-center",
    isParent && "cursor-pointer hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent",
    className,
  );

  if (!isParent) {
    return <div className={triggerClass}>{triggerInner}</div>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label="Switch student" className={triggerClass}>
          {triggerInner}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side={showLabels ? "bottom" : "right"}
        sideOffset={8}
        className="w-72 rounded-xl p-1.5"
      >
        <DropdownMenuLabel className="px-2 py-1.5 font-normal">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Signed in as
          </p>
          <p className="mt-1 truncate text-sm font-medium">{parentName}</p>
          {me?.email ? (
            <p className="truncate text-xs text-muted-foreground">{me.email}</p>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Students
        </DropdownMenuLabel>
        {children.length === 0 ? (
          <div className="px-2 py-3">
            <p className="text-sm font-medium">No students yet</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Invite a student to switch into their school portal.
            </p>
          </div>
        ) : (
          children.map((child) => (
            <StudentItem
              key={child.id}
              child={child}
              active={activeChild?.id === child.id}
              onSelect={() => setActiveChild(child.id)}
            />
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg" onClick={() => go("/family")}>
          <UserPlus className="h-4 w-4" />
          Invite student
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg" onClick={() => go("/family")}>
          <Users className="h-4 w-4" />
          Manage family
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StudentItem({
  child,
  active,
  onSelect,
}: {
  child: LinkedChild;
  active: boolean;
  onSelect: () => void;
}) {
  const school = dummySchoolForId(child.id);
  return (
    <DropdownMenuItem
      className="cursor-pointer gap-2.5 rounded-lg px-2 py-2"
      onClick={onSelect}
    >
      <SchoolMark school={school} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{child.name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {school.name}
        </span>
      </span>
      {active ? <Check className="h-4 w-4 shrink-0 text-primary" /> : null}
    </DropdownMenuItem>
  );
}
