import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-200 font-montserrat">404</h1>
        <p className="text-xl text-gray-600 mt-4">Página não encontrada</p>
        <button onClick={() => navigate("/dashboard")} className="btn-primary mt-6">
          Voltar ao início
        </button>
      </div>
    </div>
  );
}
