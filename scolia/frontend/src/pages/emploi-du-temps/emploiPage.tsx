import { useEffect, useState } from 'react';
import { Calendar, Plus, Trash2, X } from 'lucide-react';
import {
  getCreneauxParClasse, createCreneau, deleteCreneau, buildGrille,
  JOURS, HEURES, type Creneau,
} from '../../service/emploi_service';
import { getClasses, type Classe } from '../../service/classe_service';
import { getCours,   type Cours   } from '../../service/cours_service';
import { getUser } from '../../service/auth';

const COURS_COLORS = [
  'bg-blue-100 text-blue-800', 'bg-green-100 text-green-800',
  'bg-purple-100 text-purple-800', 'bg-amber-100 text-amber-800',
  'bg-pink-100 text-pink-800', 'bg-teal-100 text-teal-800',
  'bg-orange-100 text-orange-800', 'bg-indigo-100 text-indigo-800',
];

// ── Modale ajout créneau ──────────────────────────────────────
function ModaleCreneau({ idClasse, cours, onSave, onClose }: {
  idClasse: number; cours: Cours[];
  onSave: (c: Creneau) => void; onClose: () => void;
}) {
  const [form, setForm] = useState({ jour: '', heure: '', idCours: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const user = getUser();

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.jour || !form.heure || !form.idCours) {
      setError('Tous les champs sont obligatoires.'); return;
    }
    setLoading(true); setError(null);
    try {
      const res = await createCreneau({
        jour: form.jour, heure: form.heure,
        idClasse, idCours: Number(form.idCours),
        idAdmin: user?.id ?? 1,
      });
      onSave(res.creneau);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally { setLoading(false); }
  };

  const inp = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20";
  const lbl = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Ajouter un créneau</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="h-4 w-4" /></button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl mb-4 text-sm">{error}</div>}

        <form onSubmit={soumettre} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Jour *</label>
              <select className={inp} value={form.jour} onChange={e => setForm(f => ({ ...f, jour: e.target.value }))}>
                <option value="">-- Choisir --</option>
                {JOURS.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Heure *</label>
              <select className={inp} value={form.heure} onChange={e => setForm(f => ({ ...f, heure: e.target.value }))}>
                <option value="">-- Choisir --</option>
                {HEURES.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={lbl}>Cours *</label>
            <select className={inp} value={form.idCours} onChange={e => setForm(f => ({ ...f, idCours: e.target.value }))}>
              <option value="">-- Choisir le cours --</option>
              {cours.map(c => <option key={c.idCours} value={c.idCours}>{c.libelle}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-[#1a3a5c] text-white rounded-xl text-sm font-medium hover:bg-[#15304d] disabled:opacity-60 transition">
              {loading ? 'Ajout...' : 'Ajouter le créneau'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────
export default function EmploiDuTempsPage() {
  const [creneaux, setCreneaux]   = useState<Creneau[]>([]);
  const [classes, setClasses]     = useState<Classe[]>([]);
  const [cours, setCours]         = useState<Cours[]>([]);
  const [idClasse, setIdClasse]   = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    getClasses().then(d => {
      const list = Array.isArray(d) ? d : (d as any).data ?? [];
      setClasses(list);
      if (list.length > 0) setIdClasse(list[0].idClasse);
    }).catch(() => {});
    getCours({ paginate: 'false' } as any).then(d => {
      setCours(Array.isArray(d) ? d : (d as any).data ?? []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!idClasse) return;
    setLoading(true); setError(null);
    getCreneauxParClasse(idClasse)
      .then(setCreneaux)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [idClasse]);

  const ajouterCreneau = (c: Creneau) => {
    setCreneaux(p => [...p, c]);
    setShowModal(false);
  };

  const supprimerCreneau = async (id: number) => {
    if (!confirm('Supprimer ce créneau ?')) return;
    try {
      await deleteCreneau(id);
      setCreneaux(p => p.filter(c => c.idTemps !== id));
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Erreur'); }
  };

  const grille  = buildGrille(creneaux);
  const coursIds = [...new Set(creneaux.map(c => c.idCours))];
  const couleur  = (idCours: number) => COURS_COLORS[coursIds.indexOf(idCours) % COURS_COLORS.length];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Emploi du temps</h1>
            <p className="text-sm text-gray-500 mt-1">Grille hebdomadaire par classe</p>
          </div>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a5c] text-white rounded-xl text-sm font-medium hover:bg-[#15304d] transition">
            <Plus className="h-4 w-4" /> Ajouter un créneau
          </button>
        </div>

        {/* Sélecteur de classe */}
        <div className="flex items-center gap-3 mb-5">
          <label className="text-sm text-gray-500 font-medium">Classe :</label>
          <select
            value={idClasse}
            onChange={e => setIdClasse(Number(e.target.value))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20 font-medium"
          >
            {classes.map(c => <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>)}
          </select>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-20 text-gray-400">Chargement...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide border-r border-gray-100 w-16">Heure</th>
                  {JOURS.map(j => (
                    <th key={j} className="px-3 py-3 text-center text-xs font-semibold text-gray-700 border-r border-gray-100 last:border-r-0">{j}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HEURES.map(heure => (
                  <tr key={heure} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="px-3 py-2 text-xs text-gray-400 font-medium border-r border-gray-100">{heure}</td>
                    {JOURS.map(jour => {
                      const c = grille[jour]?.[heure];
                      return (
                        <td key={jour} className="px-2 py-2 border-r border-gray-100 last:border-r-0 min-w-[130px]">
                          {c ? (
                            <div className={`group relative rounded-xl px-2 py-1.5 ${couleur(c.idCours)}`}>
                              <p className="text-xs font-semibold truncate">{c.cours?.libelle ?? `Cours ${c.idCours}`}</p>
                              {c.cours?.enseignant?.personne && (
                                <p className="text-[10px] opacity-70 truncate">{c.cours.enseignant.personne.nom}</p>
                              )}
                              <button
                                onClick={() => supprimerCreneau(c.idTemps)}
                                className="absolute right-1 top-1 hidden group-hover:flex items-center justify-center w-4 h-4 rounded-full bg-white/80 text-current hover:bg-white"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="h-9 rounded-xl border border-dashed border-gray-200" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && creneaux.length === 0 && !error && (
          <div className="mt-4 bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
            <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun créneau pour cette classe.</p>
          </div>
        )}
      </div>

      {showModal && idClasse > 0 && (
        <ModaleCreneau
          idClasse={idClasse}
          cours={cours}
          onSave={ajouterCreneau}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
