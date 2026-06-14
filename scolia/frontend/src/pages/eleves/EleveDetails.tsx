import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { authFetch } from "../../service/auth";
import {
  ArrowLeft, CreditCard, Edit, Trash2, Heart, School,
  Plus, Upload, Loader2, FileText, Download, X, Phone,
  User, Droplets, AlertTriangle, CheckCircle, Shield,
  Calendar, MapPin, Globe, BookOpen, Activity, Users,
} from "lucide-react";
import ParentsSection from "./ParentsSection";

const API    = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
const SERVER = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:8000';

const getPhotoUrl = (url?: string): string | null => {
  if (!url || url === 'INDEFINI') return null;
  if (url.startsWith('http')) return url;
  return `${SERVER}/storage/${url}`;
};

const SEXE_LABELS: Record<number, string> = { 0: "Fille", 1: "Garçon", 2: "Autre" };

const SITUATION_LABELS: Record<string, string> = {
  deux_parents: "Deux parents", pere_seul: "Père seul",
  mere_seule: "Mère seule", orphelin_pere: "Orphelin de père",
  orphelin_mere: "Orphelin de mère", orphelin_total: "Orphelin total",
  tuteur: "Sous tutelle", autre: "Autre",
};

const GROUPE_SANGUIN_COLOR: Record<string, string> = {
  'A+': 'bg-red-50 text-red-600',      'A-': 'bg-red-50 text-red-600',
  'B+': 'bg-blue-50 text-blue-600',    'B-': 'bg-blue-50 text-blue-600',
  'AB+': 'bg-purple-50 text-purple-600','AB-': 'bg-purple-50 text-purple-600',
  'O+': 'bg-emerald-50 text-emerald-600','O-': 'bg-emerald-50 text-emerald-600',
  'inconnu': 'bg-slate-100 text-slate-500',
};

type Tab = "infos" | "sante" | "anterieur";

const TABS: { id: Tab; label: string; icon: React.ElementType; color: string }[] = [
  { id: "infos",     label: "Informations",         icon: BookOpen, color: "#0f1f3d" },
  { id: "sante",     label: "Santé",                icon: Heart,    color: "#dc2626" },
  { id: "anterieur", label: "Scolarité antérieure", icon: School,   color: "#7c3aed" },
];

