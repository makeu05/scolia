// src/pages/annees/PromotionPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUp, Users, CheckCircle, AlertTriangle,
  Loader2, ChevronRight, Trophy, X, Play,
} from 'lucide-react';
import { authFetch } from '../../service/auth';
import { useAnnee } from '../../context/AnneeContext';
import { useSearchParams } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

const STATUT_CONFIG = {
  eligible:     { label: 'Éligible',      bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  fin_cycle:    { label: 'Fin de cycle',  bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-500'    },
  non_eligible: { label: 'Non éligible',  bg: 'bg-slate-100',  text: 'text-slate-500',   dot: 'bg-slate-400'   },
};

export default function PromotionPage() {
  const navigate = useNavigate();
  const { annees, idAca } = useAnnee();



const [searchParams] = useSearchParams();

// Dans useEffect
useEffect(() => {
  const sourceFromUrl = searchParams.get('idAcaSource');
  if (sourceFromUrl) setIdAcaSource(sourceFromUrl);
}, [searchParams]);

  const [idAcaSource, setIdAcaSource] = useState('');
  const [idAcaCible,  setIdAcaCible]  = useState(idAca);
  const [resultats,   setResultats]   = useState<any[]>([]);
  const [stats,       setStats]       = useState<any>(null);
  const [loading,     setLoading]     = useState(false);
  const [applying,    setApplying]    = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');

  // Sélection des élèves à promouvoir et leurs salles cibles
  const [selections, setSelections] = useState<Record<number, { selected: boolean; idSalle: number | null }>>({});

  // Filtres
  const [filtre, setFiltre] = useState<'tous' | 'eligible' | 'fin_cycle' | 'non_eligible'>('eligible');

  useEffect(() => {
    // Par défaut : source = dernière année, cible = année active
    if (annees.length >= 2) {
      const active  = annees.find(a => (a as any).statut === 'active');
      const autres  = annees.filter(a => (a as any).statut !== 'active');
      if (active)  setIdAcaCible(String(active.idAnnee));
      if (autres.length > 0) setIdAcaSource(String(autres[0].idAnnee));
    }
  }, [annees]);

  const chargerPreview = async () => {
    if (!idAcaSource || !idAcaCible) return;
    setLoading(true); setError(''); setResultats([]); setSelections({});
    try {
      const res  = await authFetch(`${API}/promotions/preview?idAcaSource=${idAcaSource}&idAcaCible=${idAcaCible}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setResultats(data.resultats);
      setStats(data.stats);
      // Pré-sélectionner tous les éligibles
      const init: Record<number, any> = {};
      data.resultats.forEach((r: any) => {
        init[r.matricule] = {
          selected: r.statut === 'eligible',
          idSalle:  r.idSalle_cible ?? null,
        };
      });
      setSelections(init);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const appliquerPromotions = async () => {
    const promotions = resultats
      .filter(r => r.statut === 'eligible' && selections[r.matricule]?.selected && selections[r.matricule]?.idSalle)
      .map(r => ({ matricule: r.matricule, idSalle: selections[r.matricule].idSalle }));

    if (promotions.length === 0) {
      setError('Aucun élève sélectionné avec une salle cible définie.');
      return;
    }

    if (!confirm(`Promouvoir ${promotions.length} élève(s) ? Cette action est définitive.`)) return;

    setApplying(true); setError(''); setSuccess('');
    try {
      const idAdmin = Number(localStorage.getItem('idAdmin') ?? 1);
      const res  = await authFetch(`${API}/promotions/appliquer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idAcaCible: Number(idAcaCible), idAdmin, promotions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(data.message);
      chargerPreview(); // Recharger
    } catch (err: any) { setError(err.message); }
    finally { setApplying(false); }
  };

  const filtrees = resultats.filter(r => filtre === 'tous' || r.statut === filtre);
  const nbSelectionnes = Object.values(selections).filter(s => s.selected).length;

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Bannière */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)', boxShadow: '0 4px 24px rgba(102,126,234,0.4)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ArrowUp className="w-4 h-4 text-violet-200" />
              <p className="text-violet-200 text-xs font-semibold uppercase tracking-wider">Gestion des promotions</p>
            </div>
            <h1 className="text-white text-2xl font-bold" style={{ letterSpacing: '-0.03em' }}>Passage en classe supérieure</h1>
            <p className="text-violet-200/70 text-sm mt-1">
              Promouvoir automatiquement les élèves avec moyenne ≥ 10
            </p>
          </div>
          <button onClick={() => navigate('/annees')}
            className="flex items-center gap-2 bg-white/20 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-white/30 transition-all">
            ← Retour années
          </button>
        </div>
      </div>

      {/* Sélection années */}
      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Année source (résultats)</label>
            <select value={idAcaSource} onChange={e => setIdAcaSource(e.target.value)} className="input w-full">
              <option value="">— Choisir —</option>
              {annees.map(a => (
                <option key={a.idAnnee} value={a.idAnnee}>
                  {a.libelle} {(a as any).statut === 'cloturee' ? '🔒' : (a as any).statut === 'active' ? '✓' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 text-slate-400">
              <ChevronRight className="w-5 h-5" />
              <span className="text-xs font-medium">Promotion vers</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Année cible (inscription)</label>
            <select value={idAcaCible} onChange={e => setIdAcaCible(e.target.value)} className="input w-full">
              <option value="">— Choisir —</option>
              {annees.map(a => (
                <option key={a.idAnnee} value={a.idAnnee}>
                  {a.libelle} {(a as any).statut === 'active' ? '✓ Active' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button onClick={chargerPreview} disabled={!idAcaSource || !idAcaCible || loading}
          className="btn-primary gap-2 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Calculer les promotions
        </button>
      </div>

      {error   && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between"><span>{error}</span><button onClick={() => setError('')}><X className="w-4 h-4" /></button></div>}
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2"><CheckCircle className="w-4 h-4" />{success}</div>}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total élèves',   value: stats.total,         color: 'text-slate-700',   bg: 'bg-slate-50',    icon: Users        },
            { label: 'Éligibles',      value: stats.eligibles,     color: 'text-emerald-600', bg: 'bg-emerald-50',  icon: Trophy       },
            { label: 'Fin de cycle',   value: stats.fin_cycle,     color: 'text-blue-600',    bg: 'bg-blue-50',     icon: CheckCircle  },
            { label: 'Non éligibles',  value: stats.non_eligibles, color: 'text-slate-500',   bg: 'bg-slate-100',   icon: AlertTriangle },
          ].map(k => (
            <div key={k.label} className="card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${k.bg} flex items-center justify-center flex-shrink-0`}>
                <k.icon className={`w-5 h-5 ${k.color}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
                <p className="text-xs text-slate-400">{k.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Liste élèves */}
      {resultats.length > 0 && (
        <div className="space-y-3">
          {/* Filtres + action */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
              {([
                { id: 'eligible',     label: `Éligibles (${stats?.eligibles ?? 0})`       },
                { id: 'fin_cycle',    label: `Fin cycle (${stats?.fin_cycle ?? 0})`        },
                { id: 'non_eligible', label: `Non éligibles (${stats?.non_eligibles ?? 0})` },
                { id: 'tous',         label: `Tous (${stats?.total ?? 0})`                 },
              ] as const).map(f => (
                <button key={f.id} onClick={() => setFiltre(f.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filtre === f.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>

            {filtre === 'eligible' && stats?.eligibles > 0 && (
              <button onClick={appliquerPromotions} disabled={applying || nbSelectionnes === 0}
                className="btn-primary gap-2 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#43e97b,#38f9d7)', color: '#065f46' }}>
                {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" />}
                Promouvoir {nbSelectionnes} élève{nbSelectionnes > 1 ? 's' : ''}
              </button>
            )}
          </div>

          {/* Tableau */}
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {filtre === 'eligible' && <th className="px-5 py-3 w-10"></th>}
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">Élève</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Classe actuelle</th>
                  <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Moyenne</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Statut</th>
                  {filtre === 'eligible' && (
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Classe cible</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtrees.map((r: any) => {
                  const sc  = STATUT_CONFIG[r.statut as keyof typeof STATUT_CONFIG];
                  const sel = selections[r.matricule];
                  return (
                    <tr key={r.matricule} className="hover:bg-slate-50 transition-colors">
                      {filtre === 'eligible' && (
                        <td className="px-5 py-3">
                          {r.statut === 'eligible' && (
                            <input type="checkbox" checked={sel?.selected ?? false}
                              onChange={ev => setSelections(prev => ({
                                ...prev,
                                [r.matricule]: { ...prev[r.matricule], selected: ev.target.checked }
                              }))}
                              className="w-4 h-4 accent-violet-600" />
                          )}
                        </td>
                      )}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: r.moyenne_annuelle >= 10 ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'linear-gradient(135deg,#94a3b8,#64748b)' }}>
                            {r.prenom?.[0]}{r.nom?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{r.prenom} {r.nom}</p>
                            <p className="text-xs text-slate-400">#{r.matricule}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{r.classe_actuelle}</td>
                      <td className="px-4 py-3 text-center">
                        {r.moyenne_annuelle !== null ? (
                          <span className={`text-base font-bold ${r.moyenne_annuelle >= 10 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {r.moyenne_annuelle}/20
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </td>
                      {filtre === 'eligible' && (
                        <td className="px-4 py-3">
                          {r.statut === 'eligible' && r.classe_superieure && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">{r.classe_superieure.libelle}</span>
                              {r.salles_disponibles?.length > 1 && (
                                <select
                                  value={sel?.idSalle ?? ''}
                                  onChange={ev => setSelections(prev => ({
                                    ...prev,
                                    [r.matricule]: { ...prev[r.matricule], idSalle: Number(ev.target.value) }
                                  }))}
                                  className="input text-xs py-1 w-32">
                                  <option value="">— Salle —</option>
                                  {r.salles_disponibles.map((s: any) => (
                                    <option key={s.idSalle} value={s.idSalle}>{s.libelle}</option>
                                  ))}
                                </select>
                              )}
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}