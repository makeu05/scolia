import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import {
  getRapports, validerRapport, deleteRapport, getTypesDiscipline,
  getSeverite, type Rapport, type TypeDiscipline,
} from '../../service/discipline_service';
import { getEleves, type Eleve } from '../../service/eleve_service';
import { getUser } from '../../service/auth';

// ── Carte Rapport ─────────────────────────────────────────────
function CarteRapport({ rapport, onValide, onDelete }: {
  rapport: Rapport;
  onValide: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const [ouvert, setOuvert] = useState(false);
  const sv     = getSeverite(rapport.points);
  const valide = (rapport.justificatifs ?? []).some(j => j.idDirecteur);
  const user   = getUser();
  const isDir  = user?.role === 'Directeur' || user?.role === 'Administrateur';
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('fr-FR');

  return (
    <div className={`bg-white rounded-2xl border shadow-sm border-l-4 ${rapport.points > 10 ? 'border-l-red-400' : rapport.points > 3 ? 'border-l-yellow-400' : 'border-l-blue-400'}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900">
                {rapport.eleve?.prenom} {rapport.eleve?.nom}
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sv.color}`}>
                {sv.label}
              </span>
              {valide && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  Validé ✓
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {rapport.libelle} — <strong>{rapport.points} pts perdus</strong>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {fmtDate(rapport.event_date)} · Signalé par {rapport.personne?.prenom} {rapport.personne?.nom}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isDir && !valide && (
              <button
                onClick={() => onValide(rapport.idRap)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs border border-green-200 text-green-700 rounded-xl hover:bg-green-50 transition"
              >
                <CheckCircle className="h-3 w-3" /> Valider
              </button>
            )}
            <button onClick={() => onDelete(rapport.idRap)} className="p-1.5 text-gray-300 hover:text-red-400 transition">
              <AlertTriangle className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setOuvert(!ouvert)} className="text-gray-400 hover:text-gray-700 transition">
              {ouvert ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {ouvert && rapport.commentaire && (
          <div className="mt-3 px-3 py-2 bg-gray-50 rounded-xl text-sm text-gray-600">
            {rapport.commentaire}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function DisciplinePage() {
  const [rapports, setRapports]   = useState<Rapport[]>([]);
  const [eleves, setEleves]       = useState<Eleve[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [filtreMat, setFiltreMat] = useState('');

  const fetchRapports = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await getRapports(filtreMat ? Number(filtreMat) : undefined);
      setRapports(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally { setLoading(false); }
  }, [filtreMat]);

  useEffect(() => { fetchRapports(); }, [fetchRapports]);
  useEffect(() => {
    getEleves({ paginate: 'false' } as any).then(d => setEleves(Array.isArray(d) ? d : (d as any).data ?? [])).catch(() => {});
  }, []);

  const handleValider = async (id: number) => {
    const user = getUser();
    try {
      await validerRapport(id, user?.id ?? 1, 'Validé par le directeur.');
      fetchRapports();
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Erreur'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce rapport disciplinaire ?')) return;
    try {
      await deleteRapport(id);
      fetchRapports();
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Erreur'); }
  };

  const totalPts = rapports.reduce((s, r) => s + r.points, 0);
  const enAttente = rapports.filter(r => !(r.justificatifs ?? []).some(j => j.idDirecteur)).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Discipline</h1>
            <p className="text-sm text-gray-500 mt-1">Gestion des incidents disciplinaires</p>
          </div>
          <Link
            to="/discipline/nouveau"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a5c] text-white rounded-xl text-sm font-medium hover:bg-[#15304d] transition"
          >
            <Plus className="h-4 w-4" /> Signaler un incident
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total incidents',    val: rapports.length,  color: 'text-[#1a3a5c]' },
            { label: 'Points perdus',      val: totalPts,         color: 'text-yellow-600' },
            { label: 'En attente',         val: enAttente,        color: 'text-red-500'    },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Filtre par élève */}
        <div className="mb-4">
          <select
            value={filtreMat}
            onChange={e => setFiltreMat(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20"
          >
            <option value="">Tous les élèves</option>
            {eleves.map(e => (
              <option key={e.matricule} value={e.matricule}>{e.nom} {e.prenom}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-20 text-gray-400">Chargement...</div>
        ) : rapports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <AlertTriangle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun incident disciplinaire.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rapports.map(r => (
              <CarteRapport key={r.idRap} rapport={r} onValide={handleValider} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
