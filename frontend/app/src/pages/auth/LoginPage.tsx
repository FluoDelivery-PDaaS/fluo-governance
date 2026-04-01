import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Credenciais inválidas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1E3A5F] to-[#0891B2] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <div>
            <p className="text-white font-bold text-lg font-montserrat">Fluo Governance</p>
            <p className="text-white/60 text-sm">Project Delivery as a Service</p>
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white mb-4 font-montserrat leading-tight">
            Governança de projetos<br />com previsibilidade.
          </h1>
          <p className="text-white/70 text-lg">
            Acompanhe o progresso, riscos e relatórios dos seus projetos de tecnologia em tempo real.
          </p>
        </div>
        <div className="flex gap-6 text-white/50 text-sm">
          <span>© 2025 Fluo Delivery</span>
          <a href="https://fluodelivery.com" className="hover:text-white/80">fluodelivery.com</a>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="font-bold text-[#1E3A5F] font-montserrat">Fluo Governance</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-montserrat">Entrar na plataforma</h2>
          <p className="text-gray-500 mb-8">Acesse com suas credenciais.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Senha</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 mb-2">Credenciais de demonstração:</p>
            <div className="space-y-1 text-xs text-blue-600">
              <p><span className="font-medium">PM:</span> pm@fluodelivery.com / Fluo@2025</p>
              <p><span className="font-medium">Stakeholder:</span> stakeholder@techcorp.com / Fluo@2025</p>
              <p><span className="font-medium">Resource:</span> dev1@techcorp.com / Fluo@2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
