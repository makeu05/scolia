// src/pages/scolarites/ScolaritePage.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Eye, Edit, CreditCard, Layers,
  FileText, Trash2, Filter, ChevronDown,
} from "lucide-react";
import { authFetch } from "../../service/auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString("fr-FR");
}

const CYCLE_GRADIENTS = [
  { gradient: "linear-gradient(135deg,#667eea,#764ba2)", shadow: "rgba(102,126,234,0.3)" },
  { gradient: "linear-gradient(135deg,#f093fb,#f5576c)", shadow: "rgba(240,147,251,0.3)" },
  { gradient: "linear-gradient(135deg,#4facfe,#00f2fe)", shadow: "rgba(79,172,254,0.3)"  },
  { gradient: "linear-gradient(135deg,#43e97b,#38f9d7)", shadow: "rgba(67,233,123,0.3)"  },
  { gradient: "linear-gradient(135deg,#f6d365,#fda085)", shadow: "rgba(246,211,101,0.3)" },
];

const TYPE_FRAIS_LABEL: Record<string, string> = {
  examen:             "Frais d'examen",
  tenue:              "Tenue scolaire",
  transport:          "Transport",
  inscription_examen: "Inscription examen",
  assurance:          "Assurance",
  autre:              "Autre",
};

const TYPE_FRAIS_COLOR: Record<string, string> = {
  examen:             "bg-blue-50 text-blue-600",
  tenue:              "bg-purple-50 text-purple-600",
  transport:          "bg-amber-50 text-amber-600",
  inscription_examen: "bg-cyan-50 text-cyan-600",
  assurance:          "bg-green-50 text-green-600",
  autre:              "bg-slate-100 text-slate-500",
};

type Tab = "scolarites" | "frais";

interface FraisForm {
  libelle: string;
  type: string;
  montant: string;
  description: string;
  idCycle: string;
  idClasse: string;
  idSection: string;
  idAca: string;
  obligatoire: boolean;
}

const FRAIS_FORM_INIT: FraisForm = {
  libelle: "", type: "examen", montant: "",
  description: "", idCycle: "", idClasse: "",
  idSection: "", idAca: "", obligatoire: true,
};

