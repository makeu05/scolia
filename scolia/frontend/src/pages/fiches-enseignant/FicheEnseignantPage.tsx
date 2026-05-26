import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";

import {
  getFichesEnseignant,
  deleteFicheEnseignant,
  type FicheEnseignant,
} from "../../service/fiche_enseignant_service";

export default function FicheEnseignantPage() {
  const [fiches, setFiches] = useState<FicheEnseignant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFiches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFichesEnseignant();
      setFiches(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiches();
  }, [fetchFiches]);

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette fiche ?")) return;
    try {
      await deleteFicheEnseignant(id);
      fetchFiches();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fiches Enseignants</h1>
          <p className="text-gray-500 mt-1">{fiches.length} fiche(s)</p>
        </div>

        <Link
          to="/fiches-enseignant/nouveau"
          className="flex items-center gap-2 bg-[#1a3a5c] text-white px-5 py-3 rounded-xl hover:bg-[#16324f]"
        >
          <Plus size={20} />
          Nouvelle Fiche
        </Link>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6">{error}</div>}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left">Enseignant</th>
              <th className="px-6 py-4 text-left">Libellé</th>
              <th className="px-6 py-4 text-left">Date</th>
              <th className="px-6 py-4 text-left">Points</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12">Chargement...</td></tr>
            ) : fiches.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12">Aucune fiche trouvée</td></tr>
            ) : (
              fiches.map((f) => (
                <tr key={f.idRap} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {f.enseignant?.personne?.prenom} {f.enseignant?.personne?.nom}
                  </td>
                  <td className="px-6 py-4 font-medium">{f.libelle}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(f.event_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 font-medium">{f.points}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-4">
                      <Link to={`/fiches-enseignant/${f.idRap}`}>
                        <Eye size={20} className="text-blue-600 hover:text-blue-700" />
                      </Link>
                      <Link to={`/fiches-enseignant/${f.idRap}/modifier`}>
                        <Edit size={20} className="text-amber-600 hover:text-amber-700" />
                      </Link>
                      <button onClick={() => handleDelete(f.idRap)}>
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
    </div>
  );
}