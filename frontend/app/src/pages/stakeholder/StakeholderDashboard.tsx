import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { FolderKanban, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";

const HEALTH_LABELS: Record<string, { label: string; className: string }> = {
  ON_TRACK: { label: "No Prazo", className: "status-on-track" },
  AT_RISK: { label: "Em Risco", className: "status-at-risk" },
  OFF_TRACK: { label: "Atrasado", className: "status-off-track" },
  COMPLETED: { label: "Concluído", className: "status-completed" },
};

export default function StakeholderDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.list,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-montserrat">
          Olá, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">Acompanhe o status dos seus projetos</p>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-400 py-8">Carregando projetos...</div>
      ) : projects.length === 0 ? (
        <div className="card text-center py-12">
          <FolderKanban size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum projeto associado ao seu perfil.</p>
          <p className="text-sm text-gray-400 mt-1">Entre em contato com o seu Project Manager.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project: any) => {
            const health = HEALTH_LABELS[project.health] || HEALTH_LABELS.ON_TRACK;
            return (
              <div
                key={project.id}
                className="card cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/stakeholder/projects/${project.id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{project.name}</h3>
                      <span className={`status-badge ${health.className}`}>{health.label}</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-3">{project.description}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <span>Início: {new Date(project.startDate).toLocaleDateString("pt-BR")}</span>
                      <span>Fim: {new Date(project.endDate).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-300 mt-1 shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
