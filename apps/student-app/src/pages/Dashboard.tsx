import {
  Award,
  Trophy,
  Target,
  BookOpen,
  Calendar,
  MessageSquare,
  GraduationCap,
  Users,
} from "lucide-react";
import { Button } from "@nudle/ui/button";
import { Badge } from "@nudle/ui/badge";
import { AIAssistant } from "@/components/AIAssistant";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/contexts/FamilyContext";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSchoolPortalHidden } from "@/components/ParentOnly";
import { ZikimallBanner } from "@/components/ZikimallBanner";

const kpiWells = [
  "bg-primary/10 text-primary",
  "bg-brand-teal/15 text-brand-teal",
  "bg-brand-orange/15 text-brand-orange",
  "bg-brand-pink/15 text-brand-pink",
];

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user } = useAuth();
  const { isParent, activeChild, children } = useFamily();
  const { hidden: schoolPortalHidden } = useSchoolPortalHidden();
  const firstName = user?.name?.split(" ")[0] || (isParent ? "Parent" : "Student");
  const greeting = greetingForHour(new Date().getHours());
  const { data: invitations = [] } = useQuery({
    queryKey: ["student-invitations"],
    queryFn: () =>
      api.get<Array<{ token: string; parentName: string; relationship: string }>>("/api/invitations"),
    enabled: Boolean(user) && !isParent,
    refetchOnMount: "always",
  });

  const upcomingEvents: {
    id: number;
    title: string;
    course: string;
    date: string;
    time: string;
    type: string;
  }[] = [];

  const recentActivity: {
    id: number;
    type: string;
    message: string;
    time: string;
  }[] = [];

  const courses: {
    id: number;
    title: string;
    code: string;
    progress: number;
  }[] = [];

  const kpis = [
    {
      title: "Courses Enrolled",
      value: courses.length,
      hint: courses.length === 0 ? "No enrollments yet" : undefined,
      icon: BookOpen,
    },
    {
      title: "Assignments Due",
      value: upcomingEvents.filter((e) => e.type === "assignment").length,
      hint: "Nothing due right now",
      icon: Target,
    },
    {
      title: "Grade Progress",
      value: "—",
      hint: "Grades appear when posted",
      icon: Award,
    },
    {
      title: "Class Rank",
      value: "—",
      hint: "Available after assessments",
      icon: Trophy,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">
          {greeting}, {firstName}
        </h1>
        <p className="page-subtitle mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          {isParent && activeChild ? ` · Viewing ${activeChild.name}` : ""}
        </p>
      </div>

      {isParent ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="surface-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold">Kleva Finance</p>
              <p className="text-sm text-muted-foreground mt-1">
                Pay fees, buy utilities, and apply for education loans.
              </p>
            </div>
            <Button asChild className="rounded-full">
              <Link to="/finance/home">Open finance</Link>
            </Button>
          </div>
          <div className="surface-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-teal/15 text-brand-teal">
              <Users className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold">
                {children.length ? "Your family" : "Invite a student"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {children.length
                  ? `${children.length} linked student${children.length === 1 ? "" : "s"}`
                  : "Invite your child by email. Access starts after they accept."}
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/family">{children.length ? "Manage family" : "Invite a student"}</Link>
            </Button>
          </div>
        </div>
      ) : invitations.length > 0 ? (
        <div className="space-y-3">
          {invitations.map((invite) => (
            <div
              key={invite.token}
              className="surface-card p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="flex-1">
                <p className="text-sm font-semibold">Parent invitation</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {invite.parentName} ({invite.relationship}) wants to view your school portal.
                </p>
              </div>
              <Button asChild className="rounded-full">
                <Link to={`/invite/${invite.token}`}>Review invite</Link>
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      {!schoolPortalHidden && <ZikimallBanner />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={kpi.title} className="surface-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-3xl font-semibold tracking-tight mt-2">{kpi.value}</p>
                {kpi.hint && (
                  <p className="text-xs text-muted-foreground mt-1">{kpi.hint}</p>
                )}
              </div>
              <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 ${kpiWells[i % kpiWells.length]}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="surface-card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Upcoming Events</h2>
              </div>
              <Button variant="ghost" size="sm" className="rounded-full" asChild>
                <Link to="/calendar">View all</Link>
              </Button>
            </div>
            {upcomingEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 px-6 py-10 text-center">
                <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium">No upcoming events</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Assignments and exams will show up here when scheduled.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-border/80 hover:bg-hover transition-colors"
                  >
                    <div className="text-sm font-semibold bg-muted rounded-full px-3 py-2 min-w-[60px] text-center">
                      {event.date}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-sm">{event.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{event.course}</p>
                        </div>
                        <Badge variant="secondary" className="rounded-full text-xs capitalize">
                          {event.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="surface-card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">My Courses</h2>
              </div>
              <Button variant="ghost" size="sm" className="rounded-full" asChild>
                <Link to="/courses">View all</Link>
              </Button>
            </div>
            {courses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 px-6 py-10 text-center">
                <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm font-medium">No courses yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Enrolled courses will appear here once your school adds you.
                </p>
                <Button className="rounded-full mt-4" asChild>
                  <Link to="/courses">Browse courses</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="p-4 rounded-2xl border border-border/80 hover:shadow-card transition-shadow"
                  >
                    <div className="h-28 mb-3 rounded-xl bg-muted flex items-center justify-center">
                      <BookOpen className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1">{course.title}</h3>
                    <p className="text-xs text-muted-foreground">{course.code}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="surface-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Recent Activity</h2>
            </div>
            {recentActivity.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/80 bg-muted/30 px-5 py-8 text-center">
                <p className="text-sm font-medium">No recent activity</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Grades, comments, and announcements will show here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex gap-3 pb-4 border-b border-border/80 last:border-0 last:pb-0"
                  >
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <div className="h-2 w-2 rounded-full bg-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="surface-card p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Need help?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Message a teacher or check notices for support.
                </p>
              </div>
            </div>
            <Button className="w-full rounded-full" asChild>
              <Link to="/inbox">Open inbox</Link>
            </Button>
          </section>

          <section className="surface-card p-6">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-2">Ask Kleva AI</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get help with assignments, study tips, and course insights.
              </p>
              <Button variant="outline" className="w-full rounded-full">
                Open assistant
              </Button>
            </div>
          </section>
        </div>
      </div>

      <AIAssistant />
    </div>
  );
}
