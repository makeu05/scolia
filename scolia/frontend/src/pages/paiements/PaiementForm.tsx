// src/pages/paiements/PaiementForm.tsx
// Nouveau flux : chercher élève → voir ses tranches → payer → reçu PDF

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Search, CheckCircle, CreditCard,
  Printer, Loader2, AlertTriangle, Clock, Lock,
} from 'lucide-react';
import { authFetch } from '../../service/auth';
import { getModes, getAnnees } from '../../service/paiement_service';

const API    = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';
const SERVER = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:8000';

const getPhotoUrl = (url?: string) => {
  if (!url || url === 'INDEFINI') return null;
  if (url.startsWith('http')) return url;
  return `${SERVER}/storage/${url}`;
};

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

const STATUT_STYLE = {
  en_attente: { label: 'En attente', bg: 'bg-slate-100',  text: 'text-slate-500',   icon: Clock          },
  due:        { label: 'À payer',    bg: 'bg-blue-50',    text: 'text-blue-600',    icon: CreditCard     },
  partielle:  { label: 'Partielle',  bg: 'bg-amber-50',   text: 'text-amber-600',   icon: Clock          },
  payee:      { label: 'Soldée',     bg: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircle    },
  en_retard:  { label: 'En retard',  bg: 'bg-red-50',     text: 'text-red-600',     icon: AlertTriangle  },
};