export default function ScolaritePage() {
  const navigate = useNavigate();
  const [tab, setTab]               = useState<Tab>("scolarites");
  const [scolarites, setScolarites] = useState<any[]>([]);
  const [frais, setFrais]           = useState<any[]>([]);
  const [cycles, setCycles]         = useState<any[]>([]);
  const [classes, setClasses]       = useState<any[]>([]);
  const [sections, setSections]     = useState<any[]>([]);
  const [annees, setAnnees]         = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [mounted, setMounted]       = useState(false);

  // Filtres frais
  const [filterCycle, setFilterCycle]     = useState("");
  const [filterClasse, setFilterClasse]   = useState("");
  const [filterSection, setFilterSection] = useState("");

  // Formulaire frais
  const [showFraisForm, setShowFraisForm] = useState(false);
  const [fraisForm, setFraisForm]         = useState<FraisForm>(FRAIS_FORM_INIT);
  const [savingFrais, setSavingFrais]     = useState(false);
  const [errFrais, setErrFrais]           = useState("");

  useEffect(() => {
    setMounted(true);
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [scolR, fraisR, cyclesR, classesR, sectionsR, anneesR] = await Promise.all([
        authFetch(`${API}/scolarites`).then(r => r.json()),
        authFetch(`${API}/frais-annexes`).then(r => r.json()),
        authFetch(`${API}/cycles`).then(r => r.json()),
        authFetch(`${API}/classes?paginate=false`).then(r => r.json()),
        authFetch(`${API}/sections`).then(r => r.json()),
        authFetch(`${API}/annees`).then(r => r.json()),
      ]);
      setScolarites(Array.isArray(scolR)    ? scolR    : (scolR.data    ?? []));
      setFrais(     Array.isArray(fraisR)   ? fraisR   : (fraisR.data   ?? []));
      setCycles(    Array.isArray(cyclesR)  ? cyclesR  : (cyclesR.data  ?? []));
      setClasses(   Array.isArray(classesR) ? classesR : (classesR.data ?? []));
      setSections(  Array.isArray(sectionsR)? sectionsR: (sectionsR.data?? []));
      const aList = Array.isArray(anneesR)  ? anneesR  : (anneesR.data  ?? []);
      setAnnees(aList);
      if (aList.length > 0) {
        setFraisForm(f => ({ ...f, idAca: String(aList[aList.length - 1].idAnnee) }));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // ── Créer un frais annexe ─────────────────────────────────────────────────
  const handleCreateFrais = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFrais(true);
    setErrFrais("");
    try {
      const idAdmin = Number(localStorage.getItem("idAdmin") ?? 1);
      const payload = {
        libelle:     fraisForm.libelle,
        type:        fraisForm.type,
        montant:     Number(fraisForm.montant),
        description: fraisForm.description || null,
        idCycle:     fraisForm.idCycle  || null,
        idClasse:    fraisForm.idClasse || null,
        idSection:   fraisForm.idSection|| null,
        idAca:       fraisForm.idAca    || null,
        obligatoire: fraisForm.obligatoire,
        idAdmin,
      };
      const res = await authFetch(`${API}/frais-annexes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Erreur création");
      setFraisForm(FRAIS_FORM_INIT);
      setShowFraisForm(false);
      loadAll();
    } catch (err: any) {
      setErrFrais(err.message);
    } finally {
      setSavingFrais(false);
    }
  };

  // ── Supprimer un frais ────────────────────────────────────────────────────
  const handleDeleteFrais = async (idFrais: number) => {
    if (!confirm("Désactiver ce frais ?")) return;
    await authFetch(`${API}/frais-annexes/${idFrais}`, { method: "DELETE" });
    loadAll();
  };

  // ── Frais filtrés ─────────────────────────────────────────────────────────
  const fraisFiltres = frais.filter(f => {
    if (filterCycle   && f.idCycle   && String(f.idCycle)   !== filterCycle)   return false;
    if (filterClasse  && f.idClasse  && String(f.idClasse)  !== filterClasse)  return false;
    if (filterSection && f.idSection && String(f.idSection) !== filterSection) return false;
    return true;
  });

  const totalInscription = scolarites.reduce((s, sc) => s + (sc.inscription ?? 0), 0);
  const totalPension     = scolarites.reduce((s, sc) => s + (sc.pension     ?? 0), 0);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Bannière */}
      <div className={`rounded-2xl p-5 relative overflow-hidden transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
        style={{ background: "linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)", boxShadow: "0 4px 24px rgba(161,140,209,0.4)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-4 h-4 text-purple-100" />
              <p className="text-purple-100 text-xs font-semibold uppercase tracking-wider">Tarification scolaire</p>
            </div>
            <h1 className="text-white text-2xl font-bold" style={{ letterSpacing: "-0.03em" }}>
              Scolarités & Frais
            </h1>
            <p className="text-purple-100/70 text-sm mt-1">
              {scolarites.length} tarif(s) · {frais.length} frais annexe(s)
            </p>
          </div>
          <div className="flex gap-2">
            {tab === "scolarites" && (
              <button onClick={() => navigate("/scolarites/ajouter")}
                className="flex items-center gap-2 bg-white text-purple-600 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-purple-50 transition-all"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
                <Plus className="w-4 h-4" /> Nouveau tarif
              </button>
            )}
            {tab === "frais" && (
              <button onClick={() => setShowFraisForm(v => !v)}
                className="flex items-center gap-2 bg-white text-purple-600 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-purple-50 transition-all"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
                <Plus className="w-4 h-4" /> {showFraisForm ? "Annuler" : "Nouveau frais"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Cycles configurés",  value: scolarites.length,              gradient: "linear-gradient(135deg,#a18cd1,#fbc2eb)", shadow: "rgba(161,140,209,0.3)" },
          { label: "Total inscriptions", value: `${fmt(totalInscription)} FCFA`, gradient: "linear-gradient(135deg,#4facfe,#00f2fe)", shadow: "rgba(79,172,254,0.3)"  },
          { label: "Frais annexes",      value: frais.length,                   gradient: "linear-gradient(135deg,#43e97b,#38f9d7)", shadow: "rgba(67,233,123,0.3)"  },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 relative overflow-hidden"
            style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: s.gradient }} />
            <p className="text-xl font-bold text-slate-900 mt-2">{s.value}</p>
            <p className="text-xs text-slate-400 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
        {([
          { id: "scolarites", label: `Scolarités (${scolarites.length})`, icon: Layers   },
          { id: "frais",      label: `Frais annexes (${frais.length})`,   icon: FileText },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB SCOLARITÉS ── */}
      {tab === "scolarites" && (
        loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
          </div>
        ) : scolarites.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
            <CreditCard className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium mb-4">Aucune scolarité configurée</p>
            <button onClick={() => navigate("/scolarites/ajouter")} className="btn-primary">
              <Plus className="w-4 h-4" /> Créer le premier tarif
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scolarites.map((sc, i) => {
              const c     = CYCLE_GRADIENTS[i % CYCLE_GRADIENTS.length];
              const total = (sc.inscription ?? 0) + (sc.pension ?? 0);
              return (
                <div key={sc.idScolarite} className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
                  style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
                  <div className="p-5 text-white relative overflow-hidden" style={{ background: c.gradient }}>
                    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full"
                      style={{ background: "radial-gradient(circle,rgba(255,255,255,0.15) 0%,transparent 70%)" }} />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                          <Layers className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => navigate(`/scolarites/${sc.idScolarite}`)}
                            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                            <Eye className="w-4 h-4 text-white" />
                          </button>
                          <button onClick={() => navigate(`/scolarites/${sc.idScolarite}/modifier`)}
                            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                            <Edit className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>
                      <p className="font-bold text-lg mt-3">{sc.cycle?.libelle ?? `Cycle ${sc.idCycle}`}</p>
                      <p className="text-white/70 text-xs mt-0.5">
                        {sc.nbreTranche} tranche{sc.nbreTranche > 1 ? "s" : ""}
                        {sc.tranches?.length > 0 && ` · ${sc.tranches.length} configurée${sc.tranches.length > 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">Inscription</span>
                      <span className="text-sm font-bold text-slate-900">{fmt(sc.inscription)} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-400">Pension</span>
                      <span className="text-sm font-bold text-slate-900">{fmt(sc.pension)} FCFA</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between">
                      <span className="text-xs font-semibold text-slate-600">Total annuel</span>
                      <span className="text-base font-bold" style={{ background: c.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        {fmt(total)} FCFA
                      </span>
                    </div>
                    {sc.tranches?.length > 0 && (
                      <div className="pt-2 space-y-1">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Tranches</p>
                        {sc.tranches.map((t: any) => (
                          <div key={t.idTranche} className="flex justify-between items-center px-2 py-1 rounded-lg bg-slate-50">
                            <span className="text-xs text-slate-600">{t.libelle}</span>
                            <span className="text-xs font-semibold text-slate-900">{fmt(t.montant)} FCFA</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* ── TAB FRAIS ANNEXES ── */}
      {tab === "frais" && (
        <div className="space-y-4">

          {/* Formulaire création */}
          {showFraisForm && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4"
              style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
              <h3 className="text-sm font-bold text-slate-900">Nouveau frais annexe</h3>

              {errFrais && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{errFrais}</div>
              )}

              <form onSubmit={handleCreateFrais} className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Libellé *</label>
                    <input required type="text" value={fraisForm.libelle}
                      onChange={e => setFraisForm(f => ({ ...f, libelle: e.target.value }))}
                      placeholder="Ex : Frais d'examen CEP" className="input w-full" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Type *</label>
                    <select value={fraisForm.type} onChange={e => setFraisForm(f => ({ ...f, type: e.target.value }))} className="input w-full">
                      {Object.entries(TYPE_FRAIS_LABEL).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Montant (FCFA) *</label>
                    <input required type="number" min={0} value={fraisForm.montant}
                      onChange={e => setFraisForm(f => ({ ...f, montant: e.target.value }))}
                      className="input w-full" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Année académique</label>
                    <select value={fraisForm.idAca} onChange={e => setFraisForm(f => ({ ...f, idAca: e.target.value }))} className="input w-full">
                      <option value="">Toutes les années</option>
                      {annees.map((a: any) => <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Obligatoire</label>
                    <div className="flex items-center gap-3 pt-2">
                      <button type="button"
                        onClick={() => setFraisForm(f => ({ ...f, obligatoire: !f.obligatoire }))}
                        className={`relative w-11 h-6 rounded-full transition-colors ${fraisForm.obligatoire ? "bg-violet-500" : "bg-slate-200"}`}>
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${fraisForm.obligatoire ? "translate-x-5" : ""}`} />
                      </button>
                      <span className="text-sm text-slate-600">{fraisForm.obligatoire ? "Oui" : "Non"}</span>
                    </div>
                  </div>
                </div>

                {/* Scope d'application */}
                <div className="pt-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Applicable à (laisser vide = toute l'école)
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Cycle</label>
                      <select value={fraisForm.idCycle} onChange={e => setFraisForm(f => ({ ...f, idCycle: e.target.value }))} className="input w-full">
                        <option value="">Tous les cycles</option>
                        {cycles.map((c: any) => <option key={c.idCycle} value={c.idCycle}>{c.libelle}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Classe</label>
                      <select value={fraisForm.idClasse} onChange={e => setFraisForm(f => ({ ...f, idClasse: e.target.value }))} className="input w-full">
                        <option value="">Toutes les classes</option>
                        {classes
                          .filter((c: any) => !fraisForm.idCycle || String(c.idCycle) === fraisForm.idCycle)
                          .map((c: any) => <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500">Section</label>
                      <select value={fraisForm.idSection} onChange={e => setFraisForm(f => ({ ...f, idSection: e.target.value }))} className="input w-full">
                        <option value="">Toutes les sections</option>
                        {sections.map((s: any) => <option key={s.idSection} value={s.idSection}>{s.libelle}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Description</label>
                  <input type="text" value={fraisForm.description}
                    onChange={e => setFraisForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Optionnel" className="input w-full" />
                </div>

                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => { setShowFraisForm(false); setFraisForm(FRAIS_FORM_INIT); }} className="btn-secondary">
                    Annuler
                  </button>
                  <button type="submit" disabled={savingFrais} className="btn-primary gap-2">
                    {savingFrais ? "Création…" : <><Plus className="w-4 h-4" /> Créer le frais</>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filtres */}
          <div className="flex gap-3 flex-wrap items-center">
            <Filter className="w-4 h-4 text-slate-400" />
            <select value={filterCycle} onChange={e => setFilterCycle(e.target.value)} className="input w-44">
              <option value="">Tous les cycles</option>
              {cycles.map((c: any) => <option key={c.idCycle} value={c.idCycle}>{c.libelle}</option>)}
            </select>
            <select value={filterClasse} onChange={e => setFilterClasse(e.target.value)} className="input w-44">
              <option value="">Toutes les classes</option>
              {classes
                .filter((c: any) => !filterCycle || String(c.idCycle) === filterCycle)
                .map((c: any) => <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>)}
            </select>
            <select value={filterSection} onChange={e => setFilterSection(e.target.value)} className="input w-44">
              <option value="">Toutes les sections</option>
              {sections.map((s: any) => <option key={s.idSection} value={s.idSection}>{s.libelle}</option>)}
            </select>
            {(filterCycle || filterClasse || filterSection) && (
              <button onClick={() => { setFilterCycle(""); setFilterClasse(""); setFilterSection(""); }}
                className="text-xs text-slate-400 hover:text-slate-600 underline">
                Réinitialiser
              </button>
            )}
            <span className="ml-auto text-xs text-slate-400">
              {fraisFiltres.length} frais affiché{fraisFiltres.length > 1 ? "s" : ""}
            </span>
          </div>

          {/* Liste des frais */}
          {fraisFiltres.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
              <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Aucun frais annexe</p>
              <p className="text-sm text-slate-400 mt-1">Cliquez sur "Nouveau frais" pour en créer un.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
              style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">Frais</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">Type</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3 hidden md:table-cell">Applicable à</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3 hidden md:table-cell">Année</th>
                    <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">Montant</th>
                    <th className="px-5 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {fraisFiltres.map((f: any) => {
                    // Scope d'application
                    const scope = f.idClasse
                      ? classes.find((c: any) => c.idClasse == f.idClasse)?.libelle
                      : f.idCycle
                        ? cycles.find((c: any) => c.idCycle == f.idCycle)?.libelle
                        : f.idSection
                          ? sections.find((s: any) => s.idSection == f.idSection)?.libelle
                          : "Toute l'école";

                    return (
                      <tr key={f.idFrais} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{f.libelle}</p>
                            {f.description && <p className="text-xs text-slate-400 mt-0.5">{f.description}</p>}
                            {f.obligatoire && (
                              <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-500 rounded-full">Obligatoire</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_FRAIS_COLOR[f.type] ?? "bg-slate-100 text-slate-500"}`}>
                            {TYPE_FRAIS_LABEL[f.type] ?? f.type}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-500 hidden md:table-cell">{scope}</td>
                        <td className="px-5 py-3 text-sm text-slate-500 hidden md:table-cell">
                          {annees.find((a: any) => a.idAnnee == f.idAca)?.libelle ?? "Toutes"}
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-slate-900">
                          {fmt(f.montant)} FCFA
                        </td>
                        <td className="px-5 py-3">
                          <button onClick={() => handleDeleteFrais(f.idFrais)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}