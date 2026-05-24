import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getNature,
  createNature,
  updateNature,
} from '../../service/nature_service';

export default function NatureForm() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = !!id;

  const [form, setForm]     = useState({ libelle: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (isEdit) loadNature();
  }, []);

  async function loadNature() {
    try {
      setLoading(true);
      const data = await getNature(Number(id));
      setForm({
        libelle:     data.libelle,
        description: data.description ?? '',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEdit) {
        await updateNature(Number(id), form);
      } else {
        await createNature(form);
      }
      navigate('/natures');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {isEdit ? "Modifier la nature" : "Ajouter une nature d'épreuve"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit ? 'Mettre à jour les informations' : 'Créer un nouveau type d\'épreuve'}
        </p>
      </div>

      {/* ERREUR */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-2xl p-6 space-y-5"
      >
        <div>
          <label className="block text-sm mb-2">Libellé</label>
          <input
            type="text"
            required
            value={form.libelle}
            onChange={e => update('libelle', e.target.value)}
            placeholder="ex: Devoir, Interrogation, Examen..."
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm mb-2">Description (optionnel)</label>
          <textarea
            value={form.description}
            onChange={e => update('description', e.target.value)}
            rows={3}
            placeholder="Description de cette nature d'épreuve..."
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground px-5 py-3 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/natures')}
            className="bg-secondary px-5 py-3 rounded-lg text-sm hover:opacity-80 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}