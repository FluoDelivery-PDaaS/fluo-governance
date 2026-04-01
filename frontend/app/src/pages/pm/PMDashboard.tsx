import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import { Plus, FolderKanban, AlertTriangle, CheckCircle2, Clock, TrendingUp } from "lucide-react";

const HEALTH_LABELS: Record<string, { label: string; className: string }> = {
  ON_TRACK: { label: "No Prazo", className: "status-on-track" },
  AT_RISK: { label: "Em Risco", className: "status-at-risk" },
  OFF_TRACK: { label: "Atrasado", className: "status-off-track" },
  COMPLETED: { label: "Concluído", className: "status-completed" },
};

export default function PMDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", startDate: "", endDate: "", budget: "", currency: "BRL",
  });

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setShowCreate(false);
      setForm({ name: "", description: "", startDate: "", endDate: "", budget: "", currency: "BRL" });
      toast.success("Projeto criado com sucesso!");
    },
    onError: () => toast.error("Erro ao criar projeto."),
  });

  const metrics = {
    total: projects.length,
    onTrack: projects.filter((p: any) => p.health === "ON_TRACK").length,
    atRisk: projects.filter((p: any) => p.health === "AT_RISK").length,
    completed: projects.filter((p: any) => p.health === "COMPLETED" || p.status === "COMPLETED").length,
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      budget: form.budget ? Number(form.budget) : undefined,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-montserrat">
            Olá, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">Visão geral dos seus projetos</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Novo Projeto
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <FolderKanban size={16} /> Total de Projetos
          </div>
          <p className="text-3xl font-bold text-gray-900">{metrics.total}</p>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <TrendingUp size={16} /> No Prazo
          </div>
          <p className="text-3xl font-bold text-green-600">{metrics.onTrack}</p>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-2 text-amber-600 text-sm">
            <AlertTriangle size={16} /> Em Risco
          </div>
          <p className="text-3xl font-bold text-amber-600">{metrics.atRisk}</p>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <CheckCircle2 size={16} /> Concluídos
          </div>
          <p className="text-3xl font-bold text-gray-600">{metrics.completed}</p>
        </div>
      </div>

      {/* Projects list */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Projetos Ativos</h2>
          <span className="text-sm text-gray-500">{projects.length} projetos</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Carregando projetos...</div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center">
            <FolderKanban size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum projeto ainda.</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary mt-4">
              Criar primeiro projeto
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {projects.map((project: any) => {
              const health = HEALTH_LABELS[project.health] || HEALTH_LABELS.ON_TRACK;
              const start = new Date(project.startDate).toLocaleDateString("pt-BR");
              const end = new Date(project.endDate).toLocaleDateString("pt-BR");
              return (
                <div
                  key={project.id}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/pm/projects/${project.id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
                        <span className={`status-badge ${health.className}`}>{health.label}</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{project.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Clock size={12} /> {start} — {end}</span>
                        {project.budget && (
                          <span>
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: project.currency || "BRL" }).format(project.budget)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      {project._count?.members || 0} membros
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create project modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 font-montserrat">Novo Projeto</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="label">Nome do Projeto *</label>
                <input className="input" placeholder="Ex: Implementação SAP S/4HANA" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Descrição</label>
                <textarea className="input resize-none" rows={3} placeholder="Descreva o objetivo do projeto..."
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Data de Início *</label>
                  <input type="date" className="input" value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Data de Fim *</label>
                  <input type="date" className="input" value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Orçamento</label>
                  <input type="number" className="input" placeholder="1200000" value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })} />
                </div>
                <div>
                  <label className="label">Moeda</label>
                  <select className="input" value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                    <option value="BRL">BRL</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1">
                  {createMutation.isPending ? "Criando..." : "Criar Projeto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
