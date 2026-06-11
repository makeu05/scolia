// src/pages/eleves/ElevePaiementSuivi.tsx
// Accessible depuis EleveDetails : onglet "Paiements" ou page dédiée
// Route suggérée : /eleves/:matricule/paiements

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle, AlertTriangle, Clock, Plus,
  CreditCard, TrendingUp, Wallet, ChevronLeft,
} from 'lucide-react';
import { authFetch } from '../../service/auth';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

const STATUT_CONFIG = {
  solde:         { label: 'Soldé',          bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle  },
  partiel:       { label: 'Partiel',         bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   icon: Clock        },
  en_retard:     { label: 'En retard',       bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     icon: AlertTriangle },
  non_configure: { label: 'Non configuré',   bg: 'bg-slate-50',   text: 'text-slate-500',   border: 'border-slate-200',   icon: Clock        },
};

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ElevePaiementSuivi() {
  const { matricule } = useParams<{ matricule: string }>();
  const navigate      = useNavigate();

  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = () => {
    if (!matricule) return;
    setLoading(true);
    authFetch(`${API}/paiements/suivi/${matricule}`)
      .then(r => r.json())
      .then(d => {
        if (d.message) throw new Error(d.message);
        setData(d);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [matricule]);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}
    </div>
  );

  if (error || !data) return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-center">
      <p className="text-red-500">{error || 'Données introuvables'}</p>
    </div>
  );

  const { eleve, inscription, scolarite, paiements, tranches, resume } = data;
  const statut  = STATUT_CONFIG[resume.statut as keyof typeof STATUT_CONFIG] ?? STATUT_CONFIG.non_configure;
  const StatutIcon = statut.icon;

  return (
    <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/eleves/${matricule}`)}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-500" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900" style={{ letterSpacing: '-0.02em' }}>
            Suivi des paiements
          </h1>
          <p className="text-sm text-slate-400">
            {eleve.prenom} {eleve.nom} · Matricule {eleve.matricule}
          </p>
        </div>
        <button
          onClick={() => navigate(`/paiements/nouveau?matricule=${matricule}`)}
          className="ml-auto btn-primary gap-2">
          <Plus className="w-4 h-4" /> Enregistrer un paiement
        </button>
      </div>

      {/* Inscription */}
      {inscription && (
        <div className="card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5 text-violet-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              {inscription.classe_libelle} — {inscription.salle_libelle}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {inscription.cycle_libelle} · {inscription.annee_libelle}
            </p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statut.bg} ${statut.text} ${statut.border} flex items-center gap-1.5`}>
            <StatutIcon className="w-3.5 h-3.5" />
            {statut.label}
          </span>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total dû',      value: fmt(resume.total_du),      icon: Wallet,     bg: 'bg-slate-50',    color: 'text-slate-600'   },
          { label: 'Total payé',    value: fmt(resume.total_paye),     icon: CheckCircle,bg: 'bg-emerald-50',  color: 'text-emerald-600' },
          { label: 'Reste à payer', value: fmt(resume.reste_a_payer),  icon: AlertTriangle, bg: resume.reste_a_payer > 0 ? 'bg-red-50' : 'bg-emerald-50', color: resume.reste_a_payer > 0 ? 'text-red-600' : 'text-emerald-600' },
        ].map(k => (
          <div key={k.label} className="card p-4">
            <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center mb-3`}>
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </div>
            <p className="text-base font-bold text-slate-900" style={{ letterSpacing: '-0.02em' }}>{k.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Barre de progression */}
      {resume.total_du > 0 && (
        <div className="card p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-700">Progression du paiement</span>
            <span className="text-sm font-bold text-slate-900">{resume.pourcentage}%</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${resume.pourcentage}%`,
                background: resume.pourcentage >= 100
                  ? 'linear-gradient(90deg,#34d399,#10b981)'
                  : resume.pourcentage >= 50
                    ? 'linear-gradient(90deg,#fbbf24,#f59e0b)'
                    : 'linear-gradient(90deg,#f87171,#ef4444)',
              }}
            />
          </div>
          {scolarite && (
            <div className="flex justify-between text-xs text-slate-400 pt-1">
              <span>Inscription : {fmt(scolarite.inscription)}</span>
              <span>Pension : {fmt(scolarite.pension)}</span>
            </div>
          )}
        </div>
      )}

      {/* Tranches */}
      {tranches?.length > 0 && (
        <div className="card p-5 space-y-3">
          <h3 className="section-title">Échéancier des tranches</h3>
          <div className="space-y-2">
            {tranches.map((t: any, i: number) => {
              // Estimer si la tranche est couverte par les paiements cumulés
              const cumulDu = tranches
                .slice(0, i + 1)
                .reduce((s: number, x: any) => s + x.montant, 0);
              const couverte = resume.total_paye >= cumulDu;
              return (
                <div key={t.idTranche}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    couverte ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      couverte ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {couverte ? '✓' : i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{t.libelle}</p>
                      <p className="text-xs text-slate-400">
                        Échéance : mois {t.delai_mois}, jour {t.delai_jour}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${couverte ? 'text-emerald-600' : 'text-slate-700'}`}>
                    {fmt(t.montant)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Historique des paiements */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="section-title mb-0">Historique des paiements</h3>
          <span className="text-xs text-slate-400">{paiements.length} paiement{paiements.length > 1 ? 's' : ''}</span>
        </div>

        {paiements.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-slate-400 gap-3">
            <TrendingUp className="w-10 h-10 opacity-20" />
            <p className="text-sm">Aucun paiement enregistré</p>
            <button
              onClick={() => navigate(`/paiements/nouveau?matricule=${matricule}`)}
              className="btn-secondary text-xs py-1.5 px-4">
              Enregistrer le premier paiement
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {paiements.map((p: any) => (
              <div key={p.idPaie} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{fmt(p.montant)}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {fmtDate(p.datePaie)}
                    {p.mode_libelle && ` · ${p.mode_libelle}`}
                    {p.enregistre_par && ` · Par ${p.enregistre_par}`}
                  </p>
                  {p.comentaire && p.comentaire !== 'INDEFINI' && (
                    <p className="text-xs text-slate-400 italic mt-0.5">{p.comentaire}</p>
                  )}
                </div>
                {p.operation_ID && p.operation_ID !== 'INDEFINI' && (
                  <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded-lg">
                    #{p.operation_ID}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}