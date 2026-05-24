import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getEpreuves,
  deleteEpreuve,
  getDocumentUrl,
  type Epreuve,
} from '../../service/epreuve_service';
import { getNatures, type Nature } from '../../service/nature_service';

export default function EpreuvePage() {
  const navigate = useNavigate();

  const [epreuves, setEpreuves] = useState<Epreuve[]>([]);
  const [natures, setNatures]   = useState<Nature[]>([]);
  const [search, setSearch]     = useState('');
  const [idNature, setIdNature] = useState('');
  const [page, setPage]         = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  async function load() {
    try {
      setLoading(true);
      const data = await getEpreuves({ page, search, idNature });
      setEpreuves(data.data);
      setLastPage(data.last_page);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getNatures().then(setNatures).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [page, idNature]);

  async function handleDelete(id: number) {
    if (!confirm('Supprimer cette épreuve ?')) return;
    try {
      await deleteEpreuve(id);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    load();
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Épreuves</h1>
          <p className="text-sm text-muted-foreground">{total} épreuve(s)</p>
        </div>
        <button
          onClick={() => navigate('/epreuves/ajouter')}
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

      {/* FILTRES */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Rechercher une épreuve..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <select
            value={idNature}
            onChange={e => { setIdNature(e.target.value); setPage(1); }}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Toutes les natures</option>
            {natures.map(n => (
              <option key={n.idNature} value={n.idNature}>{n.libelle}</option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:opacity-90 transition"
          >
            Rechercher
          </button>
        </form>
      </div>

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
                <th className="px-4 py-3 text-left">Nature</th>
                <th className="px-4 py-3 text-left">Auteur</th>
                <th className="px-4 py-3 text-left">Document</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {epreuves.map(ep => {
                const docUrl = getDocumentUrl(ep.urlDoc);
                return (
                  <tr key={ep.idEpreuve} className="hover:bg-muted/30 transition">
                    <td className="px-4 py-3 font-medium">{ep.libelle}</td>
                    <td className="px-4 py-3">
                      <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">
                        {ep.nature?.libelle ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {ep.auteur !== 'INDEFINI' ? ep.auteur : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {docUrl ? (
                        
                         <a href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline text-xs"
                        >
                          <span>📄</span> Voir PDF
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate(`/epreuves/${ep.idEpreuve}`)}
                          className="text-primary hover:underline text-xs"
                        >
                          Voir
                        </button>
                        <button
                          onClick={() => navigate(`/epreuves/${ep.idEpreuve}/modifier`)}
                          className="text-blue-400 hover:underline text-xs"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(ep.idEpreuve)}
                          className="text-red-400 hover:underline text-xs"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {epreuves.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    Aucune épreuve trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      {lastPage > 1 && (
        <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
          <span>{total} épreuve(s)</span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 rounded-lg bg-card border border-border disabled:opacity-40 hover:bg-muted/30 transition"
            >
              ← Préc
            </button>
            <span className="px-3 py-1">{page} / {lastPage}</span>
            <button
              disabled={page === lastPage}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 rounded-lg bg-card border border-border disabled:opacity-40 hover:bg-muted/30 transition"
            >
              Suiv →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}