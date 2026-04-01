import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportsApi } from "../../lib/api";
import { toast } from "sonner";
import { ArrowLeft, Plus, FileText, Sparkles, Send, Clock } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  GENERATING: { label: "Gerando...", className: "status-not-started" },
  DRAFT: { label: "Rascunho", className: "status-at-risk" },
  APPROVED: { label: "Aprovado", className: "status-on-track" },
  SENT: { label: "Enviado", className: "status-completed" },
};

export default function ReportsPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [weekOf, setWeekOf] = useState(() => new Date().toISOString().split("T")[0]);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["reports", projectId],
    queryFn: () => reportsApi.list(projectId!),
    enabled: !!projectId,
    refetchInterval: 10_000,
  });

  const createReport = useMutation({
    mutationFn: () => reportsApi.create({ projectId, weekOf: new Date(weekOf).toISOString() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports", projectId] });
      setShowCreate(false);
      toast.success("Relatório criado! A IA está gerando o conteúdo...");
    },
    onError: () => toast.error("Erro ao criar relatório."),
  });

  const sendReport = useMutation({
    mutationFn: (reportId: string) => reportsApi.send(reportId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["reports", projectId] });
      toast.success(`Relatório enviado para ${data.sentTo?.length} stakeholder(s)!`);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Erro ao enviar relatório."),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 font-montserrat">Status Reports</h1>
          <p className="text-gray-500">Relatórios gerados por IA e revisados pelo PM</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Sparkles size={16} /> Gerar Relatório IA
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-gray-900">Histórico de Relatórios</h2>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Carregando...</div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum relatório ainda.</p>
            <button onClick={() => setShowCreate(true)} className="btn-primary mt-4 flex items-center gap-2 mx-auto">
              <Sparkles size={16} /> Gerar primeiro relatório
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {reports.map((report: any) => {
              const status = STATUS_LABELS[report.status] || STATUS_LABELS.DRAFT;
              const latestVersion = report.versions?.[0];
              return (
                <div key={report.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex-1 cursor-pointer" onClick={() => navigate(`/pm/reports/${report.id}`)}>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium text-gray-900">{report.title}</h3>
                      <span className={`status-badge ${status.className}`}>{status.label}</span>
                      {latestVersion?.isAIGenerated && (
                        <span className="status-badge bg-purple-100 text-purple-700">
                          <Sparkles size={10} /> IA
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> Semana de {new Date(report.weekOf).toLocaleDateString("pt-BR")}
                      </span>
                      <span>{report._count?.versions || 0} versão(ões)</span>
                    </div>
                  </div>
                  {report.status === "APPROVED" && (
                    <button
                      onClick={() => sendReport.mutate(report.id)}
                      disabled={sendReport.isPending}
                      className="btn-secondary flex items-center gap-1 text-xs px-3 py-1.5 ml-4"
                    >
                      <Send size={12} /> Enviar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold font-montserrat flex items-center gap-2">
                <Sparkles size={18} className="text-purple-500" /> Gerar Relatório com IA
              </h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">
                A IA vai analisar o status das tarefas, riscos e atualizações recentes para gerar um status report executivo completo.
              </p>
              <div>
                <label className="label">Semana de referência</label>
                <input type="date" className="input" value={weekOf} onChange={(e) => setWeekOf(e.target.value)} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancelar</button>
                <button onClick={() => createReport.mutate()} disabled={createReport.isPending} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Sparkles size={16} />
                  {createReport.isPending ? "Gerando..." : "Gerar com IA"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
