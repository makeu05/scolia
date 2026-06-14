// src/pages/annees/annee.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus, Trash2, ChevronDown, ChevronUp, Calendar, Clock,
  ArrowRight, CheckCircle, Lock, Play, BarChart2, Users,
  CreditCard, BookOpen, AlertTriangle, X, ArrowUp,
} from "lucide-react";
import {
  getAnnees, createAnnee, deleteAnnee,
  createTrimestre, deleteTrimestre, type AnneeAcademique,
} from "../../service/annee_service";
import { authFetch } from "../../service/auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
}

const STATUT_CONFIG = {
  brouillon: { label: 'Brouillon', bg: 'bg-slate-100', text: 'text-slate-500',   dot: 'bg-slate-400'   },
  active:    { label: 'Active',    bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  cloturee:  { label: 'Clôturée', bg: 'bg-red-50',     text: 'text-red-600',     dot: 'bg-red-500'     },
};

const TRIM_GRADIENTS = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
];

export default function AnneesPage() {
  const [annees, setAnnees]           = useState<AnneeAcademique[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [showForm, setShowForm]       = useState(false);
  const [expanded, setExpanded]       = useState<number | null>(null);
  const [showTriForm, setShowTriForm] = useState<number | null>(null);
  const [mounted, setMounted]         = useState(false);
  const [dashboard, setDashboard]     = useState<Record<number, any>>({});
  const [loadingDash, setLoadingDash] = useState<number | null>(null);
  const [showDash, setShowDash]       = useState<number | null>(null);
  const [confirmCloture, setConfirmCloture] = useState<number | null>(null);
  const [filtre, setFiltre]           = useState<'toutes' | 'active' | 'cloturee' | 'brouillon'>('toutes');

  const [formAnnee, setFormAnnee] = useState({ libelle: "", periode: "", idAdmin: "1" });
  const [formTri, setFormTri]     = useState({ libelle: "", periode: "", idAca: "", idAdmin: "1" });

  useEffect(() => { setMounted(true); load(); }, []);

  const load = async () => {
    try { setLoading(true); setAnnees(await getAnnees()); }
    catch (err: any) { setError(err.message || "Erreur"); }
    finally { setLoading(false); }
  };

  const handleAddAnnee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAnnee(formAnnee);
      setFormAnnee({ libelle: "", periode: "", idAdmin: "1" });
      setShowForm(false);
      load();
    } catch (err: any) { setError(err.message); }
  };

  const handleAddTri = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTrimestre(formTri);
      setFormTri({ libelle: "", periode: "", idAca: "", idAdmin: "1" });
      setShowTriForm(null);
      load();
    } catch (err: any) { setError(err.message); }
  };

  const handleActiver = async (id: number) => {
    try {
      const res = await authFetch(`${API}/annees/${id}/activer`, { method: 'PATCH' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      load();
    } catch (err: any) { setError(err.message); }
  };

  const handleCloturer = async (id: number) => {
    try {
      const res = await authFetch(`${API}/annees/${id}/cloturer`, { method: 'PATCH' });
      if (!res.ok) { const d = await res.json(); throw new Error(d.message); }
      setConfirmCloture(null);
      load();
    } catch (err: any) { setError(err.message); }
  };

  const loadDashboard = async (id: number) => {
    if (dashboard[id]) { setShowDash(id); return; }
    setLoadingDash(id);
    try {
      const res  = await authFetch(`${API}/annees/${id}/dashboard`);
      const data = await res.json();
      setDashboard(prev => ({ ...prev, [id]: data }));
      setShowDash(id);
    } catch { }
    finally { setLoadingDash(null); }
  };

  const anneesFiltrees = annees.filter(a =>
    filtre === 'toutes' ? true : (a as any).statut === filtre
  );
  const anneeActive = annees.find(a => (a as any).statut === 'active');

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Bannière */}
      <div className={`rounded-2xl p-5 relative overflow-hidden transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
        style={{ background: "linear-gradient(135deg,#f6d365 0%,#fda085 100%)", boxShadow: "0 4px 24px rgba(246,211,101,0.45)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-orange-100" />
              <p className="text-orange-100 text-xs font-semibold uppercase tracking-wider">Calendrier scolaire</p>
            </div>
            <h1 className="text-white text-2xl font-bold" style={{ letterSpacing: "-0.03em" }}>Années académiques</h1>
            <p className="text-orange-100/70 text-sm mt-1">
              {annees.length} année{annees.length > 1 ? "s" : ""} ·{" "}
              {anneeActive ? `Active : ${anneeActive.libelle}` : "Aucune année active"}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* ✅ Bouton Promotions */}
            <Link to="/promotions"
              className="flex items-center gap-2 bg-white/20 border border-white/30 text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-white/30 transition-all backdrop-blur-sm">
              <ArrowUp className="w-4 h-4" /> Promotions
            </Link>
            <Link to="/sessions"
              className="flex items-center gap-2 bg-white/20 border border-white/30 text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-white/30 transition-all backdrop-blur-sm">
              Sessions <ArrowRight className="w-4 h-4" />
            </Link>
            <button onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-2 bg-white text-orange-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-orange-50 transition-all"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
              <Plus className="w-4 h-4" /> {showForm ? "Annuler" : "Nouvelle année"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Formulaire nouvelle année */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5"
          style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
          <h3 className="text-sm font-bold text-slate-900 mb-4">Nouvelle année académique</h3>
          <form onSubmit={handleAddAnnee} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Libellé *</label>
                <input required className="input" placeholder="ex: Année académique 2025-2026"
                  value={formAnnee.libelle} onChange={e => setFormAnnee({ ...formAnnee, libelle: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Période *</label>
                <input required className="input" placeholder="ex: Septembre 2025 - Juillet 2026"
                  value={formAnnee.periode} onChange={e => setFormAnnee({ ...formAnnee, periode: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn-primary"
              style={{ background: "linear-gradient(135deg,#f6d365,#fda085)" }}>
              <Plus className="w-4 h-4" /> Créer l'année
            </button>
          </form>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
        {([
          { id: 'toutes',    label: `Toutes (${annees.length})` },
          { id: 'active',    label: `Actives (${annees.filter(a => (a as any).statut === 'active').length})` },
          { id: 'cloturee',  label: `Clôturées (${annees.filter(a => (a as any).statut === 'cloturee').length})` },
          { id: 'brouillon', label: `Brouillons (${annees.filter(a => (a as any).statut === 'brouillon').length})` },
        ] as const).map(f => (
          <button key={f.id} onClick={() => setFiltre(f.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filtre === f.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : anneesFiltrees.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Aucune année dans ce filtre</p>
        </div>
      ) : (
        <div className="space-y-3">
          {anneesFiltrees.map((annee, anneeIdx) => {
            const statut     = (annee as any).statut ?? 'brouillon';
            const sc         = STATUT_CONFIG[statut as keyof typeof STATUT_CONFIG] ?? STATUT_CONFIG.brouillon;
            const isCloturee = statut === 'cloturee';
            const isActive   = statut === 'active';
            const dash       = dashboard[annee.idAnnee];

            return (
              <div key={annee.idAnnee} className={`bg-white rounded-2xl border overflow-hidden ${
                isActive ? 'border-emerald-200' : 'border-slate-100'
              }`} style={{ boxShadow: isActive ? "0 4px 16px rgba(52,211,153,0.15)" : "0 2px 8px rgba(15,31,61,0.06)" }}>

                {/* Header */}
                <div className="flex items-center gap-4 p-5 cursor-pointer hover:bg-slate-50/60 transition-colors"
                  onClick={() => setExpanded(expanded === annee.idAnnee ? null : annee.idAnnee)}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg"
                    style={{ background: "linear-gradient(135deg,#f6d365,#fda085)" }}>
                    {String(anneeIdx + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-900">{annee.libelle}</p>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                      {(annee as any).date_cloture && (
                        <span className="text-xs text-slate-400">
                          Clôturée le {new Date((annee as any).date_cloture).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <p className="text-sm text-slate-400">{annee.periode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Badge trimestres */}
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full text-orange-700"
                      style={{ background: "linear-gradient(135deg,rgba(246,211,101,0.15),rgba(253,160,133,0.15))" }}>
                      {annee.trimestres?.length ?? 0} trimestre{(annee.trimestres?.length ?? 0) > 1 ? "s" : ""}
                    </span>

                    {/* Stats */}
                    <button onClick={ev => { ev.stopPropagation(); loadDashboard(annee.idAnnee); }}
                      disabled={loadingDash === annee.idAnnee}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                      {loadingDash === annee.idAnnee
                        ? <span className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />
                        : <BarChart2 className="w-3.5 h-3.5" />}
                      Stats
                    </button>

                    {/* ✅ Bouton Promotions sur chaque année clôturée ou active */}
                    {(isActive || isCloturee) && (
                      <Link
                        to={`/promotions?idAcaSource=${annee.idAnnee}`}
                        onClick={ev => ev.stopPropagation()}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors">
                        <ArrowUp className="w-3.5 h-3.5" /> Promotions
                      </Link>
                    )}

                    {/* Activer */}
                    {!isActive && !isCloturee && (
                      <button onClick={ev => { ev.stopPropagation(); handleActiver(annee.idAnnee); }}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                        <Play className="w-3.5 h-3.5" /> Activer
                      </button>
                    )}

                    {/* Clôturer */}
                    {!isCloturee && (
                      <button onClick={ev => { ev.stopPropagation(); setConfirmCloture(annee.idAnnee); }}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                        <Lock className="w-3.5 h-3.5" /> Clôturer
                      </button>
                    )}

                    {/* Supprimer */}
                    {!isCloturee && (
                      <button onClick={ev => { ev.stopPropagation(); if (confirm("Supprimer cette année ?")) { deleteAnnee(annee.idAnnee); load(); } }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {isCloturee && <Lock className="w-4 h-4 text-slate-300" />}
                    {expanded === annee.idAnnee
                      ? <ChevronUp className="w-4 h-4 text-slate-400" />
                      : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Dashboard */}
                {showDash === annee.idAnnee && dash && (
                  <div className="border-t border-slate-100 p-5 bg-slate-50/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900">Tableau de bord — {annee.libelle}</h3>
                      <button onClick={() => setShowDash(null)} className="p-1 hover:bg-slate-200 rounded-lg">
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Élèves inscrits',    value: dash.eleves_inscrits,        icon: Users,         color: 'text-violet-600',  bg: 'bg-violet-50'  },
                        { label: 'Paiements',          value: fmt(dash.total_paiements),   icon: CreditCard,    color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Taux recouvrement',  value: `${dash.taux_recouvrement}%`,icon: CheckCircle,   color: 'text-blue-600',    bg: 'bg-blue-50'    },
                        { label: 'Absences',           value: dash.total_absences,         icon: AlertTriangle, color: 'text-amber-600',   bg: 'bg-amber-50'   },
                      ].map(k => (
                        <div key={k.label} className="card p-4">
                          <div className={`w-8 h-8 rounded-xl ${k.bg} flex items-center justify-center mb-2`}>
                            <k.icon className={`w-4 h-4 ${k.color}`} />
                          </div>
                          <p className={`text-lg font-bold ${k.color}`}>{k.value}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{k.label}</p>
                        </div>
                      ))}
                    </div>
                    {dash.resultats_trimestriels?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Résultats par trimestre</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {dash.resultats_trimestriels.map((t: any, i: number) => (
                            <div key={i} className="card p-4 space-y-1">
                              <p className="text-sm font-semibold text-slate-800">{t.trimestre}</p>
                              <p className="text-xs text-slate-400">{t.nb_evalues} élève{t.nb_evalues > 1 ? 's' : ''} évalué{t.nb_evalues > 1 ? 's' : ''}</p>
                              {t.moyenne_globale && <p className="text-base font-bold text-violet-600">{t.moyenne_globale}/20</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {dash.par_classe?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Élèves par classe</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {dash.par_classe.map((c: any) => (
                            <div key={c.idClasse} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-slate-100">
                              <span className="text-sm font-medium text-slate-700 truncate">{c.classe}</span>
                              <span className="text-xs font-bold text-violet-600 ml-2 flex-shrink-0">{c.nb_eleves}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Trimestres */}
                {expanded === annee.idAnnee && (
                  <div className="border-t border-slate-100 p-5 bg-slate-50/40">
                    {!isCloturee && (
                      showTriForm === annee.idAnnee ? (
                        <form onSubmit={handleAddTri} className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
                          <p className="text-sm font-bold text-slate-900 mb-3">Nouveau trimestre</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                            <input required placeholder="Libellé (ex: 1er Trimestre)"
                              value={formTri.libelle}
                              onChange={e => setFormTri({ ...formTri, libelle: e.target.value, idAca: String(annee.idAnnee) })}
                              className="input" />
                            <input required placeholder="Période (ex: Sept - Déc 2025)"
                              value={formTri.periode}
                              onChange={e => setFormTri({ ...formTri, periode: e.target.value })}
                              className="input" />
                          </div>
                          <div className="flex gap-2">
                            <button type="submit" className="btn-primary text-sm py-2"
                              style={{ background: "linear-gradient(135deg,#f6d365,#fda085)" }}>
                              <Plus className="w-3.5 h-3.5" /> Ajouter
                            </button>
                            <button type="button" onClick={() => setShowTriForm(null)} className="btn-secondary text-sm py-2">Annuler</button>
                          </div>
                        </form>
                      ) : (
                        <button onClick={() => { setShowTriForm(annee.idAnnee); setFormTri({ libelle: "", periode: "", idAca: String(annee.idAnnee), idAdmin: "1" }); }}
                          className="btn-secondary text-sm mb-4 gap-2">
                          <Plus className="w-3.5 h-3.5" /> Ajouter un trimestre
                        </button>
                      )
                    )}
                    {annee.trimestres && annee.trimestres.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {annee.trimestres.map((t, ti) => (
                          <div key={t.idTrimes} className="bg-white rounded-2xl border border-slate-200 p-4 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                              style={{ background: TRIM_GRADIENTS[ti % TRIM_GRADIENTS.length] }} />
                            <div className="flex items-start justify-between mt-1">
                              <div>
                                <p className="font-bold text-sm text-slate-900">{t.libelle}</p>
                                {t.periode && <p className="text-xs text-slate-400 mt-0.5">{t.periode}</p>}
                              </div>
                              {!isCloturee ? (
                                <button onClick={() => { if (confirm("Supprimer ?")) { deleteTrimestre(t.idTrimes); load(); } }}
                                  className="p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <Lock className="w-3.5 h-3.5 text-slate-300" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 text-center py-4">
                        {isCloturee ? "Aucun trimestre" : "Aucun trimestre — ajoutez-en un ci-dessus"}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal clôture */}
      {confirmCloture && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <Lock className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Clôturer l'année ?</h3>
                <p className="text-sm text-slate-500 mt-0.5">Cette action est irréversible.</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700 space-y-1">
              <p>⚠ Une fois clôturée :</p>
              <ul className="ml-4 space-y-0.5 text-xs">
                <li>• Plus aucune modification possible</li>
                <li>• Les inscriptions, notes et paiements sont figés</li>
                <li>• L'année reste consultable à tout moment</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmCloture(null)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={() => handleCloturer(confirmCloture)}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" /> Confirmer la clôture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}