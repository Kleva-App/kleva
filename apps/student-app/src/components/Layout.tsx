import { SidebarProvider, useSidebar } from "@nudle/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Menu, Search, Bell } from "lucide-react";
import { Input } from "@nudle/ui/input";
import { Button } from "@nudle/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";
import { useFamily } from "@/contexts/FamilyContext";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isParent, isInstitution } = useFamily();

  return (
    <SidebarProvider
      className="h-svh overflow-hidden"
      style={{ "--sidebar-width-icon": "4rem" } as React.CSSProperties}
    >
      <div className="flex h-full min-h-0 w-full bg-background">
        <AppSidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden">
          <header className="relative z-20 h-16 shrink-0 border-b border-border bg-background">
            <div className="mx-auto flex h-full w-full max-w-7xl items-center gap-3 px-5 sm:gap-4 sm:px-6 md:px-8">
              <MobileSidebarTrigger />

              <div className="min-w-0 flex-1 max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={
                      isInstitution
                        ? "Search applications or school finance…"
                        : isParent
                          ? "Search courses, fees, or applications…"
                          : "Search courses, assignments, or resources…"
                    }
                    className="pl-10 h-10 rounded-full bg-card border-border/70 shadow-sm"
                  />
                </div>
              </div>

              <div className="ml-auto flex shrink-0 items-center gap-2">
                <Button variant="outline" size="icon" className="rounded-full">
                  <Bell className="h-4 w-4" />
                </Button>
                <ThemeToggle compact />
                <ProfileMenu />
              </div>
            </div>
          </header>
          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-x-none touch-pan-y">
            <div className="mx-auto w-full min-w-0 max-w-7xl space-y-6 px-5 py-5 pb-10 sm:px-6 md:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function MobileSidebarTrigger() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="rounded-full md:hidden"
      onClick={toggleSidebar}
      aria-label="Open sidebar"
    >
      <Menu className="h-5 w-5 text-foreground" />
    </Button>
  );
}
