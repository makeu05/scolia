// src/pages/cours/coursPage.tsx — Version colorée premium
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Edit, Trash2, Search, BookOpen } from "lucide-react";
import { getCours, deleteCours, type Cours, type CoursPaginate, type CoursFilters } from "../../service/cours_service";

const GRADIENTS = [
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f6d365,#fda085)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
];

export default function CoursPage() {
  const navigate = useNavigate();
  const [coursData, setCoursData] = useState<CoursPaginate | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  const [mounted, setMounted]     = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const fetchCours = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await getCours({ page, search: search.trim() || undefined } as CoursFilters);
      setCoursData(data);
    } catch (err: any) { setError(err.message || "Impossible de charger les cours"); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchCours(); }, [fetchCours]);

  const handleDelete = async (idCours: number) => {
    if (!confirm("Supprimer ce cours ?")) return;
    try { await deleteCours(idCours); fetchCours(); } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Bannière verte */}
      <div className={`rounded-2xl p-5 relative overflow-hidden transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
        style={{ background: "linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)", boxShadow: "0 4px 24px rgba(67,233,123,0.4)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(255,255,255,0.2) 0%,transparent 70%)" }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-emerald-100" />
              <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">Programme scolaire</p>
            </div>
            <h1 className="text-white text-2xl font-bold" style={{ letterSpacing: "-0.03em" }}>Cours</h1>
            <p className="text-emerald-100/70 text-sm mt-1">{coursData?.total ?? 0} cours au total</p>
          </div>
          <button onClick={() => navigate("/cours/nouveau")}
            className="flex items-center gap-2 bg-white text-emerald-600 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-emerald-50 transition-all active:scale-[0.97]"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
            <Plus className="w-4 h-4" /> Nouveau cours
          </button>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Rechercher un cours…" className="input pl-10" />
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
        <table className="w-full">
          <thead>
            <tr>{["Cours","Classe","Enseignant","Coefficient","Statut","Actions"].map(h => <th key={h} className="table-th">{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j} className="table-td"><div className="skeleton h-4 rounded w-3/4" /></td>)}</tr>
              ))
            ) : coursData?.data.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg,#43e97b,#38f9d7)" }}>
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-slate-500 font-medium">Aucun cours trouvé</p>
                  </div>
                </td>
              </tr>
            ) : (
              coursData?.data.map((c: Cours, idx: number) => (
                <tr key={c.idCours} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors cursor-pointer"
                  onClick={() => navigate(`/cours/${c.idCours}`)}>
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: GRADIENTS[idx % GRADIENTS.length] }}>
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      <p className="font-semibold text-slate-900 text-sm">{c.libelle}</p>
                    </div>
                  </td>
                  <td className="table-td">
                    {c.classe?.libelle
                      ? <span className="inline-flex text-xs font-semibold px-2.5 py-1 rounded-full text-blue-700" style={{ background: "rgba(79,172,254,0.1)" }}>{c.classe.libelle}</span>
                      : "—"}
                  </td>
                  <td className="table-td text-sm text-slate-600">
                    {c.enseignant?.personne ? `${c.enseignant.personne.prenom} ${c.enseignant.personne.nom}` : <span className="text-slate-400 italic">Non assigné</span>}
                  </td>
                  <td className="table-td">
                    <span className="font-mono text-sm font-bold px-2.5 py-1 rounded-lg text-emerald-700"
                      style={{ background: "rgba(67,233,123,0.1)" }}>×{c.coefficient ?? "—"}</span>
                  </td>
                  <td className="table-td">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${c.actif ? "text-emerald-700" : "text-slate-500"}`}
                      style={{ background: c.actif ? "rgba(67,233,123,0.1)" : "#f8fafc" }}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.actif ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {c.actif ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="table-td" onClick={ev => ev.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(`/cours/${c.idCours}`)} className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => navigate(`/cours/${c.idCours}/modifier`)} className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(c.idCours)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {coursData && coursData.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">Page <span className="font-semibold text-slate-700">{coursData.current_page}</span> sur {coursData.last_page}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="btn-secondary py-2 px-4 disabled:opacity-40">Précédent</button>
            <button onClick={() => setPage(p => Math.min(coursData.last_page,p+1))} disabled={page===coursData.last_page} className="btn-secondary py-2 px-4 disabled:opacity-40">Suivant</button>
          </div>
        </div>
      )}
    </div>
  );
}