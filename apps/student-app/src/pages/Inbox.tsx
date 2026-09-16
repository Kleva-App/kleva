import { InboxView } from "@nudle/ui/inbox-view";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export default function Inbox() {
  const { user } = useAuth();

  return (
    <InboxView
      user={user ? { id: user.id, name: user.name } : null}
      api={api}
    />
  );
}
