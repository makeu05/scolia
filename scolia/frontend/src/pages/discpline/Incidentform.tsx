// pages/discipline/IncidentForm.tsx
// Formulaire de signalement d'un incident + sanction immédiate optionnelle

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2, AlertTriangle } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import {
  createIncident, createSanction,
  TYPES_INCIDENT, type Gravite, type TypeSanction,
} from '../../service/discipline_service';

export default function IncidentForm() {
  const navigate = useNavigate();

  // Incident
  const [matricule, setMatricule]     = useState('');
  const [type, setType]               = useState('');
  const [typeCustom, setTypeCustom]   = useState('');
  const [description, setDescription] = useState('');
  const [dateIncident, setDate]       = useState(new Date().toISOString().split('T')[0]);
  const [gravite, setGravite]         = useState<Gravite>('leger');

  // Sanction immédiate
  const [avecSanction, setAvecSanction]         = useState(false);
  const [typeSanction, setTypeSanction]         = useState<TypeSanction>('avertissement');
  const [motif, setMotif]                       = useState('');
  const [dateSanction, setDateSanction]         = useState(new Date().toISOString().split('T')[0]);
  const [dateExpiration, setDateExpiration]     = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricule) { setError('Matricule de l\'élève requis'); return; }
    const typeIncident = type === 'Autre' ? typeCustom : type;
    if (!typeIncident) { setError('Type d\'incident requis'); return; }

    setSaving(true);
    setError('');
    try {
      const idPers  = Number(localStorage.getItem('idPers')  ?? 1);
      const idAdmin = Number(localStorage.getItem('idAdmin') ?? 1);

      const incident = await createIncident({
        matricule: Number(matricule),
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

        {/* Incident */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <h3 className="section-title mb-0">Détails de l'incident</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-slate-500 font-medium">
                Matricule élève <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                placeholder="Ex : 2024001"
                className="input w-full"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-500 font-medium">Date</label>
              <input
                type="date"
                value={dateIncident}
                onChange={(e) => setDate(e.target.value)}
                className="input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-slate-500 font-medium">
                Type d'incident <span className="text-red-400">*</span>
              </label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="input w-full" required>
                <option value="">— Sélectionner —</option>
                {TYPES_INCIDENT.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {type === 'Autre' && (
                <input
                  type="text"
                  value={typeCustom}
                  onChange={(e) => setTypeCustom(e.target.value)}
                  placeholder="Préciser le type…"
                  className="input w-full mt-2"
                />
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm text-slate-500 font-medium">Gravité</label>
              <div className="flex gap-2 pt-1">
                {(['leger', 'moyen', 'grave'] as Gravite[]).map((g) => (
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
            <label className="text-sm text-slate-500 font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Décrivez les faits…"
              className="input w-full resize-none"
            />
          </div>
        </div>

        {/* Sanction immédiate */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="section-title mb-0">Sanction immédiate</h3>
            <button
              type="button"
              onClick={() => setAvecSanction((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${avecSanction ? 'bg-violet-500' : 'bg-slate-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${avecSanction ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          {avecSanction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm text-slate-500 font-medium">Type de sanction</label>
                  <select value={typeSanction} onChange={(e) => setTypeSanction(e.target.value as TypeSanction)} className="input w-full">
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
                  <input type="date" value={dateSanction} onChange={(e) => setDateSanction(e.target.value)} className="input w-full" />
                </div>
              </div>

              {(typeSanction === 'exclusion_temporaire') && (
                <div className="space-y-1">
                  <label className="text-sm text-slate-500 font-medium">Date de fin d'exclusion</label>
                  <input type="date" value={dateExpiration} onChange={(e) => setDateExpiration(e.target.value)} className="input w-full" />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm text-slate-500 font-medium">Motif</label>
                <textarea
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  rows={2}
                  placeholder="Motif de la sanction (laisser vide pour reprendre la description)…"
                  className="input w-full resize-none"
                />
              </div>

              {['convocation_parent', 'exclusion_temporaire', 'exclusion_definitive'].includes(typeSanction) && (
                <p className="text-xs text-violet-600 bg-violet-50 px-3 py-2 rounded-xl">
                  ℹ Les parents seront automatiquement notifiés après la création.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pb-8">
          <button type="button" onClick={() => navigate('/discipline')} className="btn-secondary">Annuler</button>
          <button type="submit" disabled={saving} className="btn-primary gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Enregistrer
          </button>
        </div>
      </form>
    </PageLayout>
  );
}