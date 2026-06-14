// src/pages/eleves/ElevePaiementComplet.tsx
// Page unifiée : Tranches scolarité + Frais annexes
// Route : /eleves/:matricule/paiements

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle, AlertTriangle, Clock, Lock,
  ChevronLeft, CreditCard, Calendar, Loader2,
  BookOpen, FileText,
} from 'lucide-react';
import { authFetch } from '../../service/auth';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUT_TRANCHE = {
  en_attente: { label: 'En attente', bg: 'bg-slate-100',  text: 'text-slate-500',   icon: Clock         },
  due:        { label: 'À payer',    bg: 'bg-blue-50',    text: 'text-blue-600',    icon: CreditCard    },
  partielle:  { label: 'Partielle',  bg: 'bg-amber-50',   text: 'text-amber-600',   icon: Clock         },
  payee:      { label: 'Soldée',     bg: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircle   },
  en_retard:  { label: 'En retard',  bg: 'bg-red-50',     text: 'text-red-600',     icon: AlertTriangle },
};

const TYPE_FRAIS_LABEL: Record<string, string> = {
  examen:              "Frais d'examen",
  tenue:               'Tenue scolaire',
  transport:           'Transport',
  inscription_examen:  "Inscription examen",
  assurance:           'Assurance',
  autre:               'Autre',
};

type Tab = 'scolarite' | 'frais';

