import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, authFetch } from "../../service/auth";
import {
  BookOpen, ClipboardList, BarChart2, FileText,
  ArrowRight, GraduationCap, Bell,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export default function EnseignantDashboard() {
  const navigate    = useNavigate();
  const user        = getUser();
  const [cours, setCours] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    if (!user?.idCours) return;
    authFetch(`${API}/cours/${user.idCours}`)
      .then(r => r.json())
      .then(setCours);
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Espace Enseignant
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bonjour {user?.name}
        </p>
      </div>

      {/* Cours assigné */}
      {cours && (
        <div className="bg-card border border-border rounded-2xl p-5 mb-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Mon cours
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg">{cours.libelle}</p>
              <p className="text-sm text-muted-foreground">
                {cours.classe?.libelle} — Coefficient {cours.coefficient}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              cours.actif
                ? 'bg-green-500/10 text-green-400'
                : 'bg-red-500/10 text-red-400'
            }`}>
              {cours.actif ? 'Actif' : 'Inactif'}
            </span>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            label: 'Saisir des notes',
            desc:  'Entrer les notes de mes élèves',
            icon:  '✏️',
            path:  '/notes/saisie',
            color: 'bg-blue-50 hover:bg-blue-100',
          },
          {
            label: 'Voir le classement',
            desc:  'Classement de ma classe',
            icon:  '📊',
            path:  '/notes/classement',
            color: 'bg-violet-50 hover:bg-violet-100',
          },
          {
            label: 'Bulletins',
            desc:  'Générer les bulletins',
            icon:  '📄',
            path:  '/notes/bulletin',
            color: 'bg-emerald-50 hover:bg-emerald-100',
          },
          {
            label: 'Mes épreuves',
            desc:  'Gérer mes épreuves',
            icon:  '📝',
            path:  '/epreuves',
            color: 'bg-amber-50 hover:bg-amber-100',
          },
        ].map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`${item.color} rounded-2xl p-5 text-left transition-colors border border-transparent hover:border-gray-200`}
          >
            <span className="text-3xl block mb-3">{item.icon}</span>
            <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
            <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
          </button>
        ))}
      </div>

    </div>
  );
}

// ── Composant saisie rapide ──────────────────────────────────────────────────
function SaisieRapide({ idCours, eleves, sessions, epreuves, idPers }: any) {
  const [idSession,  setIdSession]  = useState('');
  const [idEpreuve,  setIdEpreuve]  = useState('');
  const [notes,      setNotes]      = useState<Record<number, string>>({});
  const [loading,    setLoading]    = useState(false);
  const [success,    setSuccess]    = useState('');
  const [error,      setError]      = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idSession || !idEpreuve) { setError('Sélectionnez une session et une épreuve'); return; }

    const notesArray = Object.entries(notes)
      .filter(([, v]) => v !== '')
      .map(([matricule, note]) => ({ matricule: Number(matricule), note: Number(note) }));

    if (notesArray.length === 0) { setError('Aucune note saisie'); return; }

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/evaluations/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          idCours, idSession, idEpreuve,
          idPers: idPers ?? 1,
          notes: notesArray,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(data.message);
      setNotes({});
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message ?? 'Erreur lors de la saisie');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Saisie rapide des notes
      </h2>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-2 mb-4">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Session + Épreuve */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">Session</label>
            <select
              value={idSession}
              onChange={e => setIdSession(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a3a5c]"
            >
              <option value="">-- Choisir --</option>
              {sessions.map((s: any) => (
                <option key={s.idSession} value={s.idSession}>{s.libelle}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">Épreuve</label>
            <select
              value={idEpreuve}
              onChange={e => setIdEpreuve(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1a3a5c]"
            >
              <option value="">-- Choisir --</option>
              {epreuves.map((ep: any) => (
                <option key={ep.idEpreuve} value={ep.idEpreuve}>{ep.libelle}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tableau de saisie */}
        {eleves.length > 0 && (
          <div className="max-h-56 overflow-y-auto border border-gray-100 rounded-xl mb-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs text-gray-400 font-semibold">Élève</th>
                  <th className="px-4 py-2 text-center text-xs text-gray-400 font-semibold">Note /20</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {eleves.map((e: any) => (
                  <tr key={e.matricule} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-700">
                      {e.nom} {e.prenom}
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.25"
                        placeholder="—"
                        value={notes[e.matricule] ?? ''}
                        onChange={ev => setNotes(prev => ({ ...prev, [e.matricule]: ev.target.value }))}
                        className="w-20 mx-auto block text-center border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-[#1a3a5c]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1a3a5c] hover:bg-[#16324f] disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer les notes'}
        </button>
      </form>
    </div>
  );
}