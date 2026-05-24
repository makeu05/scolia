import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';

import {
  getInscriptions,
  deleteInscription,
  getClasses,
  getAnnees,
  type Inscription,
  type Classe,
  type AnneeAcademique,
} from '../../service/inscription_service';

export default function InscriptionPage() {
  const navigate = useNavigate();

  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [annees, setAnnees] = useState<AnneeAcademique[]>([]);

  const [idClasse, setIdClasse] = useState('');
  const [idAcademi, setIdAcademi] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      const data = await getInscriptions({ page, search, idClasse, idAcademi });
      setInscriptions(data.data);
      setLastPage(data.last_page);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getClasses().then(setClasses).catch(() => {});
    getAnnees().then(setAnnees).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [page, idClasse, idAcademi]);

  async function handleDelete(id: number) {
    if (!confirm('Supprimer cette inscription ?')) return;
    try {
      await deleteInscription(id);
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
          <h1 className="text-3xl font-bold text-gray-900">Inscriptions</h1>
          <p className="text-gray-500 mt-1">{total} inscription(s) enregistrée(s)</p>
        </div>

        <button
          onClick={() => navigate('/inscriptions/ajouter')}
          className="flex items-center gap-2 bg-[#1a3a5c] text-white px-5 py-3 rounded-xl hover:bg-[#16324f] transition"
        >
          <Plus size={20} />
          Inscrire un élève
        </button>
      </div>

      {/* Error */}
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
            placeholder="Rechercher un élève (nom, prénom, matricule)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(); } }}
            className="flex-1 min-w-[280px] border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
          />

          <select
            value={idAcademi}
            onChange={(e) => { setIdAcademi(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
          >
            <option value="">Toutes les années</option>
            {annees.map(a => (
              <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>
            ))}
          </select>

          <select
            value={idClasse}
            onChange={(e) => { setIdClasse(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
          >
            <option value="">Toutes les classes</option>
            {classes.map(c => (
              <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>
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

      {/* Tableau */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left">Élève</th>
              <th className="px-6 py-4 text-left">Matricule</th>
              <th className="px-6 py-4 text-left">Classe</th>
              <th className="px-6 py-4 text-left">Salle</th>
              <th className="px-6 py-4 text-left">Année</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">Chargement des inscriptions...</td>
              </tr>
            ) : inscriptions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">Aucune inscription trouvée</td>
              </tr>
            ) : (
              inscriptions.map(i => (
                <tr key={i.idFrequente} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium">
                    {i.eleve?.prenom} {i.eleve?.nom}
                  </td>
                  <td className="px-6 py-4 text-gray-600">#{i.eleve?.matricule}</td>
                  <td className="px-6 py-4">{i.salle?.classe?.libelle ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{i.salle?.libelle ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {i.annee_academique?.libelle ?? '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => navigate(`/inscriptions/${i.idFrequente}`)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() => navigate(`/inscriptions/${i.idFrequente}/modifier`)}
                        className="text-amber-600 hover:text-amber-700"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(i.idFrequente)}
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
            {total} inscription(s) • Page {page} / {lastPage}
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