export default function ElevePaiementComplet() {
  const { matricule } = useParams<{ matricule: string }>();
  const navigate      = useNavigate();

  const [tab, setTab]             = useState<Tab>('scolarite');
  const [eleve, setEleve]         = useState<any>(null);
  const [tranches, setTranches]   = useState<any>(null);
  const [frais, setFrais]         = useState<any>(null);
  const [modes, setModes]         = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);

  // Modal paiement tranche
  const [payingTranche, setPayingTranche]   = useState<any>(null);
  const [montantT, setMontantT]             = useState('');

  // Modal paiement frais
  const [payingFrais, setPayingFrais]       = useState<any>(null);

  // Shared form state
  const [idMode, setIdMode]         = useState('1');
  const [operationId, setOperationId] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [saving, setSaving]         = useState(false);
  const [errPay, setErrPay]         = useState('');

  const load = async () => {
    if (!matricule) return;
    setLoading(true);
    try {
      const [eleveR, tranchesR, fraisR, modesR] = await Promise.all([
        authFetch(`${API}/eleves/${matricule}`).then(r => r.json()),
        authFetch(`${API}/eleves/${matricule}/tranches`).then(r => r.json()),
        authFetch(`${API}/eleves/${matricule}/frais-annexes`).then(r => r.json()),
        authFetch(`${API}/modes`).then(r => r.json()),
      ]);
      setEleve(eleveR);
      setTranches(tranchesR.message ? null : tranchesR);
      setFrais(fraisR.message ? null : fraisR);
      setModes(Array.isArray(modesR) ? modesR : (modesR.data ?? []));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [matricule]);

  // ── Payer une tranche ─────────────────────────────────────────────────────
  const handlePayerTranche = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingTranche) return;
    setSaving(true); setErrPay('');
    try {
      const res = await authFetch(`${API}/tranches/payer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matricule:    Number(matricule),
          idTranche:    payingTranche.idTranche,
          idAca:        tranches?.annee?.idAnnee,
          montant:      Number(montantT),
          idMode:       Number(idMode),
          idPers:       Number(localStorage.getItem('idPers') ?? 1),
          operation_ID: operationId || undefined,
          comentaire:   commentaire || undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      setPayingTranche(null); setMontantT(''); setCommentaire(''); setOperationId('');
      load();
    } catch (err: any) { setErrPay(err.message); }
    finally { setSaving(false); }
  };

  // ── Payer un frais annexe ─────────────────────────────────────────────────
  const handlePayerFrais = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingFrais) return;
    setSaving(true); setErrPay('');
    try {
      const res = await authFetch(`${API}/frais-annexes/payer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matricule:    Number(matricule),
          idFrais:      payingFrais.idFrais,
          idAca:        tranches?.annee?.idAnnee ?? frais?.idAca,
          idMode:       Number(idMode),
          idPers:       Number(localStorage.getItem('idPers') ?? 1),
          operation_ID: operationId || undefined,
          comentaire:   commentaire || undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      setPayingFrais(null); setCommentaire(''); setOperationId('');
      load();
    } catch (err: any) { setErrPay(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
    </div>
  );

  // Totaux globaux
  const totalScol  = tranches?.total_du     ?? 0;
  const payeScol   = tranches?.total_paye   ?? 0;
  const totalFraisAnn = frais?.total_frais  ?? 0;
  const payeFrais  = frais?.total_paye      ?? 0;
  const grandTotal = totalScol + totalFraisAnn;
  const grandPaye  = payeScol  + payeFrais;
  const grandReste = grandTotal - grandPaye;

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
            Paiements
          </h1>
          {eleve && <p className="text-sm text-slate-400">{eleve.prenom} {eleve.nom} · #{matricule}</p>}
        </div>
      </div>

      {/* Résumé global */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total dû',  value: fmt(grandTotal), color: 'text-slate-700'   },
          { label: 'Payé',      value: fmt(grandPaye),  color: 'text-emerald-600' },
          { label: 'Reste',     value: fmt(grandReste), color: grandReste > 0 ? 'text-red-600' : 'text-emerald-600' },
        ].map(k => (
          <div key={k.label} className="card p-4 text-center">
            <p className={`text-base font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Barre globale */}
      {grandTotal > 0 && (
        <div className="card p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 font-medium">Progression globale</span>
            <span className="font-bold">{grandTotal > 0 ? Math.round((grandPaye / grandTotal) * 100) : 0}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all"
              style={{
                width: `${grandTotal > 0 ? (grandPaye / grandTotal) * 100 : 0}%`,
                background: grandReste === 0
                  ? 'linear-gradient(90deg,#34d399,#10b981)'
                  : grandPaye / grandTotal >= 0.5
                    ? 'linear-gradient(90deg,#fbbf24,#f59e0b)'
                    : 'linear-gradient(90deg,#f87171,#ef4444)',
              }} />
          </div>
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
        {([
          { id: 'scolarite', label: 'Scolarité',     icon: BookOpen  },
          { id: 'frais',     label: 'Frais annexes', icon: FileText  },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB SCOLARITÉ ── */}
      {tab === 'scolarite' && (
        <>
          {!tranches ? (
            <div className="card p-8 text-center text-slate-400">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>Aucune scolarité trouvée pour cet élève.</p>
              <p className="text-xs mt-1">Vérifiez que son cycle a une scolarité configurée.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Infos classe/section */}
              <div className="card p-4">
                <p className="text-sm font-semibold text-slate-900">
                  {tranches.inscription?.classe_libelle}
                  {tranches.inscription?.cycle_libelle && ` · ${tranches.inscription.cycle_libelle}`}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{tranches.annee?.libelle}</p>
                <div className="flex gap-4 mt-2 text-xs text-slate-500">
                  <span>Inscription : <strong>{fmt(tranches.scolarite?.inscription ?? 0)}</strong></span>
                  <span>Pension : <strong>{fmt(tranches.scolarite?.pension ?? 0)}</strong></span>
                </div>
              </div>

              {tranches.tranches?.map((t: any, i: number) => {
                const s       = STATUT_TRANCHE[t.statut as keyof typeof STATUT_TRANCHE] ?? STATUT_TRANCHE.en_attente;
                const StatusIcon = s.icon;
                const bloquee = i > 0 && tranches.tranches[i - 1].statut !== 'payee';
                return (
                  <div key={t.idTranche} className={`card p-5 ${bloquee ? 'opacity-50' : ''}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                        {bloquee ? <Lock className={`w-5 h-5 text-slate-400`} /> : <StatusIcon className={`w-5 h-5 ${s.text}`} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-slate-900">{t.libelle}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.bg} ${s.text}`}>
                            {bloquee ? 'Bloquée' : s.label}
                          </span>
                        </div>
                        <div className="flex gap-4 mt-1 flex-wrap text-xs">
                          <span className="text-slate-500">Dû : <strong>{fmt(t.montant_du)}</strong></span>
                          {t.montant_paye > 0 && <span className="text-emerald-600">Payé : <strong>{fmt(t.montant_paye)}</strong></span>}
                          {t.reste > 0 && t.statut !== 'payee' && <span className="text-red-500">Reste : <strong>{fmt(t.reste)}</strong></span>}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span className={`text-xs ${t.statut === 'en_retard' ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                            Échéance : {fmtDate(t.date_echeance)}
                          </span>
                        </div>
                        {t.date_paiement && <p className="text-xs text-emerald-500 mt-1">✓ Payée le {fmtDate(t.date_paiement)}</p>}
                        {t.montant_paye > 0 && t.statut !== 'payee' && (
                          <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(t.montant_paye / t.montant_du) * 100}%` }} />
                          </div>
                        )}
                      </div>
                      {!bloquee && t.statut !== 'payee' && (
                        <button onClick={() => { setPayingTranche(t); setMontantT(String(t.reste)); }}
                          className="btn-primary gap-1.5 text-sm py-2 px-4 flex-shrink-0">
                          <CreditCard className="w-4 h-4" /> Payer
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── TAB FRAIS ANNEXES ── */}
      {tab === 'frais' && (
        <>
          {!frais || frais.frais?.length === 0 ? (
            <div className="card p-8 text-center text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>Aucun frais annexe applicable pour cet élève.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Résumé frais */}
              <div className="card p-4 flex justify-between items-center">
                <span className="text-sm text-slate-600">{frais.frais.length} frais applicable{frais.frais.length > 1 ? 's' : ''}</span>
                <div className="flex gap-4 text-xs">
                  <span className="text-slate-500">Total : <strong>{fmt(frais.total_frais)}</strong></span>
                  <span className="text-emerald-600">Payé : <strong>{fmt(frais.total_paye)}</strong></span>
                  {frais.reste > 0 && <span className="text-red-500">Reste : <strong>{fmt(frais.reste)}</strong></span>}
                </div>
              </div>

              {frais.frais.map((f: any) => (
                <div key={f.idFrais} className="card p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      f.statut === 'paye' ? 'bg-emerald-50' : 'bg-amber-50'
                    }`}>
                      {f.statut === 'paye'
                        ? <CheckCircle className="w-5 h-5 text-emerald-500" />
                        : <AlertTriangle className="w-5 h-5 text-amber-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">{f.libelle}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          {TYPE_FRAIS_LABEL[f.type] ?? f.type}
                        </span>
                        {f.obligatoire && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500">Obligatoire</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          f.statut === 'paye' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {f.statut === 'paye' ? 'Payé' : 'Non payé'}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-700 mt-1">{fmt(f.montant)}</p>
                      {f.description && <p className="text-xs text-slate-400 mt-0.5">{f.description}</p>}
                      {f.date_paiement && <p className="text-xs text-emerald-500 mt-1">✓ Payé le {fmtDate(f.date_paiement)}</p>}
                    </div>
                    {f.statut !== 'paye' && (
                      <button onClick={() => setPayingFrais(f)}
                        className="btn-primary gap-1.5 text-sm py-2 px-4 flex-shrink-0">
                        <CreditCard className="w-4 h-4" /> Payer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Modal paiement tranche ── */}
      {payingTranche && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Payer — {payingTranche.libelle}</h3>
            <p className="text-sm text-slate-500">Reste : <strong>{fmt(payingTranche.reste)}</strong></p>
            {errPay && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{errPay}</div>}
            <form onSubmit={handlePayerTranche} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Montant *</label>
                <input type="number" required min={1} max={payingTranche.reste} value={montantT} onChange={e => setMontantT(e.target.value)} className="input w-full" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Mode de paiement</label>
                <select value={idMode} onChange={e => setIdMode(e.target.value)} className="input w-full">
                  {modes.map((m: any) => <option key={m.idMode} value={m.idMode}>{m.libelle}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">N° Opération</label>
                <input type="text" value={operationId} onChange={e => setOperationId(e.target.value)} placeholder="Optionnel" className="input w-full" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setPayingTranche(null); setErrPay(''); }} className="btn-secondary flex-1">Annuler</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal paiement frais annexe ── */}
      {payingFrais && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Payer — {payingFrais.libelle}</h3>
            <p className="text-sm text-slate-500">Montant : <strong>{fmt(payingFrais.montant)}</strong></p>
            {errPay && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{errPay}</div>}
            <form onSubmit={handlePayerFrais} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Mode de paiement</label>
                <select value={idMode} onChange={e => setIdMode(e.target.value)} className="input w-full">
                  {modes.map((m: any) => <option key={m.idMode} value={m.idMode}>{m.libelle}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">N° Opération</label>
                <input type="text" value={operationId} onChange={e => setOperationId(e.target.value)} placeholder="Optionnel" className="input w-full" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Commentaire</label>
                <input type="text" value={commentaire} onChange={e => setCommentaire(e.target.value)} placeholder="Optionnel" className="input w-full" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setPayingFrais(null); setErrPay(''); }} className="btn-secondary flex-1">Annuler</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
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