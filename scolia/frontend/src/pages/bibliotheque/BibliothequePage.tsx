// src/pages/bibliotheque/BibliothequePage.tsx
import { useEffect, useState, useCallback } from "react";
import { Plus, Search, Edit, Trash2, BookOpen, Tag, TrendingUp } from "lucide-react";
import { authFetch } from "../../service/auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
const TOKEN = () => localStorage.getItem("token") ?? "";

const GRADIENTS = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#f6d365,#fda085)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
];

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n/1_000).toFixed(0)}K`;
  return n.toLocaleString("fr-FR");
}

export default function BibliothequePage() {
  const [livres, setLivres]       = useState<any[]>([]);
  const [specialites, setSpecialites] = useState<any[]>([]);
  const [stats, setStats]         = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [idSpec, setIdSpec]       = useState("");
  const [mounted, setMounted]     = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<any>(null);
  const [form, setForm]           = useState({ titre: "", auteurs: "", prix: "", idSpecialite: "", edition: "", annee_parution: "", idAdmin: "1" });

  useEffect(() => {
    setMounted(true);
    // Charger spécialités
    fetch(`${API}/specialites`, { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json()).then(d => setSpecialites(d.data ?? d)).catch(() => {});
    // Charger stats
    fetch(`${API}/livres/stats`, { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  const fetchLivres = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (idSpec) params.append("idSpecialite", idSpec);
      const d = await fetch(`${API}/livres?${params}`, { headers: { Authorization: `Bearer ${TOKEN()}` } }).then(r => r.json());
      setLivres(d.data ?? d);
    } catch { setLivres([]); }
    finally { setLoading(false); }
  }, [search, idSpec]);

  useEffect(() => { fetchLivres(); }, [fetchLivres]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await authFetch(`${API}/livres/${editing.idLivre}`, {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
        });
      } else {
        await authFetch(`${API}/livres`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
        });
      }
      setShowForm(false); setEditing(null);
      setForm({ titre: "", auteurs: "", prix: "", idSpecialite: "", edition: "", annee_parution: "", idAdmin: "1" });
      fetchLivres();
    } catch { alert("Erreur lors de l'enregistrement"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce livre ?")) return;
    await authFetch(`${API}/livres/${id}`, { method: "DELETE" });
    fetchLivres();
  };

  const handleEdit = (livre: any) => {
    setEditing(livre);
    setForm({
      titre: livre.titre, auteurs: livre.auteurs, prix: String(livre.prix ?? ""),
      idSpecialite: String(livre.idSpecialite), edition: livre.edition,
      annee_parution: livre.annee_parution?.split("T")[0] ?? "", idAdmin: "1",
    });
    setShowForm(true);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Bannière */}
      <div className={`rounded-2xl p-5 relative overflow-hidden transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
        style={{ background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)", boxShadow: "0 4px 24px rgba(102,126,234,0.4)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(255,255,255,0.15) 0%,transparent 70%)" }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-purple-200" />
              <p className="text-purple-200 text-xs font-semibold uppercase tracking-wider">Ressources pédagogiques</p>
            </div>
            <h1 className="text-white text-2xl font-bold" style={{ letterSpacing: "-0.03em" }}>Bibliothèque</h1>
            <p className="text-purple-200/70 text-sm mt-1">{stats?.total ?? 0} livre{(stats?.total ?? 0) > 1 ? "s" : ""} disponible{(stats?.total ?? 0) > 1 ? "s" : ""}</p>
          </div>
          <button onClick={() => { setShowForm(v => !v); setEditing(null); setForm({ titre: "", auteurs: "", prix: "", idSpecialite: "", edition: "", annee_parution: "", idAdmin: "1" }); }}
            className="flex items-center gap-2 bg-white text-purple-700 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-purple-50 transition-all active:scale-[0.97]"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
            <Plus className="w-4 h-4" /> {showForm ? "Annuler" : "Ajouter un livre"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 stagger">
        {[
          { label: "Total livres",    value: stats?.total ?? 0,                         gradient: "linear-gradient(135deg,#667eea,#764ba2)", shadow: "rgba(102,126,234,0.3)" },
          { label: "Valeur totale",   value: `${fmt(stats?.valeurTotale ?? 0)} FCFA`,  gradient: "linear-gradient(135deg,#43e97b,#38f9d7)", shadow: "rgba(67,233,123,0.3)" },
          { label: "Spécialités",     value: stats?.parSpecialite?.length ?? 0,         gradient: "linear-gradient(135deg,#f6d365,#fda085)", shadow: "rgba(246,211,101,0.3)" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-fade-in relative overflow-hidden"
            style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)", transition: "all 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${s.shadow}`; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(15,31,61,0.06)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: s.gradient }} />
            <p className="text-xl font-bold text-slate-900 mt-2" style={{ letterSpacing: "-0.02em" }}>{s.value}</p>
            <p className="text-xs text-slate-400 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-fade-in"
          style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
          <h3 className="text-sm font-bold text-slate-900 mb-4">{editing ? "Modifier le livre" : "Nouveau livre"}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Titre *</label>
              <input required className="input" placeholder="Titre du livre" value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Spécialité *</label>
              <select required className="input appearance-none" value={form.idSpecialite} onChange={e => setForm({ ...form, idSpecialite: e.target.value })}>
                <option value="">Choisir…</option>
                {specialites.map(s => <option key={s.idSpecialite} value={s.idSpecialite}>{s.libelle}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Auteur(s)</label>
              <input className="input" placeholder="Nom de l'auteur" value={form.auteurs} onChange={e => setForm({ ...form, auteurs: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Édition</label>
              <input className="input" placeholder="Édition" value={form.edition} onChange={e => setForm({ ...form, edition: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Prix (FCFA)</label>
              <input type="number" className="input" placeholder="0" value={form.prix} onChange={e => setForm({ ...form, prix: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Année parution</label>
              <input type="date" className="input" value={form.annee_parution} onChange={e => setForm({ ...form, annee_parution: e.target.value })} />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary" style={{ background: "linear-gradient(135deg,#667eea,#764ba2)" }}>
                {editing ? "Enregistrer" : "Ajouter le livre"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un livre, auteur…" className="input pl-10" />
        </div>
        <select value={idSpec} onChange={e => setIdSpec(e.target.value)} className="input appearance-none min-w-[180px] cursor-pointer">
          <option value="">Toutes les spécialités</option>
          {specialites.map(s => <option key={s.idSpecialite} value={s.idSpecialite}>{s.libelle}</option>)}
        </select>
      </div>

      {/* Grille livres */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : livres.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-100"
          style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg,#667eea,#764ba2)" }}>
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-500 font-medium">Aucun livre trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger">
          {livres.map((livre, idx) => (
            <div key={livre.idLivre} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-fade-in group"
              style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)", transition: "all 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(102,126,234,0.2)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(15,31,61,0.06)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
              {/* Header coloré */}
              <div className="h-2" style={{ background: GRADIENTS[idx % GRADIENTS.length] }} />
              <div className="p-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: GRADIENTS[idx % GRADIENTS.length] }}>
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <p className="font-bold text-slate-900 text-sm leading-snug mb-1">{livre.titre}</p>
                <p className="text-xs text-slate-400">{livre.auteurs !== "INDEFINI" ? livre.auteurs : "—"}</p>
                {livre.specialite && (
                  <div className="flex items-center gap-1 mt-2">
                    <Tag className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-500">{livre.specialite.libelle}</span>
                  </div>
                )}
                {livre.prix > 0 && (
                  <p className="text-xs font-semibold text-emerald-600 mt-1">{fmt(livre.prix)} FCFA</p>
                )}
                <div className="flex gap-1 mt-3 pt-3 border-t border-slate-100" onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleEdit(livre)}
                    className="flex-1 p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors flex items-center justify-center">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(livre.idLivre)}
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