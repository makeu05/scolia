import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, Eye, Edit, UserCheck, UserX } from "lucide-react";

import {
  getEnseignants,
  desactiverEnseignant,
  reactiverEnseignant,
  type Enseignant,
  type EnseignantPaginate,
} from "../../service/enseignant_service";

export default function EnseignantsPage() {
  const [enseignantsData, setEnseignantsData] = useState<EnseignantPaginate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [actif, setActif] = useState("");
  const [page, setPage] = useState(1);

  const fetchEnseignants = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getEnseignants({ page, search: search.trim() || undefined, actif });
      setEnseignantsData(data);
    } catch (err: any) {
      setError(err.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [page, search, actif]);

  useEffect(() => {
    fetchEnseignants();
  }, [fetchEnseignants]);

  const toggleStatut = async (id: number, actuel: number) => {
    try {
      if (actuel === 1) {
        await desactiverEnseignant(id);
      } else {
        await reactiverEnseignant(id);
      }
      fetchEnseignants();
    } catch (err: any) {
      alert(err.message || "Erreur lors du changement de statut");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enseignants</h1>
          <p className="text-gray-500 mt-1">
            {enseignantsData?.total || 0} enseignant(s)
          </p>
        </div>

        <Link
          to="/enseignants/nouveau"
          className="flex items-center gap-2 bg-[#1a3a5c] text-white px-5 py-3 rounded-xl hover:bg-[#16324f] transition"
        >
          <Plus size={20} />
          Nouvel Enseignant
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Rechercher un enseignant..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-xl px-4 py-3 w-full md:w-80 focus:outline-none focus:border-[#1a3a5c]"
        />

        <select
          value={actif}
          onChange={(e) => { setActif(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
        >
          <option value="">Tous les statuts</option>
          <option value="1">Actifs</option>
          <option value="0">Inactifs</option>
        </select>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6">{error}</div>}

      {/* Tableau */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left">Nom & Prénom</th>
              <th className="px-6 py-4 text-left">Cours</th>
              <th className="px-6 py-4 text-left">Classe</th>
              <th className="px-6 py-4 text-left">Contact</th>
              <th className="px-6 py-4 text-left">Statut</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12">Chargement...</td></tr>
            ) : enseignantsData?.data.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12">Aucun enseignant trouvé</td></tr>
            ) : (
              enseignantsData?.data.map((e) => (
                <tr key={e.idEnseignant} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium">
                    {e.personne?.prenom} {e.personne?.nom}
                  </td>
                  <td className="px-6 py-4">{e.cours?.libelle ?? '—'}</td>
                  <td className="px-6 py-4">{e.cours?.classe?.libelle ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{e.personne?.mobile}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${e.Actif ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {e.Actif ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-4">
                      <Link to={`/enseignants/${e.idEnseignant}`}>
                        <Eye size={20} className="text-blue-600 hover:text-blue-700" />
                      </Link>
                      <Link to={`/enseignants/${e.idEnseignant}/modifier`}>
                        <Edit size={20} className="text-amber-600 hover:text-amber-700" />
                      </Link>
                      <button onClick={() => toggleStatut(e.idEnseignant, e.Actif)}>
                        {e.Actif ? (
                          <UserX size={20} className="text-red-600 hover:text-red-700" />
                        ) : (
                          <UserCheck size={20} className="text-emerald-600 hover:text-emerald-700" />
                        )}
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
      {enseignantsData && enseignantsData.last_page > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-5 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Précédent
          </button>

          <span className="text-sm text-gray-600">
            Page <strong>{enseignantsData.current_page}</strong> / {enseignantsData.last_page}
          </span>

          <button
            onClick={() => setPage(p => Math.min(enseignantsData.last_page, p + 1))}
            disabled={page === enseignantsData.last_page}
            className="px-5 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}