import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { projectsApi, reportsApi } from "../../lib/api";
import { FileText, Sparkles, Clock, ChevronRight, FolderKanban } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  GENERATING: { label: "Gerando...", className: "status-not-started" },
  DRAFT: { label: "Rascunho", className: "status-at-risk" },
  APPROVED: { label: "Aprovado", className: "status-on-track" },
  SENT: { label: "Enviado", className: "status-completed" },
};

function ProjectReports({ project, navigate }: { project: any; navigate: any }) {
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports", project.id],
    queryFn: () => reportsApi.list(project.id),
  });

  return (
    <div className="card p-0 overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-3">
          <FolderKanban size={18} className="text-[#0891B2]" />
          <h2 className="font-semibold text-gray-900">{project.name}</h2>
        </div>
        <button
          onClick={() => navigate(`/pm/projects/${project.id}/reports`)}
          className="btn-secondary text-xs flex items-center gap-1 px-3 py-1.5"
        >
          <Sparkles size={12} /> Gerar Relatório
        </button>
      </div>
      {isLoading ? (
        <div className="p-6 text-center text-gray-400 text-sm">Carregando...</div>
      ) : reports.length === 0 ? (
        <div className="p-8 text-center">
          <FileText size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Nenhum relatório ainda para este projeto.</p>
          <button
            onClick={() => navigate(`/pm/projects/${project.id}/reports`)}
            className="btn-primary mt-3 text-xs flex items-center gap-1 mx-auto"
          >
            <Sparkles size={12} /> Gerar primeiro relatório
          </button>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {reports.slice(0, 3).map((report: any) => {
            const status = STATUS_LABELS[report.status] || STATUS_LABELS.DRAFT;
            return (
              <div
                key={report.id}
                className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/pm/reports/${report.id}`)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm text-gray-900">{report.title}</span>
                    <span className={`status-badge ${status.className}`}>{status.label}</span>
                    {report.versions?.[0]?.isAIGenerated && (
                      <span className="status-badge bg-purple-100 text-purple-700 flex items-center gap-1">
                        <Sparkles size={9} /> IA
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={11} />
                    <span>Semana de {new Date(report.weekOf).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            );
          })}
          {reports.length > 3 && (
            <div className="px-6 py-3 text-center">
              <button
                onClick={() => navigate(`/pm/projects/${project.id}/reports`)}
                className="text-xs text-[#0891B2] hover:underline"
              >
                Ver todos os {reports.length} relatórios →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PMReportsAllPage() {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => projectsApi.list(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-montserrat">Status Reports</h1>
          <p className="text-gray-500 mt-1">Relatórios gerados por IA e revisados pelo PM</p>
        </div>
      </div>

      {isLoading ? (
        <div className="card p-8 text-center text-gray-400">Carregando projetos...</div>
      ) : projects.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum projeto encontrado.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project: any) => (
            <ProjectReports key={project.id} project={project} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
}
