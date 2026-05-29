// src/pages/admin/UserManagementPage.tsx — Version colorée premium
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Eye, UserX, UserCheck, Search, Shield } from "lucide-react";
import { authFetch } from "../../service/auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

interface UserItem {
  id: string; nom: string; username: string;
  role: string; actif: number; source: "admin" | "personne"; mobile?: string;
}

const ROLE_CONFIG: Record<string, { gradient: string; shadow: string; label: string }> = {
  root:       { gradient: "linear-gradient(135deg,#f5576c,#f093fb)", shadow: "rgba(245,87,108,0.3)",  label: "Root" },
  admin:      { gradient: "linear-gradient(135deg,#667eea,#764ba2)", shadow: "rgba(102,126,234,0.3)", label: "Admin" },
  directeur:  { gradient: "linear-gradient(135deg,#a18cd1,#fbc2eb)", shadow: "rgba(161,140,209,0.3)", label: "Directeur" },
  fondateur:  { gradient: "linear-gradient(135deg,#f6d365,#fda085)", shadow: "rgba(246,211,101,0.3)", label: "Fondateur" },
  enseignant: { gradient: "linear-gradient(135deg,#43e97b,#38f9d7)", shadow: "rgba(67,233,123,0.3)",  label: "Enseignant" },
  parent:     { gradient: "linear-gradient(135deg,#f093fb,#f5576c)", shadow: "rgba(240,147,251,0.3)", label: "Parent" },
};

export default function UserManagementPage() {
  const navigate = useNavigate();
  const [users, setUsers]           = useState<UserItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [typeFilter, setTypeFilter] = useState<"all"|"admin"|"personne">("all");
  const [mounted, setMounted]       = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res  = await authFetch(`${API}/admin/utilisateurs?search=${encodeURIComponent(search)}&type=${typeFilter}`);
      const data = await res.json();
      setUsers(data.data || data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [search, typeFilter]);

  const toggleActif = async (id: string) => {
    if (!confirm("Changer le statut ?")) return;
    await authFetch(`${API}/admin/utilisateurs/${id}/toggle-actif`, { method: "PUT" });
    fetchUsers();
  };

  const totalAdmins = users.filter(u => u.source === "admin").length;
  const totalPersonnes = users.filter(u => u.source === "personne").length;
  

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Bannière violet */}
      <div className={`rounded-2xl p-5 relative overflow-hidden transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
        style={{ background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)", boxShadow: "0 4px 24px rgba(102,126,234,0.35)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(255,255,255,0.15) 0%,transparent 70%)" }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-purple-200" />
              <p className="text-purple-200 text-xs font-semibold uppercase tracking-wider">Administration système</p>
            </div>
            <h1 className="text-white text-2xl font-bold" style={{ letterSpacing: "-0.03em" }}>Utilisateurs</h1>
            <p className="text-purple-200/70 text-sm mt-1">{users.length} compte(s) enregistré(s)</p>
          </div>
          <button onClick={() => navigate("/admin/utilisateurs/nouveau")}
            className="flex items-center gap-2 bg-white text-purple-700 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-purple-50 transition-all active:scale-[0.97]"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
            <Plus className="w-4 h-4" /> Nouvel utilisateur
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 stagger">
        {[
          { label: "Total",        value: users.length,    gradient: "linear-gradient(135deg,#667eea,#764ba2)", shadow: "rgba(102,126,234,0.3)" },
          { label: "Admins",       value: totalAdmins,     gradient: "linear-gradient(135deg,#4facfe,#00f2fe)", shadow: "rgba(79,172,254,0.3)" },
          { label: "Personnel",    value: totalPersonnes,  gradient: "linear-gradient(135deg,#43e97b,#38f9d7)", shadow: "rgba(67,233,123,0.3)" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-fade-in relative overflow-hidden"
            style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)", transition: "all 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${s.shadow}`; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(15,31,61,0.06)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: s.gradient }} />
            <p className="text-2xl font-bold text-slate-900 mt-1" style={{ letterSpacing: "-0.02em" }}>{s.value}</p>
            <p className="text-xs text-slate-400 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou username…" className="input pl-10" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)}
          className="input appearance-none cursor-pointer min-w-[200px]">
          <option value="all">Tous les utilisateurs</option>
          <option value="admin">Administrateurs</option>
          <option value="personne">Enseignants & Parents</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
        <table className="w-full">
          <thead>
            <tr>{["Utilisateur","Rôle","Type","Statut","Actions"].map(h => <th key={h} className="table-th">{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j} className="table-td"><div className="skeleton h-4 rounded w-3/4" /></td>)}</tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="py-16 text-center text-slate-400 text-sm">Aucun utilisateur trouvé</td></tr>
            ) : (
              users.map(u => {
                const rc = ROLE_CONFIG[u.role];
                return (
                  <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/utilisateurs/${u.id}`)}>
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: rc?.gradient ?? "#e2e8f0" }}>
                          {u.nom?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{u.nom}</p>
                          <p className="text-xs text-slate-400">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full text-white"
                        style={{ background: rc?.gradient ?? "#e2e8f0" }}>
                        <Shield className="w-3 h-3" />{rc?.label ?? u.role}
                      </span>
                    </td>
                    <td className="table-td text-sm text-slate-600">{u.source === "admin" ? "Administrateur" : "Personnel"}</td>
                    <td className="table-td">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${u.actif ? "text-emerald-700" : "text-red-600"}`}
                        style={{ background: u.actif ? "rgba(67,233,123,0.1)" : "rgba(245,87,108,0.08)" }}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.actif ? "bg-emerald-500" : "bg-red-500"}`} />
                        {u.actif ? "Actif" : "Désactivé"}
                      </span>
                    </td>
                    <td className="table-td" onClick={ev => ev.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/admin/utilisateurs/${u.id}`)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => navigate(`/admin/utilisateurs/${u.id}/modifier`)} className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => toggleActif(u.id)} className={`p-1.5 rounded-lg transition-colors text-slate-400 ${u.actif ? "hover:bg-red-50 hover:text-red-600" : "hover:bg-emerald-50 hover:text-emerald-600"}`}>
                          {u.actif ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}