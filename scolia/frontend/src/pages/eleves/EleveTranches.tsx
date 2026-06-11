// src/pages/eleves/EleveTranches.tsx — v2

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle, AlertTriangle, Clock, Lock,
  ChevronLeft, CreditCard, Calendar, Loader2,
} from 'lucide-react';
import { authFetch } from '../../service/auth';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUT = {
  en_attente: { label: 'En attente',  bg: 'bg-slate-100',  text: 'text-slate-500',   icon: Clock          },
  due:        { label: 'À payer',     bg: 'bg-blue-50',    text: 'text-blue-600',    icon: CreditCard     },
  partielle:  { label: 'Partielle',   bg: 'bg-amber-50',   text: 'text-amber-600',   icon: Clock          },
  payee:      { label: 'Soldée',      bg: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircle    },
  en_retard:  { label: 'En retard',   bg: 'bg-red-50',     text: 'text-red-600',     icon: AlertTriangle  },
};

interface Tranche {
  idEleveTranche?: number;
  idTranche: number;
  ordre: number;
  libelle: string;
  montant_du: number;
  montant_paye: number;
  reste: number;
  date_echeance: string;
  statut: keyof typeof STATUT;
  date_paiement?: string;
}

export default function EleveTranches() {
  const { matricule } = useParams<{ matricule: string }>();
  const navigate      = useNavigate();

  const [data, setData]       = useState<any>(null);
  const [eleve, setEleve]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [modes, setModes]     = useState<any[]>([]);

  // Modal paiement
  const [paying, setPaying]           = useState<Tranche | null>(null);
  const [montant, setMontant]         = useState('');
  const [idMode, setIdMode]           = useState('1');
  const [commentaire, setCommentaire] = useState('');
  const [operationId, setOperationId] = useState('');
  const [saving, setSaving]           = useState(false);
  const [errPay, setErrPay]           = useState('');

  const load = async () => {
    if (!matricule) return;
    setLoading(true);
    try {
      const [eleveRes, tranchesRes, modesRes] = await Promise.all([
        authFetch(`${API}/eleves/${matricule}`).then(r => r.json()),
        authFetch(`${API}/eleves/${matricule}/tranches`).then(r => r.json()),
        authFetch(`${API}/modes`).then(r => r.json()),
      ]);
      setEleve(eleveRes);
      if (tranchesRes.message) {
        setError(tranchesRes.message);
      } else {
        setData(tranchesRes);
      }
      setModes(Array.isArray(modesRes) ? modesRes : (modesRes.data ?? []));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [matricule]);

  const handlePayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paying) return;
    setSaving(true);
    setErrPay('');
    try {
      const idPers = Number(localStorage.getItem('idPers') ?? 1);
      const idAca  = data?.annee?.idAnnee ?? 1;

      const res = await authFetch(`${API}/tranches/payer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matricule:    Number(matricule),
          idTranche:    paying.idTranche,
          idAca,
          montant:      Number(montant),
          idMode:       Number(idMode),
          idPers,
          operation_ID: operationId || undefined,
          comentaire:   commentaire || undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      setPaying(null);
      setMontant(''); setCommentaire(''); setOperationId('');
      load();
    } catch (err: any) {
      setErrPay(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton h-20 rounded-2xl" />
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/eleves/${matricule}`)}
          className="p-2 hover:bg-slate-100 rounded-xl">
          <ChevronLeft className="w-5 h-5 text-slate-500" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900" style={{ letterSpacing: '-0.02em' }}>
            Paiement par tranches
          </h1>
          {eleve && (
            <p className="text-sm text-slate-400">
              {eleve.prenom} {eleve.nom} · #{matricule}
            </p>
          )}
        </div>
      </div>

      {/* Erreur (élève non inscrit, pas de scolarité…) */}
      {error && (
        <div className="card p-6 text-center space-y-2">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
          <p className="font-medium text-slate-700">{error}</p>
          <p className="text-sm text-slate-400">
            Vérifiez que l'élève est inscrit dans une classe dont le cycle a une scolarité configurée.
          </p>
        </div>
      )}

      {data && (
        <>
          {/* Infos classe/cycle */}
          <div className="card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-violet-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">
                {data.inscription?.classe_libelle} — {data.inscription?.salle_libelle}
              </p>
              <p className="text-xs text-slate-400">
                {data.inscription?.cycle_libelle} · {data.annee?.libelle}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Inscription</p>
              <p className="text-sm font-bold text-slate-700">{fmt(data.scolarite?.inscription ?? 0)}</p>
              <p className="text-xs text-slate-400 mt-1">Pension</p>
              <p className="text-sm font-bold text-slate-700">{fmt(data.scolarite?.pension ?? 0)}</p>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total dû',   value: fmt(data.total_du),   color: 'text-slate-700'   },
              { label: 'Payé',       value: fmt(data.total_paye), color: 'text-emerald-600' },
              { label: 'Reste',      value: fmt(data.reste),      color: data.reste > 0 ? 'text-red-600' : 'text-emerald-600' },
            ].map(k => (
              <div key={k.label} className="card p-4 text-center">
                <p className={`text-base font-bold ${k.color}`}>{k.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{k.label}</p>
              </div>
            ))}
          </div>

          {/* Barre progression */}
          <div className="card p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 font-medium">Progression</span>
              <span className="font-bold text-slate-900">{data.pourcentage}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${data.pourcentage}%`,
                  background: data.pourcentage >= 100
                    ? 'linear-gradient(90deg,#34d399,#10b981)'
                    : data.pourcentage >= 50
                      ? 'linear-gradient(90deg,#fbbf24,#f59e0b)'
                      : 'linear-gradient(90deg,#f87171,#ef4444)',
                }} />
            </div>
          </div>

          {/* Tranches */}
          <div className="space-y-3">
            {data.tranches.map((t: Tranche, i: number) => {
              const s        = STATUT[t.statut] ?? STATUT.en_attente;
              const StatusIcon = s.icon;
              // Bloquée si la précédente n'est pas soldée
              const bloquee  = i > 0 && data.tranches[i - 1].statut !== 'payee';
              const joursRetard = t.statut === 'en_retard'
                ? Math.floor((Date.now() - new Date(t.date_echeance).getTime()) / 86400000)
                : 0;

              return (
                <div key={t.idTranche}
                  className={`card p-5 transition-all ${bloquee ? 'opacity-50' : ''}`}>
                  <div className="flex items-start gap-4">
                    {/* Icône */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                      {bloquee
                        ? <Lock className="w-5 h-5 text-slate-400" />
                        : <StatusIcon className={`w-5 h-5 ${s.text}`} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">{t.libelle}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.bg} ${s.text}`}>
                          {bloquee ? 'Bloquée' : s.label}
                        </span>
                        {t.statut === 'en_retard' && (
                          <span className="text-xs text-red-500 font-medium">
                            ⚠ {joursRetard}j de retard
                          </span>
                        )}
                      </div>

                      {/* Montants */}
                      <div className="flex gap-4 mt-1.5 flex-wrap">
                        <span className="text-xs text-slate-500">
                          Dû : <strong className="text-slate-700">{fmt(t.montant_du)}</strong>
                        </span>
                        {t.montant_paye > 0 && (
                          <span className="text-xs text-emerald-600">
                            Payé : <strong>{fmt(t.montant_paye)}</strong>
                          </span>
                        )}
                        {t.reste > 0 && t.statut !== 'payee' && (
                          <span className="text-xs text-red-500">
                            Reste : <strong>{fmt(t.reste)}</strong>
                          </span>
                        )}
                      </div>

                      {/* Échéance */}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span className={`text-xs ${t.statut === 'en_retard' ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                          Échéance : {fmtDate(t.date_echeance)}
                        </span>
                      </div>

                      {/* Paiement effectué */}
                      {t.date_paiement && (
                        <p className="text-xs text-emerald-500 mt-1">
                          ✓ Payée le {fmtDate(t.date_paiement)}
                        </p>
                      )}

                      {/* Barre partielle */}
                      {t.montant_paye > 0 && t.statut !== 'payee' && (
                        <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${(t.montant_paye / t.montant_du) * 100}%` }} />
                        </div>
                      )}
                    </div>

                    {/* Bouton payer */}
                    {!bloquee && t.statut !== 'payee' && (
                      <button
                        onClick={() => { setPaying(t); setMontant(String(t.reste)); }}
                        className="btn-primary gap-1.5 text-sm py-2 px-4 flex-shrink-0">
                        <CreditCard className="w-4 h-4" /> Payer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Modal paiement */}
      {paying && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">
              Payer — {paying.libelle}
            </h3>
            <p className="text-sm text-slate-500">
              Reste à payer : <strong className="text-slate-900">{fmt(paying.reste)}</strong>
            </p>

            {errPay && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {errPay}
              </div>
            )}

            <form onSubmit={handlePayer} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Montant *
                </label>
                <input type="number" required min={1} max={paying.reste}
                  value={montant} onChange={e => setMontant(e.target.value)}
                  className="input w-full" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Mode de paiement
                </label>
                <select value={idMode} onChange={e => setIdMode(e.target.value)} className="input w-full">
                  {modes.map((m: any) => (
                    <option key={m.idMode} value={m.idMode}>{m.libelle}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  N° Opération
                </label>
                <input type="text" value={operationId}
                  onChange={e => setOperationId(e.target.value)}
                  placeholder="Optionnel" className="input w-full" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Commentaire
                </label>
                <input type="text" value={commentaire}
                  onChange={e => setCommentaire(e.target.value)}
                  placeholder="Optionnel" className="input w-full" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button"
                  onClick={() => { setPaying(null); setErrPay(''); }}
                  className="btn-secondary flex-1">
                  Annuler
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 gap-2">
                  {saving
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <CheckCircle className="w-4 h-4" />}
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}