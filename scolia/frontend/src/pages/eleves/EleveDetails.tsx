import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { authFetch } from "../../service/auth";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import ParentsSection from "./ParentsSection";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

interface EleveDetails {
  matricule: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: number;
  actif: number;
  photoURL?: string;
  langue?: string;
  // Tu peux ajouter d'autres champs retournés par ton API (ex: adresse, téléphone, etc.)
}

const SEXE_LABELS: Record<number, string> = {
  0: "Fille",
  1: "Garçon",
  2: "Autre",
};

export default function EleveDetails() {
  const { matricule } = useParams<{ matricule: string }>();
  const navigate = useNavigate();

  const [eleve, setEleve] = useState<EleveDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEleve = async () => {
      try {
        setLoading(true);
        const res = await authFetch(`${API}/eleves/${matricule}`);

        if (!res.ok) {
          if (res.status === 404) throw new Error("Élève non trouvé");
          throw new Error("Erreur lors du chargement");
        }

        const data = await res.json();
        setEleve(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (matricule) fetchEleve();
  }, [matricule]);

  const handleDelete = async () => {
    if (!confirm("Supprimer définitivement cet élève ? Cette action est irréversible.")) return;

    try {
      await authFetch(`${API}/eleves/${matricule}`, { method: "DELETE" });
      alert("Élève supprimé avec succès");
      navigate("/eleves");
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Chargement des informations...</div>;
  }

  if (error || !eleve) {
    return (
      <div className="p-10 text-center text-red-600">
        {error || "Élève non trouvé"}
        <br />
        <Link to="/eleves" className="text-blue-600 underline mt-4 inline-block">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/eleves"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          Retour à la liste
        </Link>
        <h1 className="text-3xl font-bold">Détails de l'élève</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-4xl font-bold text-gray-900">
                {eleve.nom} {eleve.prenom}
              </h2>
              <p className="text-xl text-gray-500 mt-1">Matricule : {eleve.matricule}</p>
            </div>
             <ParentsSection matricule={eleve.matricule} />
            <div className="flex gap-3">
              <Link
                to={`/eleves/${matricule}/modifier`}
                className="flex items-center gap-2 bg-amber-600 text-white px-5 py-3 rounded-xl hover:bg-amber-700 transition"
              >
                <Edit size={20} />
                Modifier
              </Link>

              <button
                onClick={handleDelete}
                className="flex items-center gap-2 bg-red-600 text-white px-5 py-3 rounded-xl hover:bg-red-700 transition"
              >
                <Trash2 size={20} />
                Supprimer
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500">Date de naissance</p>
                <p className="text-lg font-medium">
                  {new Date(eleve.dateNaissance).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Sexe</p>
                <p className="text-lg font-medium">{SEXE_LABELS[eleve.sexe]}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                    eleve.actif
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {eleve.actif ? "Actif" : "Archivé"}
                </span>
              </div>
            </div>

            {/* Tu peux ajouter d'autres informations ici plus tard */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Photo</p>
              {eleve.photoURL ? (
                <img
                  src={eleve.photoURL}
                  alt={`${eleve.nom} ${eleve.prenom}`}
                  className="w-48 h-48 object-cover rounded-2xl border"
                />
              ) : (
                <div className="w-48 h-48 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                  Pas de photo
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
 
}