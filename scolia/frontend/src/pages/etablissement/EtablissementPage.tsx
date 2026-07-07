// src/pages/etablissement/EtablissementPage.tsx
import { useEffect, useState } from "react";
import {
  Building2, MapPin, FileText, PenTool, Save, Upload,
  Loader2, CheckCircle, School, Phone, Mail, Globe, X,
} from "lucide-react";
import { authFetch } from "../../service/auth";

const API    = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
const SERVER = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api','') : 'http://localhost:8000';

type TabId = 'identite' | 'coordonnees' | 'officiel' | 'signataire';

const TABS: { id: TabId; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'identite',    label: 'Identité',    icon: Building2, color: '#6366f1' },
  { id: 'coordonnees', label: 'Coordonnées', icon: MapPin,    color: '#0ea5e9' },
  { id: 'officiel',    label: 'Officiel',    icon: FileText,  color: '#f59e0b' },
  { id: 'signataire',  label: 'Signataire',  icon: PenTool,   color: '#10b981' },
];

const empty = {
  nom: '', sigle: '', devise: '', type_etablissement: '',
  adresse: '', bp: '', telephone: '', telephone2: '', email: '', site_web: '', ville: '', region: '',
  numero_arrete: '', date_arrete: '', ministere: '', delegation: '', matricule_officiel: '', ordre_enseignement: '',
  signataire_nom: '', signataire_titre: '',
  pays_fr: '', devise_pays_fr: '', pays_en: '', devise_pays_en: '',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

export default function EtablissementPage() {
  const [tab, setTab]         = useState<TabId>('identite');
  const [form, setForm]       = useState<any>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');

  const [logo, setLogo]             = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [signature, setSignature]   = useState<File | null>(null);
  const [sigPreview, setSigPreview] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res  = await authFetch(`${API}/etablissement`);
      const data = await res.json();
      setForm({ ...empty, ...Object.fromEntries(Object.entries(data).map(([k,v]) => [k, v ?? ''])) });
      if (data.logo_url) setLogoPreview(data.logo_url);
      if (data.signataire_signature) setSigPreview(`${SERVER}/storage/${data.signataire_signature}`);
    } catch { setError("Erreur de chargement"); }
    finally { setLoading(false); }
  };

  const up = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }));

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setLogo(f); setLogoPreview(URL.createObjectURL(f));
  };
  const handleSig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setSignature(f); setSigPreview(URL.createObjectURL(f));
  };

  const save = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, (v as string) ?? ''));
      if (logo) fd.append('logo', logo);
      if (signature) fd.append('signature', signature);
      fd.append('_method', 'PUT');
      const res = await authFetch(`${API}/etablissement`, { method: 'POST', body: fd });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Erreur");
      setSuccess("Configuration enregistrée avec succès");
      setLogo(null); setSignature(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const activeTab = TABS.find(t => t.id === tab)!;

  if (loading) return (
    <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
      <div className="skeleton h-24 rounded-2xl" />
      <div className="skeleton h-96 rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">

      {/* Bannière */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)", boxShadow: "0 4px 24px rgba(99,102,241,0.4)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.06) 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{ border: "2px solid rgba(255,255,255,0.3)" }}>
              {logoPreview
                ? <img src={logoPreview} alt="logo" className="w-full h-full object-contain" />
                : <School className="w-8 h-8 text-white/60" />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-indigo-200" />
                <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">Configuration</p>
              </div>
              <h1 className="text-white text-2xl font-bold" style={{ letterSpacing: "-0.03em" }}>
                {form.nom || "Mon Établissement"}
              </h1>
              <p className="text-indigo-200/70 text-sm mt-0.5">
                {form.type_etablissement} {form.ville ? `· ${form.ville}` : ''}
              </p>
            </div>
          </div>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 bg-white text-indigo-600 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-indigo-50 transition-all disabled:opacity-60"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Enregistrer
          </button>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
          <span>{error}</span><button onClick={() => setError('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.id ? 'bg-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
            style={tab === t.id ? { color: t.color } : {}}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6" style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>

        {/* IDENTITÉ */}
        {tab === 'identite' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nom de l'établissement">
                <input className="input w-full" value={form.nom} onChange={e => up('nom', e.target.value)} placeholder="Collège Bilingue La Réussite" />
              </Field>
              <Field label="Sigle">
                <input className="input w-full" value={form.sigle} onChange={e => up('sigle', e.target.value)} placeholder="CBLR" />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Type d'établissement">
                <input className="input w-full" value={form.type_etablissement} onChange={e => up('type_etablissement', e.target.value)} placeholder="Collège Bilingue" />
              </Field>
              <Field label="Devise de l'école">
                <input className="input w-full" value={form.devise} onChange={e => up('devise', e.target.value)} placeholder="Discipline - Travail - Réussite" />
              </Field>
            </div>
            <Field label="Logo de l'établissement">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 flex-shrink-0">
                  {logoPreview ? <img src={logoPreview} alt="logo" className="w-full h-full object-contain" /> : <School className="w-8 h-8 text-slate-300" />}
                </div>
                <label className="btn-secondary gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" /> Choisir un logo
                  <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
                </label>
              </div>
            </Field>
          </div>
        )}

        {/* COORDONNÉES */}
        {tab === 'coordonnees' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Adresse"><input className="input w-full" value={form.adresse} onChange={e => up('adresse', e.target.value)} placeholder="Quartier, rue…" /></Field>
              <Field label="Boîte Postale (BP)"><input className="input w-full" value={form.bp} onChange={e => up('bp', e.target.value)} placeholder="BP 1234" /></Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Ville"><input className="input w-full" value={form.ville} onChange={e => up('ville', e.target.value)} placeholder="Yaoundé" /></Field>
              <Field label="Région"><input className="input w-full" value={form.region} onChange={e => up('region', e.target.value)} placeholder="Centre" /></Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Téléphone 1"><input className="input w-full" value={form.telephone} onChange={e => up('telephone', e.target.value)} placeholder="+237 6XX XXX XXX" /></Field>
              <Field label="Téléphone 2"><input className="input w-full" value={form.telephone2} onChange={e => up('telephone2', e.target.value)} placeholder="Optionnel" /></Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Email"><input className="input w-full" type="email" value={form.email} onChange={e => up('email', e.target.value)} placeholder="contact@ecole.cm" /></Field>
              <Field label="Site web"><input className="input w-full" value={form.site_web} onChange={e => up('site_web', e.target.value)} placeholder="www.ecole.cm" /></Field>
            </div>
          </div>
        )}

        {/* OFFICIEL */}
        {tab === 'officiel' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Numéro d'arrêté"><input className="input w-full" value={form.numero_arrete} onChange={e => up('numero_arrete', e.target.value)} placeholder="N° 123/MINESEC/…" /></Field>
              <Field label="Date de l'arrêté"><input className="input w-full" type="date" value={form.date_arrete} onChange={e => up('date_arrete', e.target.value)} /></Field>
            </div>
            <Field label="Ministère de tutelle">
              <input className="input w-full" value={form.ministere} onChange={e => up('ministere', e.target.value)} placeholder="Ministère des Enseignements Secondaires" />
            </Field>
            <Field label="Délégation régionale">
              <input className="input w-full" value={form.delegation} onChange={e => up('delegation', e.target.value)} placeholder="Délégation Régionale du Centre" />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Matricule officiel"><input className="input w-full" value={form.matricule_officiel} onChange={e => up('matricule_officiel', e.target.value)} placeholder="Code établissement" /></Field>
              <Field label="Ordre d'enseignement">
                <select className="input w-full" value={form.ordre_enseignement} onChange={e => up('ordre_enseignement', e.target.value)}>
                  <option value="">— Choisir —</option>
                  <option value="Public">Public</option>
                  <option value="Privé Laïc">Privé Laïc</option>
                  <option value="Privé Confessionnel">Privé Confessionnel</option>
                </select>
              </Field>
            </div>

            {/* En-tête bilingue */}
            <div className="border-t border-slate-100 pt-4 mt-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">En-tête officiel bilingue (documents)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Pays (Français)"><input className="input w-full" value={form.pays_fr} onChange={e => up('pays_fr', e.target.value)} placeholder="République du Cameroun" /></Field>
                <Field label="Country (English)"><input className="input w-full" value={form.pays_en} onChange={e => up('pays_en', e.target.value)} placeholder="Republic of Cameroon" /></Field>
                <Field label="Devise pays (FR)"><input className="input w-full" value={form.devise_pays_fr} onChange={e => up('devise_pays_fr', e.target.value)} placeholder="Paix - Travail - Patrie" /></Field>
                <Field label="Motto (EN)"><input className="input w-full" value={form.devise_pays_en} onChange={e => up('devise_pays_en', e.target.value)} placeholder="Peace - Work - Fatherland" /></Field>
              </div>
            </div>
          </div>
        )}

        {/* SIGNATAIRE */}
        {tab === 'signataire' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nom du signataire"><input className="input w-full" value={form.signataire_nom} onChange={e => up('signataire_nom', e.target.value)} placeholder="M. NKENG Jean" /></Field>
              <Field label="Titre / Fonction">
                <select className="input w-full" value={form.signataire_titre} onChange={e => up('signataire_titre', e.target.value)}>
                  <option value="">— Choisir —</option>
                  <option value="Le Proviseur">Le Proviseur</option>
                  <option value="Le Directeur">Le Directeur</option>
                  <option value="Le Principal">Le Principal</option>
                  <option value="La Directrice">La Directrice</option>
                  <option value="Le Chef d'établissement">Le Chef d'établissement</option>
                </select>
              </Field>
            </div>
            <Field label="Signature scannée (optionnel)">
              <div className="flex items-center gap-4">
                <div className="w-32 h-20 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 flex-shrink-0">
                  {sigPreview ? <img src={sigPreview} alt="signature" className="w-full h-full object-contain" /> : <PenTool className="w-6 h-6 text-slate-300" />}
                </div>
                <label className="btn-secondary gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" /> Choisir une signature
                  <input type="file" accept="image/*" onChange={handleSig} className="hidden" />
                </label>
              </div>
            </Field>
            <p className="text-xs text-slate-400">
              La signature apparaîtra sur les certificats de scolarité et documents officiels.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}