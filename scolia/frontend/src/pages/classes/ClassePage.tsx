import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Eye, Edit, Search, Building2, Layers, BookOpen } from "lucide-react";
import { getClasses, deleteClasse, type Classe } from "../../service/classe_service";
import { getCycles, createCycle, deleteCycle, type Cycle } from "../../service/cycle_service";

const CYCLE_GRADS = [
  { g1: "#6366f1", g2: "#8b5cf6" },
  { g1: "#ec4899", g2: "#f43f5e" },
  { g1: "#0ea5e9", g2: "#06b6d4" },
  { g1: "#10b981", g2: "#059669" },
  { g1: "#f59e0b", g2: "#f97316" },
];

export default function ClassesPage() {
  const navigate = useNavigate();
  const [classes, setClasses]   = useState<Classe[]>([]);
  const [cycles, setCycles]     = useState<Cycle[]>([]);
  const [loading, setLoading]   = useState(false);
  const [page, setPage]         = useState(1);
  const [meta, setMeta]         = useState<any>(null);
  const [search, setSearch]     = useState("");
  const [idCycle, setIdCycle]   = useState("");
  const [showCycleForm, setShowCycleForm] = useState(false);
  const [cycleForm, setCycleForm] = useState({ libelle: "", description: "", idAdmin: "1" });

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClasses(page, idCycle, search);
      setClasses(data.data || []); setMeta(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, idCycle, search]);

  const fetchCycles = async () => {
    try { setCycles(await getCycles()); } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchCycles(); }, []);
  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  async function handleCreateCycle(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createCycle(cycleForm);
      setCycleForm({ libelle: "", description: "", idAdmin: "1" });
      setShowCycleForm(false);
      fetchCycles(); fetchClasses();
    } catch { alert("Erreur lors de la création du cycle"); }
  }

  return (
    <div style={{ background: "var(--bg-app)", minHeight: "100vh" }}>

      {/* ── Hero ──────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ minHeight: 220 }}>
        <img
          src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600&q=70"
          alt="" className="absolute inset-0 w-full h-full object-cover animate-kenburns"
          style={{ filter: "brightness(0.18) saturate(1.0)", animationDuration: "14s" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(125deg,rgba(5,20,50,0.98) 0%,rgba(14,165,233,0.45) 65%,rgba(6,182,212,0.2) 100%)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px)",
          backgroundSize: "28px 28px",
        }} />
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse at 75% 40%,rgba(14,165,233,0.2) 0%,transparent 55%)" }} />

        <div className="relative z-10 px-6 md:px-10 pt-10 pb-16 flex items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-white/40 text-[11px] font-bold tracking-[0.2em] uppercase">Structure pédagogique</span>
            </div>
            <h1 className="font-black text-white leading-none mb-2" style={{ fontSize: "clamp(1.8rem,3.5vw,2.8rem)", letterSpacing: "-0.04em" }}>
              Classes{" "}
              <span style={{ background: "linear-gradient(90deg,#67e8f9,#a5f3fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                & Cycles
              </span>
            </h1>
            <p className="text-white/35 text-sm">{cycles.length} cycle(s) · {meta?.total ?? 0} classe(s)</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setShowCycleForm(v => !v)}
              className="flex items-center gap-2 font-semibold text-sm px-4 py-2.5 rounded-xl transition-all"
              style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.18)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}
            >
              <Layers style={{ width: 15, height: 15 }} /> {showCycleForm ? "Annuler" : "+ Cycle"}
            </button>
            <button onClick={() => navigate("/classes/nouveau")}
              className="flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg,#0ea5e9,#06b6d4)", color: "#fff", boxShadow: "0 4px 20px rgba(14,165,233,0.5)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(14,165,233,0.5)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(14,165,233,0.5)"; }}
            >
              <Plus style={{ width: 15, height: 15 }} /> Nouvelle classe
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────── */}
      <div className="px-6 md:px-10 -mt-9 relative z-10 mb-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { l: "Total classes",  v: meta?.total ?? 0, g1: "#0ea5e9", g2: "#06b6d4", icon: Building2 },
            { l: "Cycles",         v: cycles.length,    g1: "#6366f1", g2: "#8b5cf6", icon: Layers    },
            { l: "Cette page",     v: classes.length,   g1: "#10b981", g2: "#059669", icon: BookOpen  },
            { l: "Sélectionné",    v: idCycle ? (cycles.find(c => String(c.idCycle) === idCycle)?.libelle ?? "—") : "Tous", g1: "#f59e0b", g2: "#f97316", icon: Eye },
          ].map((k, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow: "var(--shadow-lg)", border: "1px solid rgba(255,255,255,0.7)", transition: "transform 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-5px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
            >
              <div className="h-1" style={{ background: `linear-gradient(90deg,${k.g1},${k.g2})` }} />
              <div className="p-4 flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `linear-gradient(135deg,${k.g1},${k.g2})`, boxShadow: `0 4px 14px ${k.g1}55` }}>
                  <k.icon style={{ width: 18, height: 18, color: "#fff" }} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-black leading-none truncate" style={{ color: "var(--text-900)", letterSpacing: "-0.04em" }}>{k.v}</p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: "var(--text-400)" }}>{k.l}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 md:px-10 space-y-5 pb-10">

        {/* Formulaire cycle */}
        {showCycleForm && (
          <div className="bg-white rounded-2xl p-5 animate-fade-in" style={{ boxShadow: "var(--shadow-md)", border: "2px solid rgba(14,165,233,0.2)" }}>
            <p className="font-bold text-sm mb-4" style={{ color: "var(--text-900)" }}>Nouveau cycle</p>
            <form onSubmit={handleCreateCycle} className="flex gap-3 flex-wrap">
              <input required className="input flex-1 min-w-[200px]" placeholder="Libellé (ex: Primaire, Collège…)"
                value={cycleForm.libelle} onChange={e => setCycleForm({ ...cycleForm, libelle: e.target.value })} />
              <input className="input flex-1 min-w-[200px]" placeholder="Description (optionnel)"
                value={cycleForm.description} onChange={e => setCycleForm({ ...cycleForm, description: e.target.value })} />
              <button type="submit" className="btn-primary">Créer le cycle</button>
            </form>
          </div>
        )}

        {/* ── Cycles ── */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] mb-3" style={{ color: "var(--text-300)" }}>
            Filtrer par cycle
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Option "Tous" */}
            <div
              role="button" tabIndex={0}
              onClick={() => setIdCycle("")}
              onKeyDown={e => e.key === "Enter" && setIdCycle("")}
              className="relative rounded-2xl p-4 cursor-pointer select-none transition-all overflow-hidden"
              style={{
                background:  idCycle === "" ? "linear-gradient(135deg,#334155,#475569)" : "white",
                border:      idCycle === "" ? "none" : "1px solid var(--border)",
                boxShadow:   idCycle === "" ? "0 4px 16px rgba(51,65,85,0.35)" : "var(--shadow-sm)",
                transform:   idCycle === "" ? "translateY(-2px)" : "",
              }}
            >
              {idCycle !== "" && <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: "linear-gradient(90deg,#334155,#475569)" }} />}
              <p className={`font-bold text-sm ${idCycle === "" ? "text-white" : ""}`} style={idCycle !== "" ? { color: "var(--text-700)" } : {}}>Tous</p>
              <p className={`text-xs mt-0.5 ${idCycle === "" ? "text-white/60" : ""}`} style={idCycle !== "" ? { color: "var(--text-300)" } : {}}>
                {meta?.total ?? 0} classe(s)
              </p>
            </div>

            {cycles.map((cycle, i) => {
              const c = CYCLE_GRADS[i % CYCLE_GRADS.length];
              const sel = idCycle === String(cycle.idCycle);
              return (
                <div
                  key={cycle.idCycle}
                  role="button" tabIndex={0}
                  onClick={() => setIdCycle(sel ? "" : String(cycle.idCycle))}
                  onKeyDown={e => e.key === "Enter" && setIdCycle(sel ? "" : String(cycle.idCycle))}
                  className="relative rounded-2xl p-4 cursor-pointer select-none transition-all overflow-hidden"
                  style={{
                    background: sel ? `linear-gradient(135deg,${c.g1},${c.g2})` : "white",
                    border:     sel ? "none" : "1px solid var(--border)",
                    boxShadow:  sel ? `0 4px 16px ${c.g1}55` : "var(--shadow-sm)",
                    transform:  sel ? "translateY(-2px)" : "",
                  }}
                  onMouseEnter={e => { if (!sel) { (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 20px ${c.g1}44`; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; } }}
                  onMouseLeave={e => { if (!sel) { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)"; (e.currentTarget as HTMLElement).style.transform = ""; } }}
                >
                  {!sel && <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg,${c.g1},${c.g2})` }} />}
                  <p className={`font-bold text-sm ${sel ? "text-white" : ""}`} style={!sel ? { color: "var(--text-700)" } : {}}>
                    {cycle.libelle}
                  </p>
                  <p className={`text-xs mt-0.5 ${sel ? "text-white/60" : ""}`} style={!sel ? { color: "var(--text-300)" } : {}}>
                    {cycle.classes?.length ?? 0} classe(s)
                  </p>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (confirm("Supprimer ce cycle ?")) { deleteCycle(cycle.idCycle); fetchCycles(); fetchClasses(); }
                    }}
                    className="absolute top-2 right-2 p-1 rounded-lg transition-colors"
                    style={{ color: sel ? "rgba(255,255,255,0.5)" : "var(--text-300)" }}
                    onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.color = sel ? "#fff" : "#ef4444"; (ev.currentTarget as HTMLElement).style.background = sel ? "rgba(255,255,255,0.15)" : "rgba(239,68,68,0.1)"; }}
                    onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.color = sel ? "rgba(255,255,255,0.5)" : "var(--text-300)"; (ev.currentTarget as HTMLElement).style.background = ""; }}
                  >
                    <Trash2 style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filtre search */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--text-300)" }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Rechercher une classe…" className="input pl-10" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-md)" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <p className="font-bold text-sm" style={{ color: "var(--text-900)" }}>Liste des classes</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-400)" }}>Cliquez sur une ligne pour voir les détails</p>
          </div>
          <table className="w-full">
            <thead>
              <tr>{["Classe","Cycle","Cours","Actions"].map(h => <th key={h} className="table-th">{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} className="table-td"><div className="skeleton h-4 rounded w-3/4" /></td>
                  ))}</tr>
                ))
              ) : classes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg,#0ea5e9,#06b6d4)" }}>
                        <Building2 className="w-7 h-7 text-white" />
                      </div>
                      <p className="text-sm" style={{ color: "var(--text-400)" }}>Aucune classe trouvée</p>
                    </div>
                  </td>
                </tr>
              ) : (
                classes.map((cl) => {
                  const ci = cycles.findIndex(cy => cy.idCycle === cl.idCycle);
                  const c  = CYCLE_GRADS[ci % CYCLE_GRADS.length] ?? CYCLE_GRADS[0];
                  return (
                    <tr key={cl.idClasse}
                      className="border-b cursor-pointer transition-colors"
                      style={{ borderColor: "var(--border)" }}
                      onClick={() => navigate(`/classes/${cl.idClasse}`)}
                      onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = "var(--bg-app)"; }}
                      onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = ""; }}
                    >
                      <td className="table-td">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: `linear-gradient(135deg,${c.g1},${c.g2})`, boxShadow: `0 2px 8px ${c.g1}55` }}>
                            <BookOpen style={{ width: 14, height: 14, color: "#fff" }} />
                          </div>
                          <span className="font-semibold text-sm" style={{ color: "var(--text-900)" }}>{cl.libelle}</span>
                        </div>
                      </td>
                      <td className="table-td">
                        {cl.cycle?.libelle
                          ? <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full text-white"
                              style={{ background: `linear-gradient(135deg,${c.g1},${c.g2})`, boxShadow: `0 2px 8px ${c.g1}44` }}>
                              {cl.cycle.libelle}
                            </span>
                          : <span style={{ color: "var(--text-300)" }}>—</span>}
                      </td>
                      <td className="table-td text-sm" style={{ color: "var(--text-500)" }}>{cl.cours_count ?? 0} cours</td>
                      <td className="table-td" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <button onClick={() => navigate(`/classes/${cl.idClasse}`)}
                            className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-300)" }}
                            onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = "rgba(14,165,233,0.1)"; (ev.currentTarget as HTMLElement).style.color = "#0ea5e9"; }}
                            onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = ""; (ev.currentTarget as HTMLElement).style.color = "var(--text-300)"; }}>
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => navigate(`/classes/${cl.idClasse}/modifier`)}
                            className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-300)" }}
                            onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = "rgba(245,158,11,0.1)"; (ev.currentTarget as HTMLElement).style.color = "#f59e0b"; }}
                            onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = ""; (ev.currentTarget as HTMLElement).style.color = "var(--text-300)"; }}>
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => { if (confirm("Supprimer cette classe ?")) { deleteClasse(cl.idClasse); fetchClasses(); } }}
                            className="p-1.5 rounded-lg transition-colors" style={{ color: "var(--text-300)" }}
                            onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)"; (ev.currentTarget as HTMLElement).style.color = "#ef4444"; }}
                            onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.background = ""; (ev.currentTarget as HTMLElement).style.color = "var(--text-300)"; }}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {meta && meta.last_page > 1 && (
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
              <p className="text-sm" style={{ color: "var(--text-400)" }}>{meta.total} classe(s)</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Précédent</button>
                <span className="flex items-center px-3 text-xs" style={{ color: "var(--text-500)" }}>{page} / {meta.last_page}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page === meta.last_page} className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40">Suivant</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
