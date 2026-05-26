// src/pages/salles/sallesPage.tsx — Version colorée premium
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Edit, Trash2, Search, Home, CheckCircle, XCircle } from "lucide-react";


const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
function getToken() { return localStorage.getItem("token") ?? ""; }

const GRADIENTS = [
  "linear-gradient(135deg,#f6d365,#fda085)",
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
];

export default function SallesPage() {
  const navigate  = useNavigate();
  const [salles, setSalles]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch(`${API}/salles`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json())
      .then(d => setSalles(Array.isArray(d) ? d : (d.data ?? [])))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = salles.filter(s =>
    !search || s.libelle?.toLowerCase().includes(search.toLowerCase()) ||
    s.position?.toLowerCase().includes(search.toLowerCase())
  );

  const totalActives   = salles.filter(s => s.actif).length;
  const totalInactives = salles.filter(s => !s.actif).length;

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette salle ?")) return;
    await fetch(`${API}/salles/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
    setSalles(prev => prev.filter(s => s.idSalle !== id));
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Bannière ambre */}
      <div className={`rounded-2xl p-5 relative overflow-hidden transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
        style={{ background: "linear-gradient(135deg,#f6d365 0%,#fda085 100%)", boxShadow: "0 4px 24px rgba(246,211,101,0.4)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(255,255,255,0.2) 0%,transparent 70%)" }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Home className="w-4 h-4 text-orange-100" />
              <p className="text-orange-100 text-xs font-semibold uppercase tracking-wider">Infrastructure scolaire</p>
            </div>
            <h1 className="text-white text-2xl font-bold" style={{ letterSpacing: "-0.03em" }}>Salles de classe</h1>
            <p className="text-orange-100/70 text-sm mt-1">{salles.length} salle{salles.length > 1 ? "s" : ""} enregistrée{salles.length > 1 ? "s" : ""}</p>
          </div>
          <button onClick={() => navigate("/salles/nouveau")}
            className="flex items-center gap-2 bg-white text-orange-600 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-orange-50 transition-all active:scale-[0.97]"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
            <Plus className="w-4 h-4" /> Nouvelle salle
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 stagger">
        {[
          { label: "Total salles",  value: salles.length,    gradient: "linear-gradient(135deg,#f6d365,#fda085)", shadow: "rgba(246,211,101,0.3)" },
          { label: "Actives",       value: totalActives,     gradient: "linear-gradient(135deg,#43e97b,#38f9d7)", shadow: "rgba(67,233,123,0.3)" },
          { label: "Inactives",     value: totalInactives,   gradient: "linear-gradient(135deg,#f093fb,#f5576c)", shadow: "rgba(240,147,251,0.3)" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-fade-in relative overflow-hidden"
            style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)", transition: "all 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${s.shadow}`; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(15,31,61,0.06)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: s.gradient }} />
            <p className="text-2xl font-bold text-slate-900 mt-2" style={{ letterSpacing: "-0.02em" }}>{s.value}</p>
            <p className="text-xs text-slate-400 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recherche */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher une salle…" className="input pl-10" />
      </div>

      {/* Grille des salles */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-100"
          style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg,#f6d365,#fda085)" }}>
            <Home className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-500 font-medium">Aucune salle trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger">
          {filtered.map((salle, idx) => (
            <div key={salle.idSalle} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-fade-in group cursor-pointer"
              style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)", transition: "all 0.2s" }}
              onClick={() => navigate(`/salles/${salle.idSalle}`)}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(246,211,101,0.25)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(15,31,61,0.06)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
              {/* Header coloré */}
              <div className="h-3 rounded-t-2xl" style={{ background: GRADIENTS[idx % GRADIENTS.length] }} />
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: GRADIENTS[idx % GRADIENTS.length], boxShadow: "0 2px 8px rgba(15,31,61,0.1)" }}>
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  {salle.actif
                    ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                    : <XCircle className="w-4 h-4 text-red-400" />}
                </div>
                <p className="font-bold text-slate-900 text-sm mt-2">{salle.libelle}</p>
                {salle.position && <p className="text-xs text-slate-400 mt-0.5">{salle.position}</p>}
                {salle.classe?.libelle && (
                  <p className="text-xs text-slate-400 mt-0.5">Classe : {salle.classe.libelle}</p>
                )}
                {salle.surface && <p className="text-xs text-slate-400">{salle.surface}</p>}

                {/* Actions */}
                <div className="flex gap-1 mt-3 pt-3 border-t border-slate-100" onClick={ev => ev.stopPropagation()}>
                  <button onClick={() => navigate(`/salles/${salle.idSalle}`)}
                    className="flex-1 p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors flex items-center justify-center">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => navigate(`/salles/${salle.idSalle}/modifier`)}
                    className="flex-1 p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors flex items-center justify-center">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(salle.idSalle)}
                    className="flex-1 p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors flex items-center justify-center">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}