import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2, UserX, UserCheck } from "lucide-react";

import { getEnseignant, desactiverEnseignant, reactiverEnseignant, deleteEnseignant, type Enseignant } from "../../service/enseignant_service";

export default function EnseignantDetail() {
  const { idEnseignant } = useParams<{ idEnseignant: string }>();
  const navigate = useNavigate();

  const [enseignant, setEnseignant] = useState<Enseignant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getEnseignant(idEnseignant!);
        setEnseignant(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (idEnseignant) fetchData();
  }, [idEnseignant]);

  const toggleStatut = async () => {
    if (!enseignant) return;
    try {
      if (enseignant.Actif === 1) {
        await desactiverEnseignant(enseignant.idEnseignant);
      } else {
        await reactiverEnseignant(enseignant.idEnseignant);
      }
      // Rafraîchir
      const updated = await getEnseignant(idEnseignant!);
      setEnseignant(updated);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer définitivement cet enseignant ?")) return;
    try {
      await deleteEnseignant(enseignant!.idEnseignant);
      alert("Enseignant supprimé");
      navigate("/enseignants");
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-10 text-center">Chargement...</div>;
  if (error || !enseignant) return <div className="p-10 text-red-600 text-center">{error || "Enseignant non trouvé"}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/enseignants" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
          Retour à la liste
        </Link>
        <h1 className="text-3xl font-bold">Détails Enseignant</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-4xl font-bold">
              {enseignant.personne.prenom} {enseignant.personne.nom}
            </h2>
            <p className="text-gray-500 mt-2">ID : {enseignant.idEnseignant}</p>
          </div>

          <div className="flex gap-3">
            <Link
              to={`/enseignants/${enseignant.idEnseignant}/modifier`}
              className="flex items-center gap-2 bg-amber-600 text-white px-5 py-3 rounded-xl hover:bg-amber-700"
            >
              <Edit size={20} />
              Modifier
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 bg-red-600 text-white px-5 py-3 rounded-xl hover:bg-red-700"
            >
              <Trash2 size={20} />
              Supprimer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500">Cours enseigné</p>
              <p className="text-lg font-medium">{enseignant.cours?.libelle || "Non assigné"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Classe</p>
              <p className="text-lg font-medium">{enseignant.cours?.classe?.libelle || "—"}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500">Téléphone</p>
              <p className="text-lg font-medium">{enseignant.personne.mobile}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Statut</p>
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${enseignant.Actif ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                {enseignant.Actif ? "Actif" : "Inactif"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}