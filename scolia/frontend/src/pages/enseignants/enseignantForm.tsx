import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

import { getCours } from "../../service/cours_service"; // ← On importe pour charger les cours
import { getEnseignant } from "../../service/enseignant_service";

export default function EnseignantForm() {
  const { idEnseignant } = useParams<{ idEnseignant?: string }>();
  const navigate = useNavigate();
  const isEditing = !!idEnseignant;

  const [coursList, setCoursList] = useState<any[]>([]);
  const [loadingCours, setLoadingCours] = useState(false);

  const [form, setForm] = useState({
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
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Charger la liste des cours
  useEffect(() => {
    const fetchCours = async () => {
      setLoadingCours(true);
      try {
        const data = await getCours({ paginate: 'false' }); // ou sans pagination
        setCoursList(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("Erreur chargement cours", err);
      } finally {
        setLoadingCours(false);
      }
    };
    fetchCours();
  }, []);

  // Charger données en mode édition
  useEffect(() => {

  async function loadEnseignant() {

    try {

      setLoading(true);

      const data = await getEnseignant(
        idEnseignant!
      );

      setForm({
        nom:
          data.personne?.nom ?? "",

        prenom:
          data.personne?.prenom ?? "",

        mobile:
          data.personne?.mobile ?? "",

        phone:
          data.personne?.phone ?? "",

        username:
          data.personne?.username ?? "",

        dateNaissance:
          data.personne?.dateNaissance ?? "",

        lieuNaissance:
          data.personne?.lieuNaissance ?? "",

        idCours:
          String(data.idCours ?? ""),
        
        password: "",

        idAdmin: "1",
      });

    } catch (err: any) {

      setError(
        err.message ||
        "Erreur chargement enseignant"
      );

    } finally {

      setLoading(false);

    }
  }

  if (isEditing && idEnseignant) {
    loadEnseignant();
  }

}, [idEnseignant, isEditing]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
      const url = isEditing 
        ? `${API}/enseignants/${idEnseignant}` 
        : `${API}/enseignants`;

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Erreur lors de l'opération");

      alert(isEditing ? "Enseignant modifié avec succès" : "Enseignant créé avec succès");
      navigate("/enseignants");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/enseignants" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
          Retour
        </Link>
        <h1 className="text-3xl font-bold">
          {isEditing ? "Modifier l'Enseignant" : "Nouvel Enseignant"}
        </h1>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Prénom *</label>
            <input type="text" name="prenom" value={form.prenom} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Nom *</label>
            <input type="text" name="nom" value={form.nom} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3" />
          </div>

          {/* Cours enseigné - Version améliorée */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Cours enseigné *</label>
            <select
              name="idCours"
              value={form.idCours}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            >
              <option value="">-- Sélectionner un cours --</option>
              {loadingCours ? (
                <option disabled>Chargement des cours...</option>
              ) : (
                coursList.map((c) => (
                  <option key={c.idCours} value={c.idCours}>
                    {c.libelle} {c.classe?.libelle ? `(${c.classe.libelle})` : ""}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mobile *</label>
            <input type="text" name="mobile" value={form.mobile} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Username *</label>
            <input type="text" name="username" value={form.username} onChange={handleChange} required className="w-full border border-gray-300 rounded-xl px-4 py-3" />
          </div>
        </div>

        <div className="mt-10 flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-[#1a3a5c] text-white py-4 rounded-xl font-semibold hover:bg-[#16324f] transition flex items-center justify-center gap-2 disabled:opacity-70"
          >
            <Save size={20} />
            {saving ? "Enregistrement..." : isEditing ? "Enregistrer les modifications" : "Créer l'enseignant"}
          </button>

          <Link
            to="/enseignants"
            className="flex-1 border border-gray-300 text-gray-700 py-4 rounded-xl font-semibold text-center hover:bg-gray-50 transition"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}