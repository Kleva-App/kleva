import { InboxView } from "@nudle/ui/inbox-view";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useMe } from "@/hooks/use-me";
import { studentInboxThreads } from "@/lib/inbox-demo";

export default function Inbox() {
  const { user } = useAuth();
  const { isParent, isOrganization } = useMe();
  const extraThreads = studentInboxThreads(
    isOrganization ? "organization" : isParent ? "parent" : "student",
  );

  return (
    <InboxView
      user={user ? { id: user.id, name: user.name } : null}
      api={api}
      extraThreads={extraThreads}
    />
  );
}
