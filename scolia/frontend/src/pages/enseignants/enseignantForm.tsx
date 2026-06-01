import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

import {
  getEnseignant,
  createEnseignant,
  updateEnseignant,
} from "../../service/enseignant_service";

import { getCours, type Cours } from "../../service/cours_service";

// 1. Déclaration de l'interface pour typer le formulaire
// Cela permet à TypeScript de connaître exactement la structure attendue
interface EnseignantFormState {
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  mobile: string;
  phone: string;
  username: string;
  password: string;
  idCours: string;
  idAdmin: string;
  idPers?: string; // Le "?" rend cette propriété optionnelle
}

export default function EnseignantForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  // 2. Utilisation de l'interface dans le useState
  const [form, setForm] = useState<EnseignantFormState>({
    nom: "",
    prenom: "",
    dateNaissance: "",
    lieuNaissance: "",
    mobile: "",
    phone: "",
    username: "",
    password: "",
    idCours: "",
    idAdmin: "1",
    idPers: "",
  });

  const [cours, setCours] = useState<Cours[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Charger les cours
  useEffect(() => {
    const loadCours = async () => {
      try {
        const data = await getCours({ paginate: "false" });
        setCours(Array.isArray(data) ? data : data.data ?? []);
      } catch (err) {
        console.error("Erreur chargement des cours :", err);
      }
    };
    loadCours();
  }, []);

  // Charger en mode édition
  useEffect(() => {
    if (!isEdit || !id) return;

    const loadEnseignant = async () => {
      try {
        setLoading(true);
        const data = await getEnseignant(id);

        setForm({
          nom: data.personne?.nom || "",
          prenom: data.personne?.prenom || "",
          dateNaissance: data.personne?.dateNaissance?.split("T")[0] || "",
          lieuNaissance: data.personne?.lieuNaissance || "",
          mobile: data.personne?.mobile || "",
          phone: data.personne?.phone || "",
          username: data.personne?.username || "",
          password: "",
          idCours: data.idCours?.toString() || "",
          idAdmin: "1",
          idPers: data.idPers?.toString() || "",
        });
      } catch (err) {
        setError("Impossible de charger les informations de l'enseignant");
      } finally {
        setLoading(false);
      }
    };

    loadEnseignant();
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = { ...form };
      
      // L'erreur TypeScript a disparu ici car idPers est défini comme optionnel dans l'interface
      if (!isEdit) delete payload.idPers; 

      if (isEdit && id) {
        await updateEnseignant(id, payload);
        alert("Enseignant modifié avec succès !");
      } else {
        await createEnseignant(payload);
        alert("Enseignant créé avec succès !");
      }

      navigate("/enseignants");
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Chargement des données...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/enseignants" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
          Retour à la liste
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? "Modifier l'Enseignant" : "Nouvel Enseignant"}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
            <input
              type="text"
              name="prenom"
              value={form.prenom}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
            <input
              type="text"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
            <input
              type="date"
              name="dateNaissance"
              value={form.dateNaissance}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lieu de naissance</label>
            <input
              type="text"
              name="lieuNaissance"
              value={form.lieuNaissance}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mobile *</label>
            <input
              type="text"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cours enseigné *</label>
            <select
              name="idCours"
              value={form.idCours}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            >
              <option value="">Sélectionner un cours</option>
              {cours.map((c) => (
                <option key={c.idCours} value={c.idCours}>
                  {c.libelle} {c.classe?.libelle ? `(${c.classe.libelle})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom d'utilisateur *</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            />
          </div>

          {!isEdit && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
              />
            </div>
          )}
        </div>

        <div className="mt-10 flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-[#1a3a5c] text-white py-4 rounded-xl font-semibold hover:bg-[#16324f] transition flex items-center justify-center gap-2 disabled:opacity-70"
          >
            <Save size={20} />
            {saving
              ? "Enregistrement..."
              : isEdit
              ? "Enregistrer les modifications"
              : "Créer l'enseignant"}
          </button>

          <Link
            to="/enseignants"
            className="flex-1 border border-gray-300 text-gray-700 py-4 rounded-xl font-semibold text-center hover:bg-gray-50 transition flex items-center justify-center"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}