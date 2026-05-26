import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getNatures,
  deleteNature,
  type Nature,
} from '../../service/nature_service';

export default function NaturePage() {
  const navigate = useNavigate();
  const [natures, setNatures] = useState<Nature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function load() {
    try {
      setLoading(true);
      const data = await getNatures();
      setNatures(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: number) {
    if (!confirm('Supprimer cette nature ?')) return;
    try {
      await deleteNature(id);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Natures d'épreuve
          </h1>
          <p className="text-sm text-muted-foreground">
            Types d'épreuves disponibles
          </p>
        </div>
        <button
          onClick={() => navigate('/natures/ajouter')}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:opacity-90 transition"
        >
          + Ajouter
        </button>
      </div>

      {/* ERREUR */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}

      {/* TABLEAU */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Chargement...
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Libellé</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {natures.map(n => (
                <tr key={n.idNature} className="hover:bg-muted/30 transition">
                  <td className="px-4 py-3 font-medium">{n.libelle}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                    {n.description || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/natures/${n.idNature}/modifier`)}
                        className="text-blue-400 hover:underline text-xs"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(n.idNature)}
                        className="text-red-400 hover:underline text-xs"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {natures.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-muted-foreground">
                    Aucune nature d'épreuve trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}