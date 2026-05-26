// src/pages/annees/annee.tsx — Version colorée premium
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, ChevronDown, ChevronUp, Calendar, Clock, ArrowRight } from "lucide-react";
import {
  getAnnees, createAnnee, deleteAnnee,
  createTrimestre, deleteTrimestre, type AnneeAcademique,
} from "../../service/annee_service";

const TRIM_GRADIENTS = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
];

export default function AnneesPage() {
  const [annees, setAnnees]     = useState<AnneeAcademique[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showTriForm, setShowTriForm] = useState<number | null>(null);
  const [mounted, setMounted]   = useState(false);
  const [formAnnee, setFormAnnee] = useState({ libelle: "", periode: "", idAdmin: "1" });
  const [formTri, setFormTri]     = useState({ libelle: "", periode: "", idAca: "", idAdmin: "1" });

  useEffect(() => { setMounted(true); }, []);

  const load = async () => {
    try { setLoading(true); setAnnees(await getAnnees()); }
    catch (err: any) { setError(err.message || "Erreur"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAddAnnee = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await createAnnee(formAnnee); setFormAnnee({ libelle: "", periode: "", idAdmin: "1" }); setShowForm(false); load(); }
    catch (err: any) { setError(err.message); }
  };

  const handleAddTri = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await createTrimestre(formTri); setFormTri({ libelle: "", periode: "", idAca: "", idAdmin: "1" }); setShowTriForm(null); load(); }
    catch (err: any) { setError(err.message); }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Bannière orange/jaune */}
      <div className={`rounded-2xl p-5 relative overflow-hidden transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
        style={{ background: "linear-gradient(135deg,#f6d365 0%,#fda085 100%)", boxShadow: "0 4px 24px rgba(246,211,101,0.45)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(255,255,255,0.2) 0%,transparent 70%)" }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-orange-100" />
              <p className="text-orange-100 text-xs font-semibold uppercase tracking-wider">Calendrier scolaire</p>
            </div>
            <h1 className="text-white text-2xl font-bold" style={{ letterSpacing: "-0.03em" }}>Années académiques</h1>
            <p className="text-orange-100/70 text-sm mt-1">{annees.length} année{annees.length > 1 ? "s" : ""} enregistrée{annees.length > 1 ? "s" : ""}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/sessions" className="flex items-center gap-2 bg-white/20 border border-white/30 text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-white/30 transition-all backdrop-blur-sm">
              Sessions <ArrowRight className="w-4 h-4" />
            </Link>
            <button onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-2 bg-white text-orange-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-orange-50 transition-all active:scale-[0.97]"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
              <Plus className="w-4 h-4" /> {showForm ? "Annuler" : "Nouvelle année"}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* Formulaire nouvelle année */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-fade-in"
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
            <button type="submit" className="btn-primary" style={{ background: "linear-gradient(135deg,#f6d365,#fda085)", boxShadow: "0 2px 8px rgba(246,211,101,0.4)" }}>
              <Plus className="w-4 h-4" /> Créer l'année
            </button>
          </form>
        </div>
      )}

      {/* Liste des années */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : annees.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center"
          style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg,#f6d365,#fda085)" }}>
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-500 font-medium">Aucune année académique</p>
          <button onClick={() => setShowForm(true)} className="mt-4 btn-primary"
            style={{ background: "linear-gradient(135deg,#f6d365,#fda085)" }}>
            <Plus className="w-4 h-4" /> Créer la première année
          </button>
        </div>
      ) : (
        <div className="space-y-3 stagger">
          {annees.map((annee, anneeIdx) => (
            <div key={annee.idAnnee} className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-fade-in"
              style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
              <div className="flex items-center gap-4 p-5 cursor-pointer hover:bg-slate-50/60 transition-colors"
                onClick={() => setExpanded(expanded === annee.idAnnee ? null : annee.idAnnee)}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg"
                  style={{ background: "linear-gradient(135deg,#f6d365,#fda085)", boxShadow: "0 2px 8px rgba(246,211,101,0.4)" }}>
                  {String(anneeIdx + 1).padStart(2, "0")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900">{annee.libelle}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <p className="text-sm text-slate-400">{annee.periode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full text-orange-700"
                    style={{ background: "linear-gradient(135deg,rgba(246,211,101,0.15),rgba(253,160,133,0.15))" }}>
                    <Calendar className="w-3 h-3" />
                    {annee.trimestres?.length ?? 0} trimestre{(annee.trimestres?.length ?? 0) > 1 ? "s" : ""}
                  </span>
                  <button onClick={ev => { ev.stopPropagation(); if (confirm("Supprimer cette année ?")) { deleteAnnee(annee.idAnnee); load(); } }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {expanded === annee.idAnnee
                    ? <ChevronUp className="w-4 h-4 text-slate-400" />
                    : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {expanded === annee.idAnnee && (
                <div className="border-t border-slate-100 p-5 animate-fade-in bg-slate-50/40">
                  {showTriForm === annee.idAnnee ? (
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
                            <button onClick={() => { if (confirm("Supprimer ?")) { deleteTrimestre(t.idTrimes); load(); } }}
                              className="p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 text-center py-4">Aucun trimestre — ajoutez-en un ci-dessus</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}