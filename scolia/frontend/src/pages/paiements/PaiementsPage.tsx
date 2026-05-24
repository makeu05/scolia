import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';

import {
  getPaiements,
  deletePaiement,
  getModes,
  getAnnees,
  formatMontant,
  type Paiement,
  type Mode,
  type AnneeAcademique,
} from '../../service/paiement_service';

export default function PaiementPage() {
  const navigate = useNavigate();

  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [modes, setModes] = useState<Mode[]>([]);
  const [annees, setAnnees] = useState<AnneeAcademique[]>([]);

  const [search, setSearch] = useState('');
  const [idAca, setIdAca] = useState('');
  const [idMode, setIdMode] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      const data = await getPaiements({ page, search, idAca, idMode });
      setPaiements(data.data);
      setLastPage(data.last_page);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getModes().then(setModes).catch(() => {});
    getAnnees().then(setAnnees).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [page, idAca, idMode]);

  async function handleDelete(id: number) {
    if (!confirm('Supprimer ce paiement ?')) return;
    try {
      await deletePaiement(id);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Paiements</h1>
          <p className="text-gray-500 mt-1">{total} paiement(s) enregistrés</p>
        </div>

        <button
          onClick={() => navigate('/paiements/nouveau')}
          className="flex items-center gap-2 bg-[#1a3a5c] text-white px-5 py-3 rounded-xl hover:bg-[#16324f] transition"
        >
          <Plus size={20} />
          Nouveau Paiement
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6">
          {error}
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Rechercher élève (nom, prénom, matricule)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(); } }}
            className="flex-1 min-w-[280px] border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
          />

          <select
            value={idAca}
            onChange={(e) => { setIdAca(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
          >
            <option value="">Toutes les années</option>
            {annees.map(a => (
              <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>
            ))}
          </select>

          <select
            value={idMode}
            onChange={(e) => { setIdMode(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
          >
            <option value="">Tous les modes</option>
            {modes.map(m => (
              <option key={m.idMode} value={m.idMode}>{m.libelle}</option>
            ))}
          </select>

          <button
            onClick={() => { setPage(1); load(); }}
            className="bg-[#1a3a5c] text-white px-6 py-3 rounded-xl hover:bg-[#16324f] transition"
          >
            Rechercher
          </button>
        </div>
      </div>

      {/* Tableau des Paiements */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left">Élève</th>
              <th className="px-6 py-4 text-left">Année</th>
              <th className="px-6 py-4 text-left">Mode</th>
              <th className="px-6 py-4 text-right">Montant</th>
              <th className="px-6 py-4 text-left">Date</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">Chargement des paiements...</td>
              </tr>
            ) : paiements.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">Aucun paiement trouvé</td>
              </tr>
            ) : (
              paiements.map(p => (
                <tr key={p.idPaie} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-medium">
                      {p.eleve?.prenom} {p.eleve?.nom}
                    </div>
                    <div className="text-xs text-gray-400">#{p.eleve?.matricule}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {p.annee_academique?.libelle ?? '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
                      {p.mode?.libelle ?? '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-green-600">
                    {formatMontant(p.montant)}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {p.datePaie}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => navigate(`/paiements/${p.idPaie}`)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() => navigate(`/paiements/${p.idPaie}/modifier`)}
                        className="text-amber-600 hover:text-amber-700"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.idPaie)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-between mt-6 px-2">
          <span className="text-sm text-gray-500">
            Page {page} sur {lastPage} • {total} paiements
          </span>

          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-5 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50"
            >
              Précédent
            </button>
            <button
              disabled={page === lastPage}
              onClick={() => setPage(p => p + 1)}
              className="px-5 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}