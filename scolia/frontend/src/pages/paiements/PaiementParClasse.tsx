import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getPaiementsParClasse,
  getAnnees,
  formatMontant,
  getStatutPaiement,
  type AnneeAcademique,
} from '../../service/paiement_service';

interface Classe {
  idClasse: number;
  libelle: string;
}

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

function getToken(): string {
  return localStorage.getItem('token') ?? '';
}

async function getClasses(): Promise<Classe[]> {
  const res = await fetch(`${API}/classes`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  return data.data ?? data;
}

export default function PaiementParClasse() {
  const navigate = useNavigate();

  const [annees, setAnnees]   = useState<AnneeAcademique[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [idAca, setIdAca]     = useState('');
  const [idClasse, setIdClasse] = useState('');
  const [result, setResult]   = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    getAnnees().then(data => {
      setAnnees(data);
      if (data.length > 0) setIdAca(String(data[data.length - 1].idAnnee));
    }).catch(() => {});
    getClasses().then(setClasses).catch(() => {});
  }, []);

  async function handleCharger() {
    if (!idClasse || !idAca) return;
    try {
      setLoading(true); setError(''); setResult(null);
      const data = await getPaiementsParClasse(idClasse, idAca);
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Paiements par classe
        </h1>
        <p className="text-sm text-muted-foreground">
          Suivi des paiements élève par élève pour une classe
        </p>
      </div>

      {/* ERREUR */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}

      {/* FILTRES */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-sm mb-2">Année académique</label>
            <select
              value={idAca}
              onChange={e => setIdAca(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm"
            >
              {annees.map(a => (
                <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-sm mb-2">Classe</label>
            <select
              value={idClasse}
              onChange={e => setIdClasse(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm"
            >
              <option value="">-- Sélectionner --</option>
              {classes.map(c => (
                <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleCharger}
              disabled={!idClasse || !idAca || loading}
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Chargement...' : 'Afficher'}
            </button>
          </div>
        </div>
      </div>

      {/* RÉSULTATS */}
      {result && (
        <>
          {/* RÉSUMÉ CLASSE */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              {
                label: 'Total collecté',
                value: formatMontant(result.totalCollecte),
                color: 'text-green-500',
              },
              {
                label: 'Total attendu',
                value: formatMontant(result.totalAttendu),
                color: 'text-blue-400',
              },
              {
                label: 'Taux de recouvrement',
                value: `${result.tauxRecouvrement}%`,
                color: result.tauxRecouvrement >= 80
                  ? 'text-green-500'
                  : result.tauxRecouvrement >= 50
                  ? 'text-yellow-500'
                  : 'text-red-400',
              },
            ].map(s => (
              <div key={s.label} className="bg-card border border-border rounded-2xl p-4 text-center">
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* TABLEAU ÉLÈVES */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {result.classe?.libelle} — {result.eleves.length} élève(s)
              </h2>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                  Soldé
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
                  Partiel
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                  Non payé
                </span>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Élève</th>
                  <th className="px-4 py-3 text-right">Payé</th>
                  <th className="px-4 py-3 text-right">Reste</th>
                  <th className="px-4 py-3 text-left">Progression</th>
                  <th className="px-4 py-3 text-center">Paiements</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {result.eleves.map((el: any) => {
                  const statut = getStatutPaiement(el.totalPaye, el.montantAttendu);
                  const barColor =
                    el.tauxRecouvrement >= 100 ? 'bg-green-500' :
                    el.tauxRecouvrement >= 50  ? 'bg-yellow-500' : 'bg-red-500';

                  return (
                    <tr key={el.matricule} className="hover:bg-muted/20 transition">
                      <td className="px-4 py-3">
                        <p className="font-medium">{el.prenom} {el.nom}</p>
                        <p className="text-xs text-muted-foreground">#{el.matricule}</p>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-green-500">
                        {formatMontant(el.totalPaye)}
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${
                        el.resteAPayer > 0 ? 'text-red-400' : 'text-green-500'
                      }`}>
                        {el.resteAPayer > 0 ? formatMontant(el.resteAPayer) : '✓ Soldé'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2 min-w-[60px]">
                            <div
                              className={`h-2 rounded-full ${barColor}`}
                              style={{ width: `${Math.min(el.tauxRecouvrement, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs w-8 text-muted-foreground">
                            {el.tauxRecouvrement}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-muted px-2 py-1 rounded-full text-xs">
                          {el.nbPaiements}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/paiements/suivi?mat=${el.matricule}`)}
                          className="text-primary hover:underline text-xs"
                        >
                          Voir →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}