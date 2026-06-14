import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Eye, Edit, UserCheck, UserX, Search,
  Filter, GraduationCap, BookOpen, Printer,
} from "lucide-react";
import { imprimerEnseignants } from "../../utils/impression";
import {
  getEnseignants, desactiverEnseignant, reactiverEnseignant,
  type EnseignantPaginate,
} from "../../service/enseignant_service";

const GRADS = [
  ["#ec4899","#f43f5e"],["#6366f1","#8b5cf6"],["#0ea5e9","#06b6d4"],
  ["#10b981","#059669"],["#f59e0b","#f97316"],["#a855f7","#ec4899"],
];

export default function EnseignantsPage() {
  const navigate = useNavigate();
  const [enseignantsData, setEnseignantsData] = useState<EnseignantPaginate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [search, setSearch]   = useState("");
  const [actif, setActif]     = useState("");
  const [page, setPage]       = useState(1);

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

  const totalActifs   = enseignantsData?.data.filter(e => e.Actif).length ?? 0;
  const totalInactifs = (enseignantsData?.total ?? 0) - totalActifs;

  const KPI = [
    { l: "Total enseignants", v: enseignantsData?.total ?? 0, g1: "#ec4899", g2: "#f43f5e", icon: GraduationCap },
    { l: "Actifs",            v: totalActifs,                 g1: "#10b981", g2: "#059669", icon: UserCheck     },
    { l: "Inactifs",          v: totalInactifs,               g1: "#f59e0b", g2: "#f97316", icon: UserX         },
  ];

  return (
    <div style={{ background: "var(--bg-app)", minHeight: "100vh" }}>

      {/* ── Hero ──────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ minHeight: 220 }}>
        <img
          src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=70"
          alt="" className="absolute inset-0 w-full h-full object-cover animate-kenburns"
          style={{ filter: "brightness(0.18) saturate(0.9)", animationDuration: "14s" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(125deg,rgba(30,5,40,0.98) 0%,rgba(236,72,153,0.45) 60%,rgba(244,63,94,0.2) 100%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px)",
          backgroundSize: "28px 28px",
        }} />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse at 80% 40%,rgba(236,72,153,0.22) 0%,transparent 55%)" }} />

        <div className="relative z-10 px-6 md:px-10 pt-10 pb-16 flex items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />
              <span className="text-white/40 text-[11px] font-bold tracking-[0.2em] uppercase">Corps enseignant</span>
            </div>
            <h1 className="font-black text-white leading-none mb-2" style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", letterSpacing: "-0.04em" }}>
              Nos{" "}
              <span style={{ background: "linear-gradient(90deg,#fbcfe8,#fda4af)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                enseignants
              </span>
            </h1>
            <p className="text-white/35 text-sm">
              {enseignantsData?.total ?? 0} enseignant(s) enregistré(s)
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => imprimerEnseignants(enseignantsData?.data ?? [])}
              className="flex items-center gap-2 font-semibold text-sm px-4 py-2.5 rounded-xl transition-all"
              style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.18)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}
            >
              <Printer style={{ width: 15, height: 15 }} /> Imprimer
            </button>
            <button
              onClick={() => navigate("/enseignants/nouveau")}
              className="flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg,#ec4899,#f43f5e)", color: "#fff", boxShadow: "0 4px 20px rgba(236,72,153,0.5)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(236,72,153,0.5)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(236,72,153,0.5)"; }}
            >
              <Plus style={{ width: 15, height: 15 }} /> Nouvel enseignant
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────── */}
      <div className="px-6 md:px-10 -mt-9 relative z-10 mb-5">
        <div className="grid grid-cols-3 gap-4">
          {KPI.map((k, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow: "var(--shadow-lg)", border: "1px solid rgba(255,255,255,0.7)", transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-5px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
            >
              <div className="h-1" style={{ background: `linear-gradient(90deg,${k.g1},${k.g2})` }} />
              <div className="p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `linear-gradient(135deg,${k.g1},${k.g2})`, boxShadow: `0 4px 14px ${k.g1}55` }}>
                  <k.icon style={{ width: 18, height: 18, color: "#fff" }} />
                </div>
                <div>
                  <p className="text-2xl font-black leading-none" style={{ color: "var(--text-900)", letterSpacing: "-0.04em" }}>{k.v}</p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: "var(--text-400)" }}>{k.l}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filtres ───────────────────────────────────── */}
      <div className="px-6 md:px-10 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--text-300)" }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher un enseignant…" className="input pl-10" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--text-300)" }} />
          <select value={actif} onChange={e => { setActif(e.target.value); setPage(1); }}
            className="input pl-9 pr-8 appearance-none cursor-pointer min-w-[160px]">
            <option value="">Tous les statuts</option>
            <option value="1">Actifs</option>
            <option value="0">Inactifs</option>
          </select>
        </div>
      </div>

      {error && <div className="px-6 md:px-10 mb-4"><div className="alert alert-error">{error}</div></div>}

      {/* ── Table ─────────────────────────────────────── */}
      <div className="px-6 md:px-10 pb-10">
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <p className="font-bold text-sm" style={{ color: "var(--text-900)" }}>Liste des enseignants</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-400)" }}>Cliquez sur une ligne pour voir le profil</p>
          </div>
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
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="table-td"><div className="skeleton h-4 rounded w-3/4" /></td>
                  ))}</tr>
                ))
              ) : enseignantsData?.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg,#ec4899,#f43f5e)" }}>
                        <GraduationCap className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-sm" style={{ color: "var(--text-400)" }}>Aucun enseignant trouvé</p>
                      <button onClick={() => navigate("/enseignants/nouveau")}
                        className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-xl"
                        style={{ background: "linear-gradient(135deg,#ec4899,#f43f5e)", boxShadow: "0 4px 14px rgba(236,72,153,0.35)" }}>
                        <Plus className="w-4 h-4" /> Ajouter un enseignant
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                enseignantsData?.data.map((e, idx) => (
                  <tr key={e.idEnseignant}
                    className="border-b cursor-pointer transition-colors"
                    style={{ borderColor: "var(--border)" }}
                    onClick={() => navigate(`/enseignants/${e.idEnseignant}`)}
                    onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = "var(--bg-app)"; }}
                    onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = ""; }}
                  >
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                          style={{ background: `linear-gradient(135deg,${GRADS[idx%GRADS.length][0]},${GRADS[idx%GRADS.length][1]})`, boxShadow: `0 2px 8px ${GRADS[idx%GRADS.length][0]}66` }}>
                          {e.personne?.prenom?.[0]}{e.personne?.nom?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: "var(--text-900)" }}>{e.personne?.prenom} {e.personne?.nom}</p>
                          <p className="text-xs" style={{ color: "var(--text-400)" }}>@{e.personne?.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-sm" style={{ color: "var(--text-700)" }}>{e.cours?.libelle ?? "—"}</td>
                    <td className="table-td">
                      {e.cours?.classe?.libelle
                        ? <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                            style={{ background: "rgba(14,165,233,0.1)", color: "#0ea5e9" }}>
                            <BookOpen style={{ width: 11, height: 11 }} />{e.cours.classe.libelle}
                          </span>
                        : <span style={{ color: "var(--text-300)" }}>—</span>}
                    </td>
                    <td className="table-td text-sm" style={{ color: "var(--text-500)" }}>{e.personne?.mobile ?? "—"}</td>
                    <td className="table-td">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                        style={e.Actif
                          ? { background: "rgba(16,185,129,0.1)", color: "#059669" }
                          : { background: "rgba(239,68,68,0.08)", color: "#ef4444" }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: e.Actif ? "#10b981" : "#ef4444" }} />
                        {e.Actif ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="table-td" onClick={ev => ev.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/enseignants/${e.idEnseignant}`)}
                          className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-300)" }}
                          onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = "rgba(14,165,233,0.1)"; (ev.currentTarget as HTMLElement).style.color = "#0ea5e9"; }}
                          onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = ""; (ev.currentTarget as HTMLElement).style.color = "var(--text-300)"; }}>
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigate(`/enseignants/${e.idEnseignant}/modifier`)}
                          className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-300)" }}
                          onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.1)"; (ev.currentTarget as HTMLElement).style.color = "#f59e0b"; }}
                          onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = ""; (ev.currentTarget as HTMLElement).style.color = "var(--text-300)"; }}>
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => toggleStatut(e.idEnseignant, e.Actif)}
                          className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-300)" }}
                          onMouseEnter={ev => {
                            const el = ev.currentTarget as HTMLElement;
                            if (e.Actif) { el.style.background = "rgba(239,68,68,0.1)"; el.style.color = "#ef4444"; }
                            else { el.style.background = "rgba(16,185,129,0.1)"; el.style.color = "#10b981"; }
                          }}
                          onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = ""; (ev.currentTarget as HTMLElement).style.color = "var(--text-300)"; }}>
                          {e.Actif ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {enseignantsData && enseignantsData.last_page > 1 && (
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="text-sm" style={{ color: "var(--text-400)" }}>
                Page <span className="font-semibold" style={{ color: "var(--text-700)" }}>{enseignantsData.current_page}</span> sur {enseignantsData.last_page}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Précédent</button>
                <button onClick={() => setPage(p => Math.min(enseignantsData.last_page, p + 1))} disabled={page === enseignantsData.last_page}
                  className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Suivant</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
