import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit, Key, UserCheck, UserX, Trash2, Shield, Phone, Calendar } from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import { authFetch } from "../../service/auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

interface UserDetail {
  id: string;
  sourceId: number;
  source: "admin" | "personne";
  nom: string;
  username: string;
  role: string;
  actif: number;
  mobile?: string;
  created?: string;
  prenom?: string;
  dateNaissance?: string;
}

const ROLE_STYLES: Record<string, { badge: string; label: string }> = {
  root:       { badge: "badge-red",    label: "Root" },
  admin:      { badge: "badge-blue",   label: "Administrateur" },
  fondateur:  { badge: "badge-amber",  label: "Fondateur" },
  directeur:  { badge: "badge-purple", label: "Directeur" },
  enseignant: { badge: "badge-green",  label: "Enseignant" },
  parent:     { badge: "bg-pink-50 text-pink-700 ring-1 ring-pink-100", label: "Parent" },
};

export default function UserDetail() {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const [user, setUser]       = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUser = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res  = await authFetch(`${API}/admin/utilisateurs/${id}`);
      const data = await res.json();
      setUser(data);
    } catch { setError("Impossible de charger l'utilisateur"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUser(); }, [id]);

  const toggleActif = async () => {
    if (!id || !user) return;
    if (!confirm("Changer le statut de cet utilisateur ?")) return;
    setActionLoading("toggle");
    try {
      await authFetch(`${API}/admin/utilisateurs/${id}/toggle-actif`, { method: "PUT" });
      fetchUser();
    } catch { alert("Une erreur est survenue"); }
    finally { setActionLoading(null); }
  };

  const resetPassword = async () => {
    if (!id) return;
    const pwd = prompt("Nouveau mot de passe (min. 6 caractères) :");
    if (!pwd || pwd.length < 6) { alert("Mot de passe trop court"); return; }
    setActionLoading("reset");
    try {
      await authFetch(`${API}/admin/utilisateurs/${id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd, password_confirmation: pwd }),
      });
      alert("Mot de passe réinitialisé ✓");
    } catch { alert("Erreur lors de la réinitialisation"); }
    finally { setActionLoading(null); }
  };

  const deleteUser = async () => {
    if (!id || !confirm("⚠️ Supprimer définitivement cet utilisateur ? Action irréversible.")) return;
    setActionLoading("delete");
    try {
      await authFetch(`${API}/admin/utilisateurs/${id}`, { method: "DELETE" });
      navigate("/admin/utilisateurs");
    } catch { alert("Impossible de supprimer l'utilisateur"); }
    finally { setActionLoading(null); }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="space-y-3 w-full max-w-md px-6">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-2xl" />)}
      </div>
    </div>
  );

  if (error || !user) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 mb-3">{error || "Utilisateur introuvable"}</p>
        <button onClick={() => navigate("/admin/utilisateurs")} className="btn-secondary">Retour</button>
      </div>
    </div>
  );

  const roleInfo = ROLE_STYLES[user.role] ?? { badge: "badge-gray", label: user.role };
  const initiales = user.nom?.[0]?.toUpperCase() ?? "?";

  return (
    <PageLayout
      title={user.nom}
      subtitle={`@${user.username}`}
      backTo="/admin/utilisateurs"
      actions={
        <button
          onClick={() => navigate(`/admin/utilisateurs/${id}/modifier`)}
          className="btn-primary gap-2"
        >
          <Edit className="w-4 h-4" /> Modifier
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Card profil */}
        <div className="card p-6 flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-[#0f1f3d] flex items-center justify-center">
            <span className="text-white text-2xl font-bold">{initiales}</span>
          </div>
          <div>
            <p className="font-bold text-slate-900 text-lg" style={{ letterSpacing: "-0.02em" }}>
              {user.nom}
            </p>
            <p className="text-slate-400 text-sm mt-0.5">@{user.username}</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            <span className={`badge ring-1 ${roleInfo.badge}`}>{roleInfo.label}</span>
            <span className={`badge ring-1 ${user.actif ? "badge-green" : "badge-red"}`}>
              {user.actif ? "Actif" : "Désactivé"}
            </span>
          </div>
        </div>

        {/* Infos détaillées */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="section-title mb-4">Informations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Shield,   label: "Rôle",           value: roleInfo.label },
              { icon: Shield,   label: "Type de compte", value: user.source === "admin" ? "Administrateur" : "Personnel" },
              ...(user.mobile ? [{ icon: Phone,    label: "Téléphone", value: user.mobile }] : []),
              ...(user.dateNaissance ? [{ icon: Calendar, label: "Date de naissance", value: new Date(user.dateNaissance).toLocaleDateString("fr-FR") }] : []),
              ...(user.created ? [{ icon: Calendar, label: "Compte créé le", value: new Date(user.created).toLocaleDateString("fr-FR") }] : []),
            ].map(row => (
              <div key={row.label} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                  <row.icon className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{row.label}</p>
                  <p className="text-sm font-medium text-slate-900 mt-0.5">{row.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="card p-5 lg:col-span-3">
          <h3 className="section-title mb-4">Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/admin/utilisateurs/${id}/modifier`)}
              className="btn-secondary gap-2"
            >
              <Edit className="w-4 h-4" /> Modifier
            </button>

            <button
              onClick={resetPassword}
              disabled={actionLoading === "reset"}
              className="btn-secondary gap-2"
            >
              <Key className="w-4 h-4" />
              {actionLoading === "reset" ? "En cours…" : "Réinitialiser le mot de passe"}
            </button>

            <button
              onClick={toggleActif}
              disabled={actionLoading === "toggle"}
              className={`btn-secondary gap-2 ${
                user.actif
                  ? "text-red-600 hover:bg-red-50 border-red-200"
                  : "text-emerald-600 hover:bg-emerald-50 border-emerald-200"
              }`}
            >
              {user.actif ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
              {actionLoading === "toggle" ? "En cours…" : user.actif ? "Désactiver" : "Activer"}
            </button>

            <button
              onClick={deleteUser}
              disabled={actionLoading === "delete"}
              className="btn-secondary gap-2 text-red-600 hover:bg-red-50 border-red-200 ml-auto"
            >
              <Trash2 className="w-4 h-4" />
              {actionLoading === "delete" ? "Suppression…" : "Supprimer"}
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}