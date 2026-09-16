import { Badge } from "@nudle/ui/badge";
import { PageHeader } from "@nudle/ui/page-header";
import { SurfaceCard } from "@nudle/ui/surface-card";
import { StatCard } from "@nudle/ui/stat-card";
import { Award, TrendingUp, FileBarChart } from "lucide-react";

interface CourseResult {
  courseCode: string;
  courseName: string;
  finalExam: number;
  coursework: number;
  total: number;
  grade: string;
  credits: number;
  status: "pass" | "fail" | "distinction";
}

const mockResults: CourseResult[] = [
  {
    courseCode: "MATH301",
    courseName: "Advanced Mathematics",
    finalExam: 85,
    coursework: 88,
    total: 86.5,
    grade: "A",
    credits: 4,
    status: "distinction",
  },
  {
    courseCode: "PHYS201",
    courseName: "Physics II",
    finalExam: 78,
    coursework: 82,
    total: 80,
    grade: "B+",
    credits: 4,
    status: "pass",
  },
  {
    courseCode: "CHEM202",
    courseName: "Organic Chemistry",
    finalExam: 92,
    coursework: 90,
    total: 91,
    grade: "A+",
    credits: 3,
    status: "distinction",
  },
  {
    courseCode: "ENG101",
    courseName: "English Literature",
    finalExam: 75,
    coursework: 78,
    total: 76.5,
    grade: "B",
    credits: 3,
    status: "pass",
  },
  {
    courseCode: "HIST150",
    courseName: "Modern History",
    finalExam: 88,
    coursework: 85,
    total: 86.5,
    grade: "A",
    credits: 3,
    status: "distinction",
  },
  {
    courseCode: "BIO210",
    courseName: "Biology",
    finalExam: 82,
    coursework: 80,
    total: 81,
    grade: "B+",
    credits: 4,
    status: "pass",
  },
];

export default function ReportCard() {
  const hasResults = mockResults.length > 0;
  const totalCredits = mockResults.reduce((sum, course) => sum + course.credits, 0);
  const weightedAverage = hasResults
    ? mockResults.reduce((sum, course) => sum + course.total * course.credits, 0) / totalCredits
    : 0;
  const gpa = hasResults ? (weightedAverage / 25).toFixed(2) : "—";
  const distinctions = mockResults.filter((r) => r.status === "distinction").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report Card"
        subtitle="Final exam results and overall performance"
      />

      {!hasResults ? (
        <SurfaceCard className="p-12 text-center">
          <FileBarChart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">No results yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your report card will appear when grades are published.
          </p>
        </SurfaceCard>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              label="Overall Average"
              value={`${weightedAverage.toFixed(1)}%`}
              icon={Award}
              compact
            />
            <StatCard label="GPA" value={gpa} icon={TrendingUp} compact />
            <StatCard label="Total Credits" value={String(totalCredits)} compact />
            <StatCard
              label="Distinctions"
              value={String(distinctions)}
              icon={Award}
              compact
            />
          </div>

          <SurfaceCard className="p-5 md:p-6 overflow-hidden">
            <h2 className="text-lg font-semibold mb-4">Course Results</h2>
            <div className="overflow-x-auto -mx-1 px-1">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="border-b border-border/80">
                    {[
                      "Course Code",
                      "Course Name",
                      "Coursework",
                      "Final Exam",
                      "Total",
                      "Grade",
                      "Credits",
                      "Status",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className={`py-3 px-3 text-sm font-medium text-muted-foreground ${
                          heading === "Course Code" || heading === "Course Name"
                            ? "text-left"
                            : "text-center"
                        }`}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mockResults.map((course) => (
                    <tr
                      key={course.courseCode}
                      className="border-b border-border/60 last:border-0 hover:bg-hover/60 transition-colors"
                    >
                      <td className="py-3.5 px-3">
                        <span className="text-sm font-medium">{course.courseCode}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="text-sm">{course.courseName}</span>
                      </td>
                      <td className="py-3.5 px-3 text-center text-sm">{course.coursework}%</td>
                      <td className="py-3.5 px-3 text-center text-sm font-medium">
                        {course.finalExam}%
                      </td>
                      <td className="py-3.5 px-3 text-center text-sm font-semibold">
                        {course.total}%
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <Badge
                          variant={course.status === "distinction" ? "default" : "secondary"}
                          className="rounded-full font-semibold"
                        >
                          {course.grade}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-3 text-center text-sm text-muted-foreground">
                        {course.credits}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {course.status === "distinction" ? (
                            <>
                              <TrendingUp className="h-4 w-4 text-success" />
                              <span className="text-xs font-medium text-success">
                                Distinction
                              </span>
                            </>
                          ) : (
                            <span className="text-xs font-medium text-muted-foreground">
                              Pass
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SurfaceCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SurfaceCard className="p-6">
              <h2 className="text-lg font-semibold mb-4">Grade Distribution</h2>
              <div className="space-y-3">
                {["A+", "A", "B+", "B"].map((grade) => {
                  const count = mockResults.filter((r) => r.grade === grade).length;
                  const percentage = (count / mockResults.length) * 100;
                  return (
                    <div key={grade} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{grade}</span>
                        <span className="text-muted-foreground">{count} courses</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-foreground/80 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </SurfaceCard>

            <SurfaceCard className="p-6">
              <h2 className="text-lg font-semibold mb-4">Performance Insights</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Strong Performance</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      You achieved distinctions in {distinctions} out of {mockResults.length}{" "}
                      courses
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Top Performer</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Your GPA of {gpa} places you in the top tier of students
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold">i</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Consistent Excellence</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Your average exam score of {weightedAverage.toFixed(1)}% shows consistent
                      high performance
                    </p>
                  </div>
                </div>
              </div>
            </SurfaceCard>
          </div>
        </>
      )}
    </div>
  );
}
