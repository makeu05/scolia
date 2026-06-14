import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, User, Phone } from "lucide-react";
import { authFetch } from "../../service/auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
const SERVER = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:8000';

const SITUATIONS = [
  { value: 'deux_parents',   label: 'Deux parents'     },
  { value: 'pere_seul',      label: 'Père seul'        },
  { value: 'mere_seule',     label: 'Mère seule'       },
  { value: 'orphelin_pere',  label: 'Orphelin de père' },
  { value: 'orphelin_mere',  label: 'Orphelin de mère' },
  { value: 'orphelin_total', label: 'Orphelin total'   },
  { value: 'tuteur',         label: 'Sous tutelle'     },
  { value: 'autre',          label: 'Autre'            },
];

type Section = 'base' | 'famille' | 'urgence' | 'tuteur';

const SECTIONS = [
  { id: 'base',    label: 'Informations de base', required: true  },
  { id: 'famille', label: 'Situation familiale',  required: false },
  { id: 'urgence', label: "Contact d'urgence",    required: false },
  { id: 'tuteur',  label: 'Tuteur légal',         required: false },
] as const;

export default function EleveForm() {
  const { matricule } = useParams();
  const navigate      = useNavigate();
  const isEditing     = !!matricule;

  const [loading, setLoading]           = useState(false);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState('');
  const [photo, setPhoto]               = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoActuelle, setPhotoActuelle] = useState<string | null>(null);
  const [section, setSection]           = useState<Section>('base');

  const [form, setForm] = useState({
    nom: '', prenom: '', dateNaissance: '', lieuNaissance: '',
    sexe: '1', langue: 'fr', idAdmin: '1',
    religion: '', situation_familiale: '',
    contact_urgence_nom: '', contact_urgence_tel: '', contact_urgence_lien: '',
    tuteur_nom: '', tuteur_tel: '', tuteur_profession: '',
  });

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  useEffect(() => {
    if (!isEditing) return;
    setLoading(true);
    authFetch(`${API}/eleves/${matricule}`)
      .then(r => r.json())
      .then(data => {
        setForm({
          nom:                    data.nom              ?? '',
          prenom:                 data.prenom           ?? '',
          dateNaissance:          data.dateNaissance?.split('T')[0] ?? '',
          lieuNaissance:          data.lieuNaissance    ?? '',
          sexe:                   String(data.sexe      ?? '1'),
          langue:                 data.langue           ?? 'fr',
          idAdmin:                String(data.idAdmin   ?? '1'),
          religion:               data.religion               ?? '',
          situation_familiale:    data.situation_familiale    ?? '',
          contact_urgence_nom:    data.contact_urgence_nom    ?? '',
          contact_urgence_tel:    data.contact_urgence_tel    ?? '',
          contact_urgence_lien:   data.contact_urgence_lien   ?? '',
          tuteur_nom:             data.tuteur_nom             ?? '',
          tuteur_tel:             data.tuteur_tel             ?? '',
          tuteur_profession:      data.tuteur_profession      ?? '',
        });
        if (data.photoURL && data.photoURL !== 'INDEFINI') {
          setPhotoActuelle(
            data.photoURL.startsWith('http')
              ? data.photoURL
              : `${SERVER}/storage/${data.photoURL}`
          );
        }
      })
      .catch(() => setError("Erreur lors du chargement de l'élève"))
      .finally(() => setLoading(false));
  }, [matricule, isEditing]);

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
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (isEditing) {
          fd.append(k, v);
        } else {
          if (v !== '') fd.append(k, v);
        }
      });
      if (photo) fd.append('photo', photo);
      if (isEditing) fd.append('_method', 'PUT');

      const res = await authFetch(
        isEditing ? `${API}/eleves/${matricule}` : `${API}/eleves`,
        { method: 'POST', body: fd }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? "Erreur lors de l'enregistrement");
      }
      navigate('/eleves');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-10 text-center text-gray-500">Chargement...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/eleves" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} /> Retour à la liste
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? "Modifier l'élève" : "Nouvel élève"}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6">
          {error}
        </div>
      )}

      {/* Navigation sections */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl mb-6 flex-wrap">
        {SECTIONS.map(s => (
          <button key={s.id} type="button" onClick={() => setSection(s.id)}
            className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              section === s.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {s.label}
            {s.required && <span className="text-red-400 ml-1">*</span>}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── SECTION BASE ── */}
        {section === 'base' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Photo de l'élève</label>
              <div className="flex items-center gap-6">
                <div className="w-28 h-28 rounded-2xl border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-50">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Prévisualisation" className="w-full h-full object-cover" />
                  ) : photoActuelle ? (
                    <img src={photoActuelle} alt="Photo actuelle" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <div>
                  <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" id="photo-upload" />
                  <label htmlFor="photo-upload"
                    className="cursor-pointer inline-block bg-gray-100 hover:bg-gray-200 px-5 py-3 rounded-xl text-sm transition">
                    {photoActuelle ? 'Changer la photo' : 'Choisir une photo'}
                  </label>
                  {photo && <p className="text-xs text-gray-500 mt-2">{photo.name}</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                <input required type="text" value={form.nom}
                  onChange={e => update('nom', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 uppercase"
                  placeholder="FOUDA" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                <input required type="text" value={form.prenom}
                  onChange={e => update('prenom', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                  placeholder="Jean Claude" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance *</label>
                <input required type="date" value={form.dateNaissance}
                  onChange={e => update('dateNaissance', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lieu de naissance *</label>
                <input required type="text" value={form.lieuNaissance}
                  onChange={e => update('lieuNaissance', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                  placeholder="Yaoundé" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sexe *</label>
                <select value={form.sexe} onChange={e => update('sexe', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3">
                  <option value="1">Garçon</option>
                  <option value="0">Fille</option>
                  <option value="2">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Langue principale</label>
                <select value={form.langue} onChange={e => update('langue', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3">
                  <option value="fr">Français</option>
                  <option value="en">Anglais</option>
                  <option value="bi">Bilingue</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION FAMILLE ── */}
        {section === 'famille' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-violet-500" />
              <h3 className="font-semibold text-slate-900">Situation familiale</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Religion</label>
                <select value={form.religion} onChange={e => update('religion', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3">
                  <option value="">— Non renseigné —</option>
                  <option value="Christianisme">Christianisme</option>
                  <option value="Islam">Islam</option>
                  <option value="Catholicisme">Catholicisme</option>
                  <option value="Protestantisme">Protestantisme</option>
                  <option value="Animisme">Animisme</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Situation familiale</label>
                <select value={form.situation_familiale}
                  onChange={e => update('situation_familiale', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3">
                  <option value="">— Non renseigné —</option>
                  {SITUATIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {(form.situation_familiale === 'orphelin_total' ||
              form.situation_familiale === 'orphelin_pere' ||
              form.situation_familiale === 'orphelin_mere') && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                ⚠ Pensez à renseigner un tuteur légal dans l'onglet "Tuteur légal".
              </div>
            )}
          </div>
        )}

        {/* ── SECTION URGENCE ── */}
        {section === 'urgence' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-slate-900">Contact d'urgence</h3>
              <span className="text-xs text-slate-400 ml-1">Personne à contacter en cas d'urgence</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                <input type="text" value={form.contact_urgence_nom}
                  onChange={e => update('contact_urgence_nom', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                  placeholder="Ex : Marie FOUDA" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input type="tel" value={form.contact_urgence_tel}
                  onChange={e => update('contact_urgence_tel', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                  placeholder="+237 6XX XXX XXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lien de parenté</label>
                <select value={form.contact_urgence_lien}
                  onChange={e => update('contact_urgence_lien', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3">
                  <option value="">— Choisir —</option>
                  <option value="Père">Père</option>
                  <option value="Mère">Mère</option>
                  <option value="Tuteur">Tuteur</option>
                  <option value="Oncle">Oncle</option>
                  <option value="Tante">Tante</option>
                  <option value="Grand-père">Grand-père</option>
                  <option value="Grand-mère">Grand-mère</option>
                  <option value="Frère">Frère</option>
                  <option value="Sœur">Sœur</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION TUTEUR ── */}
        {section === 'tuteur' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-slate-900">Tuteur légal</h3>
              <span className="text-xs text-slate-400 ml-1">Si différent des parents</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du tuteur</label>
                <input type="text" value={form.tuteur_nom}
                  onChange={e => update('tuteur_nom', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                  placeholder="Nom et prénom du tuteur" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input type="tel" value={form.tuteur_tel}
                  onChange={e => update('tuteur_tel', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                  placeholder="+237 6XX XXX XXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                <input type="text" value={form.tuteur_profession}
                  onChange={e => update('tuteur_profession', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                  placeholder="Ex: Enseignant, Commerçant…" />
              </div>
            </div>
          </div>
        )}

        {/* Boutons */}
        <div className="flex gap-4 pb-8">
          <button type="submit" disabled={saving}
            className="flex-1 bg-[#1a3a5c] text-white py-4 rounded-xl font-semibold hover:bg-[#16324f] transition flex items-center justify-center gap-2 disabled:opacity-70">
            <Save size={20} />
            {saving ? 'Enregistrement…' : isEditing ? "Mettre à jour" : "Créer l'élève"}
          </button>
          <Link to="/eleves"
            className="flex-1 border border-gray-300 py-4 rounded-xl font-semibold text-center hover:bg-gray-50 transition">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
