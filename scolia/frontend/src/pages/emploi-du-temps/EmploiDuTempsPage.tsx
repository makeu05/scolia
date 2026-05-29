// src/pages/emploi-du-temps/EmploiDuTempsPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Clock, Calendar, BookOpen, ChevronDown } from "lucide-react";
import { authFetch } from "../../service/auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
const TOKEN = () => localStorage.getItem("token") ?? "";

const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const HEURES = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];

const JOUR_COLORS: Record<string, { gradient: string; light: string; text: string }> = {
  Lundi:    { gradient: "linear-gradient(135deg,#667eea,#764ba2)", light: "rgba(102,126,234,0.1)", text: "#667eea" },
  Mardi:    { gradient: "linear-gradient(135deg,#f093fb,#f5576c)", light: "rgba(240,147,251,0.1)", text: "#f5576c" },
  Mercredi: { gradient: "linear-gradient(135deg,#4facfe,#00f2fe)", light: "rgba(79,172,254,0.1)",  text: "#4facfe" },
  Jeudi:    { gradient: "linear-gradient(135deg,#43e97b,#38f9d7)", light: "rgba(67,233,123,0.1)",  text: "#43e97b" },
  Vendredi: { gradient: "linear-gradient(135deg,#f6d365,#fda085)", light: "rgba(246,211,101,0.1)", text: "#fda085" },
  Samedi:   { gradient: "linear-gradient(135deg,#a18cd1,#fbc2eb)", light: "rgba(161,140,209,0.1)", text: "#a18cd1" },
};

