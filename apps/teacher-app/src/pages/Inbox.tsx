import { InboxView, type InboxSeedThread } from "@nudle/ui/inbox-view";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { useMe } from "@/hooks/useTeacherData";
import { useDemo } from "@/pages/school/shared";

export default function Inbox() {
  const { user } = useAuth();
  const { data: me } = useMe();
  const { demo } = useDemo();
  const isSchoolAdmin = me?.roles?.includes("school_admin") ?? false;

  const extraThreads: InboxSeedThread[] = isSchoolAdmin
    ? demo.conversations.map((c) => ({
        id: c.id,
        name: c.from,
        role: c.role,
        preview: c.preview,
        time: c.time,
        subject: c.subject,
        tags: c.tags,
        section:
          c.tab === "Staff" ? "staff" : c.tab === "Announcements" ? "announcements" : "parents",
      }))
    : [];

  return (
    <InboxView
      user={user ? { id: user.id, name: user.name } : null}
      api={api}
      extraThreads={extraThreads}
    />
  );
}
