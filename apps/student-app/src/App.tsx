import { Toaster } from "@nudle/ui/toaster";
import { Toaster as Sonner } from "@nudle/ui/sonner";
import { TooltipProvider } from "@nudle/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ParentOnly, RequiresLinkedStudent } from "./components/ParentOnly";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { FamilyProvider } from "./contexts/FamilyContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Assignments from "./pages/Assignments";
import Subjects from "./pages/Subjects";
import Insights from "./pages/Insights";
import Notices from "./pages/Notices";
import Account from "./pages/Account";
import Settings from "./pages/Settings";
import Calendar from "./pages/Calendar";
import Courses from "./pages/Courses";
import ReportCard from "./pages/ReportCard";
import Inbox from "./pages/Inbox";
import Family from "./pages/Family";
import Invite from "./pages/Invite";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import FinanceHome from "./pages/finance/FinanceHome";
import FinanceMarketplace from "./pages/finance/FinanceMarketplace";
import FinancePay from "./pages/finance/FinancePay";
import FinanceUtilities from "./pages/finance/FinanceUtilities";
import FinanceApply from "./pages/finance/FinanceApply";
import FinanceApplications from "./pages/finance/FinanceApplications";
import FinanceReceipt from "./pages/finance/FinanceReceipt";
import FinanceSchool from "./pages/finance/FinanceSchool";
import FinanceSupplier from "./pages/finance/FinanceSupplier";

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

function AppPage({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

function ParentPage({ children }: { children: React.ReactNode }) {
  return (
    <AppPage>
      <ParentOnly>{children}</ParentOnly>
    </AppPage>
  );
}

function StudentPortalPage({ children }: { children: React.ReactNode }) {
  return (
    <AppPage>
      <RequiresLinkedStudent>{children}</RequiresLinkedStudent>
    </AppPage>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <FamilyProvider>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/invite/:token" element={<Invite />} />
                <Route path="/" element={<StudentPortalPage><Dashboard /></StudentPortalPage>} />
                <Route path="/courses" element={<StudentPortalPage><Courses /></StudentPortalPage>} />
                <Route path="/assignments" element={<StudentPortalPage><Assignments /></StudentPortalPage>} />
                <Route path="/calendar" element={<StudentPortalPage><Calendar /></StudentPortalPage>} />
                <Route path="/subjects" element={<StudentPortalPage><Subjects /></StudentPortalPage>} />
                <Route path="/report-card" element={<StudentPortalPage><ReportCard /></StudentPortalPage>} />
                <Route path="/inbox" element={<StudentPortalPage><Inbox /></StudentPortalPage>} />
                <Route path="/insights" element={<StudentPortalPage><Insights /></StudentPortalPage>} />
                <Route path="/notices" element={<AppPage><Notices /></AppPage>} />
                <Route path="/account" element={<AppPage><Account /></AppPage>} />
                <Route path="/settings" element={<AppPage><Settings /></AppPage>} />
                <Route path="/family" element={<ParentPage><Family /></ParentPage>} />
                <Route path="/finance" element={<ParentPage><Navigate to="/finance/home" replace /></ParentPage>} />
                <Route path="/finance/home" element={<ParentPage><FinanceHome /></ParentPage>} />
                <Route path="/finance/marketplace" element={<ParentPage><FinanceMarketplace /></ParentPage>} />
                <Route path="/finance/pay" element={<ParentPage><FinancePay /></ParentPage>} />
                <Route path="/finance/utilities" element={<ParentPage><FinanceUtilities /></ParentPage>} />
                <Route path="/finance/apply" element={<ParentPage><FinanceApply /></ParentPage>} />
                <Route path="/finance/applications" element={<ParentPage><FinanceApplications /></ParentPage>} />
                <Route path="/finance/receipt" element={<ParentPage><FinanceReceipt /></ParentPage>} />
                <Route path="/finance/school" element={<ParentPage><FinanceSchool /></ParentPage>} />
                <Route path="/finance/supplier" element={<ParentPage><FinanceSupplier /></ParentPage>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </FamilyProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
