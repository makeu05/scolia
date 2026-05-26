// src/pages/enseignants/enseignantPage.tsx — Version colorée premium
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Edit, UserCheck, UserX, Search, Filter, GraduationCap, Users, BookOpen } from "lucide-react";
import {
  getEnseignants, desactiverEnseignant, reactiverEnseignant,
  type EnseignantPaginate,
} from "../../service/enseignant_service";

const GRADIENTS = [
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f6d365,#fda085)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
];

export default function EnseignantsPage() {
  const navigate = useNavigate();
  const [enseignantsData, setEnseignantsData] = useState<EnseignantPaginate | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [actif, setActif]       = useState("");
  const [page, setPage]         = useState(1);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetchEnseignants = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await getEnseignants({ page, search: search.trim() || undefined, actif });
      setEnseignantsData(data);
    } catch (err: any) { setError(err.message || "Erreur de chargement"); }
    finally { setLoading(false); }
  }, [page, search, actif]);

  useEffect(() => { fetchEnseignants(); }, [fetchEnseignants]);

  const toggleStatut = async (id: number, actuel: number) => {
    try {
      actuel === 1 ? await desactiverEnseignant(id) : await reactiverEnseignant(id);
      fetchEnseignants();
    } catch (err: any) { alert(err.message); }
  };

  const totalActifs = enseignantsData?.data.filter(e => e.Actif).length ?? 0;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Bannière rose/rouge */}
      <div className={`rounded-2xl p-5 relative overflow-hidden transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
        style={{ background: "linear-gradient(135deg,#f093fb 0%,#f5576c 100%)", boxShadow: "0 4px 24px rgba(240,147,251,0.4)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(255,255,255,0.15) 0%,transparent 70%)" }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-4 h-4 text-pink-100" />
              <p className="text-pink-100 text-xs font-semibold uppercase tracking-wider">Corps enseignant</p>
            </div>
            <h1 className="text-white text-2xl font-bold" style={{ letterSpacing: "-0.03em" }}>Enseignants</h1>
            <p className="text-pink-100/70 text-sm mt-1">{enseignantsData?.total ?? 0} enseignant(s) enregistré(s)</p>
          </div>
          <button onClick={() => navigate("/enseignants/nouveau")}
            className="flex items-center gap-2 bg-white text-pink-600 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-pink-50 transition-all active:scale-[0.97]"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
            <Plus className="w-4 h-4" /> Nouvel enseignant
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 stagger">
        {[
          { label: "Total",   value: enseignantsData?.total ?? 0, icon: Users,      gradient: "linear-gradient(135deg,#f093fb,#f5576c)", shadow: "rgba(240,147,251,0.3)" },
          { label: "Actifs",  value: totalActifs,                 icon: UserCheck,  gradient: "linear-gradient(135deg,#43e97b,#38f9d7)", shadow: "rgba(67,233,123,0.3)" },
          { label: "Inactifs",value: (enseignantsData?.total ?? 0) - totalActifs, icon: UserX, gradient: "linear-gradient(135deg,#f6d365,#fda085)", shadow: "rgba(253,160,133,0.3)" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-fade-in relative overflow-hidden"
            style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)", transition: "all 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${s.shadow}`; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(15,31,61,0.06)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: s.gradient }} />
            <div className="flex items-center gap-3 mt-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.gradient, boxShadow: `0 2px 8px ${s.shadow}` }}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900" style={{ letterSpacing: "-0.02em" }}>{s.value}</p>
                <p className="text-xs text-slate-400 font-medium">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher un enseignant…" className="input pl-10" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select value={actif} onChange={e => { setActif(e.target.value); setPage(1); }}
            className="input pl-9 pr-8 appearance-none cursor-pointer min-w-[160px]">
            <option value="">Tous les statuts</option>
            <option value="1">Actifs</option>
            <option value="0">Inactifs</option>
          </select>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
        <table className="w-full">
          <thead>
            <tr>
              {["Enseignant","Cours","Classe","Contact","Statut","Actions"].map(h => (
                <th key={h} className="table-th">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                  <td key={j} className="table-td"><div className="skeleton h-4 rounded w-3/4" /></td>
                ))}</tr>
              ))
            ) : enseignantsData?.data.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg,#f093fb,#f5576c)" }}>
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-slate-500 font-medium">Aucun enseignant trouvé</p>
                  </div>
                </td>
              </tr>
            ) : (
              enseignantsData?.data.map((e, idx) => (
                <tr key={e.idEnseignant}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors cursor-pointer"
                  onClick={() => navigate(`/enseignants/${e.idEnseignant}`)}>
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: GRADIENTS[idx % GRADIENTS.length] }}>
                        {e.personne?.prenom?.[0]}{e.personne?.nom?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{e.personne?.prenom} {e.personne?.nom}</p>
                        <p className="text-xs text-slate-400">@{e.personne?.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-td text-sm text-slate-700">{e.cours?.libelle ?? "—"}</td>
                  <td className="table-td">
                    {e.cours?.classe?.libelle
                      ? <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "linear-gradient(135deg,rgba(79,172,254,0.1),rgba(0,242,254,0.1))", color: "#4facfe" }}><BookOpen className="w-3 h-3" />{e.cours.classe.libelle}</span>
                      : "—"}
                  </td>
                  <td className="table-td text-sm text-slate-500">{e.personne?.mobile}</td>
                  <td className="table-td">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${e.Actif ? "text-emerald-700" : "text-red-600"}`}
                      style={{ background: e.Actif ? "linear-gradient(135deg,rgba(67,233,123,0.1),rgba(56,249,215,0.1))" : "rgba(245,87,108,0.08)" }}>
                      <span className={`w-1.5 h-1.5 rounded-full ${e.Actif ? "bg-emerald-500" : "bg-red-500"}`} />
                      {e.Actif ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="table-td" onClick={ev => ev.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(`/enseignants/${e.idEnseignant}`)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => navigate(`/enseignants/${e.idEnseignant}/modifier`)}
                        className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => toggleStatut(e.idEnseignant, e.Actif)}
                        className={`p-1.5 rounded-lg transition-colors text-slate-400 ${e.Actif ? "hover:bg-red-50 hover:text-red-600" : "hover:bg-emerald-50 hover:text-emerald-600"}`}>
                        {e.Actif ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {enseignantsData && enseignantsData.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">Page <span className="font-semibold text-slate-700">{enseignantsData.current_page}</span> sur {enseignantsData.last_page}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="btn-secondary py-2 px-4 disabled:opacity-40">Précédent</button>
            <button onClick={() => setPage(p => Math.min(enseignantsData.last_page, p+1))} disabled={page===enseignantsData.last_page} className="btn-secondary py-2 px-4 disabled:opacity-40">Suivant</button>
          </div>
        </div>
      )}
    </div>
  );
}