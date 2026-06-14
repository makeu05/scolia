import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus, Search, Filter, Eye, Edit,
  Archive, ArchiveRestore, Trash2, Users, UserCheck,
} from "lucide-react";
import {
  getEleves, archiverEleve, reactiverEleve, deleteEleve,
  type Eleve, type ElevePaginate, type EleveFilters, getSexeLabel,
} from "../../service/eleve_service";

const GRADS = [
  ["#6366f1","#8b5cf6"],["#ec4899","#f43f5e"],["#0ea5e9","#06b6d4"],
  ["#10b981","#059669"],["#f59e0b","#f97316"],["#a855f7","#ec4899"],
  ["#14b8a6","#06b6d4"],["#f43f5e","#fb7185"],
];

export default function ElevesList() {
  const navigate = useNavigate();
  const [eleves, setEleves]   = useState<ElevePaginate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [search, setSearch]   = useState("");
  const [actif, setActif]     = useState("");
  const [page, setPage]       = useState(1);

  const fetchEleves = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await getEleves({ page, search: search.trim() || undefined, actif: actif || undefined } as EleveFilters);
      setEleves(data);
    } catch (err: any) { setError(err.message || "Impossible de charger les élèves"); }
    finally { setLoading(false); }
  }, [search, actif, page]);

  useEffect(() => { fetchEleves(); }, [fetchEleves]);

  const handleArchiver = async (m: number) => {
    if (!confirm("Archiver cet élève ?")) return;
    try { await archiverEleve(m); fetchEleves(); } catch (e: any) { alert(e.message); }
  };
  const handleReactiver = async (m: number) => {
    try { await reactiverEleve(m); fetchEleves(); } catch (e: any) { alert(e.message); }
  };
  const handleSupprimer = async (m: number) => {
    if (!confirm("Supprimer définitivement cet élève ?")) return;
    try { await deleteEleve(m); fetchEleves(); } catch (e: any) { alert(e.message); }
  };

  const totalActifs   = eleves?.data.filter(e => e.actif).length ?? 0;
  const totalArchives = eleves?.data.filter(e => !e.actif).length ?? 0;

  const KPI = [
    { l: "Total inscrits", v: eleves?.total ?? 0,  icon: Users,      g1: "#6366f1", g2: "#8b5cf6" },
    { l: "Actifs",         v: totalActifs,          icon: UserCheck,  g1: "#10b981", g2: "#059669" },
    { l: "Archivés",       v: totalArchives,        icon: Archive,    g1: "#f59e0b", g2: "#f97316" },
  ];

  return (
    <div style={{ background: "var(--bg-app)", minHeight: "100vh" }}>

      {/* ── Hero ──────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ minHeight: 220 }}>
        <img
          src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600&q=70"
          alt="" className="absolute inset-0 w-full h-full object-cover animate-kenburns"
          style={{ filter: "brightness(0.22) saturate(1.1)", animationDuration: "14s" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(125deg,rgba(10,10,35,0.97) 0%,rgba(79,70,229,0.5) 60%,rgba(139,92,246,0.25) 100%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.055) 1px,transparent 1px)",
          backgroundSize: "26px 26px",
        }} />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse at 80% 50%,rgba(99,102,241,0.2) 0%,transparent 55%)" }} />

        <div className="relative z-10 px-6 md:px-10 pt-10 pb-16 flex items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span className="text-white/40 text-[11px] font-bold tracking-[0.2em] uppercase">Gestion des élèves</span>
            </div>
            <h1 className="font-black text-white leading-none mb-2" style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", letterSpacing: "-0.04em" }}>
              Élèves{" "}
              <span style={{ background: "linear-gradient(90deg,#a5b4fc,#c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                inscrits
              </span>
            </h1>
            <p className="text-white/35 text-sm">
              {eleves ? `${eleves.total} élève${eleves.total !== 1 ? "s" : ""} enregistré${eleves.total !== 1 ? "s" : ""}` : "Chargement…"}
            </p>
          </div>
          <button onClick={() => navigate("/eleves/nouveau")}
            className="flex items-center gap-2 font-bold text-sm px-5 py-3 rounded-xl transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", boxShadow: "0 4px 20px rgba(99,102,241,0.5)", flexShrink: 0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(99,102,241,0.5)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(99,102,241,0.5)"; }}
          >
            <UserPlus style={{ width: 16, height: 16 }} /> Nouvel élève
          </button>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────── */}
      <div className="px-6 md:px-10 -mt-9 relative z-10 mb-5">
        <div className="grid grid-cols-3 gap-4">
          {KPI.map((k, i) => (
            <div key={i}
              className="bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow: "var(--shadow-lg)", border: "1px solid rgba(255,255,255,0.7)", transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)" }}
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
            placeholder="Rechercher par nom, prénom ou matricule…"
            className="input pl-10" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--text-300)" }} />
          <select value={actif} onChange={e => { setActif(e.target.value); setPage(1); }}
            className="input pl-9 pr-8 appearance-none cursor-pointer min-w-[160px]">
            <option value="">Tous les statuts</option>
            <option value="1">Actifs</option>
            <option value="0">Archivés</option>
          </select>
        </div>
      </div>

      {error && <div className="px-6 md:px-10 mb-4"><div className="alert alert-error">{error}</div></div>}

      {/* ── Table ─────────────────────────────────────── */}
      <div className="px-6 md:px-10 pb-10">
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <p className="font-bold text-sm" style={{ color: "var(--text-900)" }}>Liste des élèves</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-400)" }}>Cliquez sur une ligne pour voir les détails</p>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                {["Élève","Matricule","Naissance","Sexe","Statut","Actions"].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 7 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="table-td"><div className="skeleton h-4 rounded w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : !eleves || eleves.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <p className="font-medium" style={{ color: "var(--text-400)" }}>Aucun élève trouvé</p>
                      <button onClick={() => navigate("/eleves/nouveau")}
                        className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-xl"
                        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}>
                        <UserPlus className="w-4 h-4" /> Inscrire un élève
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                eleves.data.map((e: Eleve, idx: number) => (
                  <tr key={e.matricule}
                    className="border-b cursor-pointer transition-colors"
                    style={{ borderColor: "var(--border)" }}
                    onClick={() => navigate(`/eleves/${e.matricule}`)}
                    onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = "var(--bg-app)"; }}
                    onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = ""; }}
                  >
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                          style={{ background: `linear-gradient(135deg,${GRADS[idx%GRADS.length][0]},${GRADS[idx%GRADS.length][1]})`, boxShadow: `0 2px 8px ${GRADS[idx%GRADS.length][0]}66` }}>
                          {e.prenom?.[0]}{e.nom?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: "var(--text-900)" }}>{e.prenom} {e.nom}</p>
                          <p className="text-xs" style={{ color: "var(--text-400)" }}>{e.lieuNaissance || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-td">
                      <span className="font-mono text-xs px-2 py-1 rounded-lg font-bold"
                        style={{ background: "var(--bg-surface)", color: "var(--text-500)" }}>{e.matricule}</span>
                    </td>
                    <td className="table-td text-sm" style={{ color: "var(--text-500)" }}>
                      {new Date(e.dateNaissance).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="table-td text-sm" style={{ color: "var(--text-500)" }}>{getSexeLabel(e.sexe)}</td>
                    <td className="table-td">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                        style={e.actif
                          ? { background: "rgba(16,185,129,0.1)", color: "#059669" }
                          : { background: "var(--bg-surface)", color: "var(--text-400)" }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: e.actif ? "#10b981" : "var(--text-300)" }} />
                        {e.actif ? "Actif" : "Archivé"}
                      </span>
                    </td>
                    <td className="table-td" onClick={ev => ev.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/eleves/${e.matricule}`)}
                          className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-300)" }}
                          onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = "rgba(14,165,233,0.1)"; (ev.currentTarget as HTMLElement).style.color = "#0ea5e9"; }}
                          onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = ""; (ev.currentTarget as HTMLElement).style.color = "var(--text-300)"; }}>
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigate(`/eleves/${e.matricule}/modifier`)}
                          className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-300)" }}
                          onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.1)"; (ev.currentTarget as HTMLElement).style.color = "#f59e0b"; }}
                          onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = ""; (ev.currentTarget as HTMLElement).style.color = "var(--text-300)"; }}>
                          <Edit className="w-4 h-4" />
                        </button>
                        {e.actif ? (
                          <button onClick={() => handleArchiver(e.matricule)}
                            className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-300)" }}
                            onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = "rgba(249,115,22,0.1)"; (ev.currentTarget as HTMLElement).style.color = "#f97316"; }}
                            onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = ""; (ev.currentTarget as HTMLElement).style.color = "var(--text-300)"; }}>
                            <Archive className="w-4 h-4" />
                          </button>
                        ) : (
                          <button onClick={() => handleReactiver(e.matricule)}
                            className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-300)" }}
                            onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = "rgba(16,185,129,0.1)"; (ev.currentTarget as HTMLElement).style.color = "#10b981"; }}
                            onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = ""; (ev.currentTarget as HTMLElement).style.color = "var(--text-300)"; }}>
                            <ArchiveRestore className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleSupprimer(e.matricule)}
                          className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-300)" }}
                          onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)"; (ev.currentTarget as HTMLElement).style.color = "#ef4444"; }}
                          onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = ""; (ev.currentTarget as HTMLElement).style.color = "var(--text-300)"; }}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination intégrée */}
          {eleves && eleves.last_page > 1 && (
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="text-sm" style={{ color: "var(--text-400)" }}>
                Page <span className="font-semibold" style={{ color: "var(--text-700)" }}>{eleves.current_page}</span> sur {eleves.last_page} · {eleves.total} résultats
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Précédent</button>
                <button onClick={() => setPage(p => Math.min(eleves.last_page, p + 1))} disabled={page === eleves.last_page}
                  className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Suivant</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
