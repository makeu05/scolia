// src/pages/emploi-du-temps/EmploiDuTempsPage.tsx

import { useEffect, useState } from "react";
import { Plus, Trash2, Clock, Calendar, BookOpen, ChevronDown, Coffee, Star, MapPin, Settings } from "lucide-react";
import { authFetch } from "../../service/auth";

const API   = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
const TOKEN = () => localStorage.getItem("token") ?? "";

const JOURS  = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const HEURES = [
  "07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30",
  "11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30",
  "15:00","15:30","16:00","16:30","17:00","17:30","18:00",
];

const JOURS_SEMAINE = ["Lundi","Mardi","Mercredi","Jeudi","Vendredi"];

const CATEGORIES_ACTIVITE = [
  { value: "sport",          label: "Sport" },
  { value: "musique",        label: "Musique" },
  { value: "theatre",        label: "Théâtre" },
  { value: "club",           label: "Club" },
  { value: "sortie_scolaire",label: "Sortie scolaire" },
  { value: "voyage",         label: "Voyage" },
  { value: "autre",          label: "Autre" },
];

const JOUR_COLORS: Record<string, { gradient: string; light: string; text: string }> = {
  Lundi:    { gradient: "linear-gradient(135deg,#667eea,#764ba2)", light: "rgba(102,126,234,0.1)", text: "#667eea" },
  Mardi:    { gradient: "linear-gradient(135deg,#f093fb,#f5576c)", light: "rgba(240,147,251,0.1)", text: "#f5576c" },
  Mercredi: { gradient: "linear-gradient(135deg,#4facfe,#00f2fe)", light: "rgba(79,172,254,0.1)",  text: "#4facfe" },
  Jeudi:    { gradient: "linear-gradient(135deg,#43e97b,#38f9d7)", light: "rgba(67,233,123,0.1)",  text: "#43e97b" },
  Vendredi: { gradient: "linear-gradient(135deg,#f6d365,#fda085)", light: "rgba(246,211,101,0.1)", text: "#fda085" },
  Samedi:   { gradient: "linear-gradient(135deg,#a18cd1,#fbc2eb)", light: "rgba(161,140,209,0.1)", text: "#a18cd1" },
};

// ── Types ──────────────────────────────────────────────────────────────────────
type TypeCreneau = "cours" | "pause" | "activite" | "special";
type TabType = "grille" | "pauses" | "activites";

interface Creneau {
  idTemps: number | string;
  jour: string;
  heure: string;
  heureFin?: string;
  type: TypeCreneau;
  libelle?: string;
  description?: string;
  isPause?: boolean;
  isActivite?: boolean;
  categorie?: string;
  lieu?: string;
  cours?: { idCours: number; libelle: string; enseignant?: { personne?: { nom: string; prenom: string } } };
  salle?: { idSalle: number; libelle: string };
}

interface PauseCycle {
  idPause: number;
  idCycle: number;
  libelle: string;
  heureDebut: string;
  heureFin: string;
  jours: string[];
  actif: boolean;
}

interface Activite {
  idActivite: number;
  libelle: string;
  categorie: string;
  description?: string;
  lieu?: string;
  idClasse?: number;
  dateDebut?: string;
  dateFin?: string;
  jourHebdo?: string;
  heureDebut?: string;
  heureFin?: string;
  actif: boolean;
}

