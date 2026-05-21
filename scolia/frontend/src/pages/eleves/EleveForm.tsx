import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { authFetch } from "../../service/auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

interface VilleNaissance {
  idVille: number;
  libelle: string;
}

interface FormDataType {
  matricule: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  sexe: string;
  langue: string;
  idVilleNaissance: string;
  idAdmin: string;
}

export default function EleveForm() {
  const { matricule } = useParams();
  const navigate = useNavigate();

  const isEditing = !!matricule;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [villes, setVilles] = useState<VilleNaissance[]>([]);

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [form, setForm] = useState<FormDataType>({
    matricule: "",
    nom: "",
    prenom: "",
    dateNaissance: "",
    lieuNaissance: "",
    sexe: "1",
    langue: "fr",
    idVilleNaissance: "",
    idAdmin: "1",
  });

  // ─── Load villes ─────────────────────────────
  useEffect(() => {
    authFetch(`${API}/villes`)
      .then((r) => r.json())
      .then(setVilles)
      .catch(() => {});
  }, []);

  // ─── Load eleve si edit ──────────────────────
  useEffect(() => {
    if (!isEditing) return;

    setLoading(true);

    authFetch(`${API}/eleves/${matricule}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          matricule: data.matricule ?? "",
          nom: data.nom ?? "",
          prenom: data.prenom ?? "",
          dateNaissance: data.dateNaissance?.split("T")[0] ?? "",
          lieuNaissance: data.lieuNaissance ?? "",
          sexe: String(data.sexe ?? "1"),
          langue: data.langue ?? "fr",
          idVilleNaissance: String(data.idVilleNaissance ?? ""),
          idAdmin: String(data.idAdmin ?? "1"),
        });
      })
      .catch(() => setError("Erreur chargement élève"))
      .finally(() => setLoading(false));
  }, [matricule, isEditing]);

  function update(field: keyof FormDataType, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  // ─── Submit ─────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([k, v]) => {
        formData.append(k, String(v));
      });

      if (photo) formData.append("photo", photo);

      const url = isEditing
        ? `${API}/eleves/${matricule}`
        : `${API}/eleves`;

      const method = isEditing ? "POST" : "POST"; 
      if (isEditing) formData.append("_method", "PUT");

      const res = await authFetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Erreur");
      }

      navigate("/eleves");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-10 text-center">Chargement...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/eleves" className="text-gray-600 hover:text-black">
          ← Retour
        </Link>
        <h1 className="text-2xl font-bold">
          {isEditing ? "Modifier élève" : "Nouvel élève"}
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* PHOTO */}
        <div>
          <input type="file" accept="image/*" onChange={handlePhoto} />
          {photoPreview && (
            <img src={photoPreview} className="w-24 h-24 rounded-full mt-2" />
          )}
        </div>

        {/* FORM */}
        <input
          placeholder="Matricule"
          value={form.matricule}
          onChange={(e) => update("matricule", e.target.value)}
          className="border p-2 w-full"
        />

        <input
          placeholder="Nom"
          value={form.nom}
          onChange={(e) => update("nom", e.target.value)}
          className="border p-2 w-full"
        />

        <input
          placeholder="Prénom"
          value={form.prenom}
          onChange={(e) => update("prenom", e.target.value)}
          className="border p-2 w-full"
        />

        <input
          type="date"
          value={form.dateNaissance}
          onChange={(e) => update("dateNaissance", e.target.value)}
          className="border p-2 w-full"
        />

        <input
          placeholder="Lieu naissance"
          value={form.lieuNaissance}
          onChange={(e) => update("lieuNaissance", e.target.value)}
          className="border p-2 w-full"
        />

        {/* VILLES */}
        <select
          value={form.idVilleNaissance}
          onChange={(e) => update("idVilleNaissance", e.target.value)}
          className="border p-2 w-full"
        >
          <option value="">Ville</option>
          {villes.map((v) => (
            <option key={v.idVille} value={v.idVille}>
              {v.libelle}
            </option>
          ))}
        </select>

        <button
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}