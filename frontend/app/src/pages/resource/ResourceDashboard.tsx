import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { projectsApi, tasksApi } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { CheckCircle2, Clock, AlertTriangle, ChevronRight } from "lucide-react";

const TASK_STATUS: Record<string, { label: string; className: string }> = {
  NOT_STARTED: { label: "Não Iniciado", className: "status-not-started" },
  ON_TRACK: { label: "No Prazo", className: "status-on-track" },
  AT_RISK: { label: "Em Risco", className: "status-at-risk" },
  DELAYED: { label: "Atrasado", className: "status-delayed" },
  BLOCKED: { label: "Bloqueado", className: "status-blocked" },
  COMPLETED: { label: "Concluído", className: "status-completed" },
};

export default function ResourceDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: myTasks = [], isLoading } = useQuery({
    queryKey: ["my-tasks"],
    queryFn: tasksApi.myTasks,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.list,
  });

  const pendingTasks = myTasks.filter((t: any) => t.status !== "COMPLETED");
  const completedTasks = myTasks.filter((t: any) => t.status === "COMPLETED");
  const overdueTasks = myTasks.filter((t: any) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "COMPLETED");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-montserrat">
          Olá, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">Suas tarefas e projetos ativos</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="metric-card">
          <div className="text-sm text-gray-500 flex items-center gap-1"><Clock size={14} /> Pendentes</div>
          <p className="text-3xl font-bold text-gray-900">{pendingTasks.length}</p>
        </div>
        <div className="metric-card">
          <div className="text-sm text-red-500 flex items-center gap-1"><AlertTriangle size={14} /> Atrasadas</div>
          <p className="text-3xl font-bold text-red-600">{overdueTasks.length}</p>
        </div>
        <div className="metric-card">
          <div className="text-sm text-green-600 flex items-center gap-1"><CheckCircle2 size={14} /> Concluídas</div>
          <p className="text-3xl font-bold text-green-600">{completedTasks.length}</p>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-gray-900">Minhas Tarefas</h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Carregando tarefas...</div>
        ) : myTasks.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Nenhuma tarefa atribuída a você.</div>
        ) : (
          <div className="divide-y divide-border">
            {myTasks.map((task: any) => {
              const s = TASK_STATUS[task.status] || TASK_STATUS.NOT_STARTED;
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "COMPLETED";
              return (
                <div key={task.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/resource/tasks/${task.id}`)}>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{task.project?.name}</p>
                    {task.dueDate && (
                      <p className={`text-xs mt-0.5 ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
                        {isOverdue ? "⚠ " : ""}Prazo: {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className={`status-badge ${s.className}`}>{s.label}</span>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-gray-900">Meus Projetos</h2>
        </div>
        <div className="divide-y divide-border">
          {projects.map((project: any) => (
            <div key={project.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p className="font-medium text-gray-900 text-sm">{project.name}</p>
                <p className="text-xs text-gray-400">{project.description}</p>
              </div>
              <span className={`status-badge ${project.health === "ON_TRACK" ? "status-on-track" : project.health === "AT_RISK" ? "status-at-risk" : "status-off-track"}`}>
                {project.health === "ON_TRACK" ? "No Prazo" : project.health === "AT_RISK" ? "Em Risco" : "Atrasado"}
              </span>
            </div>
          ))}
          {projects.length === 0 && <div className="p-8 text-center text-gray-400">Nenhum projeto associado.</div>}
        </div>
      </div>
    </div>
  );
}
