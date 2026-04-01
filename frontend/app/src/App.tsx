import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import PMDashboard from "./pages/pm/PMDashboard";
import ProjectDetail from "./pages/pm/ProjectDetail";
import TasksPage from "./pages/pm/TasksPage";
import ReportsPage from "./pages/pm/ReportsPage";
import ReportDetail from "./pages/pm/ReportDetail";
import StakeholderDashboard from "./pages/stakeholder/StakeholderDashboard";
import StakeholderProject from "./pages/stakeholder/StakeholderProject";
import ResourceDashboard from "./pages/resource/ResourceDashboard";
import ResourceTasks from "./pages/resource/ResourceTasks";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RoleRoute({ role, children }: { role: string; children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== role) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function DashboardRedirect() {
  const { user } = useAuth();
  if (user?.role === "PROJECT_MANAGER") return <Navigate to="/pm" replace />;
  if (user?.role === "STAKEHOLDER") return <Navigate to="/stakeholder" replace />;
  return <Navigate to="/resource" replace />;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#0891B2] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Carregando...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected */}
      <Route path="/" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
        <Route index element={<DashboardRedirect />} />
        <Route path="dashboard" element={<DashboardRedirect />} />

        {/* PM Routes */}
        <Route path="pm" element={<RoleRoute role="PROJECT_MANAGER"><PMDashboard /></RoleRoute>} />
        <Route path="pm/projects/:id" element={<RoleRoute role="PROJECT_MANAGER"><ProjectDetail /></RoleRoute>} />
        <Route path="pm/projects/:id/tasks" element={<RoleRoute role="PROJECT_MANAGER"><TasksPage /></RoleRoute>} />
        <Route path="pm/projects/:id/reports" element={<RoleRoute role="PROJECT_MANAGER"><ReportsPage /></RoleRoute>} />
        <Route path="pm/reports/:id" element={<RoleRoute role="PROJECT_MANAGER"><ReportDetail /></RoleRoute>} />

        {/* Stakeholder Routes */}
        <Route path="stakeholder" element={<RoleRoute role="STAKEHOLDER"><StakeholderDashboard /></RoleRoute>} />
        <Route path="stakeholder/projects/:id" element={<RoleRoute role="STAKEHOLDER"><StakeholderProject /></RoleRoute>} />

        {/* Resource Routes */}
        <Route path="resource" element={<RoleRoute role="RESOURCE"><ResourceDashboard /></RoleRoute>} />
        <Route path="resource/tasks" element={<RoleRoute role="RESOURCE"><ResourceTasks /></RoleRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
