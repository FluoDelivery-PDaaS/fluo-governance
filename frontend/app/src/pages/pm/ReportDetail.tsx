import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportsApi } from "../../lib/api";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, Edit2, Save, Send } from "lucide-react";

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  const { data: report, isLoading } = useQuery({
    queryKey: ["report", id],
    queryFn: () => reportsApi.get(id!),
    enabled: !!id,
    refetchInterval: (data: any) => data?.status === "GENERATING" ? 5_000 : false,
  });

  const latestVersion = report?.versions?.[0];

  const updateReport = useMutation({
    mutationFn: (data: any) => reportsApi.update(id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["report", id] });
      setEditing(false);
      toast.success("Relatório atualizado e aprovado!");
    },
    onError: () => toast.error("Erro ao salvar."),
  });

  const sendReport = useMutation({
    mutationFn: () => reportsApi.send(id!),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["report", id] });
      toast.success(`Relatório enviado para ${data.sentTo?.length} stakeholder(s)!`);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Erro ao enviar."),
  });

  if (isLoading) return <div className="p-8 text-center text-gray-400">Carregando relatório...</div>;
  if (!report) return <div className="p-8 text-center text-gray-400">Relatório não encontrado.</div>;

  const isGenerating = report.status === "GENERATING";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 font-montserrat">{report.title}</h1>
          <p className="text-gray-500 text-sm">
            Semana de {new Date(report.weekOf).toLocaleDateString("pt-BR")} · Status: {report.status}
          </p>
        </div>
        <div className="flex gap-2">
          {!editing && latestVersion && report.status !== "SENT" && (
            <button onClick={() => { setEditing(true); setEditContent(latestVersion.fullContent || ""); }}
              className="btn-secondary flex items-center gap-2">
              <Edit2 size={16} /> Editar
            </button>
          )}
          {report.status === "APPROVED" && (
            <button onClick={() => sendReport.mutate()} disabled={sendReport.isPending}
              className="btn-primary flex items-center gap-2">
              <Send size={16} /> {sendReport.isPending ? "Enviando..." : "Enviar"}
            </button>
          )}
        </div>
      </div>

      {isGenerating && (
        <div className="card flex items-center gap-4 bg-purple-50 border-purple-200">
          <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin shrink-0" />
          <div>
            <p className="font-semibold text-purple-700">IA gerando relatório...</p>
            <p className="text-sm text-purple-500">Analisando tarefas, riscos e atualizações do projeto.</p>
          </div>
        </div>
      )}

      {latestVersion && !editing && (
        <div className="card space-y-6">
          {latestVersion.isAIGenerated && (
            <div className="flex items-center gap-2 text-purple-600 text-sm">
              <Sparkles size={14} /> Gerado por IA {latestVersion.editedByHuman ? "· Revisado pelo PM" : "· Aguardando revisão"}
            </div>
          )}

          {latestVersion.executiveSummary && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Sumário Executivo</h3>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{latestVersion.executiveSummary}</p>
            </div>
          )}

          {latestVersion.mainRisks && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Principais Riscos</h3>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{latestVersion.mainRisks}</p>
            </div>
          )}

          {latestVersion.mainBlockers && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Bloqueadores</h3>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{latestVersion.mainBlockers}</p>
            </div>
          )}

          {latestVersion.mitigationSuggestions && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Sugestões de Mitigação</h3>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{latestVersion.mitigationSuggestions}</p>
            </div>
          )}
        </div>
      )}

      {editing && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Editar Relatório</h3>
            <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-gray-600 text-sm">Cancelar</button>
          </div>
          <textarea
            className="input resize-none w-full font-mono text-sm"
            rows={20}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          <button
            onClick={() => updateReport.mutate({ fullContent: editContent })}
            disabled={updateReport.isPending}
            className="btn-primary flex items-center gap-2"
          >
            <Save size={16} /> {updateReport.isPending ? "Salvando..." : "Salvar e Aprovar"}
          </button>
        </div>
      )}

      {!latestVersion && !isGenerating && (
        <div className="card text-center py-12">
          <Sparkles size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum conteúdo gerado ainda.</p>
        </div>
      )}
    </div>
  );
}
