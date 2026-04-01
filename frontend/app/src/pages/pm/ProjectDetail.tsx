import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsApi, tasksApi } from "../../lib/api";
import { toast } from "sonner";
import { ArrowLeft, Plus, AlertTriangle, CheckCircle2, Clock, Users, FileText, ChevronRight } from "lucide-react";

const HEALTH_LABELS: Record<string, { label: string; className: string }> = {
  ON_TRACK: { label: "No Prazo", className: "status-on-track" },
  AT_RISK: { label: "Em Risco", className: "status-at-risk" },
  OFF_TRACK: { label: "Atrasado", className: "status-off-track" },
  COMPLETED: { label: "Concluído", className: "status-completed" },
};

const TASK_STATUS: Record<string, { label: string; className: string }> = {
  NOT_STARTED: { label: "Não Iniciado", className: "status-not-started" },
  ON_TRACK: { label: "No Prazo", className: "status-on-track" },
  AT_RISK: { label: "Em Risco", className: "status-at-risk" },
  DELAYED: { label: "Atrasado", className: "status-delayed" },
  BLOCKED: { label: "Bloqueado", className: "status-blocked" },
  COMPLETED: { label: "Concluído", className: "status-completed" },
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "risks" | "milestones">("overview");
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddRisk, setShowAddRisk] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "MEDIUM", dueDate: "", milestoneId: "" });
  const [riskForm, setRiskForm] = useState({ title: "", description: "", probability: "MEDIUM", impact: "MEDIUM", mitigation: "", owner: "" });

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsApi.get(id!),
    enabled: !!id,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", id],
    queryFn: () => tasksApi.list(id!),
    enabled: !!id,
  });

  const { data: risks = [] } = useQuery({
    queryKey: ["risks", id],
    queryFn: () => projectsApi.getRisks(id!),
    enabled: !!id,
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ["milestones", id],
    queryFn: () => projectsApi.getMilestones(id!),
    enabled: !!id,
  });

  const createTask = useMutation({
    mutationFn: (data: any) => tasksApi.create({ ...data, projectId: id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks", id] }); setShowAddTask(false); toast.success("Tarefa criada!"); },
    onError: () => toast.error("Erro ao criar tarefa."),
  });

  const createRisk = useMutation({
    mutationFn: (data: any) => projectsApi.createRisk(id!, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["risks", id] }); setShowAddRisk(false); toast.success("Risco cadastrado!"); },
    onError: () => toast.error("Erro ao cadastrar risco."),
  });

  if (isLoading) return <div className="p-8 text-center text-gray-400">Carregando projeto...</div>;
  if (!project) return <div className="p-8 text-center text-gray-400">Projeto não encontrado.</div>;

  const health = HEALTH_LABELS[project.health] || HEALTH_LABELS.ON_TRACK;
  const completedTasks = tasks.filter((t: any) => t.status === "COMPLETED").length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => navigate("/pm")} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg mt-0.5">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900 font-montserrat">{project.name}</h1>
            <span className={`status-badge ${health.className}`}>{health.label}</span>
          </div>
          <p className="text-gray-500">{project.description}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/pm/projects/${id}/reports`)} className="btn-secondary flex items-center gap-2">
            <FileText size={16} /> Relatórios
          </button>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="text-sm text-gray-500 flex items-center gap-1"><Clock size={14} /> Prazo</div>
          <p className="text-sm font-semibold text-gray-900">
            {new Date(project.startDate).toLocaleDateString("pt-BR")} — {new Date(project.endDate).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <div className="metric-card">
          <div className="text-sm text-gray-500 flex items-center gap-1"><CheckCircle2 size={14} /> Progresso</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#0891B2] rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-sm font-bold text-gray-900">{progress}%</span>
          </div>
        </div>
        <div className="metric-card">
          <div className="text-sm text-gray-500 flex items-center gap-1"><AlertTriangle size={14} /> Riscos Abertos</div>
          <p className="text-2xl font-bold text-amber-600">{risks.filter((r: any) => r.status === "OPEN").length}</p>
        </div>
        <div className="metric-card">
          <div className="text-sm text-gray-500 flex items-center gap-1"><Users size={14} /> Membros</div>
          <p className="text-2xl font-bold text-gray-900">{project.members?.length || 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-1">
          {(["overview", "tasks", "risks", "milestones"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-[#0891B2] text-[#0891B2]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {{ overview: "Visão Geral", tasks: "Tarefas", risks: "Riscos", milestones: "Marcos" }[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Tarefas Recentes</h3>
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task: any) => {
                const s = TASK_STATUS[task.status] || TASK_STATUS.NOT_STARTED;
                return (
                  <div key={task.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 truncate flex-1">{task.title}</span>
                    <span className={`status-badge ml-2 ${s.className}`}>{s.label}</span>
                  </div>
                );
              })}
              {tasks.length === 0 && <p className="text-sm text-gray-400">Nenhuma tarefa cadastrada.</p>}
            </div>
          </div>
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Riscos Abertos</h3>
            <div className="space-y-3">
              {risks.filter((r: any) => r.status === "OPEN").slice(0, 5).map((risk: any) => (
                <div key={risk.id} className="flex items-start gap-3">
                  <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{risk.title}</p>
                    <p className="text-xs text-gray-400">{risk.probability} prob. / {risk.impact} impacto</p>
                  </div>
                </div>
              ))}
              {risks.filter((r: any) => r.status === "OPEN").length === 0 && (
                <p className="text-sm text-gray-400">Nenhum risco aberto.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Tarefas ({tasks.length})</h3>
            <button onClick={() => setShowAddTask(true)} className="btn-primary flex items-center gap-1 text-xs px-3 py-1.5">
              <Plus size={14} /> Adicionar
            </button>
          </div>
          <div className="divide-y divide-border">
            {tasks.map((task: any) => {
              const s = TASK_STATUS[task.status] || TASK_STATUS.NOT_STARTED;
              return (
                <div key={task.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{task.title}</p>
                    {task.dueDate && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Prazo: {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className={`status-badge ${s.className}`}>{s.label}</span>
                    <span className="text-xs text-gray-400 capitalize">{task.priority?.toLowerCase()}</span>
                  </div>
                </div>
              );
            })}
            {tasks.length === 0 && (
              <div className="p-8 text-center text-gray-400">Nenhuma tarefa cadastrada.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === "risks" && (
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Riscos ({risks.length})</h3>
            <button onClick={() => setShowAddRisk(true)} className="btn-primary flex items-center gap-1 text-xs px-3 py-1.5">
              <Plus size={14} /> Adicionar
            </button>
          </div>
          <div className="divide-y divide-border">
            {risks.map((risk: any) => (
              <div key={risk.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 text-sm">{risk.title}</p>
                      <span className={`status-badge ${risk.status === "OPEN" ? "status-at-risk" : risk.status === "MITIGATED" ? "status-on-track" : "status-completed"}`}>
                        {risk.status === "OPEN" ? "Aberto" : risk.status === "MITIGATED" ? "Mitigado" : "Fechado"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{risk.description}</p>
                    {risk.mitigation && (
                      <p className="text-xs text-gray-400"><span className="font-medium">Mitigação:</span> {risk.mitigation}</p>
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

      {activeTab === "milestones" && (
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="font-semibold text-gray-900">Marcos do Projeto ({milestones.length})</h3>
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
                  {m.completed && m.completedAt && (
                    <p className="text-green-600">Entregue: {new Date(m.completedAt).toLocaleDateString("pt-BR")}</p>
                  )}
                </div>
              </div>
            ))}
            {milestones.length === 0 && <div className="p-8 text-center text-gray-400">Nenhum marco cadastrado.</div>}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold font-montserrat">Nova Tarefa</h3>
              <button onClick={() => setShowAddTask(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createTask.mutate(taskForm); }} className="p-6 space-y-4">
              <div>
                <label className="label">Título *</label>
                <input className="input" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
              </div>
              <div>
                <label className="label">Descrição</label>
                <textarea className="input resize-none" rows={2} value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Prioridade</label>
                  <select className="input" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                    <option value="CRITICAL">Crítica</option>
                  </select>
                </div>
                <div>
                  <label className="label">Prazo</label>
                  <input type="date" className="input" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddTask(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={createTask.isPending} className="btn-primary flex-1">
                  {createTask.isPending ? "Criando..." : "Criar Tarefa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Risk Modal */}
      {showAddRisk && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold font-montserrat">Novo Risco</h3>
              <button onClick={() => setShowAddRisk(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createRisk.mutate(riskForm); }} className="p-6 space-y-4">
              <div>
                <label className="label">Título *</label>
                <input className="input" value={riskForm.title} onChange={(e) => setRiskForm({ ...riskForm, title: e.target.value })} required />
              </div>
              <div>
                <label className="label">Descrição</label>
                <textarea className="input resize-none" rows={2} value={riskForm.description}
                  onChange={(e) => setRiskForm({ ...riskForm, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Probabilidade</label>
                  <select className="input" value={riskForm.probability} onChange={(e) => setRiskForm({ ...riskForm, probability: e.target.value })}>
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="label">Impacto</label>
                  <select className="input" value={riskForm.impact} onChange={(e) => setRiskForm({ ...riskForm, impact: e.target.value })}>
                    <option value="LOW">Baixo</option>
                    <option value="MEDIUM">Médio</option>
                    <option value="HIGH">Alto</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Mitigação</label>
                <textarea className="input resize-none" rows={2} value={riskForm.mitigation}
                  onChange={(e) => setRiskForm({ ...riskForm, mitigation: e.target.value })} />
              </div>
              <div>
                <label className="label">Responsável</label>
                <input className="input" value={riskForm.owner} onChange={(e) => setRiskForm({ ...riskForm, owner: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddRisk(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={createRisk.isPending} className="btn-primary flex-1">
                  {createRisk.isPending ? "Salvando..." : "Cadastrar Risco"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
