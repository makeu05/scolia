import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, User } from "lucide-react";
import { authFetch } from "../../service/auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

interface VilleNaissance {
  idVille: number;
  libelle: string;
}

interface FormDataType {
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
  const [error, setError] = useState('');
  const [villes, setVilles] = useState<VilleNaissance[]>([]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoActuelle, setPhotoActuelle] = useState<string | null>(null);

  const [form, setForm] = useState<FormDataType>({
    nom: '',
    prenom: '',
    dateNaissance: '',
    lieuNaissance: '',
    sexe: '1',
    langue: 'fr',
    idVilleNaissance: '',
    idAdmin: '1',
  });

  /* ─── Chargement villes ─── */
 // ✅ CORRECT — se déclenche une seule fois
useEffect(() => {
  authFetch(`${API}/villes`)
    .then(r => r.json())
    .then(data => {
      const liste = Array.isArray(data) ? data : (data.data ?? []);
      setVilles(liste);
    })
    .catch(() => setVilles([]));
}, []); // ← tableau vide OBLIGATOIRE

  /* ─── Chargement élève en mode édition ─── */
  useEffect(() => {
    if (!isEditing) return;
    setLoading(true);

    authFetch(`${API}/eleves/${matricule}`)
      .then(r => r.json())
      .then(data => {
        setForm({
          nom: data.nom ?? '',
          prenom: data.prenom ?? '',
          dateNaissance: data.dateNaissance?.split('T')[0] ?? '',
          lieuNaissance: data.lieuNaissance ?? '',
          sexe: String(data.sexe ?? '1'),
          langue: data.langue ?? 'fr',
          idVilleNaissance: String(data.idVilleNaissance ?? ''),
          idAdmin: String(data.idAdmin ?? '1'),
        });

        if (data.photoURL && data.photoURL !== 'INDEFINI') {
          setPhotoActuelle(
            data.photoURL.startsWith('http')
              ? data.photoURL
              : `http://localhost:8000${data.photoURL}`
          );
        }
      })
      .catch(() => setError('Erreur lors du chargement de l\'élève'))
      .finally(() => setLoading(false));
  }, [matricule, isEditing]);

  function update(field: keyof FormDataType, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([k, v]) => {
        formData.append(k, String(v));
      });

      if (photo) formData.append('photo', photo);
      if (isEditing) formData.append('_method', 'PUT');

      const url = isEditing
        ? `${API}/eleves/${matricule}`
        : `${API}/eleves`;

      const res = await authFetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Erreur lors de l\'enregistrement');
      }

      navigate('/eleves');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="p-10 text-center text-gray-500">Chargement de l'élève...</div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/eleves" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
          Retour à la liste
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? "Modifier l'élève" : "Nouvel Élève"}
        </h1>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        
        {/* Photo */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">Photo de l'élève</label>
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 rounded-2xl border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50">
              {photoPreview ? (
                <img src={photoPreview} alt="Prévisualisation" className="w-full h-full object-cover" />
              ) : photoActuelle ? (
                <img src={photoActuelle} alt="Photo actuelle" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300">
                  👤
                </div>
              )}
            </div>

            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer inline-block bg-gray-100 hover:bg-gray-200 px-5 py-3 rounded-xl text-sm transition"
              >
                {photoActuelle ? 'Changer la photo' : 'Choisir une photo'}
              </label>
              {photo && <p className="text-xs text-gray-500 mt-2">{photo.name}</p>}
            </div>
          </div>
        </div>

        {/* Nom + Prénom */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
            <input
              type="text"
              required
              value={form.nom}
              onChange={e => update('nom', e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c] uppercase"
              placeholder="ex: FOUDA"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
            <input
              type="text"
              required
              value={form.prenom}
              onChange={e => update('prenom', e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
              placeholder="ex: Jean Claude"
            />
          </div>
        </div>

        {/* Date + Lieu de naissance */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance *</label>
            <input
              type="date"
              required
              value={form.dateNaissance}
              onChange={e => update('dateNaissance', e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lieu de naissance *</label>
            <input
              type="text"
              required
              value={form.lieuNaissance}
              onChange={e => update('lieuNaissance', e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
              placeholder="Yaoundé"
            />
          </div>
        </div>

        {/* Ville de naissance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ville de naissance *</label>
          <select
            required
            value={form.idVilleNaissance}
            onChange={e => update('idVilleNaissance', e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
          >
            <option value="">Sélectionner une ville</option>
            {villes.map(v => (
              <option key={v.idVille} value={v.idVille}>{v.libelle}</option>
            ))}
          </select>
        </div>

        {/* Sexe + Langue */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sexe *</label>
            <select
              value={form.sexe}
              onChange={e => update('sexe', e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            >
              <option value="1">Garçon</option>
              <option value="0">Fille</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Langue principale</label>
            <select
              value={form.langue}
              onChange={e => update('langue', e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            >
              <option value="fr">Français</option>
              <option value="en">Anglais</option>
              <option value="bi">Bilingue</option>
            </select>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-4 mt-10">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-[#1a3a5c] text-white py-4 rounded-xl font-semibold hover:bg-[#16324f] transition flex items-center justify-center gap-2 disabled:opacity-70"
          >
            <Save size={20} />
            {saving ? 'Enregistrement...' : isEditing ? "Mettre à jour l'élève" : "Créer l'élève"}
          </button>

          <Link
            to="/eleves"
            className="flex-1 border border-gray-300 py-4 rounded-xl font-semibold text-center hover:bg-gray-50 transition"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}