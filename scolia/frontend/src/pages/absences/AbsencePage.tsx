// src/pages/absences/AbsencePage.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserX, Plus, CheckCircle,
  AlertTriangle, Clock, Trash2,
} from 'lucide-react';
import { authFetch } from '../../service/auth';
import { useAnnee } from '../../context/AnneeContext'; // ✅ import contexte

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUT_CONFIG = {
  non_justifiee: { label: 'Non justifiée', bg: 'bg-red-50',    text: 'text-red-600',    icon: AlertTriangle },
  justifiee:     { label: 'Justifiée',     bg: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircle   },
  retard:        { label: 'Retard',        bg: 'bg-amber-50',   text: 'text-amber-600',   icon: Clock         },
};

export default function AbsencePage() {
  const navigate = useNavigate();

  // ✅ Année depuis le contexte global
  const { idAca, annees, setIdAca } = useAnnee();

  const [absences, setAbsences]   = useState<any[]>([]);
  const [meta, setMeta]           = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [cours, setCours]         = useState<any[]>([]);
  const [classes, setClasses]     = useState<any[]>([]);

  // Filtres locaux
  const [statut, setStatut]   = useState('');
  const [mode, setMode]       = useState('');
  const [page, setPage]       = useState(1);

  // Modal saisie
  const [showForm, setShowForm]   = useState(false);
  const [formMode, setFormMode]   = useState<'individuelle' | 'classe'>('individuelle');

  // Form individuelle
  const [form, setForm] = useState({
    matricule: '', nom_eleve: '',
    date_absence: new Date().toISOString().split('T')[0],
    mode: 'journee', statut: 'non_justifiee',
    idCours: '', motif: '', nb_heures: '1',
  });
  const [elevesSearch, setElevesSearch]   = useState('');
  const [elevesResults, setElevesResults] = useState<any[]>([]);
  const [saving, setSaving]               = useState(false);
  const [errForm, setErrForm]             = useState('');

  // Form classe (bulk)
  const [idClasseSelected, setIdClasseSelected] = useState('');
  const [elevesClasse, setElevesClasse]   = useState<any[]>([]);
  const [absencesBulk, setAbsencesBulk]  = useState<Record<string, { checked: boolean; statut: string; motif: string }>>({});
  const [bulkDate, setBulkDate]           = useState(new Date().toISOString().split('T')[0]);
  const [bulkIdCours, setBulkIdCours]     = useState('');
  const [bulkMode, setBulkMode]           = useState('seance');

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (statut) params.append('statut', statut);
      if (mode)   params.append('mode',   mode);
      if (idAca)  params.append('idAca',  idAca);

      const res  = await authFetch(`${API}/absences?${params}`);
      const data = await res.json();
      setAbsences(data.data ?? []);
      setMeta(data);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => {
    // ✅ Plus besoin de charger les années ici, elles viennent du contexte
    authFetch(`${API}/cours?paginate=false`).then(r => r.json()).then(d => setCours(Array.isArray(d) ? d : (d.data ?? [])));
    authFetch(`${API}/classes?paginate=false`).then(r => r.json()).then(d => setClasses(Array.isArray(d) ? d : (d.data ?? [])));
  }, []);

  // ✅ Recharger quand idAca change (depuis le contexte)
  useEffect(() => { if (idAca) load(); }, [page, statut, mode, idAca]);

  const searchEleve = async () => {
    if (elevesSearch.length < 2) return;
    const res  = await authFetch(`${API}/eleves?search=${encodeURIComponent(elevesSearch)}`);
    const data = await res.json();
    setElevesResults(data.data ?? []);
  };

  const loadElevesClasse = async (idClasse: string) => {
    if (!idClasse) return;
    const res  = await authFetch(`${API}/inscriptions/eleves-classe?idClasse=${idClasse}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    setElevesClasse(list);
    const init: Record<string, any> = {};
    list.forEach((e: any) => {
      init[e.matricule] = { checked: false, statut: 'non_justifiee', motif: '' };
    });
    setAbsencesBulk(init);
  };

  const handleStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErrForm('');
    try {
      const idPers = Number(localStorage.getItem('idPers') ?? 1);
      const res = await authFetch(`${API}/absences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          matricule: Number(form.matricule),
          idAca:     Number(idAca), // ✅ depuis le contexte
          idCours:   form.idCours ? Number(form.idCours) : null,
          nb_heures: Number(form.nb_heures),
          idPers,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      setShowForm(false);
      load();
    } catch (err: any) { setErrForm(err.message); }
    finally { setSaving(false); }
  };

  const handleBulk = async () => {
    setSaving(true); setErrForm('');
    try {
      const idPers = Number(localStorage.getItem('idPers') ?? 1);
      const absents = Object.entries(absencesBulk)
        .filter(([, v]) => v.checked)
        .map(([mat, v]) => ({ matricule: Number(mat), statut: v.statut, motif: v.motif }));

      if (absents.length === 0) throw new Error('Sélectionnez au moins un élève');

      const res = await authFetch(`${API}/absences/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          absences:     absents,
          idAca:        Number(idAca), // ✅ depuis le contexte
          date_absence: bulkDate,
          mode:         bulkMode,
          idCours:      bulkIdCours ? Number(bulkIdCours) : null,
          idPers,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      setShowForm(false);
      load();
    } catch (err: any) { setErrForm(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette absence ?')) return;
    await authFetch(`${API}/absences/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Bannière */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#f6d365 0%,#fda085 100%)', boxShadow: '0 4px 24px rgba(253,160,133,0.4)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.06) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UserX className="w-4 h-4 text-orange-100" />
              <p className="text-orange-100 text-xs font-semibold uppercase tracking-wider">Suivi</p>
            </div>
            <h1 className="text-white text-2xl font-bold" style={{ letterSpacing: '-0.03em' }}>Absences & Retards</h1>
            {/* ✅ Affiche l'année active */}
            <p className="text-orange-100/70 text-sm mt-1">
              {meta?.total ?? 0} enregistrement(s)
              {annees.find(a => String(a.idAnnee) === idAca)?.libelle
                ? ` · ${annees.find(a => String(a.idAnnee) === idAca)?.libelle}`
                : ''}
            </p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-white text-orange-600 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-orange-50 transition-all"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
            <Plus className="w-4 h-4" /> Saisir une absence
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 flex-wrap">
        {/* ✅ Sélecteur d'année lié au contexte global */}
        <select value={idAca} onChange={e => setIdAca(e.target.value)} className="input min-w-[200px]">
          {annees.map((a: any) => (
            <option key={a.idAnnee} value={a.idAnnee}>
              {a.libelle}{a.statut === 'active' ? ' ✓' : a.statut === 'cloturee' ? ' 🔒' : ''}
            </option>
          ))}
        </select>
        <select value={statut} onChange={e => setStatut(e.target.value)} className="input min-w-[160px]">
          <option value="">Tous les statuts</option>
          <option value="non_justifiee">Non justifiée</option>
          <option value="justifiee">Justifiée</option>
          <option value="retard">Retard</option>
        </select>
        <select value={mode} onChange={e => setMode(e.target.value)} className="input min-w-[140px]">
          <option value="">Tous les modes</option>
          <option value="journee">Journée</option>
          <option value="seance">Séance</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
          </div>
        ) : absences.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-slate-400 gap-3">
            <UserX className="w-12 h-12 opacity-20" />
            <p>Aucune absence enregistrée</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Élève', 'Date', 'Mode', 'Statut', 'Cours', 'Motif', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {absences.map((a: any) => {
                const s = STATUT_CONFIG[a.statut as keyof typeof STATUT_CONFIG] ?? STATUT_CONFIG.non_justifiee;
                const StatusIcon = s.icon;
                return (
                  <tr key={a.idAbsence}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/eleves/${a.matricule}`)}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center text-xs font-bold text-orange-600 flex-shrink-0">
                          {a.prenom?.[0]}{a.nom?.[0]}
                        </div>
                        <span className="text-sm font-medium text-slate-900">{a.prenom} {a.nom}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500">{fmtDate(a.date_absence)}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
                        {a.mode === 'journee' ? 'Journée' : 'Séance'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium w-fit ${s.bg} ${s.text}`}>
                        <StatusIcon className="w-3 h-3" /> {s.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500">{a.cours_libelle ?? '—'}</td>
                    <td className="px-5 py-3 text-sm text-slate-400 max-w-[150px] truncate">{a.motif ?? '—'}</td>
                    <td className="px-5 py-3" onClick={ev => ev.stopPropagation()}>
                      <button onClick={() => handleDelete(a.idAbsence)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">{meta.total} absence(s)</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary py-2 px-4 disabled:opacity-40">Précédent</button>
            <span className="flex items-center px-3 text-sm">{page} / {meta.last_page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page === meta.last_page} className="btn-secondary py-2 px-4 disabled:opacity-40">Suivant</button>
          </div>
        </div>
      )}

      {/* ── Modal saisie ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Saisir une absence</h3>
                {/* ✅ Rappel de l'année active dans le modal */}
                <p className="text-xs text-slate-400 mt-0.5">
                  {annees.find(a => String(a.idAnnee) === idAca)?.libelle}
                </p>
              </div>
              <button onClick={() => { setShowForm(false); setErrForm(''); }}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">✕</button>
            </div>

            {/* Onglets */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
              {(['individuelle', 'classe'] as const).map(m => (
                <button key={m} onClick={() => setFormMode(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    formMode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                  }`}>
                  {m === 'individuelle' ? 'Élève individuel' : 'Toute une classe'}
                </button>
              ))}
            </div>

            {errForm && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{errForm}</div>
            )}

            {/* ── Individuelle ── */}
            {formMode === 'individuelle' && (
              <form onSubmit={handleStore} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Élève *</label>
                  {form.matricule ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                      <span className="text-sm font-medium text-emerald-800">{form.nom_eleve} — #{form.matricule}</span>
                      <button type="button" onClick={() => setForm(f => ({ ...f, matricule: '', nom_eleve: '' }))}
                        className="text-xs text-slate-400 hover:text-red-500">Changer</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input value={elevesSearch} onChange={e => setElevesSearch(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); searchEleve(); }}}
                        placeholder="Nom ou matricule…" className="input flex-1" />
                      <button type="button" onClick={searchEleve} className="btn-secondary px-4">Chercher</button>
                    </div>
                  )}
                  {elevesResults.length > 0 && !form.matricule && (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      {elevesResults.map((e: any) => (
                        <button key={e.matricule} type="button"
                          onClick={() => { setForm(f => ({ ...f, matricule: String(e.matricule), nom_eleve: `${e.prenom} ${e.nom}` })); setElevesResults([]); }}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm border-b border-slate-100 last:border-0 flex justify-between">
                          <span>{e.prenom} {e.nom}</span>
                          <span className="text-slate-400">#{e.matricule}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Date *</label>
                    <input type="date" required value={form.date_absence}
                      onChange={e => setForm(f => ({ ...f, date_absence: e.target.value }))} className="input w-full" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Statut *</label>
                    <select value={form.statut} onChange={e => setForm(f => ({ ...f, statut: e.target.value }))} className="input w-full">
                      <option value="non_justifiee">Non justifiée</option>
                      <option value="justifiee">Justifiée</option>
                      <option value="retard">Retard</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Mode</label>
                    <select value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value }))} className="input w-full">
                      <option value="journee">Journée entière</option>
                      <option value="seance">Séance de cours</option>
                    </select>
                  </div>
                  {form.mode === 'seance' && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Cours</label>
                      <select value={form.idCours} onChange={e => setForm(f => ({ ...f, idCours: e.target.value }))} className="input w-full">
                        <option value="">— Choisir —</option>
                        {cours.map((c: any) => <option key={c.idCours} value={c.idCours}>{c.libelle}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Motif</label>
                  <input type="text" value={form.motif} onChange={e => setForm(f => ({ ...f, motif: e.target.value }))}
                    placeholder="Optionnel" className="input w-full" />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Annuler</button>
                  <button type="submit" disabled={saving || !form.matricule} className="btn-primary flex-1 gap-2">
                    {saving ? 'Enregistrement…' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            )}

            {/* ── Classe entière ── */}
            {formMode === 'classe' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Classe *</label>
                    <select value={idClasseSelected}
                      onChange={e => { setIdClasseSelected(e.target.value); loadElevesClasse(e.target.value); }}
                      className="input w-full">
                      <option value="">— Choisir —</option>
                      {classes.map((c: any) => <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Date *</label>
                    <input type="date" value={bulkDate} onChange={e => setBulkDate(e.target.value)} className="input w-full" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Mode</label>
                    <select value={bulkMode} onChange={e => setBulkMode(e.target.value)} className="input w-full">
                      <option value="journee">Journée</option>
                      <option value="seance">Séance</option>
                    </select>
                  </div>
                  {bulkMode === 'seance' && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Cours</label>
                      <select value={bulkIdCours} onChange={e => setBulkIdCours(e.target.value)} className="input w-full">
                        <option value="">— Choisir —</option>
                        {cours.map((c: any) => <option key={c.idCours} value={c.idCours}>{c.libelle}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                {elevesClasse.length > 0 && (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700">
                        {elevesClasse.length} élève(s) — cochez les absents
                      </p>
                      <button type="button" onClick={() => {
                        const allChecked = Object.values(absencesBulk).every(v => v.checked);
                        setAbsencesBulk(prev => Object.fromEntries(
                          Object.entries(prev).map(([k, v]) => [k, { ...v, checked: !allChecked }])
                        ));
                      }} className="text-xs text-violet-600 hover:underline">
                        Tout sélectionner
                      </button>
                    </div>
                    <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                      {elevesClasse.map((e: any) => {
                        const mat  = String(e.matricule);
                        const data = absencesBulk[mat] ?? { checked: false, statut: 'non_justifiee', motif: '' };
                        return (
                          <div key={mat} className={`flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0 ${data.checked ? 'bg-red-50' : ''}`}>
                            <input type="checkbox" checked={data.checked}
                              onChange={ev => setAbsencesBulk(prev => ({ ...prev, [mat]: { ...prev[mat], checked: ev.target.checked } }))}
                              className="w-4 h-4 accent-red-500" />
                            <span className="text-sm font-medium flex-1">{e.eleve?.prenom} {e.eleve?.nom}</span>
                            {data.checked && (
                              <select value={data.statut}
                                onChange={ev => setAbsencesBulk(prev => ({ ...prev, [mat]: { ...prev[mat], statut: ev.target.value } }))}
                                className="input text-xs py-1 w-36">
                                <option value="non_justifiee">Non justifiée</option>
                                <option value="justifiee">Justifiée</option>
                                <option value="retard">Retard</option>
                              </select>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">Annuler</button>
                      <button onClick={handleBulk} disabled={saving} className="btn-primary flex-1">
                        {saving ? 'Enregistrement…' : 'Enregistrer les absences'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}