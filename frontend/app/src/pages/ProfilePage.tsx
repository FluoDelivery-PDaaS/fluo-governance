import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../lib/api";
import { toast } from "sonner";
import { User, Bell, Key } from "lucide-react";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const updateProfile = useMutation({
    mutationFn: () => authApi.updateProfile({ name }),
    onSuccess: () => { refreshUser(); toast.success("Perfil atualizado!"); },
    onError: () => toast.error("Erro ao atualizar perfil."),
  });

  const changePassword = useMutation({
    mutationFn: () => authApi.changePassword({ currentPassword, newPassword }),
    onSuccess: () => { setCurrentPassword(""); setNewPassword(""); toast.success("Senha alterada!"); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Erro ao alterar senha."),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-montserrat">Meu Perfil</h1>
        <p className="text-gray-500 mt-1">Gerencie suas informações pessoais</p>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-[#1E3A5F] flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>
        <div>
          <label className="label">Nome</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <button onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending} className="btn-primary">
          {updateProfile.isPending ? "Salvando..." : "Salvar Perfil"}
        </button>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Key size={18} className="text-gray-500" />
          <h3 className="font-semibold text-gray-900">Alterar Senha</h3>
        </div>
        <div>
          <label className="label">Senha Atual</label>
          <input type="password" className="input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        </div>
        <div>
          <label className="label">Nova Senha</label>
          <input type="password" className="input" placeholder="Mínimo 8 caracteres" value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)} minLength={8} />
        </div>
        <button onClick={() => changePassword.mutate()} disabled={changePassword.isPending || !currentPassword || !newPassword}
          className="btn-primary disabled:opacity-60">
          {changePassword.isPending ? "Alterando..." : "Alterar Senha"}
        </button>
      </div>
    </div>
  );
}
