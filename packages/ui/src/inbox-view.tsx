import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bold,
  ChevronDown,
  FileText,
  Italic,
  Link2,
  List,
  MessageSquare,
  Paperclip,
  Plus,
  Search,
  Send,
  Smile,
  SquarePen,
  Star,
} from "lucide-react";
import { format, isThisWeek, isToday, isYesterday } from "date-fns";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { useToast } from "./use-toast";
import { cn } from "./lib/utils";

type Section = "all" | "staff" | "parents" | "announcements" | "dms";
type ThreadTab = "messages" | "files";

export type InboxApi = {
  get: <T = unknown>(path: string) => Promise<T>;
  post: <T = unknown>(path: string, body?: unknown) => Promise<T>;
};

export type InboxUser = {
  id: string;
  name: string;
};

export type InboxProfile = {
  id: string;
  email: string;
  full_name: string;
};

export type InboxSeedThread = {
  id: string;
  name: string;
  role: string;
  preview: string;
  time: string;
  subject: string;
  tags: string[];
  section: "staff" | "parents" | "announcements";
};

type LiveConversation = {
  id: string;
  subject: string;
  updated_at: string;
  conversation_participants?: {
    user_id: string;
    profiles: { id: string; email: string; full_name: string };
  }[];
};

type LiveMessage = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
};

type ThreadMessage = {
  id: string;
  sender: string;
  senderId?: string;
  content: string;
  createdAt: string;
};

type InboxThread = {
  id: string;
  source: "demo" | "live";
  section: Exclude<Section, "all">;
  name: string;
  subtitle: string;
  preview: string;
  updatedAt: string;
  unread: boolean;
  subject: string;
  seeded: ThreadMessage[];
};

const SECTION_LABEL: Record<Section, string> = {
  all: "All messages",
  staff: "Staff",
  parents: "Parents",
  announcements: "Announcements",
  dms: "Direct messages",
};

const AVATAR_TONES = [
  "bg-violet-600",
  "bg-rose-600",
  "bg-amber-600",
  "bg-emerald-600",
  "bg-sky-600",
  "bg-orange-600",
  "bg-pink-600",
  "bg-teal-600",
];

const WEEKDAYS: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function hashName(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h;
}

function parseDemoTime(label: string, minusMinutes = 0) {
  const d = new Date();
  d.setSeconds(0, 0);
  const clock = /^(\d{1,2}):(\d{2})$/.exec(label);
  if (clock) {
    d.setHours(Number(clock[1]), Number(clock[2]) - minusMinutes, 0, 0);
    return d.toISOString();
  }
  if (label === "Yesterday") {
    d.setDate(d.getDate() - 1);
    d.setHours(16, 40 - minusMinutes, 0, 0);
    return d.toISOString();
  }
  const weekday = WEEKDAYS[label];
  if (weekday !== undefined) {
    const diff = (d.getDay() - weekday + 7) % 7 || 7;
    d.setDate(d.getDate() - diff);
    d.setHours(10, 15 - minusMinutes, 0, 0);
    return d.toISOString();
  }
  d.setMinutes(d.getMinutes() - minusMinutes);
  return d.toISOString();
}

function listTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return "Yesterday";
  if (isThisWeek(d, { weekStartsOn: 1 })) return format(d, "EEE");
  return format(d, "MMM d");
}

function dayHeading(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  if (isToday(d)) return format(d, "EEEE, MMMM d");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEEE, MMMM d");
}