// ── Reçu PDF ─────────────────────────────────────────────────────────────────
function imprimerRecu(data: {
  eleve: any; tranche: any; montant: number;
  mode: string; operationId: string; date: string;
  annee: string; ecole?: any;
}) {
  const now = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const heure = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const numRecu = `REC-${Date.now().toString().slice(-8)}`;

  const html = `
    <!DOCTYPE html><html lang="fr">
    <head>
      <meta charset="UTF-8"/>
      <title>Reçu de paiement — ${numRecu}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a1a; }
        .page { width: 148mm; margin: 0 auto; padding: 8mm; }
        .header { text-align:center; padding-bottom: 8px; border-bottom: 2px solid #1a3a5c; margin-bottom: 10px; }
        .header h1 { font-size: 16px; color: #1a3a5c; font-weight: bold; letter-spacing: 1px; }
        .header h2 { font-size: 11px; color: #555; margin-top: 2px; }
        .recu-num { text-align:center; margin: 8px 0; }
        .recu-num span { background: #1a3a5c; color: white; padding: 3px 12px; border-radius: 99px; font-size: 11px; font-weight: bold; }
        .section { margin: 8px 0; }
        .section-title { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: .05em; color: #888; margin-bottom: 4px; border-bottom: 1px solid #eee; padding-bottom: 2px; }
        .row { display: flex; justify-content: space-between; padding: 3px 0; }
        .row .label { color: #555; }
        .row .value { font-weight: 600; text-align: right; }
        .montant-box { background: #1a3a5c; color: white; border-radius: 8px; padding: 10px 16px; margin: 12px 0; text-align: center; }
        .montant-box .label { font-size: 10px; opacity: .7; }
        .montant-box .value { font-size: 22px; font-weight: bold; letter-spacing: -0.5px; }
        .footer { border-top: 1px solid #eee; margin-top: 12px; padding-top: 8px; }
        .signature { display: flex; justify-content: space-between; margin-top: 20px; }
        .signature div { text-align: center; font-size: 10px; color: #555; }
        .signature .line { border-top: 1px solid #1a3a5c; width: 100px; margin: 0 auto 4px; }
        .stamp { border: 2px dashed #1a3a5c; border-radius: 50%; width: 70px; height: 70px; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 9px; color: #1a3a5c; font-weight: bold; margin: 0 auto; }
        .note { font-size: 9px; color: #aaa; text-align: center; margin-top: 8px; }
        @media print { .page { width: 100%; } }
      </style>
    </head>
    <body>
    <div class="page">
      <div class="header">
        <h1>${data.ecole?.ecole_nom ?? 'SCOLIA'}</h1>
        <h2>${[data.ecole?.ecole_adresse, data.ecole?.ecole_ville].filter(Boolean).join(' — ') || 'Gestion Scolaire'}</h2>
        ${data.ecole?.ecole_telephone ? `<h2>Tél : ${data.ecole.ecole_telephone}</h2>` : ''}
      </div>

      <div class="recu-num"><span>REÇU N° ${numRecu}</span></div>

      <div class="section">
        <div class="section-title">Élève</div>
        <div class="row"><span class="label">Nom & Prénom</span><span class="value">${data.eleve.nom} ${data.eleve.prenom}</span></div>
        <div class="row"><span class="label">Matricule</span><span class="value">#${data.eleve.matricule}</span></div>
        <div class="row"><span class="label">Année académique</span><span class="value">${data.annee}</span></div>
      </div>

      <div class="montant-box">
        <div class="label">MONTANT REÇU</div>
        <div class="value">${fmt(data.montant)}</div>
      </div>

      <div class="section">
        <div class="section-title">Détails du paiement</div>
        <div class="row"><span class="label">Objet</span><span class="value">${data.tranche}</span></div>
        <div class="row"><span class="label">Mode de paiement</span><span class="value">${data.mode}</span></div>
        ${data.operationId ? `<div class="row"><span class="label">N° Opération</span><span class="value">${data.operationId}</span></div>` : ''}
        <div class="row"><span class="label">Date</span><span class="value">${fmtDate(data.date)}</span></div>
        <div class="row"><span class="label">Heure</span><span class="value">${heure}</span></div>
      </div>

      <div class="footer">
        <div class="signature">
          <div>
            <div class="line"></div>
            Le Caissier
          </div>
          <div class="stamp">CACHET<br/>ÉCOLE</div>
          <div>
            <div class="line"></div>
            Le Directeur
          </div>
        </div>
      </div>

      <p class="note">Ce reçu est un document officiel. Conservez-le précieusement. — Généré le ${now} à ${heure}</p>
    </div>
    <script>window.onload = () => { window.print(); }</script>
    </body></html>
  `;

  const win = window.open('', '_blank', 'width=600,height=800');
  if (win) { win.document.write(html); win.document.close(); }
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function PaiementForm() {
  const navigate                    = useNavigate();
  const [searchParams]              = useSearchParams();
  const matriculeInit               = searchParams.get('matricule') ?? '';

  const [step, setStep]             = useState<'eleve'|'tranche'|'confirm'>(matriculeInit ? 'tranche' : 'eleve');
  const [searchQ, setSearchQ]       = useState('');
  const [elevesRes, setElevesRes]   = useState<any[]>([]);
  const [searching, setSearching]   = useState(false);
  const [eleve, setEleve]           = useState<any>(null);
  const [tranchesData, setTranchesData] = useState<any>(null);
  const [loadingTranches, setLoadingTranches] = useState(false);
  const [selectedTranche, setSelectedTranche] = useState<any>(null);
  const [modes, setModes]           = useState<any[]>([]);
  const [annees, setAnnees]         = useState<any[]>([]);
  const [ecole, setEcole]           = useState<any>(null);

  // Form paiement
  const [montant, setMontant]       = useState('');
  const [idMode, setIdMode]         = useState('');
  const [operationId, setOperationId] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [datePaie, setDatePaie]     = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [paiementFait, setPaiementFait] = useState<any>(null);

  useEffect(() => {
    getModes().then(d => {
      setModes(Array.isArray(d) ? d : []);
      if (d.length > 0) setIdMode(String(d[0].idMode));
    }).catch(() => {});
    getAnnees().then(d => setAnnees(Array.isArray(d) ? d : [])).catch(() => {});
    // Charger les paramètres école pour le reçu
    authFetch(`${API}/parametres/publics`).then(r => r.json()).then(setEcole).catch(() => {});
    // Si matricule en query param
    if (matriculeInit) loadEleve(matriculeInit);
  }, []);

  // ── Charger élève ─────────────────────────────────────────────────────────
  const loadEleve = async (mat: string) => {
    try {
      const [eleveR, tranchesR] = await Promise.all([
        authFetch(`${API}/eleves/${mat}`).then(r => r.json()),
        loadTranches(mat),
      ]);
      setEleve(eleveR);
    } catch { }
  };

  // ── Charger tranches ──────────────────────────────────────────────────────
  const loadTranches = async (mat: string) => {
    setLoadingTranches(true);
    try {
      const res = await authFetch(`${API}/eleves/${mat}/tranches`);
      const d   = await res.json();
      setTranchesData(d.message ? null : d);
      return d;
    } catch { return null; }
    finally { setLoadingTranches(false); }
  };

  // ── Recherche élève ───────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (searchQ.length < 2) return;
    setSearching(true);
    try {
      const res = await authFetch(`${API}/eleves?search=${encodeURIComponent(searchQ)}&paginate=false`);
      const d   = await res.json();
      setElevesRes(Array.isArray(d) ? d : (d.data ?? []));
    } catch { }
    finally { setSearching(false); }
  };

  // ── Sélectionner élève ────────────────────────────────────────────────────
  const selectEleve = async (el: any) => {
    setEleve(el);
    setElevesRes([]);
    setSearchQ('');
    setLoadingTranches(true);
    setStep('tranche');
    await loadTranches(String(el.matricule));
  };

  // ── Sélectionner tranche ──────────────────────────────────────────────────
  const selectTranche = (t: any) => {
    setSelectedTranche(t);
    setMontant(String(t.reste));
    setStep('confirm');
    setError('');
  };

  // ── Confirmer paiement ────────────────────────────────────────────────────
  const handlePayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const idPers = Number(localStorage.getItem('idPers') ?? 1);
      const idAca  = tranchesData?.annee?.idAnnee ?? annees[annees.length - 1]?.idAnnee ?? 1;

      const res = await authFetch(`${API}/tranches/payer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matricule:    eleve.matricule,
          idTranche:    selectedTranche.idTranche,
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

      // Préparer les données du reçu
      const modeLabel = modes.find(m => String(m.idMode) === idMode)?.libelle ?? idMode;
      const anneeLabel = tranchesData?.annee?.libelle ?? '';

      setPaiementFait({
        eleve, tranche: selectedTranche.libelle,
        montant: Number(montant), mode: modeLabel,
        operationId, date: datePaie, annee: anneeLabel,
      });

    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  // ── Afficher reçu ────────────────────────────────────────────────────────
  const handleRecu = () => {
    if (!paiementFait) return;
    imprimerRecu({ ...paiementFait, ecole });
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/paiements" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} /> Retour
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Enregistrer un paiement</h1>
      </div>

      {/* Étapes */}
      <div className="flex items-center gap-2 text-xs">
        {[
          { id: 'eleve',   label: '1. Élève'   },
          { id: 'tranche', label: '2. Tranche'  },
          { id: 'confirm', label: '3. Paiement' },
        ].map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            {i > 0 && <div className="w-8 h-px bg-slate-200" />}
            <span className={`px-3 py-1 rounded-full font-semibold ${
              step === s.id
                ? 'bg-[#1a3a5c] text-white'
                : paiementFait || (s.id === 'tranche' && (step === 'confirm')) || (s.id === 'eleve' && step !== 'eleve')
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-400'
            }`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── ÉTAPE 1 : ÉLÈVE ── */}
      {step === 'eleve' && !paiementFait && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-slate-900">Rechercher l'élève</h2>
          <div className="flex gap-3">
            <input
              type="text" value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); }}}
              placeholder="Nom, prénom ou matricule…"
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            />
            <button onClick={handleSearch} disabled={searching || searchQ.length < 2}
              className="bg-[#1a3a5c] text-white px-5 py-3 rounded-xl hover:bg-[#16324f] disabled:opacity-50 flex items-center gap-2">
              <Search className="w-4 h-4" />
              {searching ? '…' : 'Chercher'}
            </button>
          </div>
          {elevesRes.length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              {elevesRes.map((el: any) => (
                <button key={el.matricule} onClick={() => selectEleve(el)}
                  className="w-full text-left px-5 py-3 hover:bg-slate-50 border-b border-gray-100 last:border-0 flex items-center gap-3 transition">
                  {getPhotoUrl(el.photoURL) ? (
                    <img src={getPhotoUrl(el.photoURL)!} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-xs font-bold text-violet-600 flex-shrink-0">
                      {el.prenom?.[0]}{el.nom?.[0]}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{el.prenom} {el.nom}</p>
                  </div>
                  <span className="text-slate-400 text-sm">#{el.matricule}</span>
                </button>
              ))}
            </div>
          )}
          {searchQ.length >= 2 && !searching && elevesRes.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">Aucun élève trouvé</p>
          )}
        </div>
      )}

      {/* ── ÉTAPE 2 : TRANCHES ── */}
      {step === 'tranche' && !paiementFait && (
        <div className="space-y-4">
          {/* Récap élève */}
          {eleve && (
            <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
              {getPhotoUrl(eleve.photoURL) ? (
                <img src={getPhotoUrl(eleve.photoURL)!} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-sm font-bold text-violet-600 flex-shrink-0">
                  {eleve.prenom?.[0]}{eleve.nom?.[0]}
                </div>
              )}
              <div className="flex-1">
                <p className="font-bold text-slate-900">{eleve.nom} {eleve.prenom}</p>
                <p className="text-xs text-slate-400">#{eleve.matricule}</p>
              </div>
              <button onClick={() => { setEleve(null); setTranchesData(null); setStep('eleve'); }}
                className="text-xs text-slate-400 hover:text-slate-600 underline">Changer</button>
            </div>
          )}

          {/* Tranches */}
          {loadingTranches ? (
            <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" /> Chargement des tranches…
            </div>
          ) : !tranchesData ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
              <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
              <p className="font-medium text-slate-700">Aucune scolarité trouvée</p>
              <p className="text-sm text-slate-400 mt-1">Vérifiez que l'élève est inscrit dans une classe avec une scolarité configurée.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{tranchesData.inscription?.classe_libelle}</p>
                  <p className="text-xs text-slate-400">{tranchesData.annee?.libelle}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Reste à payer</p>
                  <p className="font-bold text-red-600">{fmt(tranchesData.reste ?? 0)}</p>
                </div>
              </div>

              {/* Barre progression */}
              <div className="px-5 py-3 border-b border-slate-100">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Progression</span>
                  <span className="font-bold">{tranchesData.pourcentage ?? 0}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{
                      width: `${tranchesData.pourcentage ?? 0}%`,
                      background: (tranchesData.pourcentage ?? 0) >= 100
                        ? 'linear-gradient(90deg,#34d399,#10b981)'
                        : (tranchesData.pourcentage ?? 0) >= 50
                          ? 'linear-gradient(90deg,#fbbf24,#f59e0b)'
                          : 'linear-gradient(90deg,#f87171,#ef4444)',
                    }} />
                </div>
              </div>

              {/* Liste tranches */}
              <div className="divide-y divide-slate-50">
                {tranchesData.tranches?.map((t: any, i: number) => {
                  const s        = STATUT_STYLE[t.statut as keyof typeof STATUT_STYLE] ?? STATUT_STYLE.en_attente;
                  const StatusIcon = s.icon;
                  const bloquee  = i > 0 && tranchesData.tranches[i - 1].statut !== 'payee';
                  const payable  = !bloquee && t.statut !== 'payee';

                  return (
                    <div key={t.idTranche}
                      onClick={() => payable && selectTranche(t)}
                      className={`flex items-center gap-4 px-5 py-4 transition-all ${
                        payable ? 'cursor-pointer hover:bg-slate-50' : 'opacity-60'
                      }`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                        {bloquee ? <Lock className="w-4 h-4 text-slate-400" /> : <StatusIcon className={`w-4 h-4 ${s.text}`} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{t.libelle}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.bg} ${s.text}`}>
                            {bloquee ? 'Bloquée' : s.label}
                          </span>
                        </div>
                        <div className="flex gap-3 mt-0.5 text-xs text-slate-400">
                          <span>Dû : <strong className="text-slate-600">{fmt(t.montant_du)}</strong></span>
                          {t.montant_paye > 0 && <span className="text-emerald-500">Payé : {fmt(t.montant_paye)}</span>}
                          {t.reste > 0 && t.statut !== 'payee' && <span className="text-red-400">Reste : {fmt(t.reste)}</span>}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Échéance : {fmtDate(t.date_echeance)}
                          {t.statut === 'en_retard' && (
                            <span className="text-red-500 ml-2">
                              ⚠ {Math.floor((Date.now() - new Date(t.date_echeance).getTime()) / 86400000)}j de retard
                            </span>
                          )}
                        </p>
                      </div>
                      {payable && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-xl bg-[#1a3a5c] flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ÉTAPE 3 : CONFIRMATION PAIEMENT ── */}
      {step === 'confirm' && !paiementFait && selectedTranche && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Confirmer le paiement</h2>
            <button onClick={() => setStep('tranche')} className="text-xs text-slate-400 hover:text-slate-600 underline">
              ← Retour aux tranches
            </button>
          </div>

          {/* Récap tranche */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Élève</span>
              <span className="font-semibold">{eleve?.nom} {eleve?.prenom}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tranche</span>
              <span className="font-semibold">{selectedTranche.libelle}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Montant dû</span>
              <span className="font-semibold">{fmt(selectedTranche.montant_du)}</span>
            </div>
            {selectedTranche.montant_paye > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Déjà payé</span>
                <span className="font-semibold text-emerald-600">{fmt(selectedTranche.montant_paye)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm border-t border-slate-200 pt-2">
              <span className="font-semibold text-slate-700">Reste à payer</span>
              <span className="font-bold text-red-600">{fmt(selectedTranche.reste)}</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handlePayer} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Montant *</label>
                <input type="number" required min={1} max={selectedTranche.reste}
                  value={montant} onChange={e => setMontant(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3" />
                {Number(montant) > 0 && (
                  <p className="text-xs text-emerald-600 font-medium">{fmt(Number(montant))}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Mode de paiement *</label>
                <select required value={idMode} onChange={e => setIdMode(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3">
                  <option value="">— Choisir —</option>
                  {modes.map((m: any) => <option key={m.idMode} value={m.idMode}>{m.libelle}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Date</label>
                <input type="date" value={datePaie} onChange={e => setDatePaie(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">N° Opération</label>
                <input type="text" value={operationId} onChange={e => setOperationId(e.target.value)}
                  placeholder="Optionnel" className="w-full border border-gray-300 rounded-xl px-4 py-3" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Commentaire</label>
              <input type="text" value={commentaire} onChange={e => setCommentaire(e.target.value)}
                placeholder="Optionnel" className="w-full border border-gray-300 rounded-xl px-4 py-3" />
            </div>

            <div className="flex gap-4 pt-2">
              <button type="submit" disabled={saving || !idMode}
                className="flex-1 bg-[#1a3a5c] text-white py-4 rounded-xl font-semibold hover:bg-[#16324f] transition disabled:opacity-70 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle size={20} />}
                {saving ? 'Enregistrement…' : 'Confirmer le paiement'}
              </button>
              <button type="button" onClick={() => navigate('/paiements')}
                className="border border-gray-300 py-4 px-6 rounded-xl font-semibold hover:bg-gray-50 transition">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── SUCCÈS + REÇU ── */}
      {paiementFait && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto">
            <CheckCircle className="w-9 h-9 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Paiement enregistré !</h2>
            <p className="text-slate-500 mt-1">
              {fmt(paiementFait.montant)} reçu pour {paiementFait.tranche}
            </p>
            <p className="text-sm text-slate-400 mt-0.5">
              {paiementFait.eleve.nom} {paiementFait.eleve.prenom} · #{paiementFait.eleve.matricule}
            </p>
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={handleRecu}
              className="flex items-center gap-2 bg-[#1a3a5c] text-white px-6 py-3 rounded-xl hover:bg-[#16324f] transition font-semibold">
              <Printer className="w-5 h-5" /> Imprimer le reçu
            </button>
            <button
              onClick={() => {
                setEleve(null); setTranchesData(null);
                setSelectedTranche(null); setPaiementFait(null);
                setMontant(''); setOperationId(''); setCommentaire('');
                setStep('eleve');
              }}
              className="flex items-center gap-2 border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-50 transition font-semibold">
              <CreditCard className="w-5 h-5" /> Nouveau paiement
            </button>
            <button onClick={() => navigate(`/eleves/${paiementFait.eleve.matricule}/paiements`)}
              className="flex items-center gap-2 border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-50 transition">
              Voir tous les paiements
            </button>
          </div>
        </div>
      )}
    </div>
  );
}