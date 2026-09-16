import { Toaster } from "@nudle/ui/toaster";
import { Toaster as Sonner } from "@nudle/ui/sonner";
import { TooltipProvider } from "@nudle/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SchoolProvider } from "@/contexts/SchoolContext";
import { Sidebar } from "@/components/Layout/Sidebar";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { AskKlevaDialog } from "@/components/AskKleva/AskKlevaDialog";
import { SchoolAdminRoute } from "@/components/SchoolAdminRoute";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Grading from "./pages/Grading";
import Attendance from "./pages/Attendance";
import ReportCards from "./pages/ReportCards";
import Messages from "./pages/Messages";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Hub from "./pages/Hub";
import SchoolStaff from "./pages/school/Staff";
import SchoolStudents from "./pages/school/Students";
import StaffDetailPage from "./pages/school/StaffDetail";
import StudentDetailPage from "./pages/school/StudentDetail";
import SchoolAdmissions from "./pages/school/Admissions";
import SchoolAcademics from "./pages/school/Academics";
import SchoolAttendancePage from "./pages/school/Attendance";
import SchoolFees from "./pages/school/Fees";
import SchoolAccounting from "./pages/school/Accounting";
import SchoolPayroll from "./pages/school/Payroll";
import SchoolReports from "./pages/school/ReportsHub";
import SchoolIntelligence from "./pages/school/Intelligence";
import SchoolsPage from "./pages/school/Schools";
import AdminsPage from "./pages/school/Admins";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AdminOnly({ children }: { children: React.ReactNode }) {
  return <SchoolAdminRoute>{children}</SchoolAdminRoute>;
}

function AppShell() {
  const [askKlevaOpen, setAskKlevaOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <SchoolProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar
          isOpen={sidebarOpen}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            sidebarOpen ? "lg:ml-64" : "lg:ml-0"
          }`}
        >
          <Header
            onAskKleva={() => setAskKlevaOpen(true)}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            sidebarOpen={sidebarOpen}
          />
          <main className="flex-1 p-5 md:p-8">
            <div className="max-w-7xl mx-auto w-full space-y-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/grading" element={<Grading />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/report-cards" element={<ReportCards />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />

                <Route path="/school" element={<Navigate to="/school/staff" replace />} />
                <Route path="/school/staff" element={<AdminOnly><SchoolStaff /></AdminOnly>} />
                <Route path="/school/staff/:staffId" element={<AdminOnly><StaffDetailPage /></AdminOnly>} />
                <Route path="/school/students" element={<AdminOnly><SchoolStudents /></AdminOnly>} />
                <Route path="/school/students/:studentId" element={<AdminOnly><StudentDetailPage /></AdminOnly>} />
                <Route path="/school/admissions" element={<AdminOnly><SchoolAdmissions /></AdminOnly>} />
                <Route path="/school/academics" element={<AdminOnly><SchoolAcademics /></AdminOnly>} />
                <Route path="/school/attendance" element={<AdminOnly><SchoolAttendancePage /></AdminOnly>} />
                <Route path="/school/fees" element={<AdminOnly><SchoolFees /></AdminOnly>} />
                <Route path="/school/accounting" element={<AdminOnly><SchoolAccounting /></AdminOnly>} />
                <Route path="/school/payroll" element={<AdminOnly><SchoolPayroll /></AdminOnly>} />
                <Route path="/school/reports" element={<AdminOnly><SchoolReports /></AdminOnly>} />
                <Route path="/school/intelligence" element={<AdminOnly><SchoolIntelligence /></AdminOnly>} />
                <Route path="/school/schools" element={<AdminOnly><SchoolsPage /></AdminOnly>} />
                <Route path="/school/admins" element={<AdminOnly><AdminsPage /></AdminOnly>} />
                <Route path="/hub" element={<AdminOnly><Hub /></AdminOnly>} />

                {/* Legacy redirects from earlier IA */}
                <Route path="/school/offers" element={<Navigate to="/school/admissions" replace />} />
                <Route path="/school/enrolments" element={<Navigate to="/school/admissions" replace />} />
                <Route path="/school/assessment" element={<Navigate to="/school/admissions" replace />} />
                <Route path="/school/curriculum" element={<Navigate to="/school/academics" replace />} />
                <Route path="/school/classes" element={<Navigate to="/school/attendance" replace />} />
                <Route path="/school/reports/*" element={<Navigate to="/school/reports" replace />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </main>
          <Footer />
        </div>
        <AskKlevaDialog open={askKlevaOpen} onOpenChange={setAskKlevaOpen} />
      </div>
    </SchoolProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
