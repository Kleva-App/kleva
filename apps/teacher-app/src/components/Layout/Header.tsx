import { Search, Bell, Bot, Menu } from "lucide-react";
import { Input } from "@nudle/ui/input";
import { Button } from "@nudle/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@nudle/ui/popover";
import { Separator } from "@nudle/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nudle/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/Layout/ProfileMenu";
import { useMe } from "@/hooks/useTeacherData";
import { useSchool } from "@/contexts/SchoolContext";
import { useTheme } from "@/contexts/ThemeContext";
import { PageShell } from "@nudle/ui/page-shell";
import { useEffect } from "react";

interface HeaderProps {
  onAskKleva: () => void;
  onToggleMobileSidebar: () => void;
}

export const Header = ({
  onAskKleva,
  onToggleMobileSidebar,
}: HeaderProps) => {
  const { data: me } = useMe();
  const isSchoolAdmin = me?.roles?.includes("school_admin") ?? false;
  const { schools, activeSchoolId, setActiveSchoolId } = useSchool();
  const { setTheme, theme } = useTheme();

  // School admin refs are dark — prefer dark once for admin accounts
  useEffect(() => {
    if (!isSchoolAdmin) return;
    if (theme === "system") setTheme("dark");
  }, [isSchoolAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <header className="h-16 sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/60">
      <PageShell variant="bar" className="h-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleMobileSidebar}
            className="lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={
                isSchoolAdmin
                  ? "Search students, staff, invoices…"
                  : "Search courses, students, or materials…"
              }
              className="pl-10 h-10 rounded-full bg-card border-border/70"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSchoolAdmin && schools.length > 0 && (
            <Select value={activeSchoolId ?? undefined} onValueChange={setActiveSchoolId}>
              <SelectTrigger className="w-[140px] md:w-[180px] rounded-full h-10 hidden sm:flex">
                <SelectValue placeholder="Select school" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {schools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 rounded-2xl" align="end">
              <div className="space-y-2">
                <h4 className="font-semibold">Notifications</h4>
                <Separator />
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No notifications yet
                </p>
              </div>
            </PopoverContent>
          </Popover>

          <ThemeToggle compact />
          <ProfileMenu variant="avatar" />

          <Button onClick={onAskKleva} size="default">
            <Bot className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Ask Kleva</span>
          </Button>
        </div>
      </PageShell>
    </header>
  );
};