export default function EleveDetails() {
  const { matricule } = useParams<{ matricule: string }>();
  const navigate      = useNavigate();

  const [eleve, setEleve]                     = useState<any>(null);
  const [sante, setSante]                     = useState<any>(null);
  const [anterieur, setAnterieur]             = useState<any[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState('');
  const [tab, setTab]                         = useState<Tab>("infos");
  const [santeDisponible, setSanteDisponible] = useState(true);

  const [editingSante, setEditingSante]   = useState(false);
  const [santeForm, setSanteForm]         = useState<any>({});
  const [savingSante, setSavingSante]     = useState(false);
  const [vaccins, setVaccins]             = useState<any[]>([]);

  const [showAntForm, setShowAntForm] = useState(false);
  const [antForm, setAntForm] = useState({
    etablissement_nom: '', etablissement_ville: '', etablissement_type: 'Privé',
    classe_precedente: '', annee_scolaire: '', moyenne_annuelle: '',
    appreciation: '', redoublant: false, motif_depart: '',
  });
  const [savingAnt, setSavingAnt] = useState(false);

  const bulletinRef                               = useRef<HTMLInputElement>(null);
  const [uploadingBulletin, setUploadingBulletin] = useState<number | null>(null);

  const load = async () => {
    if (!matricule) return;
    setLoading(true);
    setError('');
    try {
      const eleveRes = await authFetch(`${API}/eleves/${matricule}`);
      if (!eleveRes.ok) {
        const d = await eleveRes.json();
        throw new Error(d.message ?? `Erreur ${eleveRes.status}`);
      }
      setEleve(await eleveRes.json());
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
      return;
    }
    try {
      const santeRes = await authFetch(`${API}/eleves/${matricule}/sante`);
      if (santeRes.ok) {
        const santeData = await santeRes.json();
        setSante(santeData);
        setSanteForm(santeData);
        setVaccins(santeData.vaccins ?? []);
      } else {
        setSanteDisponible(false);
      }
    } catch { setSanteDisponible(false); }
    try {
      const antRes = await authFetch(`${API}/eleves/${matricule}/scolarite-anterieure`);
      if (antRes.ok) {
        const antData = await antRes.json();
        setAnterieur(Array.isArray(antData) ? antData : []);
      }
    } catch { setAnterieur([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [matricule]);

  const handleSaveSante = async () => {
    setSavingSante(true);
    try {
      await authFetch(`${API}/eleves/${matricule}/sante`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...santeForm, vaccins }),
      });
      setEditingSante(false);
      load();
    } catch { alert("Erreur sauvegarde"); }
    finally { setSavingSante(false); }
  };

  const handleAddAnt = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAnt(true);
    try {
      await authFetch(`${API}/eleves/${matricule}/scolarite-anterieure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(antForm),
      });
      setShowAntForm(false);
      setAntForm({
        etablissement_nom: '', etablissement_ville: '', etablissement_type: 'Privé',
        classe_precedente: '', annee_scolaire: '', moyenne_annuelle: '',
        appreciation: '', redoublant: false, motif_depart: '',
      });
      load();
    } catch { alert("Erreur"); }
    finally { setSavingAnt(false); }
  };

  const handleUploadBulletin = async (idScolariteAnt: number, file: File) => {
    setUploadingBulletin(idScolariteAnt);
    try {
      const fd = new FormData();
      fd.append('bulletin', file);
      await authFetch(`${API}/eleves/${matricule}/scolarite-anterieure/${idScolariteAnt}/bulletin`, {
        method: 'POST', body: fd,
      });
      load();
    } catch { alert("Erreur upload"); }
    finally { setUploadingBulletin(null); }
  };

  const handleDelete = async () => {
    if (!confirm("Supprimer définitivement cet élève ?")) return;
    await authFetch(`${API}/eleves/${matricule}`, { method: "DELETE" });
    navigate("/eleves");
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen" style={{ background: 'var(--bg-app)' }}>
      <div className="max-w-5xl mx-auto px-4 pt-4 space-y-4 animate-fade-in">
        <div className="skeleton h-14 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-32 rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="skeleton h-48 rounded-2xl" />
          <div className="skeleton h-48 rounded-2xl" />
        </div>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error || !eleve) return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--bg-app)' }}>
      <div className="card-elevated p-10 text-center max-w-md w-full animate-bounce-in">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <p className="font-bold text-lg mb-1" style={{ color: 'var(--text-900)' }}>
          {error || 'Élève non trouvé'}
        </p>
        {error?.includes('500') && (
          <div className="mt-4 p-4 rounded-xl text-left text-sm" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <p className="font-semibold text-amber-700 mb-1">Migrations manquantes</p>
            <code className="block bg-amber-100 rounded-lg px-3 py-2 text-xs text-amber-800">php artisan migrate</code>
          </div>
        )}
        <button onClick={() => navigate('/eleves')} className="btn-secondary mt-6 w-full">
          <ArrowLeft className="w-4 h-4" /> Retour à la liste
        </button>
      </div>
    </div>
  );

  const photoUrl    = getPhotoUrl(eleve.photoURL);
  const activeTab   = TABS.find(t => t.id === tab)!;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-app)' }}>

      {/* ── Sticky header ── */}
      <div
        className="sticky top-0 z-20 border-b"
        style={{
          background: 'rgba(247,248,252,0.92)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-2.5 h-14">
            <button onClick={() => navigate('/eleves')} className="btn-back flex-shrink-0">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs">Élèves</span>
            </button>
            <div className="w-px h-4 flex-shrink-0" style={{ background: 'var(--border)' }} />
            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 border" style={{ borderColor: 'var(--border)' }}>
              {photoUrl
                ? <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-slate-100 flex items-center justify-center"><User style={{ width: 14, height: 14, color: '#94a3b8' }} /></div>
              }
            </div>
            <p className="page-title truncate">{eleve.nom} {eleve.prenom}</p>
            <span className="text-xs flex-shrink-0 hidden sm:block" style={{ color: 'var(--text-400)' }}>
              #{eleve.matricule}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16">

        {/* ── Hero banner ── */}
        <div
          className="mt-4 rounded-2xl overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, #0f1f3d 0%, #1e3a6e 60%, #2d4f8a 100%)',
            boxShadow: '0 16px 48px rgba(15,31,61,0.35)',
          }}
        >
          {/* Dots pattern */}
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }}
          />
          {/* Right glow */}
          <div className="absolute right-0 top-0 w-64 h-64 rounded-full opacity-[0.08] pointer-events-none"
            style={{ background: 'radial-gradient(circle, #4f46e5, transparent)', transform: 'translate(30%, -30%)' }}
          />

          <div className="relative z-10 px-6 py-7 flex flex-col sm:flex-row items-center sm:items-start gap-6">

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-[100px] h-[100px] rounded-full overflow-hidden"
                style={{
                  border: '3px solid rgba(255,255,255,0.25)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
              >
                {photoUrl
                  ? <img src={photoUrl} alt={eleve.nom} className="w-full h-full object-cover" />
                  : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <User style={{ width: 40, height: 40, color: 'rgba(255,255,255,0.4)' }} />
                    </div>
                  )
                }
              </div>
              <span
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: eleve.actif ? '#22c55e' : '#94a3b8',
                  border: '2.5px solid #1e3a6e',
                }}
              >
                <CheckCircle style={{ width: 14, height: 14, color: '#fff' }} />
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
                {eleve.nom} <span className="font-light">{eleve.prenom}</span>
              </h1>
              <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                <span className="text-white/50 text-sm font-mono">#{eleve.matricule}</span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: eleve.actif ? 'rgba(34,197,94,0.2)' : 'rgba(148,163,184,0.2)',
                    color: eleve.actif ? '#86efac' : '#cbd5e1',
                    border: `1px solid ${eleve.actif ? 'rgba(34,197,94,0.35)' : 'rgba(148,163,184,0.3)'}`,
                  }}
                >
                  {eleve.actif ? 'Actif' : 'Archivé'}
                </span>
              </div>

              {/* Info chips */}
              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                {eleve.dateNaissance && (
                  <span className="flex items-center gap-1 text-xs text-white/65 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm">
                    <Calendar style={{ width: 11, height: 11 }} />
                    {new Date(eleve.dateNaissance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
                {eleve.sexe !== undefined && (
                  <span className="text-xs text-white/65 bg-white/10 px-2.5 py-1 rounded-full">
                    {SEXE_LABELS[eleve.sexe]}
                  </span>
                )}
                {eleve.langue && (
                  <span className="flex items-center gap-1 text-xs text-white/65 bg-white/10 px-2.5 py-1 rounded-full">
                    <Globe style={{ width: 11, height: 11 }} />
                    {eleve.langue === 'fr' ? 'Français' : eleve.langue === 'en' ? 'Anglais' : 'Bilingue'}
                  </span>
                )}
                {sante?.groupe_sanguin && sante.groupe_sanguin !== 'inconnu' && (
                  <span className="flex items-center gap-1 text-xs font-bold text-red-300 bg-red-500/20 px-2.5 py-1 rounded-full">
                    <Droplets style={{ width: 11, height: 11 }} />
                    {sante.groupe_sanguin}
                  </span>
                )}
                {eleve.lieuNaissance && (
                  <span className="flex items-center gap-1 text-xs text-white/65 bg-white/10 px-2.5 py-1 rounded-full">
                    <MapPin style={{ width: 11, height: 11 }} />
                    {eleve.lieuNaissance}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
              <button
                onClick={() => navigate(`/eleves/${matricule}/paiements`)}
                className="flex items-center justify-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl transition-all"
                style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
              >
                <CreditCard style={{ width: 14, height: 14 }} />
                <span className="hidden sm:inline">Paiements</span>
              </button>
              <Link
                to={`/eleves/${matricule}/modifier`}
                className="flex items-center justify-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl transition-all"
                style={{ background: 'rgba(245,158,11,0.25)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.35)', backdropFilter: 'blur(8px)' }}
              >
                <Edit style={{ width: 14, height: 14 }} />
                <span className="hidden sm:inline">Modifier</span>
              </Link>
              <button
                onClick={handleDelete}
                className="flex items-center justify-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl transition-all"
                style={{ background: 'rgba(239,68,68,0.25)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.35)', backdropFilter: 'blur(8px)' }}
              >
                <Trash2 style={{ width: 14, height: 14 }} />
                <span className="hidden sm:inline">Supprimer</span>
              </button>
            </div>

          </div>
        </div>

        {/* ── Parents section ── */}
        <div className="mt-4">
          <ParentsSection matricule={eleve.matricule} />
        </div>


        {/* ── Tab bar ── */}
        <div
          className="mt-5 flex gap-0 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          {TABS.map(t => {
            const isActive = t.id === tab;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="relative flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all"
                style={{
                  color: isActive ? t.color : 'var(--text-400)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <Icon style={{ width: 15, height: 15 }} />
                {t.label}
                {!santeDisponible && (t.id === 'sante' || t.id === 'anterieur') && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 absolute top-2.5 right-2" />
                )}
                {/* Active underline */}
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-300"
                  style={{ background: isActive ? t.color : 'transparent' }}
                />
              </button>
            );
          })}
        </div>

        {/* ── Tab content (animated) ── */}
        <div key={tab} className="mt-5 animate-fade-in">

          {/* ══ INFOS ══ */}
          {tab === "infos" && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

              {/* Personal info — 3 cols */}
              <div className="md:col-span-3 card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="flex items-center gap-2.5 px-5 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(15,31,61,0.03)' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(15,31,61,0.08)' }}>
                    <User style={{ width: 14, height: 14, color: '#0f1f3d' }} />
                  </div>
                  <p className="font-bold text-sm" style={{ color: '#0f1f3d' }}>Informations personnelles</p>
                </div>
                <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as any}>
                  {[
                    { icon: User,      label: "Nom complet",         value: `${eleve.nom} ${eleve.prenom}` },
                    { icon: Calendar,  label: "Date de naissance",   value: eleve.dateNaissance ? new Date(eleve.dateNaissance).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—" },
                    { icon: MapPin,    label: "Lieu de naissance",   value: eleve.lieuNaissance ?? "—" },
                    { icon: Users,     label: "Sexe",                value: SEXE_LABELS[eleve.sexe] ?? "—" },
                    { icon: Globe,     label: "Langue",              value: eleve.langue === 'fr' ? 'Français' : eleve.langue === 'en' ? 'Anglais' : eleve.langue ?? "—" },
                    { icon: BookOpen,  label: "Religion",            value: eleve.religion || "—" },
                    { icon: Shield,    label: "Situation familiale", value: SITUATION_LABELS[eleve.situation_familiale] ?? "—" },
                  ].map((row, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <row.icon style={{ width: 14, height: 14, color: 'var(--text-300)', flexShrink: 0 }} />
                      <span className="text-sm flex-1" style={{ color: 'var(--text-400)' }}>{row.label}</span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-900)' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right column — 2 cols */}
              <div className="md:col-span-2 space-y-4">

                {/* Contact urgence */}
                <div className="card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
                  <div className="flex items-center gap-2.5 px-5 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(220,38,38,0.03)' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(220,38,38,0.1)' }}>
                      <Phone style={{ width: 14, height: 14, color: '#dc2626' }} />
                    </div>
                    <p className="font-bold text-sm" style={{ color: '#dc2626' }}>Contact d'urgence</p>
                  </div>
                  <div className="p-4">
                    {eleve.contact_urgence_nom ? (
                      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.12)' }}>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(220,38,38,0.1)' }}>
                          <Phone style={{ width: 14, height: 14, color: '#dc2626' }} />
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: 'var(--text-900)' }}>{eleve.contact_urgence_nom}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-400)' }}>
                            {[eleve.contact_urgence_lien, eleve.contact_urgence_tel].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm italic text-center py-4" style={{ color: 'var(--text-300)' }}>Non renseigné</p>
                    )}
                  </div>
                </div>

                {/* Tuteur légal */}
                {eleve.tuteur_nom && (
                  <div className="card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="flex items-center gap-2.5 px-5 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(79,70,229,0.03)' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(79,70,229,0.1)' }}>
                        <Shield style={{ width: 14, height: 14, color: '#4f46e5' }} />
                      </div>
                      <p className="font-bold text-sm" style={{ color: '#4f46e5' }}>Tuteur légal</p>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(79,70,229,0.05)', border: '1px solid rgba(79,70,229,0.12)' }}>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(79,70,229,0.1)' }}>
                          <User style={{ width: 14, height: 14, color: '#4f46e5' }} />
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: 'var(--text-900)' }}>{eleve.tuteur_nom}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-400)' }}>
                            {[eleve.tuteur_profession, eleve.tuteur_tel].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ SANTÉ ══ */}
          {tab === "sante" && (
            !santeDisponible ? (
              <div className="card p-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-red-400 opacity-50" />
                </div>
                <p className="font-semibold" style={{ color: 'var(--text-900)' }}>Fonctionnalité non disponible</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-400)' }}>Lancez les migrations pour activer la fiche santé.</p>
                <code className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg block max-w-xs mx-auto mt-3">php artisan migrate</code>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Save/edit bar */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Activity style={{ width: 16, height: 16, color: '#dc2626' }} />
                    <p className="font-bold text-sm" style={{ color: 'var(--text-900)' }}>Fiche santé</p>
                  </div>
                  {!editingSante ? (
                    <button onClick={() => setEditingSante(true)} className="btn-secondary btn-sm gap-1.5">
                      <Edit style={{ width: 13, height: 13 }} /> Modifier
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setEditingSante(false)} className="btn-secondary btn-sm">Annuler</button>
                      <button onClick={handleSaveSante} disabled={savingSante} className="btn-primary btn-sm gap-1.5">
                        {savingSante
                          ? <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />
                          : <CheckCircle style={{ width: 13, height: 13 }} />
                        }
                        Enregistrer
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Général */}
                  <div className="card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="px-5 py-4 font-bold text-sm" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-900)', background: 'rgba(220,38,38,0.03)' }}>
                      Informations générales
                    </div>
                    <div className="p-5 space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-300)' }}>Groupe sanguin</p>
                        {editingSante ? (
                          <select
                            value={santeForm.groupe_sanguin ?? 'inconnu'}
                            onChange={e => setSanteForm((f: any) => ({ ...f, groupe_sanguin: e.target.value }))}
                            className="input"
                          >
                            {['A+','A-','B+','B-','AB+','AB-','O+','O-','inconnu'].map(g => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full ${GROUPE_SANGUIN_COLOR[sante?.groupe_sanguin ?? 'inconnu']}`}>
                            <Droplets style={{ width: 13, height: 13 }} />
                            {sante?.groupe_sanguin ?? 'inconnu'}
                          </span>
                        )}
                      </div>
                      {[
                        { key: 'allergies',   label: 'Allergies',            placeholder: 'Liste des allergies…', rows: 3 },
                        { key: 'antecedents', label: 'Antécédents médicaux', placeholder: 'Antécédents…',        rows: 3 },
                      ].map(f => (
                        <div key={f.key}>
                          <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-300)' }}>{f.label}</p>
                          {editingSante ? (
                            <textarea
                              value={santeForm[f.key] ?? ''} rows={f.rows}
                              onChange={e => setSanteForm((s: any) => ({ ...s, [f.key]: e.target.value }))}
                              placeholder={f.placeholder} className="input resize-none"
                            />
                          ) : (
                            <p className="text-sm" style={{ color: sante?.[f.key] ? 'var(--text-900)' : 'var(--text-300)' }}>
                              {sante?.[f.key] || 'Non renseigné'}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Médecin & assurance */}
                  <div className="card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="px-5 py-4 font-bold text-sm" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-900)', background: 'rgba(220,38,38,0.03)' }}>
                      Médecin & Assurance
                    </div>
                    <div className="p-5 space-y-4">
                      {[
                        { key: 'medecin_nom',      label: 'Médecin traitant', placeholder: 'Dr. Nom'       },
                        { key: 'medecin_tel',      label: 'Tél médecin',      placeholder: '+237 6XX…'     },
                        { key: 'assurance_nom',    label: 'Assurance',        placeholder: 'Nom assurance' },
                        { key: 'assurance_numero', label: 'N° assurance',     placeholder: 'Numéro police' },
                      ].map(field => (
                        <div key={field.key}>
                          <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: 'var(--text-300)' }}>{field.label}</p>
                          {editingSante ? (
                            <input
                              type="text" value={santeForm[field.key] ?? ''}
                              onChange={e => setSanteForm((s: any) => ({ ...s, [field.key]: e.target.value }))}
                              placeholder={field.placeholder} className="input"
                            />
                          ) : (
                            <p className="text-sm" style={{ color: sante?.[field.key] ? 'var(--text-900)' : 'var(--text-300)' }}>
                              {sante?.[field.key] || '—'}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Vaccins */}
                <div className="card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
                  <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(220,38,38,0.03)' }}>
                    <p className="font-bold text-sm" style={{ color: 'var(--text-900)' }}>
                      Vaccins <span className="font-normal text-xs" style={{ color: 'var(--text-400)' }}>({vaccins.length})</span>
                    </p>
                    {editingSante && (
                      <button
                        type="button"
                        onClick={() => setVaccins(v => [...v, { nom: '', date: '', rappel: '' }])}
                        className="btn-secondary btn-sm gap-1"
                      >
                        <Plus style={{ width: 11, height: 11 }} /> Ajouter
                      </button>
                    )}
                  </div>
                  <div className="p-5">
                    {vaccins.length === 0 ? (
                      <p className="text-sm text-center py-4 italic" style={{ color: 'var(--text-300)' }}>Aucun vaccin enregistré</p>
                    ) : (
                      <div className="space-y-2">
                        {vaccins.map((v, i) => (
                          <div
                            key={i}
                            className="flex gap-3 items-center px-3 py-2.5 rounded-xl"
                            style={{ background: 'var(--bg-app)', border: '1px solid var(--border)' }}
                          >
                            {editingSante ? (
                              <>
                                <input type="text" value={v.nom} placeholder="Vaccin"
                                  onChange={e => { const nv = [...vaccins]; nv[i] = { ...nv[i], nom: e.target.value }; setVaccins(nv); }}
                                  className="input flex-1 py-1.5 text-sm"
                                />
                                <input type="date" value={v.date}
                                  onChange={e => { const nv = [...vaccins]; nv[i] = { ...nv[i], date: e.target.value }; setVaccins(nv); }}
                                  className="input w-36 py-1.5 text-sm"
                                />
                                <button onClick={() => setVaccins(vaccins.filter((_, j) => j !== i))}
                                  className="p-1 rounded-lg hover:bg-red-50 transition-colors"
                                  style={{ color: 'var(--text-300)' }}
                                >
                                  <X style={{ width: 14, height: 14 }} />
                                </button>
                              </>
                            ) : (
                              <>
                                <CheckCircle style={{ width: 14, height: 14, color: '#22c55e', flexShrink: 0 }} />
                                <span className="text-sm font-medium flex-1" style={{ color: 'var(--text-900)' }}>{v.nom}</span>
                                {v.date && <span className="text-xs" style={{ color: 'var(--text-400)' }}>{new Date(v.date).toLocaleDateString('fr-FR')}</span>}
                                {v.rappel && <span className="text-xs text-amber-500">Rappel : {new Date(v.rappel).toLocaleDateString('fr-FR')}</span>}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          )}

          {/* ══ SCOLARITÉ ANTÉRIEURE ══ */}
          {tab === "anterieur" && (
            !santeDisponible ? (
              <div className="card p-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
                  <School className="w-8 h-8 text-violet-400 opacity-50" />
                </div>
                <p className="font-semibold" style={{ color: 'var(--text-900)' }}>Fonctionnalité non disponible</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-400)' }}>Lancez les migrations pour activer cette fonctionnalité.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <School style={{ width: 16, height: 16, color: '#7c3aed' }} />
                    <p className="font-bold text-sm" style={{ color: 'var(--text-900)' }}>
                      Anciens établissements
                      <span className="font-normal ml-1 text-xs" style={{ color: 'var(--text-400)' }}>({anterieur.length})</span>
                    </p>
                  </div>
                  <button onClick={() => setShowAntForm(v => !v)} className="btn-primary btn-sm gap-1.5">
                    {showAntForm
                      ? <><X style={{ width: 13, height: 13 }} /> Annuler</>
                      : <><Plus style={{ width: 13, height: 13 }} /> Ajouter</>
                    }
                  </button>
                </div>

                {showAntForm && (
                  <form onSubmit={handleAddAnt} className="card-elevated animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(124,58,237,0.04)' }}>
                      <School style={{ width: 14, height: 14, color: '#7c3aed' }} />
                      <p className="font-bold text-sm" style={{ color: '#7c3aed' }}>Nouvel établissement</p>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="label">Établissement *</label>
                          <input required type="text" value={antForm.etablissement_nom}
                            onChange={e => setAntForm(f => ({ ...f, etablissement_nom: e.target.value }))}
                            placeholder="Nom de l'école" className="input" />
                        </div>
                        <div>
                          <label className="label">Ville</label>
                          <input type="text" value={antForm.etablissement_ville}
                            onChange={e => setAntForm(f => ({ ...f, etablissement_ville: e.target.value }))}
                            className="input" />
                        </div>
                        <div>
                          <label className="label">Type</label>
                          <select value={antForm.etablissement_type}
                            onChange={e => setAntForm(f => ({ ...f, etablissement_type: e.target.value }))}
                            className="input">
                            {['Public','Privé','Mission','Confessionnel','Autre'].map(t => <option key={t}>{t}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="label">Classe précédente</label>
                          <input type="text" value={antForm.classe_precedente}
                            onChange={e => setAntForm(f => ({ ...f, classe_precedente: e.target.value }))}
                            placeholder="CM2, 3ème…" className="input" />
                        </div>
                        <div>
                          <label className="label">Année scolaire</label>
                          <input type="text" value={antForm.annee_scolaire}
                            onChange={e => setAntForm(f => ({ ...f, annee_scolaire: e.target.value }))}
                            placeholder="2023-2024" className="input" />
                        </div>
                        <div>
                          <label className="label">Moyenne /20</label>
                          <input type="number" min={0} max={20} step={0.01} value={antForm.moyenne_annuelle}
                            onChange={e => setAntForm(f => ({ ...f, moyenne_annuelle: e.target.value }))}
                            className="input" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="label">Motif de départ</label>
                          <input type="text" value={antForm.motif_depart}
                            onChange={e => setAntForm(f => ({ ...f, motif_depart: e.target.value }))}
                            placeholder="Déménagement, fin de cycle…" className="input" />
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                          <button type="button" onClick={() => setAntForm(f => ({ ...f, redoublant: !f.redoublant }))}
                            className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
                            style={{ background: antForm.redoublant ? '#f59e0b' : 'var(--border)' }}
                          >
                            <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                              style={{ left: antForm.redoublant ? '22px' : '2px' }}
                            />
                          </button>
                          <span className="text-sm" style={{ color: 'var(--text-500)' }}>Redoublant</span>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                        <button type="button" onClick={() => setShowAntForm(false)} className="btn-secondary btn-sm">Annuler</button>
                        <button type="submit" disabled={savingAnt} className="btn-primary btn-sm gap-1.5">
                          {savingAnt ? <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" /> : <Plus style={{ width: 13, height: 13 }} />}
                          Ajouter
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {anterieur.length === 0 && !showAntForm ? (
                  <div className="card p-14 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-3">
                      <School className="w-8 h-8 text-violet-400 opacity-50" />
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-400)' }}>Aucun établissement antérieur enregistré</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {anterieur.map((a: any) => (
                      <div key={a.idScolariteAnt} className="card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
                        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'rgba(124,58,237,0.03)' }}>
                          <div>
                            <p className="font-bold text-sm" style={{ color: 'var(--text-900)' }}>{a.etablissement_nom}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-400)' }}>
                              {[a.etablissement_type, a.etablissement_ville, a.annee_scolaire].filter(Boolean).join(' · ')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {a.moyenne_annuelle && (
                              <span className="text-sm font-black" style={{ color: '#7c3aed' }}>{a.moyenne_annuelle}/20</span>
                            )}
                            {a.redoublant && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706' }}>
                                Redoublant
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="px-5 py-4 space-y-3">
                          {a.classe_precedente && (
                            <p className="text-sm" style={{ color: 'var(--text-500)' }}>
                              Classe : <strong>{a.classe_precedente}</strong>
                              {a.appreciation && <span className="ml-2 text-xs" style={{ color: 'var(--text-400)' }}>{a.appreciation}</span>}
                            </p>
                          )}
                          {a.motif_depart && (
                            <p className="text-xs" style={{ color: 'var(--text-400)' }}>Motif de départ : {a.motif_depart}</p>
                          )}
                          {/* Bulletins */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-300)' }}>
                                Bulletins ({a.bulletins?.length ?? 0})
                              </p>
                              <button onClick={() => bulletinRef.current?.click()}
                                className="flex items-center gap-1 text-xs font-semibold transition-colors"
                                style={{ color: '#7c3aed' }}
                              >
                                <Upload style={{ width: 11, height: 11 }} />
                                {uploadingBulletin === a.idScolariteAnt ? 'Upload…' : 'Ajouter'}
                              </button>
                              <input ref={bulletinRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                                onChange={e => { const file = e.target.files?.[0]; if (file) handleUploadBulletin(a.idScolariteAnt, file); }}
                              />
                            </div>
                            {a.bulletins?.length > 0 ? (
                              <div className="flex gap-2 flex-wrap">
                                {a.bulletins.map((b: any, i: number) => (
                                  <a key={i} href={b.url} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl transition-colors font-medium"
                                    style={{ background: 'rgba(124,58,237,0.08)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.15)' }}
                                  >
                                    <FileText style={{ width: 12, height: 12 }} />
                                    {b.annee || b.nom}
                                    <Download style={{ width: 11, height: 11 }} />
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs italic" style={{ color: 'var(--text-300)' }}>Aucun bulletin</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
