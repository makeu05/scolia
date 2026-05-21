import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Eye, Edit, Trash2, UserPlus } from "lucide-react";

import {
  getEleves,
  archiverEleve,
  reactiverEleve,
  deleteEleve,
 type Eleve,
  type ElevePaginate,
  type EleveFilters,
  getSexeLabel,
} from "../../service/eleve_service";

export default function ElevesList() {
  const [eleves, setEleves] = useState<ElevePaginate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [actif, setActif] = useState("");
  const [page, setPage] = useState(1);

  const fetchEleves = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: EleveFilters = {
        page,
        search: search.trim() || undefined,
        actif: actif || undefined,
      };

      const data = await getEleves(filters);
      setEleves(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Impossible de charger les élèves");
      setEleves(null);
    } finally {
      setLoading(false);
    }
  }, [search, actif, page]);

  useEffect(() => {
    fetchEleves();
  }, [fetchEleves]);

  // ==================== ACTIONS ====================

  const handleArchiver = async (matricule: number) => {
    if (!confirm("Voulez-vous vraiment archiver cet élève ?")) return;
    try {
      await archiverEleve(matricule);
      fetchEleves();
    } catch (err: any) {
      alert(err.message || "Erreur lors de l'archivage");
    }
  };

  const handleReactiver = async (matricule: number) => {
    try {
      await reactiverEleve(matricule);
      fetchEleves();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la réactivation");
    }
  };

  const handleSupprimer = async (matricule: number) => {
    if (!confirm("⚠️ SUPPRIMER définitivement cet élève ?\nCette action est irréversible !")) return;
    try {
      await deleteEleve(matricule);
      alert("Élève supprimé avec succès");
      fetchEleves();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Élèves</h1>
          <p className="text-sm text-gray-500 mt-1">
            {eleves ? `${eleves.total} élèves au total` : "Chargement..."}
          </p>
        </div>

        <Link
          to="/eleves/nouveau"
          className="flex items-center gap-2 bg-[#1a3a5c] text-white px-5 py-3 rounded-xl hover:bg-[#16324f] transition-colors"
        >
          <UserPlus size={20} />
          Nouvel Élève
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Rechercher par nom, prénom ou matricule..."
          className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#1a3a5c] w-full md:w-80"
        />

        <select
          value={actif}
          onChange={(e) => { setActif(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#1a3a5c]"
        >
          <option value="">Tous les statuts</option>
          <option value="1">Actifs</option>
          <option value="0">Archivés</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left">Matricule</th>
              <th className="px-6 py-4 text-left">Nom complet</th>
              <th className="px-6 py-4 text-left">Date de naissance</th>
              <th className="px-6 py-4 text-left">Lieu de naissance</th>
              <th className="px-6 py-4 text-left">Sexe</th>
              <th className="px-6 py-4 text-left">Statut</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">Chargement...</td></tr>
            ) : !eleves || eleves.data.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">Aucun élève trouvé</td></tr>
            ) : (
              eleves.data.map((e: Eleve) => (
                <tr key={e.matricule} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{e.matricule}</td>
                  <td className="px-6 py-4 font-medium">{e.prenom} {e.nom}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(e.dateNaissance).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {e.villeNaissance?.libelle || e.lieuNaissance}
                  </td>
                  <td className="px-6 py-4">{getSexeLabel(e.sexe)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${e.actif ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                      {e.actif ? "Actif" : "Archivé"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-4">
                      <Link to={`/eleves/${e.matricule}`} title="Voir détails">
                        <Eye size={20} className="text-blue-600 hover:text-blue-700" />
                      </Link>

                      <Link to={`/eleves/${e.matricule}/modifier`} title="Modifier">
                        <Edit size={20} className="text-amber-600 hover:text-amber-700" />
                      </Link>

                      <button onClick={() => handleSupprimer(e.matricule)} title="Supprimer">
                        <Trash2 size={20} className="text-red-600 hover:text-red-700" />
                      </button>

                      {e.actif ? (
                        <button
                          onClick={() => handleArchiver(e.matricule)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Archiver
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactiver(e.matricule)}
                          className="text-xs text-emerald-600 hover:underline"
                        >
                          Réactiver
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {eleves && eleves.last_page > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-5 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Précédent
          </button>

          <span className="text-sm text-gray-600">
            Page <strong>{eleves.current_page}</strong> / {eleves.last_page}
          </span>

          <button
            onClick={() => setPage(p => Math.min(eleves.last_page, p + 1))}
            disabled={page === eleves.last_page}
            className="px-5 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}