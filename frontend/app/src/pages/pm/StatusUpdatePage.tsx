import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "../../lib/api";
import { toast } from "sonner";
import { ArrowLeft, Plus, Clock } from "lucide-react";

const HEALTH_OPTIONS = [
  { value: "ON_TRACK", label: "No Prazo" },
  { value: "AT_RISK", label: "Em Risco" },
  { value: "OFF_TRACK", label: "Atrasado" },
];

export default function StatusUpdatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", summary: "", overallHealth: "ON_TRACK", scopeStatus: "ON_TRACK",
    scheduleStatus: "ON_TRACK", budgetStatus: "ON_TRACK", accomplishments: "",
    nextSteps: "", blockers: "", budgetSpent: "", completionPercentage: "",
  });

  const { data: updates = [], isLoading } = useQuery({
    queryKey: ["status-updates", id],
    queryFn: () => projectsApi.getStatusUpdates(id!),
    enabled: !!id,
  });

  const createUpdate = useMutation({
    mutationFn: (data: any) => projectsApi.createStatusUpdate(id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["status-updates", id] });
      setShowForm(false);
      setForm({ title: "", summary: "", overallHealth: "ON_TRACK", scopeStatus: "ON_TRACK",
        scheduleStatus: "ON_TRACK", budgetStatus: "ON_TRACK", accomplishments: "",
        nextSteps: "", blockers: "", budgetSpent: "", completionPercentage: "" });
      toast.success("Atualização registrada!");
    },
    onError: () => toast.error("Erro ao registrar atualização."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUpdate.mutate({
      ...form,
      budgetSpent: form.budgetSpent ? Number(form.budgetSpent) : undefined,
      completionPercentage: form.completionPercentage ? Number(form.completionPercentage) : undefined,
    });
  };

  const HEALTH_COLORS: Record<string, string> = {
    ON_TRACK: "text-green-600 bg-green-50",
    AT_RISK: "text-amber-600 bg-amber-50",
    OFF_TRACK: "text-red-600 bg-red-50",
  };
  const HEALTH_LABELS: Record<string, string> = {
    ON_TRACK: "No Prazo", AT_RISK: "Em Risco", OFF_TRACK: "Atrasado",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/pm/projects/${id}`)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 font-montserrat">Atualizações de Status</h1>
          <p className="text-gray-500">Registre o progresso semanal do projeto</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nova Atualização
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-gray-900">Histórico de Atualizações</h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Carregando...</div>
        ) : updates.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Nenhuma atualização registrada.</div>
        ) : (
          <div className="divide-y divide-border">
            {updates.map((update: any) => (
              <div key={update.id} className="px-6 py-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{update.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {new Date(update.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                  <span className={`status-badge text-xs px-2 py-1 rounded-full font-medium ${HEALTH_COLORS[update.overallHealth]}`}>
                    {HEALTH_LABELS[update.overallHealth]}
                  </span>
                </div>
                {update.summary && <p className="text-sm text-gray-600 mb-3">{update.summary}</p>}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  {[
                    { label: "Escopo", value: update.scopeStatus },
                    { label: "Cronograma", value: update.scheduleStatus },
                    { label: "Orçamento", value: update.budgetStatus },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-400 mb-1">{label}</p>
                      <span className={`font-medium ${HEALTH_COLORS[value]?.split(" ")[0]}`}>
                        {HEALTH_LABELS[value]}
                      </span>
                    </div>
                  ))}
                </div>
                {update.accomplishments && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 mb-1">Realizações</p>
                    <p className="text-sm text-gray-600">{update.accomplishments}</p>
                  </div>
                )}
                {update.nextSteps && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-500 mb-1">Próximos Passos</p>
                    <p className="text-sm text-gray-600">{update.nextSteps}</p>
                  </div>
                )}
                {update.blockers && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-red-500 mb-1">Bloqueadores</p>
                    <p className="text-sm text-red-600">{update.blockers}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold font-montserrat">Nova Atualização de Status</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Título *</label>
                <input className="input" placeholder="Ex: Atualização Semanal — Semana 12" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <label className="label">Sumário Executivo</label>
                <textarea className="input resize-none" rows={3} placeholder="Visão geral do status atual do projeto..."
                  value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { key: "overallHealth", label: "Status Geral" },
                  { key: "scopeStatus", label: "Escopo" },
                  { key: "scheduleStatus", label: "Cronograma" },
                  { key: "budgetStatus", label: "Orçamento" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="label">{label}</label>
                    <select className="input" value={(form as any)[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}>
                      {HEALTH_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <div>
                <label className="label">Realizações</label>
                <textarea className="input resize-none" rows={2} placeholder="O que foi concluído neste período..."
                  value={form.accomplishments} onChange={(e) => setForm({ ...form, accomplishments: e.target.value })} />
              </div>
              <div>
                <label className="label">Próximos Passos</label>
                <textarea className="input resize-none" rows={2} placeholder="O que será feito no próximo período..."
                  value={form.nextSteps} onChange={(e) => setForm({ ...form, nextSteps: e.target.value })} />
              </div>
              <div>
                <label className="label">Bloqueadores</label>
                <textarea className="input resize-none" rows={2} placeholder="Impedimentos que precisam de atenção..."
                  value={form.blockers} onChange={(e) => setForm({ ...form, blockers: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Orçamento Gasto (R$)</label>
                  <input type="number" className="input" placeholder="0" value={form.budgetSpent}
                    onChange={(e) => setForm({ ...form, budgetSpent: e.target.value })} />
                </div>
                <div>
                  <label className="label">Conclusão (%)</label>
                  <input type="number" className="input" placeholder="0-100" min="0" max="100" value={form.completionPercentage}
                    onChange={(e) => setForm({ ...form, completionPercentage: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={createUpdate.isPending} className="btn-primary flex-1">
                  {createUpdate.isPending ? "Salvando..." : "Registrar Atualização"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
