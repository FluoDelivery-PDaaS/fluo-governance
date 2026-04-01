import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard, FolderKanban, CheckSquare, FileText,
  Bell, LogOut, ChevronDown, Menu, X
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { notificationsApi } from "../../lib/api";

function Logo() {
  return (
    <div className="flex items-center gap-2 px-4 py-5 border-b border-white/10">
      <div className="w-8 h-8 rounded-lg bg-[#0891B2] flex items-center justify-center">
        <span className="text-white font-bold text-sm">F</span>
      </div>
      <div>
        <p className="text-white font-bold text-sm font-montserrat">Fluo</p>
        <p className="text-white/50 text-xs">Governance</p>
      </div>
    </div>
  );
}

function PMNav({ currentPath }: { currentPath: string }) {
  const nav = useNavigate();
  const items = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/pm" },
    { icon: FolderKanban, label: "Projetos", path: "/pm/projects" },
    { icon: FileText, label: "Relatórios", path: "/pm/reports" },
  ];
  return (
    <nav className="flex-1 px-2 py-4 space-y-1">
      {items.map((item) => (
        <button
          key={item.path}
          onClick={() => nav(item.path)}
          className={`sidebar-item w-full ${currentPath.startsWith(item.path) ? "active" : ""}`}
        >
          <item.icon size={18} />
          {item.label}
        </button>
      ))}
    </nav>
  );
}

function StakeholderNav({ currentPath }: { currentPath: string }) {
  const nav = useNavigate();
  const items = [
    { icon: LayoutDashboard, label: "Meus Projetos", path: "/stakeholder" },
  ];
  return (
    <nav className="flex-1 px-2 py-4 space-y-1">
      {items.map((item) => (
        <button
          key={item.path}
          onClick={() => nav(item.path)}
          className={`sidebar-item w-full ${currentPath.startsWith(item.path) ? "active" : ""}`}
        >
          <item.icon size={18} />
          {item.label}
        </button>
      ))}
    </nav>
  );
}

function ResourceNav({ currentPath }: { currentPath: string }) {
  const nav = useNavigate();
  const items = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/resource" },
    { icon: CheckSquare, label: "Minhas Tarefas", path: "/resource/tasks" },
  ];
  return (
    <nav className="flex-1 px-2 py-4 space-y-1">
      {items.map((item) => (
        <button
          key={item.path}
          onClick={() => nav(item.path)}
          className={`sidebar-item w-full ${currentPath.startsWith(item.path) ? "active" : ""}`}
        >
          <item.icon size={18} />
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsApi.list,
    refetchInterval: 30_000,
  });

  const unreadCount = notifications?.filter((n: any) => !n.read).length || 0;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const renderNav = () => {
    if (user?.role === "PROJECT_MANAGER") return <PMNav currentPath={location.pathname} />;
    if (user?.role === "STAKEHOLDER") return <StakeholderNav currentPath={location.pathname} />;
    return <ResourceNav currentPath={location.pathname} />;
  };

  const roleLabel = {
    PROJECT_MANAGER: "Project Manager",
    STAKEHOLDER: "Stakeholder",
    RESOURCE: "Resource",
  }[user?.role || "RESOURCE"];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <Logo />
        {renderNav()}

        {/* User section */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#0891B2] flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-white/50 text-xs">{roleLabel}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-item w-full text-red-300 hover:text-red-200 hover:bg-red-500/10"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-border px-4 lg:px-6 h-14 flex items-center justify-between sticky top-0 z-20">
          <button
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
