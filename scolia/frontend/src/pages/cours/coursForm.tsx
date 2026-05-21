import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

import {
  getCoursById,
  createCours,
  updateCours,
  type CoursPayload,
} from "../../service/cours_service";

export default function CoursForm() {
  const { idCours } = useParams<{ idCours?: string }>();
  const navigate = useNavigate();
  const isEditing = !!idCours;

  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<CoursPayload>({
    libelle: "",
    coefficient: 1,
    description: "",
    idClasse: "",
    idAdmin: "1",
  });

  // Charger les classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'}/classes`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        setClasses(data.data ?? data);
      } catch (err) {
        console.error("Erreur chargement classes", err);
      }
    };
    fetchClasses();
  }, []);

  // Charger les données du cours en mode édition
  useEffect(() => {
    if (isEditing && idCours) {
      const fetchCours = async () => {
        try {
          setLoading(true);
          const cours = await getCoursById(idCours);
          setForm({
            libelle: cours.libelle,
            coefficient: cours.coefficient || 1,
            description: cours.description || "",
            idClasse: cours.idClasse,
            idAdmin: cours.idAdmin?.toString() || "1",
          });
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchCours();
    }
  }, [idCours, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (isEditing) {
        await updateCours(idCours!, form);
        alert("Cours modifié avec succès !");
      } else {
        await createCours(form);
        alert("Cours créé avec succès !");
      }
      navigate("/cours");
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === "idClasse" || name === "coefficient" ? Number(value) : value,
    }));
  };

  if (loading) return <div className="p-10 text-center">Chargement...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/cours"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          Retour à la liste
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? "Modifier le Cours" : "Nouveau Cours"}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Libellé du cours *
            </label>
            <input
              type="text"
              name="libelle"
              value={form.libelle}
              onChange={handleChange}
              required
              placeholder="ex: Mathématiques, Physique-Chimie..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coefficient *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                name="coefficient"
                value={form.coefficient}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classe *
              </label>
              <select
                name="idClasse"
                value={form.idClasse}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
              >
                <option value="">-- Sélectionner une classe --</option>
                {classes.map((c) => (
                  <option key={c.idClasse} value={c.idClasse}>
                    {c.libelle} {c.cycle?.libelle ? `— ${c.cycle.libelle}` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
              placeholder="Description du cours (optionnel)..."
            />
          </div>
        </div>

        <div className="mt-10 flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-[#1a3a5c] text-white py-4 rounded-xl font-semibold hover:bg-[#16324f] transition flex items-center justify-center gap-2 disabled:opacity-70"
          >
            <Save size={20} />
            {saving ? "Enregistrement..." : isEditing ? "Enregistrer les modifications" : "Créer le cours"}
          </button>

          <Link
            to="/cours"
            className="flex-1 border border-gray-300 text-gray-700 py-4 rounded-xl font-semibold text-center hover:bg-gray-50 transition"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}