import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import {
  getLivre, createLivre, updateLivre, getSpecialites,
  type LivrePayload, type Specialite,
} from '../../service/bibliotheque_service';
import { getUser } from '../../service/auth';

export default function LivreForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const user = getUser();

  const [form, setForm] = useState<LivrePayload>({
    titre: '', auteurs: '', prix: 0,
    idSpecialite: 0, edition: '', annee_parution: null,
    idAdmin: user?.id ?? 1,
  });
  const [specialites, setSpecial] = useState<Specialite[]>([]);
  const [loading, setLoading]     = useState(false);
  const [loadingData, setLD]      = useState(isEdit);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    getSpecialites().then(setSpecial).catch(() => {});
    if (isEdit) {
      getLivre(Number(id))
        .then(l => setForm({
          titre: l.titre, auteurs: l.auteurs, prix: l.prix,
          idSpecialite: l.idSpecialite, edition: l.edition,
          annee_parution: l.annee_parution, idAdmin: l.idAdmin,
        }))
        .catch(e => setError(e.message))
        .finally(() => setLD(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titre || !form.auteurs || !form.idSpecialite) {
      setError('Titre, auteur et spécialité sont obligatoires.'); return;
    }
    setLoading(true); setError(null);
    try {
      if (isEdit) {
        await updateLivre(Number(id), form);
      } else {
        await createLivre(form);
      }
      navigate('/bibliotheque');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
    } finally { setLoading(false); }
  };

  const inp = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20";
  const lbl = "block text-sm font-medium text-gray-700 mb-1";

  if (loadingData) return <div className="flex justify-center py-20 text-gray-400">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <button onClick={() => navigate('/bibliotheque')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition">
          <ArrowLeft className="h-4 w-4" /> Retour à la bibliothèque
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            {isEdit ? 'Modifier le livre' : 'Ajouter un livre'}
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={lbl}>Titre *</label>
              <input className={inp} value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} placeholder="Titre du livre" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Auteur(s) *</label>
                <input className={inp} value={form.auteurs} onChange={e => setForm(f => ({ ...f, auteurs: e.target.value }))} placeholder="Nom Prénom" />
              </div>
              <div>
                <label className={lbl}>Spécialité *</label>
                <select className={inp} value={form.idSpecialite || ''} onChange={e => setForm(f => ({ ...f, idSpecialite: Number(e.target.value) }))}>
                  <option value="">-- Choisir --</option>
                  {specialites.map(s => <option key={s.idSpecialite} value={s.idSpecialite}>{s.libelle}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Édition</label>
                <input className={inp} value={form.edition ?? ''} onChange={e => setForm(f => ({ ...f, edition: e.target.value }))} placeholder="Ex : 3ème édition" />
              </div>
              <div>
                <label className={lbl}>Année de parution</label>
                <input className={inp} type="number" min={1900} max={2099} value={form.annee_parution ? new Date(form.annee_parution).getFullYear() : ''}
                  onChange={e => setForm(f => ({ ...f, annee_parution: e.target.value ? `${e.target.value}-01-01` : null }))} placeholder="2023" />
              </div>
              <div>
                <label className={lbl}>Prix (FCFA)</label>
                <input className={inp} type="number" min={0} value={form.prix} onChange={e => setForm(f => ({ ...f, prix: Number(e.target.value) }))} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#1a3a5c] text-white rounded-xl text-sm font-medium hover:bg-[#15304d] disabled:opacity-60 transition">
                <Save className="h-4 w-4" />
                {loading ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Ajouter le livre')}
              </button>
              <button type="button" onClick={() => navigate('/bibliotheque')}
                className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
