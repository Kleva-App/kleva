import { LogOut, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@nudle/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@nudle/ui/alert-dialog";
import { useToast } from "@nudle/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useMe } from "@/hooks/use-me";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ProfileMenuProps {
  className?: string;
}

export function ProfileMenu({ className }: ProfileMenuProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const { data: me, isParent, isOrganization } = useMe();

  const name = me?.profile?.full_name || user?.name || "Student";
  const roleLabel = isOrganization ? "Organization" : isParent ? "Parent" : "Student";
  const email = me?.profile?.email || user?.email || "";
  const initial = name.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out successfully",
      description: "You have been logged out of your account",
    });
    navigate("/auth");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center gap-3 rounded-full bg-card border border-border/70 px-2 py-1.5 shadow-sm hover:bg-accent/40 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              className,
            )}
          >
            <div className="hidden sm:block text-right pl-1 min-w-0">
              <p className="text-sm font-semibold leading-none truncate max-w-[140px]">{name}</p>
              <p className="text-[11px] text-muted-foreground mt-1 truncate max-w-[140px]">
                {roleLabel}
                {email ? ` · ${email}` : ""}
              </p>
            </div>
            <div className="h-8 w-8 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
              {initial}
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-xl">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold leading-none">{name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {roleLabel}
                {email ? ` · ${email}` : ""}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="rounded-lg cursor-pointer gap-2"
            onClick={() => navigate("/account")}
          >
            <User className="h-4 w-4" />
            My account
          </DropdownMenuItem>
          <DropdownMenuItem
            className="rounded-lg cursor-pointer gap-2"
            onClick={() => navigate("/settings")}
          >
            <Settings className="h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="rounded-lg cursor-pointer gap-2 text-destructive focus:text-destructive"
            onClick={() => setSignOutOpen(true)}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={signOutOpen} onOpenChange={setSignOutOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be logged out and redirected to the sign-in page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleSignOut()}
              className="rounded-full bg-destructive text-destructive-foreground"
            >
              Sign out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
