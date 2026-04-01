import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TasksPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/pm/projects/${id}`)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 font-montserrat">Tarefas</h1>
      </div>
      <div className="card text-center py-12 text-gray-400">
        Gerencie as tarefas diretamente na aba "Tarefas" do detalhe do projeto.
      </div>
    </div>
  );
}