export default function EmploiDuTempsPage() {
  const navigate = useNavigate();
  const [classes, setClasses]       = useState<any[]>([]);
  const [selectedClasse, setSelectedClasse] = useState("");
  const [grille, setGrille]         = useState<Record<string, any[]>>({});
  const [cours, setCours]           = useState<any[]>([]);
  const [loading, setLoading]       = useState(false);
  const [mounted, setMounted]       = useState(false);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState({ jour: "Lundi", heure: "07:00", idCours: "", idAdmin: "1" });

  useEffect(() => {
    setMounted(true);
    // Charger classes
    fetch(`${API}/classes?paginate=false`, { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json()).then(d => setClasses(d.data ?? d)).catch(() => {});
    // Charger cours
    fetch(`${API}/cours?paginate=false`, { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json()).then(d => setCours(d.data ?? d)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedClasse) return;
    setLoading(true);
    fetch(`${API}/emploi-du-temps/classe/${selectedClasse}`, { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json())
      .then(d => setGrille(d.grille ?? {}))
      .catch(() => setGrille({}))
      .finally(() => setLoading(false));
  }, [selectedClasse]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClasse) return;
    try {
      await authFetch(`${API}/emploi-du-temps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, idClasse: selectedClasse }),
      });
      setShowForm(false);
      setForm({ jour: "Lundi", heure: "07:00", idCours: "", idAdmin: "1" });
      // Recharger
      const d = await fetch(`${API}/emploi-du-temps/classe/${selectedClasse}`, { headers: { Authorization: `Bearer ${TOKEN()}` } }).then(r => r.json());
      setGrille(d.grille ?? {});
    } catch { alert("Erreur lors de l'ajout"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce créneau ?")) return;
    await authFetch(`${API}/emploi-du-temps/${id}`, { method: "DELETE" });
    const d = await fetch(`${API}/emploi-du-temps/classe/${selectedClasse}`, { headers: { Authorization: `Bearer ${TOKEN()}` } }).then(r => r.json());
    setGrille(d.grille ?? {});
  };

  const totalCreneaux = Object.values(grille).reduce((s, j) => s + j.length, 0);

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
              <Clock className="w-4 h-4 text-cyan-100" />
              <p className="text-cyan-100 text-xs font-semibold uppercase tracking-wider">Planning scolaire</p>
            </div>
            <h1 className="text-white text-2xl font-bold" style={{ letterSpacing: "-0.03em" }}>Emploi du temps</h1>
            <p className="text-cyan-100/70 text-sm mt-1">
              {selectedClasse ? `${totalCreneaux} créneau${totalCreneaux > 1 ? "x" : ""} planifié${totalCreneaux > 1 ? "s" : ""}` : "Sélectionnez une classe"}
            </p>
          </div>
          <div className="flex gap-2">
            {selectedClasse && (
              <button onClick={() => setShowForm(v => !v)}
                className="flex items-center gap-2 bg-white text-cyan-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-cyan-50 transition-all active:scale-[0.97]"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
                <Plus className="w-4 h-4" /> {showForm ? "Annuler" : "Ajouter créneau"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sélecteur de classe */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select value={selectedClasse} onChange={e => setSelectedClasse(e.target.value)}
            className="input appearance-none w-full pr-9 cursor-pointer font-medium">
            <option value="">Choisir une classe…</option>
            {classes.map(c => (
              <option key={c.idClasse} value={c.idClasse}>{c.libelle}{c.cycle?.libelle ? ` — ${c.cycle.libelle}` : ""}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Formulaire ajout créneau */}
      {showForm && selectedClasse && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-fade-in"
          style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
          <h3 className="text-sm font-bold text-slate-900 mb-4">Nouveau créneau</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Jour *</label>
              <select value={form.jour} onChange={e => setForm({ ...form, jour: e.target.value })} className="input appearance-none">
                {JOURS.map(j => <option key={j}>{j}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Heure *</label>
              <select value={form.heure} onChange={e => setForm({ ...form, heure: e.target.value })} className="input appearance-none">
                {HEURES.map(h => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Cours *</label>
              <select required value={form.idCours} onChange={e => setForm({ ...form, idCours: e.target.value })} className="input appearance-none">
                <option value="">Choisir…</option>
                {cours.filter(c => !selectedClasse || String(c.idClasse) === selectedClasse).map(c => (
                  <option key={c.idCours} value={c.idCours}>{c.libelle}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" className="btn-primary w-full justify-center"
                style={{ background: "linear-gradient(135deg,#4facfe,#00f2fe)" }}>
                <Plus className="w-4 h-4" /> Ajouter
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grille emploi du temps */}
      {!selectedClasse ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center"
          style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg,#4facfe,#00f2fe)" }}>
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-500 font-medium">Sélectionnez une classe pour voir son emploi du temps</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {JOURS.map(j => <div key={j} className="skeleton h-40 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 stagger">
          {JOURS.map(jour => {
            const c = JOUR_COLORS[jour];
            const creneaux = grille[jour] ?? [];
            return (
              <div key={jour} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-fade-in"
                style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
                {/* Header jour */}
                <div className="p-3 text-white text-center font-bold text-sm" style={{ background: c.gradient }}>
                  {jour}
                  <span className="ml-2 text-white/70 text-xs font-normal">({creneaux.length})</span>
                </div>

                {/* Créneaux */}
                <div className="p-3 space-y-2 min-h-[120px]">
                  {creneaux.length === 0 ? (
                    <p className="text-xs text-slate-300 text-center py-4 italic">Libre</p>
                  ) : (
                    creneaux.map((cr: any) => (
                      <div key={cr.idTemps} className="rounded-xl p-2.5 relative group"
                        style={{ background: c.light, border: `1px solid ${c.text}20` }}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="w-3 h-3 flex-shrink-0" style={{ color: c.text }} />
                            <span className="text-xs font-bold" style={{ color: c.text }}>{cr.heure}</span>
                          </div>
                          <button onClick={() => handleDelete(cr.idTemps)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <p className="text-xs font-semibold text-slate-800 truncate">{cr.cours?.libelle ?? "—"}</p>
                        </div>
                        {cr.cours?.enseignant?.personne && (
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                            {cr.cours.enseignant.personne.prenom} {cr.cours.enseignant.personne.nom}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}