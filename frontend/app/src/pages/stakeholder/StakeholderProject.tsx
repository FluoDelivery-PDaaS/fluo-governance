import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { projectsApi, reportsApi } from "../../lib/api";
import { ArrowLeft, AlertTriangle, CheckCircle2, Clock, FileText, Sparkles } from "lucide-react";

const HEALTH_LABELS: Record<string, { label: string; className: string }> = {
  ON_TRACK: { label: "No Prazo", className: "status-on-track" },
  AT_RISK: { label: "Em Risco", className: "status-at-risk" },
  OFF_TRACK: { label: "Atrasado", className: "status-off-track" },
  COMPLETED: { label: "Concluído", className: "status-completed" },
};

export default function StakeholderProject() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "risks" | "reports">("overview");

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsApi.get(id!),
    enabled: !!id,
  });

  const { data: risks = [] } = useQuery({
    queryKey: ["risks", id],
    queryFn: () => projectsApi.getRisks(id!),
    enabled: !!id,
  });

  const { data: reports = [] } = useQuery({
    queryKey: ["reports", id],
    queryFn: () => reportsApi.list(id!),
    enabled: !!id,
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ["milestones", id],
    queryFn: () => projectsApi.getMilestones(id!),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-8 text-center text-gray-400">Carregando...</div>;
  if (!project) return <div className="p-8 text-center text-gray-400">Projeto não encontrado.</div>;

  const health = HEALTH_LABELS[project.health] || HEALTH_LABELS.ON_TRACK;
  const sentReports = reports.filter((r: any) => r.status === "SENT");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/stakeholder")} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 font-montserrat">{project.name}</h1>
            <span className={`status-badge ${health.className}`}>{health.label}</span>
          </div>
          <p className="text-gray-500 text-sm">{project.description}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="metric-card">
          <div className="text-sm text-gray-500 flex items-center gap-1"><Clock size={14} /> Período</div>
          <p className="text-sm font-semibold text-gray-900">
            {new Date(project.startDate).toLocaleDateString("pt-BR")} — {new Date(project.endDate).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <div className="metric-card">
          <div className="text-sm text-amber-600 flex items-center gap-1"><AlertTriangle size={14} /> Riscos Abertos</div>
          <p className="text-2xl font-bold text-amber-600">{risks.filter((r: any) => r.status === "OPEN").length}</p>
        </div>
        <div className="metric-card">
          <div className="text-sm text-gray-500 flex items-center gap-1"><FileText size={14} /> Relatórios</div>
          <p className="text-2xl font-bold text-gray-900">{sentReports.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1">
          {(["overview", "risks", "reports"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab ? "border-[#0891B2] text-[#0891B2]" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {{ overview: "Marcos", risks: "Riscos", reports: "Relatórios" }[tab]}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-gray-900">Marcos do Projeto</h3>
          </div>
          <div className="divide-y divide-border">
            {milestones.map((m: any) => (
              <div key={m.id} className="px-6 py-4 flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.completed ? "bg-green-100" : "bg-gray-100"}`}>
                  {m.completed ? <CheckCircle2 size={16} className="text-green-600" /> : <Clock size={16} className="text-gray-400" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{m.name}</p>
                  <p className="text-xs text-gray-400">{m.description}</p>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <p>Prazo: {new Date(m.dueDate).toLocaleDateString("pt-BR")}</p>
                  {m.completed && <p className="text-green-600">Concluído</p>}
                </div>
              </div>
            ))}
            {milestones.length === 0 && <div className="p-8 text-center text-gray-400">Nenhum marco cadastrado.</div>}
          </div>
        </div>
      )}

      {activeTab === "risks" && (
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-gray-900">Riscos do Projeto</h3>
          </div>
          <div className="divide-y divide-border">
            {risks.map((risk: any) => (
              <div key={risk.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                      <p className="font-medium text-gray-900 text-sm">{risk.title}</p>
                      <span className={`status-badge ${risk.status === "OPEN" ? "status-at-risk" : "status-on-track"}`}>
                        {risk.status === "OPEN" ? "Aberto" : "Mitigado"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 ml-5">{risk.description}</p>
                    {risk.mitigation && (
                      <p className="text-xs text-gray-400 ml-5 mt-1"><span className="font-medium">Mitigação:</span> {risk.mitigation}</p>
                    )}
                  </div>
                  <div className="text-right text-xs text-gray-400 shrink-0">
                    <p>Prob: {risk.probability}</p>
                    <p>Impacto: {risk.impact}</p>
                  </div>
                </div>
              </div>
            ))}
            {risks.length === 0 && <div className="p-8 text-center text-gray-400">Nenhum risco cadastrado.</div>}
          </div>
        </div>
      )}

      {activeTab === "reports" && (
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-gray-900">Status Reports Recebidos</h3>
          </div>
          <div className="divide-y divide-border">
            {sentReports.map((report: any) => {
              const latestVersion = report.versions?.[0];
              return (
                <div key={report.id} className="px-6 py-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} className="text-purple-500" />
                    <h4 className="font-medium text-gray-900">{report.title}</h4>
                    <span className="text-xs text-gray-400">
                      Semana de {new Date(report.weekOf).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  {latestVersion?.executiveSummary && (
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{latestVersion.executiveSummary}</p>
                  )}
                </div>
              );
            })}
            {sentReports.length === 0 && (
              <div className="p-8 text-center text-gray-400">Nenhum relatório recebido ainda.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
