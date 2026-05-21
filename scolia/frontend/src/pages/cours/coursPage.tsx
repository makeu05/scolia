import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";

import {
  getCours,
  deleteCours,
  type Cours,
  type CoursPaginate,
  type CoursFilters,
} from "../../service/cours_service";

export default function CoursPage() {
  const [coursData, setCoursData] = useState<CoursPaginate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchCours = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const filters: CoursFilters = {
        page,
        search: search.trim() || undefined,
      };

      const data = await getCours(filters);
      setCoursData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Impossible de charger les cours");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchCours();
  }, [fetchCours]);

  const handleDelete = async (idCours: number) => {
    if (!confirm("Supprimer ce cours ? Cette action est irréversible.")) return;
    try {
      await deleteCours(idCours);
      fetchCours();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Cours</h1>
          <p className="text-gray-500 mt-1">
            {coursData?.total || 0} cours au total
          </p>
        </div>

        <Link
          to="/cours/nouveau"
          className="flex items-center gap-2 bg-[#1a3a5c] text-white px-5 py-3 rounded-xl hover:bg-[#16324f] transition"
        >
          <Plus size={20} />
          Nouveau Cours
        </Link>
      </div>

      {/* Recherche */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher un cours..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // Reset à la page 1 quand on recherche
          }}
          className="w-full md:w-96 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left">Libellé</th>
              <th className="px-6 py-4 text-left">Classe</th>
              <th className="px-6 py-4 text-left">Enseignant</th>
              <th className="px-6 py-4 text-left">Coefficient</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500">
                  Chargement des cours...
                </td>
              </tr>
            ) : coursData?.data.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500">
                  Aucun cours trouvé
                </td>
              </tr>
            ) : (
              coursData?.data.map((c: Cours) => (
                <tr key={c.idCours} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{c.libelle}</td>
                  <td className="px-6 py-4">{c.classe?.libelle || "—"}</td>
                  <td className="px-6 py-4">
                    {c.enseignant?.personne 
                      ? `${c.enseignant.personne.prenom} ${c.enseignant.personne.nom}` 
                      : "—"}
                  </td>
                  <td className="px-6 py-4 font-medium">{c.coefficient ?? "—"}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-4">
                      <Link to={`/cours/${c.idCours}`} title="Voir détails">
                        <Eye size={20} className="text-blue-600 hover:text-blue-700" />
                      </Link>
                      <Link to={`/cours/${c.idCours}/modifier`} title="Modifier">
                        <Edit size={20} className="text-amber-600 hover:text-amber-700" />
                      </Link>
                      <button onClick={() => handleDelete(c.idCours)} title="Supprimer">
                        <Trash2 size={20} className="text-red-600 hover:text-red-700" />
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
      {coursData && coursData.last_page > 1 && (
        <div className="flex items-center justify-between mt-6 px-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>

          <span className="text-sm text-gray-600">
            Page <strong>{coursData.current_page}</strong> sur {coursData.last_page}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(coursData.last_page, p + 1))}
            disabled={page === coursData.last_page}
            className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}