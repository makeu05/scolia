import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, Upload, User } from "lucide-react";
import { authFetch } from "../../service/auth";
import PageLayout from "../../components/layout/PageLayout";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

interface VilleNaissance { idVille: number; libelle: string; }
interface FormData {
  nom: string; prenom: string; dateNaissance: string;
  lieuNaissance: string; sexe: string; langue: string;
  idVilleNaissance: string; idAdmin: string;
}

export default function EleveForm() {
  const { matricule } = useParams();
  const navigate      = useNavigate();
  const isEditing     = !!matricule;

  const [loading, setLoading]         = useState(false);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");
  const [villes, setVilles]           = useState<VilleNaissance[]>([]);
  const [photo, setPhoto]             = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoActuelle, setPhotoActuelle] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    nom: "", prenom: "", dateNaissance: "", lieuNaissance: "",
    sexe: "1", langue: "Français", idVilleNaissance: "", idAdmin: "1",
  });

  useEffect(() => {
    authFetch(`${API}/villes`).then(r => r.json()).then(data => {
      setVilles(Array.isArray(data) ? data : (data.data ?? []));
    }).catch(() => setVilles([]));
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    setLoading(true);
    authFetch(`${API}/eleves/${matricule}`).then(r => r.json()).then(data => {
      setForm({
        nom: data.nom ?? "", prenom: data.prenom ?? "",
        dateNaissance: data.dateNaissance?.split("T")[0] ?? "",
        lieuNaissance: data.lieuNaissance ?? "",
        sexe: String(data.sexe ?? "1"),
        langue: data.langue ?? "Français",
        idVilleNaissance: String(data.idVilleNaissance ?? ""),
        idAdmin: String(data.idAdmin ?? "1"),
      });
      if (data.photoURL && data.photoURL !== "INDEFINI") {
        setPhotoActuelle(
          data.photoURL.startsWith("http")
            ? data.photoURL
            : `http://localhost:8000/storage/${data.photoURL}`
        );
      }
    }).catch(() => setError("Erreur lors du chargement"))
      .finally(() => setLoading(false));
  }, [matricule, isEditing]);

  const update = (field: keyof FormData, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (photo) fd.append("photo", photo);
      if (isEditing) fd.append("_method", "PUT");

      const res = await authFetch(
        isEditing ? `${API}/eleves/${matricule}` : `${API}/eleves`,
        { method: "POST", body: fd }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Erreur lors de l'enregistrement");
      }
      navigate("/eleves");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="space-y-3 w-full max-w-md px-6">
        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <PageLayout
      title={isEditing ? "Modifier l'élève" : "Nouvel élève"}
      subtitle={isEditing ? `Matricule ${matricule}` : "Remplissez les informations de l'élève"}
      backTo="/eleves"
    >
      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Colonne gauche — photo */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24">
            <h3 className="section-title mb-4">Photo</h3>

            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center relative group">
                {photoPreview || photoActuelle ? (
                  <img
                    src={photoPreview ?? photoActuelle!}
                    alt="Photo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <User className="w-8 h-8" />
                    <span className="text-xs">Aucune photo</span>
                  </div>
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="btn-secondary cursor-pointer text-sm gap-2 w-full justify-center"
              >
                <Upload className="w-4 h-4" />
                {photoActuelle ? "Changer la photo" : "Choisir une photo"}
              </label>
              {photo && (
                <p className="text-xs text-slate-400 text-center truncate max-w-full">
                  {photo.name}
                </p>
              )}
            </div>

            <div className="mt-5 pt-5 border-t border-slate-100 space-y-2.5">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Statut</p>
              <div className="flex gap-2">
                {[
                  { value: "1", label: "Garçon", color: "bg-blue-50 text-blue-700 border-blue-200" },
                  { value: "0", label: "Fille",   color: "bg-pink-50 text-pink-700 border-pink-200" },
                ].map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => update("sexe", s.value)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                      form.sexe === s.value ? s.color : "bg-white border-slate-200 text-slate-500"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite — formulaire */}
        <div className="lg:col-span-2 space-y-5">

          {/* Identité */}
          <div className="card p-5">
            <h3 className="section-title mb-4">Identité</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Nom *</label>
                <input
                  required value={form.nom}
                  onChange={e => update("nom", e.target.value.toUpperCase())}
                  placeholder="FOUDA"
                  className="input uppercase"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Prénom *</label>
                <input
                  required value={form.prenom}
                  onChange={e => update("prenom", e.target.value)}
                  placeholder="Jean Claude"
                  className="input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Date de naissance *</label>
                <input
                  type="date" required value={form.dateNaissance}
                  onChange={e => update("dateNaissance", e.target.value)}
                  className="input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Lieu de naissance *</label>
                <input
                  required value={form.lieuNaissance}
                  onChange={e => update("lieuNaissance", e.target.value)}
                  placeholder="Yaoundé"
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Origine */}
          <div className="card p-5">
            <h3 className="section-title mb-4">Origine & Langue</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Ville de naissance *</label>
                <select
                  required value={form.idVilleNaissance}
                  onChange={e => update("idVilleNaissance", e.target.value)}
                  className="input appearance-none"
                >
                  <option value="">Sélectionner une ville</option>
                  {villes.map(v => (
                    <option key={v.idVille} value={v.idVille}>{v.libelle}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Langue principale</label>
                <select
                  value={form.langue}
                  onChange={e => update("langue", e.target.value)}
                  className="input appearance-none"
                >
                  <option value="Français">Français</option>
                  <option value="Anglais">Anglais</option>
                  <option value="Bilingue">Bilingue</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 justify-center py-3 disabled:opacity-60"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enregistrement…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {isEditing ? "Enregistrer les modifications" : "Créer l'élève"}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/eleves")}
              className="btn-secondary px-6"
            >
              Annuler
            </button>
          </div>
        </div>
      </form>
    </PageLayout>
  );
}