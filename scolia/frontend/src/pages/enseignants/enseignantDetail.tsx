import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";

import { getEnseignant } from "../../service/enseignant_service";
import { getFichesByEnseignant } from "../../service/fiche_enseignant_service";

export default function EnseignantDetail() {
  const { idEnseignant } = useParams<{ idEnseignant: string }>();

  const [enseignant, setEnseignant] = useState<any>(null);
  const [fiches, setFiches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [enseignantData, fichesData] = await Promise.all([
          getEnseignant(idEnseignant!),
          getFichesByEnseignant(idEnseignant!)
        ]);

        setEnseignant(enseignantData);
        setFiches(fichesData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (idEnseignant) loadData();
  }, [idEnseignant]);

  if (loading) return <div className="p-10 text-center">Chargement...</div>;
  if (error) return <div className="p-10 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/enseignants" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
          Retour à la liste
        </Link>
        <h1 className="text-3xl font-bold">
          {enseignant?.personne?.prenom} {enseignant?.personne?.nom}
        </h1>
      </div>

      {/* Infos générales */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Informations Générales</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">Cours</p>
            <p className="font-medium">{enseignant?.cours?.libelle || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Statut</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm ${enseignant?.Actif ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
              {enseignant?.Actif ? "Actif" : "Inactif"}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Mobile</p>
            <p className="font-medium">{enseignant?.personne?.mobile}</p>
          </div>
        </div>
      </div>

      {/* Fiches de l'enseignant */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Fiches de l'enseignant</h2>
        <Link
  to={`/enseignants/${idEnseignant}/fiches/nouveau`}
  className="flex items-center gap-2 bg-[#1a3a5c] text-white px-4 py-2 rounded-xl hover:bg-[#16324f]"
>
  <Plus size={18} />
  Nouvelle Fiche
</Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left">Libellé</th>
              <th className="px-6 py-4 text-left">Date</th>
              <th className="px-6 py-4 text-left">Points</th>
              <th className="px-6 py-4 text-left">Commentaire</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {fiches.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500">
                  Aucune fiche enregistrée pour cet enseignant
                </td>
              </tr>
            ) : (
              fiches.map((f) => (
                <tr key={f.idRap} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{f.libelle}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(f.event_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 font-medium">{f.points}</td>
                  <td className="px-6 py-4 text-gray-600">{f.commentaire || "—"}</td>
                  <td className="px-6 py-4 text-center">
                    {/* Boutons d'actions (voir, modifier, supprimer) */}
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