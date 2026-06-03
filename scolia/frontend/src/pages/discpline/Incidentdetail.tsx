// pages/discipline/IncidentDetail.tsx
// Fiche détail incident + gestion des sanctions

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2, Edit, Bell, Plus, AlertTriangle, Shield, Loader2, Save } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import {
  getIncident, deleteIncident, createSanction, deleteSanction, notifierParents,
  type Incident, type TypeSanction,
  GRAVITE_LABEL, SANCTION_LABEL,
} from '../../service/discipline_service';

const GRAVITE_BG: Record<string, string> = {
  leger: 'bg-yellow-50 text-yellow-600',
  moyen: 'bg-orange-50 text-orange-600',
  grave: 'bg-red-50 text-red-600',
};

export default function IncidentDetail() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  // Ajout sanction
  const [showSanctionForm, setShowSanctionForm] = useState(false);
  const [typeSanction, setTypeSanction]         = useState<TypeSanction>('avertissement');
  const [motif, setMotif]                       = useState('');
  const [dateSanction, setDateSanction]         = useState(new Date().toISOString().split('T')[0]);
  const [dateExpiration, setDateExpiration]     = useState('');
  const [savingSanction, setSavingSanction]     = useState(false);

  const load = () => {
    if (!id) return;
    setLoading(true);
    getIncident(Number(id))
      .then(setIncident)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleDelete = async () => {
    if (!confirm('Supprimer cet incident et toutes ses sanctions ?')) return;
    await deleteIncident(Number(id));
    navigate('/discipline');
  };

  const handleAddSanction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSavingSanction(true);
    try {
      const idAdmin = Number(localStorage.getItem('idAdmin') ?? 1);
      await createSanction(Number(id), {
        type: typeSanction, motif, dateSanction,
        dateExpiration: dateExpiration || undefined, idAdmin,
      });
      setShowSanctionForm(false);
      setMotif(''); setDateExpiration('');
      load();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingSanction(false);
    }
  };

  const handleDeleteSanction = async (idSanction: number) => {
    if (!confirm('Supprimer cette sanction ?')) return;
    await deleteSanction(idSanction);
    load();
  };

  const handleNotifier = async (idSanction: number) => {
    await notifierParents(idSanction);
    alert('Parents notifiés avec succès');
    load();
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="space-y-3 w-full max-w-md px-6">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}
      </div>
    </div>
  );

  if (error || !incident) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-red-600">{error || 'Incident introuvable'}</p>
    </div>
  );

  return (
    <PageLayout
      title={`Incident #${incident.idIncident}`}
      subtitle={`${incident.eleve?.nom} ${incident.eleve?.prenom} — ${new Date(incident.dateIncident).toLocaleDateString('fr-FR')}`}
      backTo="/discipline"
      actions={
        <div className="flex gap-2">
          <button onClick={() => navigate(`/discipline/${id}/modifier`)} className="btn-secondary gap-2">
            <Edit className="w-4 h-4" /> Modifier
          </button>
          <button onClick={handleDelete} className="btn-secondary gap-2 text-red-600 hover:bg-red-50 border-red-200">
            <Trash2 className="w-4 h-4" /> Supprimer
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Détails incident */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Détails de l'incident</h3>
          <div className="space-y-3">
            {[
              { label: 'Élève',       value: `${incident.eleve?.nom} ${incident.eleve?.prenom}` },
              { label: 'Matricule',   value: String(incident.matricule) },
              { label: 'Type',        value: incident.type },
              { label: 'Date',        value: new Date(incident.dateIncident).toLocaleDateString('fr-FR') },
              { label: 'Rapporteur',  value: `${incident.rapporteur?.prenom} ${incident.rapporteur?.nom}` },
            ].map((row) => (
              <div key={row.label} className="flex justify-between gap-3 py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-400">{row.label}</span>
                <span className="text-sm font-medium text-slate-900">{row.value}</span>
              </div>
            ))}
            <div className="flex justify-between gap-3 py-2">
              <span className="text-sm text-slate-400">Gravité</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${GRAVITE_BG[incident.gravite]}`}>
                {GRAVITE_LABEL[incident.gravite]}
              </span>
            </div>
          </div>
          {incident.description && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-1">Description</p>
              <p className="text-sm text-slate-600 leading-relaxed">{incident.description}</p>
            </div>
          )}
        </div>

        {/* Sanctions */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title mb-0">Sanctions</h3>
            <button
              onClick={() => setShowSanctionForm((v) => !v)}
              className="btn-secondary gap-1.5 text-xs py-1.5 px-3"
            >
              <Plus className="w-3.5 h-3.5" /> Ajouter
            </button>
          </div>

          {/* Formulaire ajout sanction */}
          {showSanctionForm && (
            <form onSubmit={handleAddSanction} className="mb-4 p-4 bg-slate-50 rounded-2xl space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-medium">Type</label>
                <select value={typeSanction} onChange={(e) => setTypeSanction(e.target.value as TypeSanction)} className="input w-full text-sm">
                  <option value="avertissement">Avertissement</option>
                  <option value="blame">Blâme</option>
                  <option value="convocation_parent">Convocation des parents</option>
                  <option value="exclusion_temporaire">Exclusion temporaire</option>
                  <option value="exclusion_definitive">Exclusion définitive</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-500 font-medium">Date sanction</label>
                  <input type="date" value={dateSanction} onChange={(e) => setDateSanction(e.target.value)} className="input w-full text-sm" />
                </div>
                {typeSanction === 'exclusion_temporaire' && (
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 font-medium">Fin exclusion</label>
                    <input type="date" value={dateExpiration} onChange={(e) => setDateExpiration(e.target.value)} className="input w-full text-sm" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-medium">Motif</label>
                <textarea value={motif} onChange={(e) => setMotif(e.target.value)} rows={2} className="input w-full text-sm resize-none" />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowSanctionForm(false)} className="btn-secondary text-xs py-1.5 px-3">Annuler</button>
                <button type="submit" disabled={savingSanction} className="btn-primary gap-1.5 text-xs py-1.5 px-3">
                  {savingSanction ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  Enregistrer
                </button>
              </div>
            </form>
          )}

          {/* Liste sanctions */}
          {!incident.sanctions || incident.sanctions.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-slate-400 gap-2">
              <Shield className="w-8 h-8 opacity-20" />
              <p className="text-sm">Aucune sanction</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {incident.sanctions.map((s) => (
                <li key={s.idSanction} className="p-3 bg-slate-50 rounded-2xl">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{SANCTION_LABEL[s.type]}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{new Date(s.dateSanction).toLocaleDateString('fr-FR')}</p>
                      {s.dateExpiration && (
                        <p className="text-xs text-orange-500 mt-0.5">
                          Jusqu'au {new Date(s.dateExpiration).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                      {s.motif && <p className="text-xs text-slate-500 mt-1">{s.motif}</p>}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {!s.parentNotifie && ['convocation_parent','exclusion_temporaire','exclusion_definitive'].includes(s.type) && (
                        <button
                          onClick={() => handleNotifier(s.idSanction)}
                          className="p-1.5 rounded-lg hover:bg-violet-50 text-violet-500"
                          title="Notifier les parents"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {s.parentNotifie && (
                        <span className="text-xs px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full self-start">
                          Parents notifiés
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteSanction(s.idSanction)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PageLayout>
  );
}