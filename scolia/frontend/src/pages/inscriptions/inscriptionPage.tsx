// src/pages/inscriptions/inscriptionPage.tsx
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Edit, Trash2, Search, UserPlus, Users, GraduationCap } from "lucide-react";
import { useAnnee } from "../../context/AnneeContext"; // ✅

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
function getToken() { return localStorage.getItem("token") ?? ""; }

const GRADIENTS = [
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#f6d365,#fda085)",
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
];

export default function InscriptionPage() {
  const navigate = useNavigate();

  // ✅ Année depuis le contexte global
  const { annees, idAca, setIdAca, anneeActive } = useAnnee();

  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetchData = useCallback(async () => {
    if (!idAca) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      params.append("page", String(page));
      params.append("idAca", idAca); // ✅ filtrer par année
      const r = await fetch(`${API}/inscriptions?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const d = await r.json();
      setData(d);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, page, idAca]); // ✅ recharger quand idAca change

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette inscription ?")) return;
    await fetch(`${API}/inscriptions/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    fetchData();
  };

  const inscriptions = Array.isArray(data) ? data : (data?.data ?? []);
  const total        = data?.total ?? inscriptions.length;
  const isCloturee   = (anneeActive as any)?.statut === 'cloturee';

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Bannière */}
      <div className={`rounded-2xl p-5 relative overflow-hidden transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
        style={{ background: "linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)", boxShadow: "0 4px 24px rgba(79,172,254,0.4)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(255,255,255,0.2) 0%,transparent 70%)" }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="w-4 h-4 text-cyan-100" />
              <p className="text-cyan-100 text-xs font-semibold uppercase tracking-wider">Gestion des inscriptions</p>
            </div>
            <h1 className="text-white text-2xl font-bold" style={{ letterSpacing: "-0.03em" }}>Inscriptions</h1>
            {/* ✅ Affiche l'année active + nb inscriptions */}
            <p className="text-cyan-100/70 text-sm mt-1">
              {total} inscription{total > 1 ? "s" : ""} · {anneeActive?.libelle ?? "—"}
              {isCloturee && <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">🔒 Clôturée</span>}
            </p>
          </div>
          {/* ✅ Masquer le bouton si année clôturée */}
          {!isCloturee && (
            <button onClick={() => navigate("/inscriptions/ajouter")}
              className="flex items-center gap-2 bg-white text-cyan-600 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-cyan-50 transition-all active:scale-[0.97]"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
              <Plus className="w-4 h-4" /> Nouvelle inscription
            </button>
          )}
        </div>
      </div>

      {/* ✅ Sélecteur d'année + Recherche */}
      <div className="flex gap-3 flex-wrap items-center">
        <select
          value={idAca}
          onChange={e => { setIdAca(e.target.value); setPage(1); }}
          className="input min-w-[220px]">
          {annees.map((a: any) => (
            <option key={a.idAnnee} value={a.idAnnee}>
              {a.libelle}
              {a.statut === 'active' ? ' ✓' : a.statut === 'cloturee' ? ' 🔒' : ''}
            </option>
          ))}
        </select>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher un élève…" className="input pl-10 w-full" />
        </div>

        {/* ✅ Stats rapides */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 text-sm"
          style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
          <Users className="w-4 h-4 text-cyan-500" />
          <span className="font-bold text-slate-900">{total}</span>
          <span className="text-slate-400">inscrit{total > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {["Élève", "Salle / Classe", "Année académique", "Actions"].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} className="px-5 py-3"><div className="skeleton h-4 rounded w-3/4" /></td>
                  ))}
                </tr>
              ))
            ) : inscriptions.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg,#4facfe,#00f2fe)" }}>
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-slate-500 font-medium">
                      Aucune inscription pour {anneeActive?.libelle ?? "cette année"}
                    </p>
                    {!isCloturee && (
                      <button onClick={() => navigate("/inscriptions/ajouter")}
                        className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-xl"
                        style={{ background: "linear-gradient(135deg,#4facfe,#00f2fe)" }}>
                        <Plus className="w-4 h-4" /> Nouvelle inscription
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              inscriptions.map((ins: any, idx: number) => (
                <tr key={ins.idFrequente ?? idx}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors cursor-pointer"
                  onClick={() => navigate(`/inscriptions/${ins.idFrequente}`)}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: GRADIENTS[idx % GRADIENTS.length] }}>
                        {ins.eleve?.prenom?.[0]}{ins.eleve?.nom?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">
                          {ins.eleve ? `${ins.eleve.prenom} ${ins.eleve.nom}` : `Matricule ${ins.matricule}`}
                        </p>
                        <p className="text-xs text-slate-400">Mat. {ins.matricule}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {ins.salle?.libelle ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full text-blue-700"
                        style={{ background: "rgba(79,172,254,0.1)" }}>
                        <GraduationCap className="w-3 h-3" /> {ins.salle.libelle}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600">
                    {ins.anneeAcademique?.libelle ?? `Année ${ins.idAcademi}`}
                  </td>
                  <td className="px-5 py-3" onClick={ev => ev.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(`/inscriptions/${ins.idFrequente}`)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      {!isCloturee && (
                        <>
                          <button onClick={() => navigate(`/inscriptions/${ins.idFrequente}/modifier`)}
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(ins.idFrequente)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data?.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Page <span className="font-semibold text-slate-700">{data.current_page}</span> sur {data.last_page}
            {" · "}{total} résultat{total > 1 ? 's' : ''}
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
              className="btn-secondary py-2 px-4 disabled:opacity-40">Précédent</button>
            <button onClick={() => setPage(p => Math.min(data.last_page, p+1))} disabled={page === data.last_page}
              className="btn-secondary py-2 px-4 disabled:opacity-40">Suivant</button>
          </div>
        </div>
      )}
    </div>
  );
}