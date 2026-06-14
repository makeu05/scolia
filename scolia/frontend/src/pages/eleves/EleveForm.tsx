import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Save, User, Phone, Users, Shield,
  Camera, BookOpen, CheckCircle2, AlertCircle,
} from "lucide-react";
import { authFetch } from "../../service/auth";

const API    = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
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

type SectionId = 'base' | 'famille' | 'urgence' | 'tuteur';

const SECTIONS: {
  id: SectionId;
  label: string;
  sub: string;
  icon: React.ElementType;
  color: string;
  light: string;
  required: boolean;
}[] = [
  {
    id: 'base', label: 'Identité', sub: 'État civil et coordonnées',
    icon: BookOpen, color: '#0f1f3d', light: 'rgba(15,31,61,0.09)', required: true,
  },
  {
    id: 'famille', label: 'Famille', sub: 'Environnement familial',
    icon: Users, color: '#7c3aed', light: 'rgba(124,58,237,0.09)', required: false,
  },
  {
    id: 'urgence', label: 'Urgence', sub: 'Contact en cas d\'urgence',
    icon: Phone, color: '#dc2626', light: 'rgba(220,38,38,0.09)', required: false,
  },
  {
    id: 'tuteur', label: 'Tuteur', sub: 'Tuteur légal si différent des parents',
    icon: Shield, color: '#059669', light: 'rgba(5,150,105,0.09)', required: false,
  },
];

