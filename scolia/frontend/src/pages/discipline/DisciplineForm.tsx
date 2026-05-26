import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { createRapport, getTypesDiscipline, type TypeDiscipline } from '../../service/discipline_service';
import { getEleves, type Eleve } from '../../service/eleve_service';
import { getUser } from '../../service/auth';

export default function DisciplineForm() {
  const navigate = useNavigate();
  const user     = getUser();

  const [form, setForm] = useState({
    libelle: '', points: 0, matricule: '',
    commentaire: '', event_date: new Date().toISOString().split('T')[0],
  });
  const [types, setTypes]   = useState<TypeDiscipline[]>([]);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    getTypesDiscipline().then(setTypes).catch(() => {});
    getEleves({ paginate: 'false' } as any)
      .then(d => setEleves(Array.isArray(d) ? d : (d as any).data ?? []))
      .catch(() => {});
  }, []);

  const choisirType = (id: number) => {
    const t = types.find(t => t.ID === id);
    if (t) setForm(f => ({ ...f, libelle: t.libelle, points: t.points }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.matricule || !form.libelle || !form.commentaire || !form.event_date) {
      setError('Tous les champs sont obligatoires.'); return;
    }
    setLoading(true); setError(null);
    try {
      await createRapport({
        libelle:     form.libelle,
        points:      form.points,
        matricule:   Number(form.matricule),
        idAca:       new Date().getFullYear(),
        commentaire: form.commentaire,
        event_date:  form.event_date,
        idPers:      user?.id ?? 1,
      });
      navigate('/discipline');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
    } finally { setLoading(false); }
  };

  const inp = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20";
  const lbl = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button onClick={() => navigate('/discipline')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition">
          <ArrowLeft className="h-4 w-4" /> Retour à la discipline
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Signaler un incident disciplinaire</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Élève *</label>
                <select className={inp} value={form.matricule} onChange={e => setForm(f => ({ ...f, matricule: e.target.value }))}>
                  <option value="">-- Sélectionner --</option>
                  {eleves.map(e => <option key={e.matricule} value={e.matricule}>{e.nom} {e.prenom}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Type d'incident *</label>
                <select className={inp} onChange={e => choisirType(Number(e.target.value))}>
                  <option value="">-- Choisir le type --</option>
                  {types.map(t => <option key={t.ID} value={t.ID}>{t.libelle} ({t.points} pts)</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Libellé *</label>
                <input className={inp} value={form.libelle} onChange={e => setForm(f => ({ ...f, libelle: e.target.value }))} placeholder="Description courte" />
              </div>
              <div>
                <label className={lbl}>Points perdus</label>
                <input className={inp} type="number" min={0} value={form.points} onChange={e => setForm(f => ({ ...f, points: Number(e.target.value) }))} />
              </div>
              <div className="sm:col-span-2">
                <label className={lbl}>Date de l'incident *</label>
                <input className={inp} type="date" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className={lbl}>Commentaire *</label>
              <textarea className={inp} rows={4} value={form.commentaire} onChange={e => setForm(f => ({ ...f, commentaire: e.target.value }))} placeholder="Décrivez l'incident en détail..." />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-[#1a3a5c] text-white rounded-xl text-sm font-medium hover:bg-[#15304d] disabled:opacity-60 transition">
                <Save className="h-4 w-4" />
                {loading ? 'Enregistrement...' : "Soumettre l'incident"}
              </button>
              <button type="button" onClick={() => navigate('/discipline')} className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
