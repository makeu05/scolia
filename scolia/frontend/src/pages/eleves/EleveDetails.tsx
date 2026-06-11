// src/pages/eleves/EleveDetails.tsx — Fix chargement robuste

import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { authFetch } from "../../service/auth";
import {
  ArrowLeft, CreditCard, Edit, Trash2, Heart, School,
  Plus, Upload, Loader2, FileText, Download, X, Phone,
  User, Calendar, MapPin, Droplets, AlertTriangle, CheckCircle,
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
  'A+':'bg-red-50 text-red-600', 'A-':'bg-red-50 text-red-600',
  'B+':'bg-blue-50 text-blue-600', 'B-':'bg-blue-50 text-blue-600',
  'AB+':'bg-purple-50 text-purple-600', 'AB-':'bg-purple-50 text-purple-600',
  'O+':'bg-emerald-50 text-emerald-600', 'O-':'bg-emerald-50 text-emerald-600',
  'inconnu':'bg-slate-100 text-slate-500',
};

type Tab = "infos" | "sante" | "anterieur";

export default function EleveDetails() {
  const { matricule } = useParams<{ matricule: string }>();
  const navigate      = useNavigate();

  const [eleve, setEleve]           = useState<any>(null);
  const [sante, setSante]           = useState<any>(null);
  const [anterieur, setAnterieur]   = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [tab, setTab]               = useState<Tab>("infos");
  const [santeDisponible, setSanteDisponible] = useState(true);

  // Santé form
  const [editingSante, setEditingSante] = useState(false);
  const [santeForm, setSanteForm]       = useState<any>({});
  const [savingSante, setSavingSante]   = useState(false);
  const [vaccins, setVaccins]           = useState<any[]>([]);

  // Scolarité antérieure form
  const [showAntForm, setShowAntForm] = useState(false);
  const [antForm, setAntForm]         = useState({
    etablissement_nom: '', etablissement_ville: '', etablissement_type: 'Privé',
    classe_precedente: '', annee_scolaire: '', moyenne_annuelle: '',
    appreciation: '', redoublant: false, motif_depart: '',
  });
  const [savingAnt, setSavingAnt]     = useState(false);

  // Upload bulletin
  const bulletinRef                   = useRef<HTMLInputElement>(null);
  const [uploadingBulletin, setUploadingBulletin] = useState<number | null>(null);

  const load = async () => {
    if (!matricule) return;
    setLoading(true);
    setError('');

    // ✅ Charger l'élève séparément — si ça échoue, afficher l'erreur
    try {
      const eleveRes = await authFetch(`${API}/eleves/${matricule}`);
      if (!eleveRes.ok) {
        const d = await eleveRes.json();
        throw new Error(d.message ?? `Erreur ${eleveRes.status}`);
      }
      const eleveData = await eleveRes.json();
      setEleve(eleveData);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
      return; // ← stop ici si l'élève ne charge pas
    }

    // ✅ Charger santé et scolarité antérieure indépendamment (ne bloquent pas l'affichage)
    try {
      const santeRes = await authFetch(`${API}/eleves/${matricule}/sante`);
      if (santeRes.ok) {
        const santeData = await santeRes.json();
        setSante(santeData);
        setSanteForm(santeData);
        setVaccins(santeData.vaccins ?? []);
      } else {
        // Migration pas encore jouée — on désactive l'onglet santé
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
      setAntForm({ etablissement_nom:'', etablissement_ville:'', etablissement_type:'Privé',
        classe_precedente:'', annee_scolaire:'', moyenne_annuelle:'',
        appreciation:'', redoublant:false, motif_depart:'' });
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

  if (loading) return (
    <div className="max-w-5xl mx-auto px-6 py-6 space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="skeleton h-20 rounded-2xl" />
      ))}
    </div>
  );

  if (error || !eleve) return (
    <div className="p-10 text-center space-y-4">
      <p className="text-red-600 font-medium">{error || 'Élève non trouvé'}</p>
      {error?.includes('500') && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 max-w-md mx-auto text-left">
          <p className="font-semibold mb-1">⚠ Migrations manquantes</p>
          <p>Lancez ces commandes :</p>
          <code className="block bg-amber-100 rounded p-2 mt-2 text-xs">
            php artisan migrate --path=database/migrations/TIMESTAMP_add_extra_fields_to_eleve.php
          </code>
        </div>
      )}
      <Link to="/eleves" className="text-blue-600 underline inline-block">← Retour à la liste</Link>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/eleves" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} /> Retour
        </Link>
        <h1 className="text-3xl font-bold flex-1">Détails de l'élève</h1>
      </div>

      {/* Carte principale */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
              {getPhotoUrl(eleve.photoURL) ? (
                <img src={getPhotoUrl(eleve.photoURL)!} alt={eleve.nom}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <User className="w-8 h-8" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{eleve.nom} {eleve.prenom}</h2>
              <p className="text-gray-500">Matricule : {eleve.matricule}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  eleve.actif ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {eleve.actif ? "Actif" : "Archivé"}
                </span>
                {sante?.groupe_sanguin && sante.groupe_sanguin !== 'inconnu' && (
                  <span className={`text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1 ${
                    GROUPE_SANGUIN_COLOR[sante.groupe_sanguin]
                  }`}>
                    <Droplets className="w-3 h-3" /> {sante.groupe_sanguin}
                  </span>
                )}
                {eleve.langue && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                    {eleve.langue === 'fr' ? 'Français' : eleve.langue === 'en' ? 'Anglais' : 'Bilingue'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button onClick={() => navigate(`/eleves/${matricule}/paiements`)}
              className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2.5 rounded-xl hover:bg-violet-700 transition text-sm">
              <CreditCard size={16} /> Paiements
            </button>
            <Link to={`/eleves/${matricule}/modifier`}
              className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2.5 rounded-xl hover:bg-amber-700 transition text-sm">
              <Edit size={16} /> Modifier
            </Link>
            <button onClick={handleDelete}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 transition text-sm">
              <Trash2 size={16} /> Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* Parents */}
      <ParentsSection matricule={eleve.matricule} />

      {/* Alerte migrations manquantes */}
      {!santeDisponible && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-700">Migrations en attente</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Les onglets Santé et Scolarité antérieure nécessitent des migrations.
              Lancez : <code className="bg-amber-100 px-1 rounded">php artisan migrate</code>
            </p>
          </div>
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
        {([
          { id: "infos",     label: "Informations",        icon: User   },
          { id: "sante",     label: "Santé",               icon: Heart  },
          { id: "anterieur", label: "Scolarité antérieure", icon: School },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
            {!santeDisponible && (t.id === 'sante' || t.id === 'anterieur') && (
              <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* ── TAB INFOS ── */}
      {tab === "infos" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="card p-5 space-y-3">
            <h3 className="section-title">Informations personnelles</h3>
            {[
              { label: "Nom complet",        value: `${eleve.nom} ${eleve.prenom}` },
              { label: "Date de naissance",  value: new Date(eleve.dateNaissance).toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" }) },
              { label: "Lieu de naissance",  value: eleve.lieuNaissance ?? "—" },
              { label: "Sexe",               value: SEXE_LABELS[eleve.sexe] ?? "—" },
              { label: "Langue",             value: eleve.langue === 'fr' ? 'Français' : eleve.langue === 'en' ? 'Anglais' : eleve.langue ?? "—" },
              { label: "Religion",           value: eleve.religion ?? "—" },
              { label: "Situation familiale",value: SITUATION_LABELS[eleve.situation_familiale] ?? "—" },
            ].map(row => (
              <div key={row.label} className="flex justify-between gap-3 py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-400">{row.label}</span>
                <span className="text-sm font-medium text-slate-900 text-right">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="card p-5 space-y-3">
              <h3 className="section-title">Contact d'urgence</h3>
              {eleve.contact_urgence_nom ? (
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                  <Phone className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{eleve.contact_urgence_nom}</p>
                    <p className="text-xs text-slate-400">
                      {eleve.contact_urgence_lien} · {eleve.contact_urgence_tel}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">Non renseigné</p>
              )}
            </div>

            {eleve.tuteur_nom && (
              <div className="card p-5 space-y-3">
                <h3 className="section-title">Tuteur légal</h3>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <User className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{eleve.tuteur_nom}</p>
                    <p className="text-xs text-slate-400">{eleve.tuteur_profession} · {eleve.tuteur_tel}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB SANTÉ ── */}
      {tab === "sante" && (
        !santeDisponible ? (
          <div className="card p-12 text-center text-slate-400 space-y-3">
            <Heart className="w-10 h-10 mx-auto opacity-20" />
            <p className="font-medium">Fonctionnalité non disponible</p>
            <p className="text-sm">Lancez les migrations pour activer la fiche santé.</p>
            <code className="text-xs bg-slate-100 px-3 py-1.5 rounded-lg block max-w-sm mx-auto">
              php artisan migrate
            </code>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900">Fiche santé</h3>
              {!editingSante ? (
                <button onClick={() => setEditingSante(true)} className="btn-secondary gap-2 text-sm">
                  <Edit className="w-4 h-4" /> Modifier
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditingSante(false)} className="btn-secondary text-sm">Annuler</button>
                  <button onClick={handleSaveSante} disabled={savingSante} className="btn-primary gap-2 text-sm">
                    {savingSante ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Enregistrer
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="card p-5 space-y-4">
                <h4 className="text-sm font-semibold text-slate-700">Informations générales</h4>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Groupe sanguin</label>
                  {editingSante ? (
                    <select value={santeForm.groupe_sanguin ?? 'inconnu'}
                      onChange={e => setSanteForm((f: any) => ({ ...f, groupe_sanguin: e.target.value }))}
                      className="input w-full">
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-','inconnu'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`inline-flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full ${GROUPE_SANGUIN_COLOR[sante?.groupe_sanguin ?? 'inconnu']}`}>
                      <Droplets className="w-3.5 h-3.5" /> {sante?.groupe_sanguin ?? 'inconnu'}
                    </span>
                  )}
                </div>
                {[
                  { key: 'allergies',   label: 'Allergies',          placeholder: 'Liste des allergies…', rows: 2 },
                  { key: 'antecedents', label: 'Antécédents médicaux', placeholder: 'Antécédents…',        rows: 2 },
                ].map(f => (
                  <div key={f.key} className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{f.label}</label>
                    {editingSante ? (
                      <textarea value={santeForm[f.key] ?? ''} rows={f.rows}
                        onChange={e => setSanteForm((s: any) => ({ ...s, [f.key]: e.target.value }))}
                        placeholder={f.placeholder} className="input w-full resize-none" />
                    ) : (
                      <p className="text-sm text-slate-700">
                        {sante?.[f.key] || <span className="text-slate-400 italic">Non renseigné</span>}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="card p-5 space-y-4">
                <h4 className="text-sm font-semibold text-slate-700">Traitement & Médecin</h4>
                {[
                  { key: 'medecin_nom',       label: 'Médecin traitant',  placeholder: 'Dr. Nom'        },
                  { key: 'medecin_tel',        label: 'Tél médecin',       placeholder: '+237 6XX…'      },
                  { key: 'assurance_nom',      label: 'Assurance',         placeholder: 'Nom assurance'  },
                  { key: 'assurance_numero',   label: 'N° assurance',      placeholder: 'Numéro police'  },
                ].map(field => (
                  <div key={field.key} className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{field.label}</label>
                    {editingSante ? (
                      <input type="text" value={santeForm[field.key] ?? ''}
                        onChange={e => setSanteForm((s: any) => ({ ...s, [field.key]: e.target.value }))}
                        placeholder={field.placeholder} className="input w-full" />
                    ) : (
                      <p className="text-sm text-slate-700">
                        {sante?.[field.key] || <span className="text-slate-400 italic">—</span>}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Vaccins */}
            <div className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-700">Vaccins ({vaccins.length})</h4>
                {editingSante && (
                  <button type="button"
                    onClick={() => setVaccins(v => [...v, { nom: '', date: '', rappel: '' }])}
                    className="btn-secondary text-xs py-1.5 px-3 gap-1">
                    <Plus className="w-3 h-3" /> Ajouter
                  </button>
                )}
              </div>
              {vaccins.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Aucun vaccin enregistré</p>
              ) : (
                <div className="space-y-2">
                  {vaccins.map((v, i) => (
                    <div key={i} className="flex gap-2 items-center p-2 bg-slate-50 rounded-xl">
                      {editingSante ? (
                        <>
                          <input type="text" value={v.nom} placeholder="Vaccin"
                            onChange={e => { const nv=[...vaccins]; nv[i]={...nv[i],nom:e.target.value}; setVaccins(nv); }}
                            className="input flex-1 text-sm py-1.5" />
                          <input type="date" value={v.date}
                            onChange={e => { const nv=[...vaccins]; nv[i]={...nv[i],date:e.target.value}; setVaccins(nv); }}
                            className="input w-36 text-sm py-1.5" />
                          <button onClick={() => setVaccins(vaccins.filter((_, j) => j !== i))}
                            className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500">
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span className="text-sm font-medium text-slate-800 flex-1">{v.nom}</span>
                          {v.date && <span className="text-xs text-slate-400">{new Date(v.date).toLocaleDateString('fr-FR')}</span>}
                          {v.rappel && <span className="text-xs text-amber-500">Rappel : {new Date(v.rappel).toLocaleDateString('fr-FR')}</span>}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      )}

      {/* ── TAB SCOLARITÉ ANTÉRIEURE ── */}
      {tab === "anterieur" && (
        !santeDisponible ? (
          <div className="card p-12 text-center text-slate-400 space-y-3">
            <School className="w-10 h-10 mx-auto opacity-20" />
            <p className="font-medium">Fonctionnalité non disponible</p>
            <p className="text-sm">Lancez les migrations pour activer la scolarité antérieure.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900">Anciens établissements</h3>
              <button onClick={() => setShowAntForm(v => !v)} className="btn-primary gap-2 text-sm">
                <Plus className="w-4 h-4" /> {showAntForm ? "Annuler" : "Ajouter"}
              </button>
            </div>

            {showAntForm && (
              <form onSubmit={handleAddAnt} className="card p-5 space-y-4">
                <h4 className="text-sm font-semibold text-slate-900">Nouvel établissement</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Établissement *</label>
                    <input required type="text" value={antForm.etablissement_nom}
                      onChange={e => setAntForm(f => ({ ...f, etablissement_nom: e.target.value }))}
                      placeholder="Nom de l'école" className="input w-full" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Ville</label>
                    <input type="text" value={antForm.etablissement_ville}
                      onChange={e => setAntForm(f => ({ ...f, etablissement_ville: e.target.value }))}
                      className="input w-full" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Type</label>
                    <select value={antForm.etablissement_type}
                      onChange={e => setAntForm(f => ({ ...f, etablissement_type: e.target.value }))} className="input w-full">
                      {['Public','Privé','Mission','Confessionnel','Autre'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Classe précédente</label>
                    <input type="text" value={antForm.classe_precedente}
                      onChange={e => setAntForm(f => ({ ...f, classe_precedente: e.target.value }))}
                      placeholder="CM2, 3ème…" className="input w-full" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Année scolaire</label>
                    <input type="text" value={antForm.annee_scolaire}
                      onChange={e => setAntForm(f => ({ ...f, annee_scolaire: e.target.value }))}
                      placeholder="2023-2024" className="input w-full" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Moyenne /20</label>
                    <input type="number" min={0} max={20} step={0.01} value={antForm.moyenne_annuelle}
                      onChange={e => setAntForm(f => ({ ...f, moyenne_annuelle: e.target.value }))}
                      className="input w-full" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Motif de départ</label>
                    <input type="text" value={antForm.motif_depart}
                      onChange={e => setAntForm(f => ({ ...f, motif_depart: e.target.value }))}
                      placeholder="Déménagement, fin de cycle…" className="input w-full" />
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button"
                      onClick={() => setAntForm(f => ({ ...f, redoublant: !f.redoublant }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${antForm.redoublant ? 'bg-amber-500' : 'bg-slate-200'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${antForm.redoublant ? 'translate-x-5' : ''}`} />
                    </button>
                    <span className="text-sm text-slate-600">Redoublant</span>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAntForm(false)} className="btn-secondary">Annuler</button>
                  <button type="submit" disabled={savingAnt} className="btn-primary gap-2">
                    {savingAnt ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Ajouter
                  </button>
                </div>
              </form>
            )}

            {anterieur.length === 0 ? (
              <div className="card p-12 text-center text-slate-400">
                <School className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p>Aucun établissement antérieur enregistré</p>
              </div>
            ) : (
              <div className="space-y-4">
                {anterieur.map((a: any) => (
                  <div key={a.idScolariteAnt} className="card p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{a.etablissement_nom}</p>
                        <p className="text-sm text-slate-400">
                          {[a.etablissement_type, a.etablissement_ville, a.annee_scolaire].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      <div className="flex gap-2 items-center">
                        {a.moyenne_annuelle && (
                          <span className="text-sm font-bold text-violet-600">
                            {a.moyenne_annuelle}/20 {a.appreciation && `· ${a.appreciation}`}
                          </span>
                        )}
                        {a.redoublant && (
                          <span className="text-xs px-2 py-1 bg-amber-50 text-amber-600 rounded-full">Redoublant</span>
                        )}
                      </div>
                    </div>
                    {a.classe_precedente && <p className="text-sm text-slate-600">Classe : <strong>{a.classe_precedente}</strong></p>}
                    {a.motif_depart && <p className="text-xs text-slate-400">Motif : {a.motif_depart}</p>}

                    {/* Bulletins */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Bulletins ({a.bulletins?.length ?? 0})
                        </p>
                        <button onClick={() => bulletinRef.current?.click()}
                          className="text-xs text-violet-600 hover:underline flex items-center gap-1">
                          <Upload className="w-3 h-3" />
                          {uploadingBulletin === a.idScolariteAnt ? 'Upload…' : 'Ajouter'}
                        </button>
                        <input ref={bulletinRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                          onChange={e => { const file = e.target.files?.[0]; if (file) handleUploadBulletin(a.idScolariteAnt, file); }} />
                      </div>
                      {a.bulletins?.length > 0 ? (
                        <div className="flex gap-2 flex-wrap">
                          {a.bulletins.map((b: any, i: number) => (
                            <a key={i} href={b.url} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-violet-50 text-violet-600 rounded-xl hover:bg-violet-100">
                              <FileText className="w-3.5 h-3.5" /> {b.annee || b.nom} <Download className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Aucun bulletin</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}