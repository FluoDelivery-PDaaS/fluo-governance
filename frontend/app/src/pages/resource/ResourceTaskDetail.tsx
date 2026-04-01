import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "../../lib/api";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "NOT_STARTED", label: "Não Iniciado" },
  { value: "ON_TRACK", label: "No Prazo" },
  { value: "AT_RISK", label: "Em Risco" },
  { value: "DELAYED", label: "Atrasado" },
  { value: "BLOCKED", label: "Bloqueado" },
  { value: "COMPLETED", label: "Concluído" },
];

export default function ResourceTaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  const { data: task, isLoading } = useQuery({
    queryKey: ["task", id],
    queryFn: () => tasksApi.get(id!),
    enabled: !!id,
    onSuccess: (data: any) => {
      setStatus(data.status);
      setNotes(data.notes || "");
    },
  });

  const updateTask = useMutation({
    mutationFn: (data: any) => tasksApi.update(id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task", id] });
      qc.invalidateQueries({ queryKey: ["my-tasks"] });
      toast.success("Tarefa atualizada!");
    },
    onError: () => toast.error("Erro ao atualizar tarefa."),
  });

  if (isLoading) return <div className="p-8 text-center text-gray-400">Carregando...</div>;
  if (!task) return <div className="p-8 text-center text-gray-400">Tarefa não encontrada.</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/resource")} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-montserrat">{task.title}</h1>
          <p className="text-gray-500 text-sm">{task.project?.name}</p>
        </div>
      </div>

      <div className="card space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Descrição</h3>
          <p className="text-gray-600 text-sm">{task.description || "Sem descrição."}</p>
        </div>

        {task.dueDate && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Prazo</h3>
            <p className="text-gray-600 text-sm">{new Date(task.dueDate).toLocaleDateString("pt-BR")}</p>
          </div>
        )}

        <div>
          <label className="label">Status *</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Notas / Comentários</label>
          <textarea className="input resize-none" rows={4} placeholder="Adicione observações sobre o andamento..."
            value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <button
          onClick={() => updateTask.mutate({ status, notes })}
          disabled={updateTask.isPending}
          className="btn-primary flex items-center gap-2"
        >
          <Save size={16} /> {updateTask.isPending ? "Salvando..." : "Salvar Atualização"}
        </button>
      </div>
    </div>
  );
}