// ── Helpers visuels ────────────────────────────────────────────────────────────
function CreneauCard({ cr, onDelete, color }: { cr: Creneau; onDelete: (id: number|string) => void; color: { light: string; text: string } }) {
  const isPause    = cr.type === "pause"    || cr.isPause;
  const isActivite = cr.type === "activite" || cr.isActivite;
  const isSpecial  = cr.type === "special";

  const bg    = isPause ? "rgba(251,191,36,0.12)"  : isActivite ? "rgba(16,185,129,0.1)" : isSpecial ? "rgba(139,92,246,0.1)" : color.light;
  const tc    = isPause ? "#d97706" : isActivite ? "#059669" : isSpecial ? "#7c3aed" : color.text;
  const border = `1px solid ${tc}20`;

  return (
    <div className="rounded-xl p-2.5 relative group" style={{ background: bg, border }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1.5 mb-1">
          {isPause    && <Coffee className="w-3 h-3 flex-shrink-0" style={{ color: tc }} />}
          {isActivite && <Star   className="w-3 h-3 flex-shrink-0" style={{ color: tc }} />}
          {isSpecial  && <Star   className="w-3 h-3 flex-shrink-0" style={{ color: tc }} />}
          {!isPause && !isActivite && !isSpecial && <Clock className="w-3 h-3 flex-shrink-0" style={{ color: tc }} />}
          <span className="text-xs font-bold" style={{ color: tc }}>
            {cr.heure}{cr.heureFin ? ` – ${cr.heureFin}` : ""}
          </span>
        </div>
        {!isPause && !isActivite && (
          <button
            onClick={() => onDelete(cr.idTemps)}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Contenu selon type */}
      {isPause ? (
        <p className="text-xs font-semibold text-amber-700">{cr.libelle ?? "Pause"}</p>
      ) : isActivite ? (
        <>
          <p className="text-xs font-semibold text-emerald-700 truncate">{cr.libelle}</p>
          {cr.lieu && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-2.5 h-2.5 text-slate-400" />
              <p className="text-[10px] text-slate-400 truncate">{cr.lieu}</p>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <p className="text-xs font-semibold text-slate-800 truncate">
              {cr.libelle ?? cr.cours?.libelle ?? "—"}
            </p>
          </div>
          {cr.cours?.enseignant?.personne && (
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
              {cr.cours.enseignant.personne.prenom} {cr.cours.enseignant.personne.nom}
            </p>
          )}
          {cr.salle && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-2.5 h-2.5 text-slate-400" />
              <p className="text-[10px] text-slate-400 truncate">{cr.salle.libelle}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Composant principal ────────────────────────────────────────────────────────
export default function EmploiDuTempsPage() {
  const [classes, setClasses]               = useState<any[]>([]);
  const [cycles, setCycles]                 = useState<any[]>([]);
  const [salles, setSalles]                 = useState<any[]>([]);
  const [selectedClasse, setSelectedClasse] = useState("");
  const [classeInfo, setClasseInfo]         = useState<any>(null);
  const [grille, setGrille]                 = useState<Record<string, Creneau[]>>({});
  const [cours, setCours]                   = useState<any[]>([]);
  const [pauses, setPauses]                 = useState<PauseCycle[]>([]);
  const [activites, setActivites]           = useState<Activite[]>([]);
  const [loading, setLoading]               = useState(false);
  const [tab, setTab]                       = useState<TabType>("grille");
  const [mounted, setMounted]               = useState(false);

  // Formulaires
  const [showForm, setShowForm]   = useState(false);
  const [formType, setFormType]   = useState<TypeCreneau>("cours");
  const [form, setForm]           = useState({
    jour: "Lundi", heure: "07:00", heureFin: "", idCours: "",
    idSalle: "", libelle: "", description: "", idAdmin: "1",
  });

  // Formulaire pause
  const [showPauseForm, setShowPauseForm] = useState(false);
  const [pauseForm, setPauseForm]         = useState({
    idCycle: "", libelle: "", heureDebut: "12:00", heureFin: "13:00",
    jours: JOURS_SEMAINE, idAdmin: "1",
  });

  // Formulaire activité
  const [showActForm, setShowActForm] = useState(false);
  const [actForm, setActForm]         = useState({
    libelle: "", categorie: "sport", description: "", lieu: "",
    idClasse: "", dateDebut: "", dateFin: "",
    jourHebdo: "Samedi", heureDebut: "08:00", heureFin: "10:00", idAdmin: "1",
    estRecurrente: true,
  });

  // ── Chargement initial ──────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    const h = { Authorization: `Bearer ${TOKEN()}` };
    fetch(`${API}/classes?paginate=false`, { headers: h }).then(r => r.json()).then(d => setClasses(d.data ?? d)).catch(() => {});
    fetch(`${API}/cours?paginate=false`,   { headers: h }).then(r => r.json()).then(d => setCours(d.data ?? d)).catch(() => {});
    fetch(`${API}/cycles`,                 { headers: h }).then(r => r.json()).then(d => setCycles(Array.isArray(d) ? d : d.data ?? [])).catch(() => {});
    fetch(`${API}/salles`,                 { headers: h }).then(r => r.json()).then(d => setSalles(d.data ?? d)).catch(() => {});
    fetch(`${API}/pauses-cycle`,           { headers: h }).then(r => r.json()).then(setPauses).catch(() => {});
    fetch(`${API}/activites`,              { headers: h }).then(r => r.json()).then(setActivites).catch(() => {});
  }, []);

  // ── Chargement grille classe ────────────────────────────────────────────────
  const loadGrille = (idClasse = selectedClasse) => {
    if (!idClasse) return;
    setLoading(true);
    fetch(`${API}/emploi-du-temps/classe/${idClasse}`, { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json())
      .then(d => {
        setGrille(d.grille ?? {});
        setClasseInfo(d.classe ?? null);
      })
      .catch(() => setGrille({}))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadGrille(); }, [selectedClasse]);

  // ── Ajout créneau ──────────────────────────────────────────────────────────
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClasse) return;
    try {
      await authFetch(`${API}/emploi-du-temps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          type: formType,
          idClasse: selectedClasse,
          idCours:  form.idCours  || null,
          idSalle:  form.idSalle  || null,
          heureFin: form.heureFin || null,
        }),
      });
      setShowForm(false);
      setForm({ jour: "Lundi", heure: "07:00", heureFin: "", idCours: "", idSalle: "", libelle: "", description: "", idAdmin: "1" });
      loadGrille();
    } catch { alert("Erreur lors de l'ajout"); }
  };

  // ── Suppression créneau ────────────────────────────────────────────────────
  const handleDelete = async (id: number | string) => {
    if (typeof id === "string") return; // pause ou activité injectée
    if (!confirm("Supprimer ce créneau ?")) return;
    await authFetch(`${API}/emploi-du-temps/${id}`, { method: "DELETE" });
    loadGrille();
  };

  // ── Ajout pause ────────────────────────────────────────────────────────────
  const handleAddPause = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authFetch(`${API}/pauses-cycle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pauseForm),
      });
      const data = await res.json();
      setPauses(p => [...p, data.pause]);
      setShowPauseForm(false);
      loadGrille();
    } catch { alert("Erreur"); }
  };

  const handleDeletePause = async (id: number) => {
    if (!confirm("Supprimer cette pause ?")) return;
    await authFetch(`${API}/pauses-cycle/${id}`, { method: "DELETE" });
    setPauses(p => p.filter(x => x.idPause !== id));
    loadGrille();
  };

  // ── Ajout activité ─────────────────────────────────────────────────────────
  const handleAddActivite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...actForm,
        idClasse:  actForm.idClasse  || null,
        jourHebdo: actForm.estRecurrente ? actForm.jourHebdo : null,
        heureDebut:actForm.estRecurrente ? actForm.heureDebut : null,
        heureFin:  actForm.estRecurrente ? actForm.heureFin  : null,
        dateDebut: !actForm.estRecurrente ? actForm.dateDebut : null,
        dateFin:   !actForm.estRecurrente ? actForm.dateFin   : null,
      };
      const res = await authFetch(`${API}/activites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setActivites(a => [...a, data.activite]);
      setShowActForm(false);
      loadGrille();
    } catch { alert("Erreur"); }
  };

  const handleDeleteActivite = async (id: number) => {
    if (!confirm("Supprimer cette activité ?")) return;
    await authFetch(`${API}/activites/${id}`, { method: "DELETE" });
    setActivites(a => a.filter(x => x.idActivite !== id));
    loadGrille();
  };

  const totalCreneaux = Object.values(grille).reduce((s, j) => s + j.filter(c => !c.isPause && !c.isActivite).length, 0);
  const filteredCours = cours.filter(c => !selectedClasse || String(c.idClasse) === selectedClasse);
  const filteredSalles = selectedClasse && classeInfo
    ? salles.filter(s => !s.idClasse || String(s.idClasse) === selectedClasse)
    : salles;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Bannière */}
      <div className={`rounded-2xl p-5 relative overflow-hidden transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
        style={{ background: "linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)", boxShadow: "0 4px 24px rgba(79,172,254,0.4)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-cyan-100" />
              <p className="text-cyan-100 text-xs font-semibold uppercase tracking-wider">Planning scolaire</p>
            </div>
            <h1 className="text-white text-2xl font-bold" style={{ letterSpacing: "-0.03em" }}>Emploi du temps</h1>
            <p className="text-cyan-100/70 text-sm mt-1">
              {selectedClasse
                ? `${totalCreneaux} cours planifié${totalCreneaux > 1 ? "s" : ""}${classeInfo ? ` · ${classeInfo.libelle}` : ""}`
                : "Sélectionnez une classe"}
            </p>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {([
          { key: "grille",    label: "Grille horaire",   icon: Calendar },
          { key: "pauses",    label: "Pauses",           icon: Coffee   },
          { key: "activites", label: "Activités",        icon: Star     },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ── TAB : GRILLE ── */}
      {tab === "grille" && (
        <>
          {/* Sélecteur classe + bouton */}
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 max-w-xs">
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select value={selectedClasse} onChange={e => setSelectedClasse(e.target.value)}
                className="input appearance-none w-full pr-9 cursor-pointer font-medium">
                <option value="">Choisir une classe…</option>
                {classes.map(c => (
                  <option key={c.idClasse} value={c.idClasse}>
                    {c.libelle}{c.cycle?.libelle ? ` — ${c.cycle.libelle}` : ""}
                  </option>
                ))}
              </select>
            </div>
            {selectedClasse && (
              <button onClick={() => setShowForm(v => !v)}
                className="flex items-center gap-2 bg-cyan-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-cyan-600 transition-all">
                <Plus className="w-4 h-4" /> {showForm ? "Annuler" : "Ajouter créneau"}
              </button>
            )}
          </div>

          {/* Formulaire ajout créneau */}
          {showForm && selectedClasse && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5" style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
              <h3 className="text-sm font-bold text-slate-900 mb-4">Nouveau créneau</h3>

              {/* Type de créneau */}
              <div className="flex gap-2 mb-4">
                {(["cours","special","activite"] as TypeCreneau[]).map(t => (
                  <button key={t} type="button" onClick={() => setFormType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
                      formType === t ? "bg-cyan-500 text-white border-cyan-500" : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}>
                    {t === "cours" ? "Cours" : t === "special" ? "Spécial samedi" : "Activité"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Jour *</label>
                  <select value={form.jour} onChange={e => setForm({ ...form, jour: e.target.value })} className="input appearance-none">
                    {JOURS.map(j => <option key={j}>{j}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Début *</label>
                  <select value={form.heure} onChange={e => setForm({ ...form, heure: e.target.value })} className="input appearance-none">
                    {HEURES.map(h => <option key={h}>{h}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Fin</label>
                  <select value={form.heureFin} onChange={e => setForm({ ...form, heureFin: e.target.value })} className="input appearance-none">
                    <option value="">—</option>
                    {HEURES.map(h => <option key={h}>{h}</option>)}
                  </select>
                </div>

                {formType === "cours" ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Cours *</label>
                      <select required value={form.idCours} onChange={e => setForm({ ...form, idCours: e.target.value })} className="input appearance-none">
                        <option value="">Choisir…</option>
                        {filteredCours.map(c => <option key={c.idCours} value={c.idCours}>{c.libelle}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Salle</label>
                      <select value={form.idSalle} onChange={e => setForm({ ...form, idSalle: e.target.value })} className="input appearance-none">
                        <option value="">—</option>
                        {filteredSalles.map(s => <option key={s.idSalle} value={s.idSalle}>{s.libelle}</option>)}
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1.5 col-span-2">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Intitulé *</label>
                    <input required type="text" value={form.libelle}
                      onChange={e => setForm({ ...form, libelle: e.target.value })}
                      placeholder={formType === "special" ? "Ex : Cours de rattrapage, Sport…" : "Ex : Club théâtre…"}
                      className="input w-full" />
                  </div>
                )}

                <div className="flex items-end">
                  <button type="submit" className="btn-primary w-full justify-center bg-cyan-500 hover:bg-cyan-600">
                    <Plus className="w-4 h-4" /> Ajouter
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Grille */}
          {!selectedClasse ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {JOURS.map(jour => {
                const c        = JOUR_COLORS[jour];
                const creneaux = grille[jour] ?? [];
                const nbCours  = creneaux.filter(cr => !cr.isPause && !cr.isActivite).length;
                const isSamedi = jour === "Samedi";
                return (
                  <div key={jour} className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
                    style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)", outline: isSamedi ? `2px solid ${c.text}40` : "none" }}>
                    <div className="p-3 text-white text-center font-bold text-sm" style={{ background: c.gradient }}>
                      {jour}
                      <span className="ml-2 text-white/70 text-xs font-normal">({nbCours} cours)</span>
                      {isSamedi && <span className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">Spécial</span>}
                    </div>
                    <div className="p-3 space-y-2 min-h-[120px]">
                      {creneaux.length === 0 ? (
                        <p className="text-xs text-slate-300 text-center py-4 italic">Libre</p>
                      ) : (
                        creneaux.map((cr, i) => (
                          <CreneauCard key={String(cr.idTemps) + i} cr={cr} onDelete={handleDelete} color={c} />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── TAB : PAUSES ── */}
      {tab === "pauses" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">{pauses.length} pause{pauses.length > 1 ? "s" : ""} configurée{pauses.length > 1 ? "s" : ""} par cycle</p>
            <button onClick={() => setShowPauseForm(v => !v)} className="btn-primary gap-2">
              <Plus className="w-4 h-4" /> {showPauseForm ? "Annuler" : "Nouvelle pause"}
            </button>
          </div>

          {showPauseForm && (
            <form onSubmit={handleAddPause} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Nouvelle pause</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Cycle *</label>
                  <select required value={pauseForm.idCycle} onChange={e => setPauseForm({ ...pauseForm, idCycle: e.target.value })} className="input">
                    <option value="">Choisir…</option>
                    {cycles.map(c => <option key={c.idCycle} value={c.idCycle}>{c.libelle}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Libellé *</label>
                  <input required type="text" value={pauseForm.libelle} onChange={e => setPauseForm({ ...pauseForm, libelle: e.target.value })}
                    placeholder="Ex : Déjeuner" className="input" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Début</label>
                  <select value={pauseForm.heureDebut} onChange={e => setPauseForm({ ...pauseForm, heureDebut: e.target.value })} className="input">
                    {HEURES.map(h => <option key={h}>{h}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Fin</label>
                  <select value={pauseForm.heureFin} onChange={e => setPauseForm({ ...pauseForm, heureFin: e.target.value })} className="input">
                    {HEURES.map(h => <option key={h}>{h}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Jours concernés</label>
                <div className="flex gap-2 flex-wrap">
                  {JOURS.map(j => (
                    <button key={j} type="button"
                      onClick={() => setPauseForm(f => ({
                        ...f,
                        jours: f.jours.includes(j) ? f.jours.filter(x => x !== j) : [...f.jours, j]
                      }))}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        pauseForm.jours.includes(j)
                          ? "bg-amber-400 text-white border-amber-400"
                          : "border-slate-200 text-slate-500"
                      }`}>
                      {j}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn-primary gap-2"><Plus className="w-4 h-4" /> Créer la pause</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pauses.length === 0 ? (
              <p className="text-slate-400 text-sm col-span-3 text-center py-8">Aucune pause configurée</p>
            ) : pauses.map(p => (
              <div key={p.idPause} className="bg-white rounded-2xl border border-slate-100 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Coffee className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{p.libelle}</p>
                      <p className="text-xs text-slate-400">{cycles.find(c => c.idCycle == p.idCycle)?.libelle ?? `Cycle #${p.idCycle}`}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeletePause(p.idPause)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm font-medium text-amber-600">{p.heureDebut} – {p.heureFin}</p>
                <div className="flex gap-1 flex-wrap mt-2">
                  {(Array.isArray(p.jours) ? p.jours : JSON.parse(p.jours as any)).map((j: string) => (
                    <span key={j} className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full">{j}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB : ACTIVITÉS ── */}
      {tab === "activites" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-500">{activites.length} activité{activites.length > 1 ? "s" : ""} enregistrée{activites.length > 1 ? "s" : ""}</p>
            <button onClick={() => setShowActForm(v => !v)} className="btn-primary gap-2">
              <Plus className="w-4 h-4" /> {showActForm ? "Annuler" : "Nouvelle activité"}
            </button>
          </div>

          {showActForm && (
            <form onSubmit={handleAddActivite} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Nouvelle activité</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Libellé *</label>
                  <input required type="text" value={actForm.libelle} onChange={e => setActForm({ ...actForm, libelle: e.target.value })} placeholder="Ex : Football, Chant…" className="input" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Catégorie *</label>
                  <select value={actForm.categorie} onChange={e => setActForm({ ...actForm, categorie: e.target.value })} className="input">
                    {CATEGORIES_ACTIVITE.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Lieu</label>
                  <input type="text" value={actForm.lieu} onChange={e => setActForm({ ...actForm, lieu: e.target.value })} placeholder="Ex : Terrain de sport" className="input" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Classe (optionnel)</label>
                  <select value={actForm.idClasse} onChange={e => setActForm({ ...actForm, idClasse: e.target.value })} className="input">
                    <option value="">Toutes les classes</option>
                    {classes.map(c => <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>)}
                  </select>
                </div>
              </div>

              {/* Type : récurrente ou ponctuelle */}
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setActForm(f => ({ ...f, estRecurrente: !f.estRecurrente }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${actForm.estRecurrente ? "bg-emerald-500" : "bg-slate-200"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${actForm.estRecurrente ? "translate-x-5" : ""}`} />
                </button>
                <span className="text-sm text-slate-600">{actForm.estRecurrente ? "Récurrente (hebdomadaire)" : "Ponctuelle (date fixe)"}</span>
              </div>

              {actForm.estRecurrente ? (
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Jour</label>
                    <select value={actForm.jourHebdo} onChange={e => setActForm({ ...actForm, jourHebdo: e.target.value })} className="input">
                      {JOURS.map(j => <option key={j}>{j}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Heure début</label>
                    <select value={actForm.heureDebut} onChange={e => setActForm({ ...actForm, heureDebut: e.target.value })} className="input">
                      {HEURES.map(h => <option key={h}>{h}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Heure fin</label>
                    <select value={actForm.heureFin} onChange={e => setActForm({ ...actForm, heureFin: e.target.value })} className="input">
                      {HEURES.map(h => <option key={h}>{h}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Date début</label>
                    <input type="date" value={actForm.dateDebut} onChange={e => setActForm({ ...actForm, dateDebut: e.target.value })} className="input" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Date fin</label>
                    <input type="date" value={actForm.dateFin} onChange={e => setActForm({ ...actForm, dateFin: e.target.value })} className="input" />
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button type="submit" className="btn-primary gap-2"><Plus className="w-4 h-4" /> Créer l'activité</button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activites.length === 0 ? (
              <p className="text-slate-400 text-sm col-span-3 text-center py-8">Aucune activité enregistrée</p>
            ) : activites.map(a => (
              <div key={a.idActivite} className="bg-white rounded-2xl border border-slate-100 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Star className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{a.libelle}</p>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">
                        {CATEGORIES_ACTIVITE.find(c => c.value === a.categorie)?.label ?? a.categorie}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteActivite(a.idActivite)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {a.jourHebdo && a.heureDebut && (
                  <p className="text-sm font-medium text-emerald-600">{a.jourHebdo} · {a.heureDebut}{a.heureFin ? ` – ${a.heureFin}` : ""}</p>
                )}
                {a.dateDebut && (
                  <p className="text-xs text-slate-400 mt-1">{new Date(a.dateDebut).toLocaleDateString("fr-FR")}{a.dateFin ? ` → ${new Date(a.dateFin).toLocaleDateString("fr-FR")}` : ""}</p>
                )}
                {a.lieu && (
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <p className="text-xs text-slate-400">{a.lieu}</p>
                  </div>
                )}
                {a.idClasse ? (
                  <p className="text-[10px] text-slate-400 mt-1">{classes.find(c => c.idClasse == a.idClasse)?.libelle ?? `Classe #${a.idClasse}`}</p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1">Toutes les classes</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}