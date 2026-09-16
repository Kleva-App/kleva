import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@nudle/ui/button";
import { Input } from "@nudle/ui/input";
import { Textarea } from "@nudle/ui/textarea";
import { Label } from "@nudle/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@nudle/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nudle/ui/select";
import { useToast } from "@nudle/ui/use-toast";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useProfiles } from "@/hooks/useTeacherData";
import { KpiGrid, PageHeader, StatusPill, useDemo } from "@/pages/school/shared";

type Tab = "Staff" | "Parent → Headmaster" | "Announcements" | "Direct messages";

type Conversation = {
  id: string;
  subject: string;
  updated_at: string;
  conversation_participants?: {
    user_id: string;
    profiles: { id: string; email: string; full_name: string };
  }[];
};

type Message = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
};

export default function Hub() {
  const { demo } = useDemo();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: profiles = [] } = useProfiles();
  const [tab, setTab] = useState<Tab>("Staff");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedDm, setSelectedDm] = useState<string | null>(null);
  const [dmMessages, setDmMessages] = useState<Message[]>([]);
  const [dmDraft, setDmDraft] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newRecipient, setNewRecipient] = useState("");

  const tabs: Tab[] = ["Staff", "Parent → Headmaster", "Announcements", "Direct messages"];

  const fetchConversations = async () => {
    try {
      const data = await api.get<Conversation[]>("/api/conversations");
      setConversations(data);
    } catch {
      // ignore
    }
  };

  const fetchDmMessages = async (id: string) => {
    try {
      const data = await api.get<Message[]>(`/api/conversations/${id}/messages`);
      setDmMessages(data);
    } catch {
      setDmMessages([]);
    }
  };

  useEffect(() => {
    if (!user) return;
    void fetchConversations();
  }, [user]);

  useEffect(() => {
    if (selectedDm) void fetchDmMessages(selectedDm);
  }, [selectedDm]);

  const startDm = async () => {
    if (!newSubject.trim() || !newRecipient) return;
    try {
      const conversation = await api.post<Conversation>("/api/conversations", {
        subject: newSubject.trim(),
        recipient_id: newRecipient,
      });
      setDialogOpen(false);
      setNewSubject("");
      setNewRecipient("");
      await fetchConversations();
      setTab("Direct messages");
      setSelectedDm(conversation.id);
    } catch (err) {
      toast({
        title: "Could not start conversation",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  const sendDm = async () => {
    if (!selectedDm || !dmDraft.trim()) return;
    try {
      await api.post(`/api/conversations/${selectedDm}/messages`, {
        content: dmDraft.trim(),
      });
      setDmDraft("");
      await fetchDmMessages(selectedDm);
      await fetchConversations();
    } catch (err) {
      toast({
        title: "Failed to send",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  const cosmetic = demo.conversations.filter((c) => c.tab === tab);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Communication"
        subtitle="Staff threads, parent escalations, announcements — plus real direct messages."
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full">New DM</Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>New direct message</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Recipient</Label>
                  <Select value={newRecipient} onValueChange={setNewRecipient}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Choose person" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.full_name || p.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full rounded-full" onClick={() => void startDm()}>
                  Start conversation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <KpiGrid
        items={[
          { label: "Unread messages", value: demo.communicationKpis.unread, tone: "warn" },
          {
            label: "Safeguarding threads",
            value: demo.communicationKpis.safeguarding,
            tone: "bad",
          },
          {
            label: "Average reply time",
            value: `${demo.communicationKpis.avgReplyHrs} hrs`,
            tone: "good",
          },
          {
            label: "Announcements this month",
            value: demo.communicationKpis.announcements,
          },
        ]}
      />

      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-3">Staff conversations</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm transition-colors",
                tab === t
                  ? "bg-white text-black font-semibold"
                  : "bg-card text-muted-foreground border border-border/60",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {tab !== "Direct messages" ? (
          <div className="space-y-3">
            {cosmetic.map((c) => (
              <div key={c.id} className="surface-card p-4 md:p-5 space-y-2">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold">{c.from}</p>
                      <span className="text-xs text-muted-foreground">{c.role}</span>
                      {c.tags.map((tag) => (
                        <StatusPill
                          key={tag}
                          tone={
                            tag === "Unread"
                              ? "good"
                              : tag === "Fees" || tag === "Safeguarding"
                                ? "warn"
                                : "neutral"
                          }
                        >
                          {tag}
                        </StatusPill>
                      ))}
                    </div>
                    <p className="font-semibold text-base">{c.subject}</p>
                    <p className="text-sm text-muted-foreground mt-1">{c.preview}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{c.time}</span>
                    <Button size="sm" variant="outline" className="rounded-full gap-1.5">
                      <Send className="h-3.5 w-3.5" />
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {cosmetic.length === 0 && (
              <div className="surface-card p-8 text-center text-sm text-muted-foreground">
                No threads in this tab.
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
            <div className="surface-card p-3 space-y-1 max-h-[420px] overflow-y-auto">
              {conversations.length === 0 ? (
                <p className="text-xs text-muted-foreground p-3">No DMs yet. Start one above.</p>
              ) : (
                conversations.map((c) => {
                  const other = c.conversation_participants?.find(
                    (p) => p.user_id !== user?.id,
                  );
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedDm(c.id)}
                      className={cn(
                        "w-full text-left rounded-xl px-3 py-2.5 text-sm",
                        selectedDm === c.id ? "bg-white text-black" : "hover:bg-muted/60",
                      )}
                    >
                      <p className="font-medium truncate">
                        {other?.profiles?.full_name || c.subject}
                      </p>
                      <p className="text-xs opacity-70 truncate">{c.subject}</p>
                    </button>
                  );
                })
              )}
            </div>
            <div className="surface-card flex flex-col min-h-[420px]">
              {selectedDm ? (
                <>
                  <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                    {dmMessages.map((m) => (
                      <div
                        key={m.id}
                        className={cn(
                          "rounded-2xl px-3.5 py-2.5 text-sm max-w-[80%]",
                          m.sender_id === user?.id
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-muted",
                        )}
                      >
                        {m.content}
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-border/50 flex gap-2">
                    <Textarea
                      value={dmDraft}
                      onChange={(e) => setDmDraft(e.target.value)}
                      placeholder="Write a message…"
                      className="min-h-[44px] rounded-xl resize-none"
                      rows={1}
                    />
                    <Button className="rounded-full shrink-0" onClick={() => void sendDm()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                  Select a conversation
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
