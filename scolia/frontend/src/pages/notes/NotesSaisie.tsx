import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../service/auth';
import {
  getAnnees,
  getTrimestres,
  getSessions,
  getCoursByEnseignant,
  getEpreuvesByEnseignant,
  getElevesByClasse,
  storeBulk,
  getAppreciation,
  getAppreciationColor,
  type AnneeAcademique,
  type Trimestre,
  type Session,
  type Cours,
  type Epreuve,
  type EleveSimple,
} from '../../service/evaluation_service';

interface ClasseOption {
  idClasse: number;
  libelle: string;
}

export default function NotesSaisie() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [annees, setAnnees]           = useState<AnneeAcademique[]>([]);
  const [trimestres, setTrimestres]   = useState<Trimestre[]>([]);
  const [sessions, setSessions]       = useState<Session[]>([]);
  const [epreuves, setEpreuves]       = useState<Epreuve[]>([]);
  const [eleves, setEleves]           = useState<EleveSimple[]>([]);
  const [notes, setNotes]             = useState<Record<number, string>>({});

  const [tousLesCours, setTousLesCours] = useState<(Cours & { idClasse: number; classe?: { idClasse: number; libelle: string } })[]>([]);
  const [classes, setClasses]           = useState<ClasseOption[]>([]);
  const [coursFiltres, setCoursFiltres] = useState<Cours[]>([]);

  const [idAcademi, setIdAcademi]     = useState(searchParams.get('idAnnee') ?? '');
  const [idClasse, setIdClasse]       = useState('');
  const [idTrimestre, setIdTrimestre] = useState('');
  const [idSession, setIdSession]     = useState('');
  const [idCours, setIdCours]         = useState('');
  const [idEpreuve, setIdEpreuve]     = useState('');

  const [loading, setLoading]         = useState(false);
  const [initLoading, setInitLoading] = useState(true); // ✅ loading initial
  const [success, setSuccess]         = useState('');
  const [error, setError]             = useState('');

  // ─── Chargement initial ───────────────────────────────────
 useEffect(() => {
  const idPers = user?.idPers ?? user?.id;  // ✅ fallback sur id
  if (!idPers) {
    setInitLoading(true);
    getAnnees()
      .then(setAnnees)
      .catch(err => setError("Erreur chargement années : " + err.message))
      .finally(() => setInitLoading(false));
    return;
  }

  setInitLoading(true);
  setError('');

  Promise.all([
    getAnnees(),
    getCoursByEnseignant(idPers),
    getEpreuvesByEnseignant(idPers),
  ])
    .then(([anneesData, coursData, epreuvesData]) => {
      setAnnees(anneesData);
      setEpreuves(epreuvesData);
      setTousLesCours(coursData);

      const map = new Map<number, string>();
      coursData.forEach(c => {
        if (c.idClasse && !map.has(c.idClasse)) {
          const libelle = (c as any).classe?.libelle ?? `Classe ${c.idClasse}`;
          map.set(c.idClasse, libelle);
        }
      });
      setClasses(
        Array.from(map.entries()).map(([idClasse, libelle]) => ({ idClasse, libelle }))
      );
    })
    .catch(err => {
      setError("Erreur lors du chargement : " + (err.message ?? 'inconnue'));
    })
    .finally(() => setInitLoading(false));

}, [user?.idPers, user?.id]);  // ✅ dépendance aussi sur user.id

  // ─── Cours filtrés selon la classe choisie ───────────────
  useEffect(() => {
    if (!idClasse) { setCoursFiltres([]); setIdCours(''); return; }
    const filtered = tousLesCours.filter(c => String(c.idClasse) === String(idClasse));
    setCoursFiltres(filtered);
    setIdCours('');
  }, [idClasse, tousLesCours]);

  // ─── Trimestres ──────────────────────────────────────────
  useEffect(() => {
    if (!idAcademi) { setTrimestres([]); setIdTrimestre(''); return; }
    getTrimestres(idAcademi).then(setTrimestres).catch(() => {});
  }, [idAcademi]);

  // ─── Sessions ────────────────────────────────────────────
  useEffect(() => {
    if (!idTrimestre) { setSessions([]); setIdSession(''); return; }
    getSessions(idTrimestre).then(setSessions).catch(() => {});
  }, [idTrimestre]);

  // ─── Élèves ──────────────────────────────────────────────
  useEffect(() => {
    if (!idClasse || !idAcademi) { setEleves([]); setNotes({}); return; }
    getElevesByClasse(idClasse, idAcademi).then(data => {
      setEleves(data);
      const init: Record<number, string> = {};
      data.forEach(e => { init[e.matricule] = ''; });
      setNotes(init);
    }).catch(() => {});
  }, [idClasse, idAcademi]);

  const peutSaisir = idClasse && idCours && idSession && idEpreuve && eleves.length > 0;
  const notesSaisies = Object.values(notes).filter(n => n !== '').length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess('');
    setError('');

    const payload = {
      idCours,
      idSession,
      idEpreuve,
      idPers: String(user?.idPers ?? user?.id ?? ''),
      notes: Object.entries(notes)
        .filter(([, note]) => note !== '')
        .map(([matricule, note]) => ({
          matricule: Number(matricule),
          note: Number(note),
        })),
    };

    if (payload.notes.length === 0) {
      setError('Aucune note saisie');
      return;
    }

    try {
      setLoading(true);
      const data = await storeBulk(payload);
      setSuccess(data.message || 'Notes enregistrées avec succès');
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  }

  // ─── Écran de chargement initial ─────────────────────────
  if (initLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#1a3a5c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Chargement de vos données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Saisie des Notes</h1>
        <p className="text-gray-500 mt-1">Sélectionnez les filtres puis saisissez les notes</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
          ✓ {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          ⚠ {error}
        </div>
      )}

      {/* Message si aucune donnée chargée */}
      {!initLoading && classes.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl mb-6">
          Aucune classe ou cours ne vous est assigné pour le moment.
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">Filtres</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Année Académique</label>
            <select value={idAcademi}
              onChange={e => { setIdAcademi(e.target.value); setIdTrimestre(''); setIdSession(''); }}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]">
              <option value="">-- Sélectionner --</option>
              {annees.map(a => <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trimestre</label>
            <select value={idTrimestre}
              onChange={e => { setIdTrimestre(e.target.value); setIdSession(''); }}
              disabled={!idAcademi}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c] disabled:opacity-50">
              <option value="">-- Sélectionner --</option>
              {trimestres.map(t => <option key={t.idTrimes} value={t.idTrimes}>{t.libelle}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session</label>
            <select value={idSession}
              onChange={e => setIdSession(e.target.value)}
              disabled={!idTrimestre}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c] disabled:opacity-50">
              <option value="">-- Sélectionner --</option>
              {sessions.map(s => <option key={s.idSession} value={s.idSession}>{s.libelle}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Classe <span className="text-xs text-gray-400">(vos classes)</span>
            </label>
            <select value={idClasse}
              onChange={e => { setIdClasse(e.target.value); setIdCours(''); }}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]">
              <option value="">-- Sélectionner --</option>
              {classes.map(c => <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cours <span className="text-xs text-gray-400">(vos cours)</span>
            </label>
            <select value={idCours}
              onChange={e => setIdCours(e.target.value)}
              disabled={!idClasse}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c] disabled:opacity-50">
              <option value="">-- Sélectionner --</option>
              {coursFiltres.map(c => (
                <option key={c.idCours} value={c.idCours}>
                  {c.libelle} (coeff. {c.coefficient})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Épreuve <span className="text-xs text-gray-400">(vos épreuves)</span>
            </label>
            <select value={idEpreuve}
              onChange={e => setIdEpreuve(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]">
              <option value="">-- Sélectionner --</option>
              {epreuves.map(ep => (
                <option key={ep.idEpreuve} value={ep.idEpreuve}>
                  {ep.libelle} — {ep.nature?.libelle}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {peutSaisir && (
        <form onSubmit={handleSubmit}>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Matricule</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Élève</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Note /20</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Appréciation</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {eleves.map(eleve => {
                  const val = notes[eleve.matricule] ?? '';
                  const note = parseFloat(val);
                  const appr = !isNaN(note) ? getAppreciation(note) : '—';
                  return (
                    <tr key={eleve.matricule} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-500">{eleve.matricule}</td>
                      <td className="px-6 py-4 font-medium">{eleve.prenom} {eleve.nom}</td>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.25"
                          value={val}
                          onChange={e => setNotes(prev => ({ ...prev, [eleve.matricule]: e.target.value }))}
                          className="w-24 text-center border border-gray-300 rounded-xl py-2 focus:outline-none focus:border-[#1a3a5c]"
                        />
                      </td>
                      <td className={`px-6 py-4 font-medium ${getAppreciationColor(appr)}`}>
                        {appr}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#1a3a5c] hover:bg-[#16324f] text-white px-8 py-3 rounded-xl font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Enregistrement en cours...' : `Enregistrer ${notesSaisies} note(s)`}
          </button>
        </form>
      )}

      {idClasse && idAcademi && eleves.length === 0 && (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
          <p className="text-5xl mb-4">👥</p>
          <p className="text-gray-500">Aucun élève inscrit dans cette classe pour cette année.</p>
        </div>
      )}
    </div>
  );
}