function Field({
  label, required, children,
}: {
  label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="label">
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export default function EleveForm() {
  const { matricule } = useParams();
  const navigate      = useNavigate();
  const isEditing     = !!matricule;

  const [loading, setLoading]             = useState(false);
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState('');
  const [photo, setPhoto]                 = useState<File | null>(null);
  const [photoPreview, setPhotoPreview]   = useState<string | null>(null);
  const [photoActuelle, setPhotoActuelle] = useState<string | null>(null);
  const [sectionIdx, setSectionIdx]       = useState(0);
  const [villes, setVilles]               = useState<{ idVille: number; libelle: string }[]>([]);

  const section     = SECTIONS[sectionIdx];
  const isLastStep  = sectionIdx === SECTIONS.length - 1;
  const isFirstStep = sectionIdx === 0;

  const [form, setForm] = useState({
    nom: '', prenom: '', dateNaissance: '', lieuNaissance: '',
    idVilleNaissance: '',
    sexe: '1', langue: 'fr', idAdmin: '1',
    religion: '', situation_familiale: '',
    contact_urgence_nom: '', contact_urgence_tel: '', contact_urgence_lien: '',
    tuteur_nom: '', tuteur_tel: '', tuteur_profession: '',
  });

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  useEffect(() => {
    authFetch(`${API}/ville-naissance`)
      .then(r => r.json())
      .then(data => setVilles(Array.isArray(data) ? data : (data.data ?? [])))
      .catch(() => {});

    if (!isEditing) return;
    setLoading(true);
    authFetch(`${API}/eleves/${matricule}`)
      .then(r => r.json())
      .then(data => {
        setForm({
          nom:                  data.nom?.toUpperCase()        ?? '',
          prenom:               data.prenom                    ?? '',
          dateNaissance:        data.dateNaissance?.split('T')[0] ?? '',
          lieuNaissance:        data.lieuNaissance             ?? '',
          idVilleNaissance:     String(data.idVilleNaissance   ?? ''),
          sexe:                 String(data.sexe               ?? '1'),
          langue:               data.langue                    ?? 'fr',
          idAdmin:              String(data.idAdmin            ?? '1'),
          religion:             data.religion                  ?? '',
          situation_familiale:  data.situation_familiale       ?? '',
          contact_urgence_nom:  data.contact_urgence_nom       ?? '',
          contact_urgence_tel:  data.contact_urgence_tel       ?? '',
          contact_urgence_lien: data.contact_urgence_lien      ?? '',
          tuteur_nom:           data.tuteur_nom                ?? '',
          tuteur_tel:           data.tuteur_tel                ?? '',
          tuteur_profession:    data.tuteur_profession         ?? '',
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
        if (isEditing) fd.append(k, v);
        else if (v !== '') fd.append(k, v);
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

  const displayName  = [form.prenom, form.nom].filter(Boolean).join(' ') || 'Nouvel élève';
  const currentPhoto = photoPreview ?? photoActuelle;

  /* ── Loading skeleton ── */
  if (loading) return (
    <div className="min-h-screen animate-fade-in" style={{ background: 'var(--bg-app)' }}>
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="skeleton h-14 rounded-2xl mb-4" />
        <div className="card p-8 space-y-5">
          <div className="skeleton w-24 h-24 rounded-full mx-auto" />
          <div className="skeleton h-5 w-40 rounded-lg mx-auto" />
          <div className="skeleton h-11 rounded-xl" />
          <div className="grid grid-cols-2 gap-4">
            <div className="skeleton h-11 rounded-xl" />
            <div className="skeleton h-11 rounded-xl" />
          </div>
          <div className="skeleton h-11 rounded-xl" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-app)' }}>

      {/* ── Sticky Header ── */}
      <div
        className="sticky top-0 z-20 border-b"
        style={{
          background: 'rgba(247,248,252,0.92)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <button type="button" onClick={() => navigate('/eleves')} className="btn-back flex-shrink-0">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">Élèves</span>
              </button>
              <div className="w-px h-4 flex-shrink-0" style={{ background: 'var(--border)' }} />
              <div className="min-w-0">
                <p className="page-title truncate">
                  {isEditing ? "Modifier l'élève" : 'Nouvel élève'}
                </p>
                {isEditing && (
                  <p className="page-subtitle hidden sm:block">Matricule : {matricule}</p>
                )}
              </div>
            </div>
            <button
              form="eleve-form"
              type="submit"
              disabled={saving}
              className="btn-primary btn-sm flex-shrink-0"
              style={{ gap: '0.375rem' }}
            >
              {saving ? (
                <>
                  <span
                    className="animate-spin"
                    style={{
                      width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
                      borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block',
                    }}
                  />
                  Enregistrement…
                </>
              ) : (
                <><Save style={{ width: 14, height: 14 }} />{isEditing ? 'Mettre à jour' : 'Enregistrer'}</>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-16">

        {/* ── Error banner ── */}
        {error && (
          <div className="alert alert-danger flex items-center gap-2 mt-4">
            <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
            {error}
          </div>
        )}

        {/* ── Hero banner — changes color per section ── */}
        <div
          className="mt-4 rounded-2xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${section.color} 0%, ${section.color}cc 100%)`,
            boxShadow: `0 8px 40px ${section.color}40`,
            transition: 'background 0.5s ease, box-shadow 0.5s ease',
          }}
        >
          {/* Decorative dots pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.06] rounded-2xl overflow-hidden"
            style={{
              backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          <div className="relative px-6 py-7 flex flex-col sm:flex-row items-center gap-5">

            {/* Avatar */}
            <div className="relative group flex-shrink-0">
              <div
                className="w-[88px] h-[88px] rounded-full overflow-hidden"
                style={{
                  border: '3px solid rgba(255,255,255,0.35)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                }}
              >
                {currentPhoto ? (
                  <img src={currentPhoto} alt="Photo élève" className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.15)' }}
                  >
                    <User style={{ width: 36, height: 36, color: 'rgba(255,255,255,0.5)' }} />
                  </div>
                )}
              </div>
              {/* Camera overlay */}
              <label
                htmlFor="photo-upload"
                className="absolute inset-0 rounded-full cursor-pointer flex items-center justify-center transition-all duration-200"
                style={{
                  background: 'rgba(0,0,0,0)',
                  opacity: 0,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLLabelElement).style.background = 'rgba(0,0,0,0.45)';
                  (e.currentTarget as HTMLLabelElement).style.opacity = '1';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLLabelElement).style.background = 'rgba(0,0,0,0)';
                  (e.currentTarget as HTMLLabelElement).style.opacity = '0';
                }}
              >
                <Camera style={{ width: 22, height: 22, color: '#fff' }} />
              </label>
              <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" id="photo-upload" />
            </div>

            {/* Student info */}
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xl font-bold text-white tracking-tight leading-tight">
                {displayName}
              </p>
              <p className="text-white/55 text-xs mt-1">
                {photo ? `📎 ${photo.name}` : 'Survoler la photo pour la modifier'}
              </p>

              {/* Progress dots */}
              <div className="flex items-center gap-1.5 mt-3 justify-center sm:justify-start">
                {SECTIONS.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSectionIdx(i)}
                    className="transition-all duration-300"
                    style={{
                      width:  i === sectionIdx ? 20 : 8,
                      height: 8,
                      borderRadius: 4,
                      background: i < sectionIdx
                        ? '#86efac'
                        : i === sectionIdx
                          ? '#ffffff'
                          : 'rgba(255,255,255,0.28)',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                    title={s.label}
                  />
                ))}
                <span className="text-white/50 text-[10px] ml-1">
                  {sectionIdx + 1}/{SECTIONS.length}
                </span>
              </div>
            </div>

            {/* Section tab pills */}
            <div
              className="flex sm:flex-col gap-1 bg-black/20 rounded-xl p-1.5"
              style={{ backdropFilter: 'blur(8px)' }}
            >
              {SECTIONS.map((s, i) => {
                const Icon     = s.icon;
                const isActive = i === sectionIdx;
                const isDone   = i < sectionIdx;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSectionIdx(i)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200"
                    style={{
                      background: isActive ? 'rgba(255,255,255,0.22)' : 'transparent',
                      color: isActive ? '#ffffff' : isDone ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
                      minWidth: 80,
                    }}
                  >
                    {isDone
                      ? <CheckCircle2 style={{ width: 13, height: 13, color: '#86efac', flexShrink: 0 }} />
                      : <Icon style={{ width: 13, height: 13, flexShrink: 0 }} />
                    }
                    <span className="text-[11px] font-semibold whitespace-nowrap">{s.label}</span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        {/* ── Form card — key forces fade-in on section change ── */}
        <form id="eleve-form" onSubmit={handleSubmit}>
          <div key={section.id} className="card mt-4 animate-fade-in" style={{ overflow: 'hidden' }}>

            {/* Section heading strip */}
            <div
              className="flex items-center gap-3 px-6 py-4"
              style={{
                borderBottom: '1px solid var(--border)',
                background: section.light,
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${section.color}18`, border: `1.5px solid ${section.color}22` }}
              >
                <section.icon style={{ width: 17, height: 17, color: section.color }} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm leading-tight" style={{ color: section.color }}>
                  {section.label}
                </p>
                <p className="text-xs leading-tight" style={{ color: 'var(--text-400)' }}>
                  {section.sub}
                </p>
              </div>
              {section.required && (
                <span
                  className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{
                    background: `${section.color}15`,
                    color: section.color,
                    border: `1px solid ${section.color}25`,
                  }}
                >
                  Obligatoire
                </span>
              )}
            </div>

            {/* Fields area */}
            <div className="p-6 space-y-4">

              {/* ── IDENTITÉ ── */}
              {section.id === 'base' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Nom de famille" required>
                      <input
                        required type="text" value={form.nom}
                        onChange={e => update('nom', e.target.value.toUpperCase())}
                        className="input uppercase tracking-wider font-semibold"
                        placeholder="FOUDA"
                      />
                    </Field>
                    <Field label="Prénom(s)" required>
                      <input
                        required type="text" value={form.prenom}
                        onChange={e => update('prenom', e.target.value)}
                        className="input"
                        placeholder="Jean Claude"
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Date de naissance" required>
                      <input
                        required type="date" value={form.dateNaissance}
                        onChange={e => update('dateNaissance', e.target.value)}
                        className="input"
                      />
                    </Field>
                    <Field label="Lieu de naissance" required>
                      <input
                        required type="text" value={form.lieuNaissance}
                        onChange={e => update('lieuNaissance', e.target.value)}
                        className="input"
                        placeholder="Yaoundé, Centre"
                      />
                    </Field>
                  </div>

                  <Field label="Ville de naissance" required>
                    <select
                      required value={form.idVilleNaissance}
                      onChange={e => update('idVilleNaissance', e.target.value)}
                      className="input"
                    >
                      <option value="">— Sélectionner une ville —</option>
                      {villes.map(v => (
                        <option key={v.idVille} value={String(v.idVille)}>{v.libelle}</option>
                      ))}
                    </select>
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Sexe" required>
                      <select
                        value={form.sexe}
                        onChange={e => update('sexe', e.target.value)}
                        className="input"
                      >
                        <option value="1">Garçon</option>
                        <option value="0">Fille</option>
                        <option value="2">Autre</option>
                      </select>
                    </Field>
                    <Field label="Langue d'enseignement">
                      <select
                        value={form.langue}
                        onChange={e => update('langue', e.target.value)}
                        className="input"
                      >
                        <option value="fr">Français</option>
                        <option value="en">Anglais</option>
                        <option value="bi">Bilingue</option>
                      </select>
                    </Field>
                  </div>
                </>
              )}

              {/* ── FAMILLE ── */}
              {section.id === 'famille' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Religion">
                      <select
                        value={form.religion}
                        onChange={e => update('religion', e.target.value)}
                        className="input"
                      >
                        <option value="">— Non renseigné —</option>
                        <option value="Christianisme">Christianisme</option>
                        <option value="Islam">Islam</option>
                        <option value="Catholicisme">Catholicisme</option>
                        <option value="Protestantisme">Protestantisme</option>
                        <option value="Animisme">Animisme</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </Field>
                    <Field label="Situation familiale">
                      <select
                        value={form.situation_familiale}
                        onChange={e => update('situation_familiale', e.target.value)}
                        className="input"
                      >
                        <option value="">— Non renseigné —</option>
                        {SITUATIONS.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  {['orphelin_total', 'orphelin_pere', 'orphelin_mere'].includes(form.situation_familiale) && (
                    <div
                      className="flex items-start gap-3 px-4 py-3 rounded-xl"
                      style={{
                        background: 'rgba(245,158,11,0.08)',
                        border: '1px solid rgba(245,158,11,0.25)',
                      }}
                    >
                      <AlertCircle style={{ width: 16, height: 16, color: '#d97706', marginTop: 2, flexShrink: 0 }} />
                      <p className="text-sm" style={{ color: '#92400e' }}>
                        Pensez à renseigner un <strong>tuteur légal</strong> dans l'onglet Tuteur.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* ── URGENCE ── */}
              {section.id === 'urgence' && (
                <>
                  <Field label="Nom complet de la personne à contacter">
                    <input
                      type="text" value={form.contact_urgence_nom}
                      onChange={e => update('contact_urgence_nom', e.target.value)}
                      className="input"
                      placeholder="Ex : Marie FOUDA"
                    />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Numéro de téléphone">
                      <input
                        type="tel" value={form.contact_urgence_tel}
                        onChange={e => update('contact_urgence_tel', e.target.value)}
                        className="input"
                        placeholder="+237 6XX XXX XXX"
                      />
                    </Field>
                    <Field label="Lien de parenté">
                      <select
                        value={form.contact_urgence_lien}
                        onChange={e => update('contact_urgence_lien', e.target.value)}
                        className="input"
                      >
                        <option value="">— Choisir —</option>
                        {['Père','Mère','Tuteur','Oncle','Tante','Grand-père','Grand-mère','Frère','Sœur','Autre'].map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                </>
              )}

              {/* ── TUTEUR ── */}
              {section.id === 'tuteur' && (
                <>
                  <Field label="Nom complet du tuteur">
                    <input
                      type="text" value={form.tuteur_nom}
                      onChange={e => update('tuteur_nom', e.target.value)}
                      className="input"
                      placeholder="Nom et prénom complets"
                    />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Téléphone">
                      <input
                        type="tel" value={form.tuteur_tel}
                        onChange={e => update('tuteur_tel', e.target.value)}
                        className="input"
                        placeholder="+237 6XX XXX XXX"
                      />
                    </Field>
                    <Field label="Profession">
                      <input
                        type="text" value={form.tuteur_profession}
                        onChange={e => update('tuteur_profession', e.target.value)}
                        className="input"
                        placeholder="Ex : Enseignant, Commerçant…"
                      />
                    </Field>
                  </div>
                </>
              )}

            </div>
          </div>

          {/* ── Step footer navigation ── */}
          <div className="flex items-center justify-between mt-4">
            <button
              type="button"
              onClick={() => setSectionIdx(i => Math.max(0, i - 1))}
              disabled={isFirstStep}
              className="btn-secondary btn-sm"
              style={{ gap: '0.375rem', opacity: isFirstStep ? 0.4 : 1 }}
            >
              <ArrowLeft style={{ width: 14, height: 14 }} />
              Précédent
            </button>

            <div className="flex gap-1">
              {SECTIONS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSectionIdx(i)}
                  style={{
                    width: i === sectionIdx ? 18 : 7,
                    height: 7,
                    borderRadius: 4,
                    background: i < sectionIdx
                      ? '#86efac'
                      : i === sectionIdx
                        ? section.color
                        : 'var(--border)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>

            {isLastStep ? (
              <button
                type="submit"
                disabled={saving}
                className="btn-primary btn-sm"
                style={{ gap: '0.375rem' }}
              >
                {saving ? (
                  <>
                    <span
                      className="animate-spin"
                      style={{
                        width: 13, height: 13,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid #fff',
                        borderRadius: '50%',
                        display: 'inline-block',
                      }}
                    />
                    Enregistrement…
                  </>
                ) : (
                  <><Save style={{ width: 14, height: 14 }} />Enregistrer</>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSectionIdx(i => i + 1)}
                className="btn-sm text-white font-semibold"
                style={{
                  background: section.color,
                  border: 'none',
                  gap: '0.375rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0 14px',
                  height: 34,
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
              >
                Suivant <ArrowRight style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
