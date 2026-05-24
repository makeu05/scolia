import { useEffect, useState } from 'react';
import {
  getStats,
  getAnnees,
  formatMontant,
  type StatsPaiement,
  type AnneeAcademique,
} from '../../service/paiement_service';

export default function PaiementStats() {
  const [annees, setAnnees] = useState<AnneeAcademique[]>([]);
  const [idAca, setIdAca] = useState('');
  const [stats, setStats] = useState<StatsPaiement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getAnnees().then(data => {
      setAnnees(data);
      if (data.length > 0) {
        setIdAca(String(data[data.length - 1].idAnnee));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!idAca) return;
    load();
  }, [idAca]);

  async function load() {
    try {
      setLoading(true);
      setError('');
      const data = await getStats(idAca);
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Statistiques Globales</h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble des paiements scolaires</p>
        </div>

        <select
          value={idAca}
          onChange={e => setIdAca(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
        >
          {annees.map(a => (
            <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-500">Chargement des statistiques...</div>
      ) : stats && (
        <>
          {/* Stats Globales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[
              {
                label: 'Total collecté',
                value: formatMontant(stats.totalCollecte),
                color: 'text-green-600',
              },
              {
                label: 'Total attendu',
                value: formatMontant(stats.totalAttendu),
                color: 'text-blue-600',
              },
              {
                label: 'Taux global',
                value: `${stats.tauxGlobal}%`,
                color: stats.tauxGlobal >= 80 ? 'text-green-600' : stats.tauxGlobal >= 50 ? 'text-amber-600' : 'text-red-600',
              },
              {
                label: 'Débiteurs',
                value: stats.nbDebiteurs,
                color: stats.nbDebiteurs > 0 ? 'text-red-600' : 'text-green-600',
              },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6">
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className={`text-3xl font-bold mt-3 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Barre de progression globale */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
            <div className="flex justify-between mb-3">
              <span className="font-medium">Recouvrement global</span>
              <span className="font-bold text-[#1a3a5c]">{stats.tauxGlobal}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  stats.tauxGlobal >= 80 ? 'bg-green-500' :
                  stats.tauxGlobal >= 50 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(stats.tauxGlobal, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Par Mode de Paiement */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-5">Répartition par Mode</h2>
              {stats.parMode.length > 0 ? (
                <div className="space-y-5">
                  {stats.parMode.map(m => {
                    const pct = stats.totalCollecte > 0 
                      ? Math.round((m.total / stats.totalCollecte) * 100) 
                      : 0;
                    return (
                      <div key={m.idMode}>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{m.libelle}</span>
                          <span className="font-semibold text-green-600">
                            {formatMontant(m.total)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-2 bg-[#1a3a5c] rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{m.nb} paiements</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 py-8 text-center">Aucune donnée disponible</p>
              )}
            </div>

            {/* Par Classe */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-5 border-b">
                <h2 className="text-lg font-semibold">Répartition par Classe</h2>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left">Classe</th>
                    <th className="px-6 py-4 text-center">Élèves</th>
                    <th className="px-6 py-4 text-right">Collecté</th>
                    <th className="px-6 py-4 text-right">Taux</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.parClasse.map(c => (
                    <tr key={c.idClasse} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{c.libelle}</td>
                      <td className="px-6 py-4 text-center text-gray-600">{c.nbEleves}</td>
                      <td className="px-6 py-4 text-right font-semibold text-green-600">
                        {formatMontant(c.totalCollecte)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-medium ${
                          c.tauxRecouvrement >= 80 ? 'text-green-600' :
                          c.tauxRecouvrement >= 50 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {c.tauxRecouvrement}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}