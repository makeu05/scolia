import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";

import { getCoursById, deleteCours, type Cours } from "../../service/cours_service";

export default function CoursDetail() {
  const { idCours } = useParams<{ idCours: string }>();
  const navigate = useNavigate();

  const [cours, setCours] = useState<Cours | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCours = async () => {
      try {
        setLoading(true);
        if (!idCours) return;
        const data = await getCoursById(idCours);
        setCours(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCours();
  }, [idCours]);

  const handleDelete = async () => {
    if (!confirm("Supprimer ce cours définitivement ?")) return;
    try {
      await deleteCours(idCours!);
      alert("Cours supprimé avec succès");
      navigate("/cours");
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression");
    }
  };

  if (loading) return <div className="p-10 text-center">Chargement du cours...</div>;
  if (error || !cours) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-600">{error || "Cours non trouvé"}</p>
        <Link to="/cours" className="text-blue-600 underline mt-4 inline-block">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/cours" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
          Retour à la liste
        </Link>
        <h1 className="text-3xl font-bold">Détails du Cours</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-4xl font-bold text-gray-900">{cours.libelle}</h2>
            <p className="text-xl text-gray-500 mt-2">ID : {cours.idCours}</p>
          </div>

          <div className="flex gap-3">
            <Link
              to={`/cours/${cours.idCours}/modifier`}
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
              <p className="text-sm text-gray-500">Classe</p>
              <p className="text-lg font-medium">{cours.classe?.libelle || "—"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Enseignant</p>
              <p className="text-lg font-medium">
                {cours.enseignant?.personne 
                  ? `${cours.enseignant.personne.prenom} ${cours.enseignant.personne.nom}` 
                  : "Non assigné"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Coefficient</p>
              <p className="text-lg font-medium">{cours.coefficient ?? "—"}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500">Note maximale</p>
              <p className="text-lg font-medium">{cours.note ?? "—"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Statut</p>
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${cours.actif ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                {cours.actif ? "Actif" : "Inactif"}
              </span>
            </div>

            {cours.description && (
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-gray-700 mt-1">{cours.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}