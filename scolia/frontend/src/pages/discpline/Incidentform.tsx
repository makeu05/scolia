// pages/discipline/IncidentForm.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2, AlertTriangle, Search, X } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { authFetch } from '../../service/auth';
import {
  createIncident, createSanction,
  TYPES_INCIDENT, type Gravite, type TypeSanction,
} from '../../service/discipline_service';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

interface EleveResult {
  matricule: number;
  nom: string;
  prenom: string;
  sexe: number;
  actif: number;
}

export default function IncidentForm() {
  const navigate = useNavigate();

  // ── Recherche élève ──────────────────────────────────────
  const [searchQ, setSearchQ]               = useState('');
  const [resultats, setResultats]           = useState<EleveResult[]>([]);
  const [searching, setSearching]           = useState(false);
  const [eleveSelectionne, setEleveSelectionne] = useState<EleveResult | null>(null);

  // ── Incident ─────────────────────────────────────────────
  const [type, setType]               = useState('');
  const [typeCustom, setTypeCustom]   = useState('');
  const [description, setDescription] = useState('');
  const [dateIncident, setDate]       = useState(new Date().toISOString().split('T')[0]);
  const [gravite, setGravite]         = useState<Gravite>('leger');

  // ── Sanction immédiate ────────────────────────────────────
  const [avecSanction, setAvecSanction]     = useState(false);
  const [typeSanction, setTypeSanction]     = useState<TypeSanction>('avertissement');
  const [motif, setMotif]                   = useState('');
  const [dateSanction, setDateSanction]     = useState(new Date().toISOString().split('T')[0]);
  const [dateExpiration, setDateExpiration] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  // ── Recherche ─────────────────────────────────────────────

  async function handleSearch() {
    if (!searchQ || searchQ.trim().length < 2) return;
    try {
      setSearching(true);
      setResultats([]);
      const res  = await authFetch(
        `${API}/eleves?search=${encodeURIComponent(searchQ.trim())}&actif=1`
      );
      const data = await res.json();
      const liste = Array.isArray(data) ? data : (data.data ?? []);
      setResultats(liste);

      if (liste.length === 0) {
        setError('Aucun élève trouvé pour cette recherche');
        setTimeout(() => setError(''), 3000);
      }
    } catch {
      setResultats([]);
    } finally {
      setSearching(false);
    }
  }

  function selectEleve(el: EleveResult) {
    setEleveSelectionne(el);
    setResultats([]);
    setSearchQ('');
    setError('');
  }

  function resetEleve() {
    setEleveSelectionne(null);
    setSearchQ('');
    setResultats([]);
  }

  // ── Submit ────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eleveSelectionne) { setError('Veuillez sélectionner un élève'); return; }
    const typeIncident = type === 'Autre' ? typeCustom : type;
    if (!typeIncident)  { setError('Type d\'incident requis'); return; }

    setSaving(true);
    setError('');

    try {
      const idPers  = Number(localStorage.getItem('idPers')  ?? 1);
      const idAdmin = Number(localStorage.getItem('idAdmin') ?? 1);

      const incident = await createIncident({
        matricule: eleveSelectionne.matricule,
        idPers,
        type: typeIncident,
        description,
        dateIncident,
        gravite,
        idAdmin,
      });

      if (avecSanction) {
        await createSanction(incident.idIncident, {
          type: typeSanction,
          motif: motif || description,
          dateSanction,
          dateExpiration: dateExpiration || undefined,
          idAdmin,
        });
      }

      navigate(`/discipline/${incident.idIncident}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout title="Signaler un incident" backTo="/discipline">
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ══ RECHERCHE ÉLÈVE ══════════════════════════════════ */}
        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <h3 className="section-title mb-0">
              Élève concerné <span className="text-red-400">*</span>
            </h3>
          </div>

          {/* Élève sélectionné */}
          {eleveSelectionne ? (
            <div className="flex items-center justify-between bg-violet-50 border border-violet-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-base flex-shrink-0">
                  {eleveSelectionne.sexe === 0 ? '👧' : '👦'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-violet-900">
                    {eleveSelectionne.prenom} {eleveSelectionne.nom}
                  </p>
                  <p className="text-xs text-violet-500">
                    Matricule #{eleveSelectionne.matricule}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetEleve}
                className="p-1.5 rounded-lg hover:bg-violet-100 transition text-violet-400 hover:text-violet-600"
                title="Changer d'élève"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="relative">

              {/* Barre de recherche */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQ}
                    onChange={e => {
                      setSearchQ(e.target.value);
                      if (!e.target.value) setResultats([]);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') { e.preventDefault(); handleSearch(); }
                      if (e.key === 'Escape') setResultats([]);
                    }}
                    placeholder="Nom, prénom ou matricule de l'élève…"
                    className="input w-full pl-9"
                    autoComplete="off"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={searching || searchQ.trim().length < 2}
                  className="btn-secondary px-4 gap-1.5 disabled:opacity-50"
                >
                  {searching
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Search className="w-3.5 h-3.5" />
                  }
                  {searching ? 'Recherche…' : 'Chercher'}
                </button>
              </div>

              {/* Résultats dropdown */}
              {resultats.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {resultats.length} résultat{resultats.length > 1 ? 's' : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => setResultats([])}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Fermer
                    </button>
                  </div>
                  <div className="max-h-52 overflow-y-auto">
                    {resultats.map(el => (
                      <button
                        key={el.matricule}
                        type="button"
                        onClick={() => selectEleve(el)}
                        className="w-full text-left px-4 py-3 hover:bg-violet-50 transition border-b border-slate-50 last:border-0 flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm flex-shrink-0">
                          {el.sexe === 0 ? '👧' : '👦'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {el.prenom} {el.nom}
                          </p>
                          <p className="text-xs text-slate-400">
                            Matricule #{el.matricule}
                          </p>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${
                          el.actif ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                        }`}>
                          {el.actif ? 'Actif' : 'Archivé'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Hint */}
              {searchQ.length > 0 && searchQ.length < 2 && (
                <p className="text-xs text-slate-400 mt-1.5">
                  Saisir au moins 2 caractères puis appuyer sur Entrée ou cliquer Chercher
                </p>
              )}
            </div>
          )}
        </div>

        {/* ══ DÉTAILS INCIDENT ═════════════════════════════════ */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <h3 className="section-title mb-0">Détails de l'incident</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-slate-500 font-medium">Date</label>
              <input
                type="date"
                value={dateIncident}
                onChange={e => setDate(e.target.value)}
                className="input w-full"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-500 font-medium">Gravité</label>
              <div className="flex gap-2 pt-1">
                {(['leger', 'moyen', 'grave'] as Gravite[]).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGravite(g)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${
                      gravite === g
                        ? g === 'grave' ? 'bg-red-500 text-white border-red-500'
                          : g === 'moyen' ? 'bg-orange-400 text-white border-orange-400'
                          : 'bg-yellow-400 text-white border-yellow-400'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {g === 'leger' ? 'Léger' : g === 'moyen' ? 'Moyen' : 'Grave'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-500 font-medium">
              Type d'incident <span className="text-red-400">*</span>
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="input w-full"
              required
            >
              <option value="">— Sélectionner —</option>
              {TYPES_INCIDENT.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {type === 'Autre' && (
              <input
                type="text"
                value={typeCustom}
                onChange={e => setTypeCustom(e.target.value)}
                placeholder="Préciser le type…"
                className="input w-full mt-2"
              />
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-500 font-medium">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Décrivez les faits…"
              className="input w-full resize-none"
            />
          </div>
        </div>

        {/* ══ SANCTION IMMÉDIATE ═══════════════════════════════ */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="section-title mb-0">Sanction immédiate</h3>
            <button
              type="button"
              onClick={() => setAvecSanction(v => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                avecSanction ? 'bg-violet-500' : 'bg-slate-200'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                avecSanction ? 'translate-x-5' : ''
              }`} />
            </button>
          </div>

          {avecSanction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-slate-500 font-medium">Type de sanction</label>
                  <select
                    value={typeSanction}
                    onChange={e => setTypeSanction(e.target.value as TypeSanction)}
                    className="input w-full"
                  >
                    <option value="avertissement">Avertissement</option>
                    <option value="blame">Blâme</option>
                    <option value="convocation_parent">Convocation des parents</option>
                    <option value="exclusion_temporaire">Exclusion temporaire</option>
                    <option value="exclusion_definitive">Exclusion définitive</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-500 font-medium">Date sanction</label>
                  <input
                    type="date"
                    value={dateSanction}
                    onChange={e => setDateSanction(e.target.value)}
                    className="input w-full"
                  />
                </div>
              </div>

              {typeSanction === 'exclusion_temporaire' && (
                <div className="space-y-1">
                  <label className="text-sm text-slate-500 font-medium">Date de fin d'exclusion</label>
                  <input
                    type="date"
                    value={dateExpiration}
                    onChange={e => setDateExpiration(e.target.value)}
                    className="input w-full"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm text-slate-500 font-medium">Motif</label>
                <textarea
                  value={motif}
                  onChange={e => setMotif(e.target.value)}
                  rows={2}
                  placeholder="Motif de la sanction (laisser vide pour reprendre la description)…"
                  className="input w-full resize-none"
                />
              </div>

              {['convocation_parent', 'exclusion_temporaire', 'exclusion_definitive']
                .includes(typeSanction) && (
                <p className="text-xs text-violet-600 bg-violet-50 px-3 py-2 rounded-xl">
                  ℹ Les parents seront automatiquement notifiés après la création.
                </p>
              )}
            </div>
          )}
        </div>

        {/* ══ ACTIONS ══════════════════════════════════════════ */}
        <div className="flex justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={() => navigate('/discipline')}
            className="btn-secondary"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving || !eleveSelectionne}
            className="btn-primary gap-2"
          >
            {saving
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Save className="w-4 h-4" />
            }
            Enregistrer
          </button>
        </div>
      </form>
    </PageLayout>
  );
}