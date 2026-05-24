import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

import {
  getDashboard,
  getAnnees,
  formatMontant,
  type DashboardPaiement,
  type AnneeAcademique,
} from '../../service/paiement_service';

export default function PaiementDashboard() {
  const navigate = useNavigate();

  const [annees, setAnnees] = useState<AnneeAcademique[]>([]);
  const [idAca, setIdAca] = useState('');
  const [dashboard, setDashboard] = useState<DashboardPaiement | null>(null);
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
      const data = await getDashboard(idAca);
      setDashboard(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const stats = [
    { label: 'Total collecté', value: dashboard ? formatMontant(dashboard.totalCollecte) : '—', color: 'text-green-600' },
    { label: 'Paiements', value: dashboard?.nbPaiements ?? '—', color: 'text-blue-600' },
    { label: 'Élèves à jour', value: dashboard?.nbElevesPayes ?? '—', color: 'text-emerald-600' },
    { label: 'Débiteurs', value: dashboard?.nbDebiteurs ?? '—', color: 'text-red-600' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion de la Scolarité</h1>
          <p className="text-gray-500 mt-1">Suivi des paiements et finances scolaires</p>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={idAca}
            onChange={(e) => setIdAca(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3a5c]"
          >
            {annees.map(a => (
              <option key={a.idAnnee} value={a.idAnnee}>
                {a.libelle}
              </option>
            ))}
          </select>

          <button
            onClick={() => navigate('/paiements/nouveau')}
            className="flex items-center gap-2 bg-[#1a3a5c] text-white px-5 py-3 rounded-xl hover:bg-[#16324f] transition"
          >
            <Plus size={20} />
            Nouveau Paiement
          </button>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6">
          {error}
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6">
            <p className="text-sm text-gray-500 mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par mode de paiement */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-5">Répartition par Mode de Paiement</h2>
          {dashboard?.parMode && dashboard.parMode.length > 0 ? (
            <div className="space-y-4">
              {dashboard.parMode.map((m, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{m.mode?.libelle || 'Autre'}</p>
                    <p className="text-sm text-gray-500">{m.nb} paiement(s)</p>
                  </div>
                  <p className="font-semibold text-green-600">
                    {formatMontant(m.total)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 py-8 text-center">Aucune donnée disponible</p>
          )}
        </div>

        {/* Accès Rapide */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-5">Accès Rapide</h2>
          <div className="grid grid-cols-1 gap-3">
            {[
              { label: '📋 Voir tous les paiements', path: '/paiements' },
              { label: '👨‍🎓 Suivi par élève', path: '/paiements/suivi' },
              { label: '📊 Statistiques détaillées', path: '/paiements/stats' },
              { label: '🏫 Scolarité par classe', path: '/paiements/par-classe' },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                className="w-full text-left px-5 py-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition text-left"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Paiements Récents */}
      {dashboard?.recents && dashboard.recents.length > 0 && (
        <div className="mt-8 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b">
            <h2 className="font-semibold">Paiements Récents</h2>
            <button
              onClick={() => navigate('/paiements')}
              className="text-[#1a3a5c] hover:underline text-sm"
            >
              Voir tout →
            </button>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">Élève</th>
                <th className="px-6 py-4 text-left">Mode</th>
                <th className="px-6 py-4 text-right">Montant</th>
                <th className="px-6 py-4 text-left">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {dashboard.recents.map((p) => (
                <tr
                  key={p.idPaie}
                  onClick={() => navigate(`/paiements/${p.idPaie}`)}
                  className="hover:bg-gray-50 cursor-pointer transition"
                >
                  <td className="px-6 py-4 font-medium">
                    {p.eleve?.prenom} {p.eleve?.nom}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {p.mode?.libelle || '—'}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-green-600">
                    {formatMontant(p.montant)}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {p.datePaie}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}