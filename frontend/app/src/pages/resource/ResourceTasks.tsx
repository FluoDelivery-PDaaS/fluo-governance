import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../lib/api";
import { useEffect, useState } from "react";

export default function ResourceTasks() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/tasks/my").then(r => {
      setTasks(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-400">Carregando tarefas...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Minhas Tarefas</h1>
      {tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Nenhuma tarefa atribuída.</div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task: any) => (
            <div
              key={task.id}
              className="bg-[#1a2942] border border-white/10 rounded-lg p-4 cursor-pointer hover:border-[#0891B2]/50 transition-colors"
              onClick={() => navigate(`/resource/tasks/${task.id}`)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium">{task.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  task.status === "COMPLETED" ? "bg-green-500/20 text-green-400" :
                  task.status === "AT_RISK" ? "bg-red-500/20 text-red-400" :
                  "bg-blue-500/20 text-blue-400"
                }`}>{task.status}</span>
              </div>
              <p className="text-gray-400 text-sm mt-1">{task.project?.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