function PersonAvatar({
  name,
  size = "md",
  presence = false,
}: {
  name: string;
  size?: "sm" | "md";
  presence?: boolean;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const tone = AVATAR_TONES[hashName(name) % AVATAR_TONES.length];
  return (
    <div className="relative shrink-0">
      <div
        className={cn(
          "flex items-center justify-center rounded-lg font-semibold text-white",
          size === "sm" ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm",
          tone,
        )}
      >
        {initial}
      </div>
      {presence && (
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
      )}
    </div>
  );
}

export function InboxView({
  user,
  api,
  extraThreads = [],
}: {
  user: InboxUser | null;
  api: InboxApi;
  extraThreads?: InboxSeedThread[];
}) {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<InboxProfile[]>([]);
  const you = user?.name || "You";

  const [section, setSection] = useState<Section>("all");
  const [unreadsOnly, setUnreadsOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [threadTab, setThreadTab] = useState<ThreadTab>("messages");
  const [starred, setStarred] = useState(false);
  const [mobileThread, setMobileThread] = useState(false);
  const [conversations, setConversations] = useState<LiveConversation[]>([]);
  const [liveMessages, setLiveMessages] = useState<LiveMessage[]>([]);
  const [demoReplies, setDemoReplies] = useState<Record<string, ThreadMessage[]>>({});
  const [draft, setDraft] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newRecipient, setNewRecipient] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const demoThreads = useMemo<InboxThread[]>(
    () =>
      extraThreads.map((c) => {
        const unread = c.tags.includes("Unread");
        const updatedAt = parseDemoTime(c.time);
        const seeded: ThreadMessage[] = [
          {
            id: `${c.id}-in`,
            sender: c.name,
            content: c.preview,
            createdAt: parseDemoTime(c.time, unread ? 0 : 18),
          },
        ];
        if (!unread) {
          seeded.push({
            id: `${c.id}-out`,
            sender: you,
            senderId: user?.id,
            content: `Thanks ${c.name.split(" ")[0]} — I'll come back on this.`,
            createdAt: updatedAt,
          });
        }
        return {
          id: `demo-${c.id}`,
          source: "demo",
          section: c.section,
          name: c.name,
          subtitle: c.role,
          preview: c.preview,
          updatedAt,
          unread,
          subject: c.subject,
          seeded,
        };
      }),
    [extraThreads, user?.id, you],
  );

  const liveThreads = useMemo<InboxThread[]>(
    () =>
      conversations.map((c) => {
        const other = c.conversation_participants?.find((p) => p.user_id !== user?.id);
        const name = other?.profiles?.full_name || c.subject;
        return {
          id: c.id,
          source: "live",
          section: "dms",
          name,
          subtitle: other?.profiles?.email || "Direct message",
          preview: c.subject,
          updatedAt: c.updated_at,
          unread: false,
          subject: c.subject,
          seeded: [],
        };
      }),
    [conversations, user?.id],
  );

  const threads = useMemo(
    () =>
      [...demoThreads, ...liveThreads].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [demoThreads, liveThreads],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return threads.filter((t) => {
      if (section !== "all" && t.section !== section) return false;
      if (unreadsOnly && !t.unread) return false;
      if (!needle) return true;
      return `${t.name} ${t.subject} ${t.preview} ${t.subtitle}`.toLowerCase().includes(needle);
    });
  }, [threads, section, unreadsOnly, query]);

  const selected = visible.find((t) => t.id === selectedId) ?? null;

  useEffect(() => {
    if (visible.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !visible.some((t) => t.id === selectedId)) {
      setSelectedId(visible[0].id);
    }
  }, [visible, selectedId]);

  const fetchConversations = async () => {
    try {
      const data = await api.get<LiveConversation[]>("/api/conversations");
      setConversations(data);
    } catch {
      // keep demo threads if the API is unavailable
    }
  };

  const fetchLiveMessages = async (id: string) => {
    try {
      const data = await api.get<LiveMessage[]>(`/api/conversations/${id}/messages`);
      setLiveMessages(data);
    } catch {
      setLiveMessages([]);
    }
  };

  useEffect(() => {
    if (!user) return;
    void fetchConversations();
    void api
      .get<InboxProfile[]>("/api/profiles")
      .then(setProfiles)
      .catch(() => setProfiles([]));
  }, [user]);

  useEffect(() => {
    if (selected?.source === "live") void fetchLiveMessages(selected.id);
    else setLiveMessages([]);
  }, [selected?.id, selected?.source]);

  const threadMessages = useMemo<ThreadMessage[]>(() => {
    if (!selected) return [];
    if (selected.source === "live") {
      return liveMessages.map((m) => ({
        id: m.id,
        sender: m.sender_id === user?.id ? you : selected.name,
        senderId: m.sender_id,
        content: m.content,
        createdAt: m.created_at,
      }));
    }
    return [...selected.seeded, ...(demoReplies[selected.id] ?? [])];
  }, [selected, liveMessages, demoReplies, user?.id, you]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [threadMessages.length, selected?.id, threadTab]);

  const startDm = async () => {
    if (!newSubject.trim() || !newRecipient) return;
    try {
      const conversation = await api.post<LiveConversation>("/api/conversations", {
        subject: newSubject.trim(),
        recipient_id: newRecipient,
      });
      setDialogOpen(false);
      setNewSubject("");
      setNewRecipient("");
      await fetchConversations();
      setSection("dms");
      setSelectedId(conversation.id);
      setMobileThread(true);
    } catch (err) {
      toast({
        title: "Could not start conversation",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    }
  };

  const send = async () => {
    if (!selected || !draft.trim()) return;
    const content = draft.trim();
    if (selected.source === "live") {
      try {
        await api.post(`/api/conversations/${selected.id}/messages`, { content });
        setDraft("");
        await fetchLiveMessages(selected.id);
        await fetchConversations();
      } catch (err) {
        toast({
          title: "Failed to send",
          description: err instanceof Error ? err.message : "Try again",
          variant: "destructive",
        });
      }
      return;
    }
    setDemoReplies((prev) => ({
      ...prev,
      [selected.id]: [
        ...(prev[selected.id] ?? []),
        {
          id: `${selected.id}-${Date.now()}`,
          sender: you,
          senderId: user?.id,
          content,
          createdAt: new Date().toISOString(),
        },
      ],
    }));
    setDraft("");
  };

  const grouped = useMemo(() => {
    const groups: { heading: string; items: ThreadMessage[] }[] = [];
    for (const message of threadMessages) {
      const heading = dayHeading(message.createdAt);
      const last = groups[groups.length - 1];
      if (!last || last.heading !== heading) groups.push({ heading, items: [message] });
      else last.items.push(message);
    }
    return groups;
  }, [threadMessages]);

  const availableSections = useMemo(() => {
    const present = new Set<Section>(["all", "dms"]);
    for (const thread of threads) present.add(thread.section);
    return (Object.keys(SECTION_LABEL) as Section[]).filter((key) => present.has(key));
  }, [threads]);

  return (
    <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden bg-background">
      <aside
        className={cn(
          "flex h-full min-h-0 w-full shrink-0 flex-col border-r border-border md:w-[320px]",
          mobileThread && "hidden md:flex",
        )}
      >
        <div className="flex h-12 items-center justify-between gap-2 border-b border-border/70 px-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex min-w-0 items-center gap-1 rounded-md px-1.5 py-1 text-left text-[15px] font-bold hover:bg-muted/70"
              >
                <span className="truncate">{SECTION_LABEL[section]}</span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="rounded-xl w-52">
              <DropdownMenuRadioGroup
                value={section}
                onValueChange={(value) => setSection(value as Section)}
              >
                {(availableSections).map((key) => (
                  <DropdownMenuRadioItem key={key} value={key} className="rounded-lg">
                    {SECTION_LABEL[key]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Unreads
              <button
                type="button"
                role="switch"
                aria-checked={unreadsOnly}
                onClick={() => setUnreadsOnly((v) => !v)}
                className={cn(
                  "relative h-4 w-7 rounded-full transition-colors",
                  unreadsOnly ? "bg-primary" : "bg-input",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-3 w-3 rounded-full bg-background shadow-sm transition-all",
                    unreadsOnly ? "left-3.5" : "left-0.5",
                  )}
                />
              </button>
            </div>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              aria-label="New message"
              onClick={() => setDialogOpen(true)}
            >
              <SquarePen className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find a conversation"
              className="h-8 rounded-lg bg-muted/50 pl-8"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {visible.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              {unreadsOnly ? "No unread messages" : "No conversations yet"}
            </p>
          ) : (
            visible.map((thread) => {
              const active = selected?.id === thread.id;
              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(thread.id);
                    setStarred(false);
                    setThreadTab("messages");
                    setMobileThread(true);
                  }}
                  className={cn(
                    "flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors",
                    active ? "bg-muted" : "hover:bg-muted/50",
                  )}
                >
                  <PersonAvatar name={thread.name} presence={thread.section !== "announcements"} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={cn(
                          "truncate text-sm",
                          thread.unread || active ? "font-semibold" : "font-medium",
                        )}
                      >
                        {thread.name}
                      </span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {listTime(thread.updatedAt)}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "truncate text-[13px]",
                        thread.unread ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {thread.preview}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <section
        className={cn(
          "h-full min-h-0 min-w-0 flex-1 flex-col bg-background",
          mobileThread ? "flex" : "hidden md:flex",
        )}
      >
        {selected ? (
          <>
            <div className="flex h-12 items-center justify-between gap-3 border-b border-border/70 px-4">
              <div className="flex min-w-0 items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="md:hidden -ml-2"
                  onClick={() => setMobileThread(false)}
                >
                  Back
                </Button>
                <PersonAvatar name={selected.name} size="sm" presence />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h1 className="truncate text-[15px] font-bold leading-none">{selected.name}</h1>
                    <button
                      type="button"
                      aria-label={starred ? "Unstar conversation" : "Star conversation"}
                      onClick={() => setStarred((v) => !v)}
                      className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                    >
                      <Star className={cn("h-3.5 w-3.5", starred && "fill-amber-400 text-amber-400")} />
                    </button>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-muted-foreground">{selected.subtitle}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 border-b border-border/70 px-4">
              {(
                [
                  { id: "messages", label: "Messages", icon: MessageSquare },
                  { id: "files", label: "Files & links", icon: FileText },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setThreadTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 border-b-2 px-2 py-2.5 text-sm transition-colors",
                    threadTab === tab.id
                      ? "border-foreground font-semibold"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {threadTab === "files" ? (
              <div className="flex flex-1 items-center justify-center px-6 text-center">
                <div>
                  <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">No files or links yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Shared files in this conversation will show up here.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="min-h-0 flex-1 overflow-y-auto">
                  {threadMessages.length === 0 ? (
                    <div className="flex h-full min-h-[240px] items-center justify-center px-6 text-center">
                      <div>
                        <p className="text-sm font-medium">{selected.subject}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          This is the start of your conversation with {selected.name}.
                        </p>
                      </div>
                    </div>
                  ) : (
                    grouped.map((group) => (
                      <div key={group.heading}>
                        <div className="relative my-3 flex items-center px-4">
                          <div className="h-px flex-1 bg-border" />
                          <span className="mx-3 rounded-full border border-border bg-background px-3 py-0.5 text-xs font-medium">
                            {group.heading}
                          </span>
                          <div className="h-px flex-1 bg-border" />
                        </div>
                        {group.items.map((message, index) => {
                          const prev = group.items[index - 1];
                          const compact =
                            prev &&
                            prev.sender === message.sender &&
                            Math.abs(
                              new Date(message.createdAt).getTime() -
                                new Date(prev.createdAt).getTime(),
                            ) <
                              5 * 60 * 1000;
                          return (
                            <div
                              key={message.id}
                              className={cn(
                                "flex gap-3 px-5 hover:bg-muted/40",
                                compact ? "py-0.5" : "py-2",
                              )}
                            >
                              {compact ? (
                                <div className="w-9 shrink-0" />
                              ) : (
                                <PersonAvatar name={message.sender} />
                              )}
                              <div className="min-w-0 flex-1">
                                {!compact && (
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-sm font-bold">{message.sender}</span>
                                    <span className="text-[11px] text-muted-foreground">
                                      {listTime(message.createdAt) ||
                                        format(new Date(message.createdAt), "h:mm a")}
                                    </span>
                                  </div>
                                )}
                                <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                                  {message.content}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))
                  )}
                  <div ref={bottomRef} />
                </div>

                <form
                  className="p-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void send();
                  }}
                >
                  <div className="overflow-hidden rounded-xl border border-border bg-card focus-within:border-foreground/30">
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          void send();
                        }
                      }}
                      placeholder={`Message ${selected.name}`}
                      rows={3}
                      className="w-full resize-none bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
                    />
                    <div className="flex items-center justify-between px-2 pb-2">
                      <div className="flex items-center">
                        {(
                          [
                            ["plus", Plus],
                            ["bold", Bold],
                            ["italic", Italic],
                            ["link", Link2],
                            ["list", List],
                            ["attach", Paperclip],
                            ["emoji", Smile],
                          ] as const
                        ).map(([id, Icon]) => (
                          <button
                            key={id}
                            type="button"
                            tabIndex={-1}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                            aria-hidden
                          >
                            <Icon className="h-4 w-4" />
                          </button>
                        ))}
                      </div>
                      <Button
                        type="submit"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        disabled={!draft.trim()}
                        aria-label="Send message"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </form>
              </>
            )}
          </>
        ) : (
          <div className="hidden flex-1 items-center justify-center text-center md:flex">
            <div>
              <MessageSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">Select a conversation</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick someone from the left to read and reply.
              </p>
            </div>
          </div>
        )}
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>New direct message</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Recipient</Label>
              <Select value={newRecipient} onValueChange={setNewRecipient}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Choose person" />
                </SelectTrigger>
                <SelectContent>
                  {profiles
                    .filter((p) => p.id !== user?.id)
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.full_name || p.email}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <Button className="w-full rounded-full" onClick={() => void startDm()}>
              Start conversation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
