import { LogOut, Settings } from "lucide-react";
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
import { useMe } from "@/hooks/useTeacherData";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ProfileMenuProps {
  variant?: "chip" | "avatar" | "sidebar";
  className?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
}

export function ProfileMenu({
  variant = "chip",
  className,
  align = "end",
  side = "bottom",
}: ProfileMenuProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut } = useAuth();
  const { data: me } = useMe();
  const [signOutOpen, setSignOutOpen] = useState(false);

  const name = me?.profile?.full_name || me?.email || "Educator";
  const email = me?.profile?.email || me?.email || "";
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
              "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              variant === "sidebar" &&
                "flex w-full items-center gap-3 px-3 py-3 rounded-2xl bg-muted/60 hover:bg-muted transition-colors text-left",
              variant === "chip" &&
                "hidden sm:flex items-center gap-3 rounded-full bg-card border border-border/70 px-2 py-1.5 shadow-sm hover:bg-accent/40 transition-colors",
              variant === "avatar" &&
                "h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity",
              className,
            )}
          >
            {variant !== "avatar" && (
              <>
                <div
                  className={cn(
                    "shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold",
                    variant === "sidebar" ? "h-10 w-10" : "h-9 w-9",
                  )}
                >
                  {initial}
                </div>
                <div className="flex-1 min-w-0 pr-1">
                  <p className="text-sm font-semibold truncate leading-none">{name}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 truncate">{email}</p>
                </div>
              </>
            )}
            {variant === "avatar" && initial}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} side={side} className="w-56 rounded-xl">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold leading-none">{name}</p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
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
