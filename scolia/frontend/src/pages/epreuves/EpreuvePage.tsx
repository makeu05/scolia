import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, Search, Filter, FileText, FileDown, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../service/auth';
import {
  getEpreuves,
  deleteEpreuve,
  getDocumentUrl,
  type Epreuve,
} from '../../service/epreuve_service';
import { getNatures, type Nature } from '../../service/nature_service';

export default function EpreuvePage() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Récupération de l'utilisateur connecté

  const [epreuves, setEpreuves] = useState<Epreuve[]>([]);
  const [natures, setNatures]   = useState<Nature[]>([]);
  const [search, setSearch]     = useState('');
  const [idNature, setIdNature] = useState('');
  const [page, setPage]         = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // Restriction stricte si l'utilisateur est un enseignant
      const teacherId = user?.role === 'enseignant' ? String(user?.idPers || user?.id) : undefined;

      const data = await getEpreuves({ 
        page, 
        search: search.trim() || undefined, 
        idNature,
        idPers: teacherId
      });
      
      setEpreuves(data.data);
      setLastPage(data.last_page);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des épreuves");
    } finally {
      setLoading(false);
    }
  }, [page, idNature, search, user]);

  useEffect(() => {
    getNatures().then(setNatures).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

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
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Bannière Premium Ambre/Orange pour les Épreuves */}
      <div className={`rounded-2xl p-5 relative overflow-hidden transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
        style={{ background: "linear-gradient(135deg,#f6d365 0%,#fda085 100%)", boxShadow: "0 4px 24px rgba(253,160,133,0.4)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(255,255,255,0.15) 0%,transparent 70%)" }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-orange-100" />
              <p className="text-orange-100 text-xs font-semibold uppercase tracking-wider">Évaluations académiques</p>
            </div>
            <h1 className="text-white text-2xl font-bold" style={{ letterSpacing: "-0.03em" }}>Mes Épreuves</h1>
            <p className="text-orange-100/70 text-sm mt-1">{total} épreuve(s) enregistrée(s)</p>
          </div>
          <button onClick={() => navigate('/epreuves/ajouter')}
            className="flex items-center gap-2 bg-white text-orange-600 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-orange-50 transition-all active:scale-[0.97]"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
            <Plus className="w-4 h-4" /> Nouvelle épreuve
          </button>
        </div>
      </div>

      {/* Zone d'Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm shadow-sm animate-fade-in">
          {error}
        </div>
      )}

      {/* Filtres alignés sur le style de l'application */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input 
            type="text"
            value={search} 
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une épreuve…" 
            className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-10 text-sm focus:outline-none focus:border-[#fda085] bg-white shadow-sm" 
          />
        </form>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select 
            value={idNature} 
            onChange={e => { setIdNature(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-xl px-4 py-3 pl-9 pr-8 text-sm appearance-none cursor-pointer min-w-[180px] bg-white shadow-sm focus:outline-none focus:border-[#fda085]"
          >
            <option value="">Toutes les natures</option>
            {natures.map(n => (
              <option key={n.idNature} value={n.idNature}>{n.libelle}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={handleSearch}
          className="bg-slate-900 text-white font-medium text-sm px-6 py-3 rounded-xl hover:bg-slate-800 transition"
        >
          Filtrer
        </button>
      </div>

      {/* Conteneur Tableau Premium */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
        style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              {["Libellé Evaluation", "Nature", "Auteur", "Document PDF", "Actions"].map(h => (
                <th key={h} className="text-left font-semibold text-slate-500 text-xs uppercase tracking-wider px-6 py-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : epreuves.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-amber-50">
                      <FileText className="w-8 h-8 text-amber-500" />
                    </div>
                    <p className="text-slate-500 font-medium">Aucune épreuve disponible ou trouvée</p>
                  </div>
                </td>
              </tr>
            ) : (
              epreuves.map(ep => {
                const docUrl = getDocumentUrl(ep.urlDoc);
                return (
                  <tr key={ep.idEpreuve} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 text-sm">{ep.libelle}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                        {ep.nature?.libelle ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {ep.auteur !== 'INDEFINI' ? ep.auteur : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {docUrl ? (
                        <a href={docUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-orange-600 hover:text-orange-700 font-medium text-xs bg-orange-50 px-3 py-1.5 rounded-lg transition"
                        >
                          <FileDown className="w-3.5 h-3.5" /> Voir le PDF
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs font-normal italic">Aucun fichier</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/epreuves/${ep.idEpreuve}`)}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => navigate(`/epreuves/${ep.idEpreuve}/modifier`)}
                          className="p-2 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(ep.idEpreuve)}
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Style Moderne */}
      {lastPage > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <p>Page <span className="font-semibold text-slate-700">{page}</span> sur {lastPage}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="border border-gray-200 bg-white text-slate-700 rounded-xl px-4 py-2 hover:bg-slate-50 transition disabled:opacity-40 font-medium"
            >
              Précédent
            </button>
            <button disabled={page === lastPage} onClick={() => setPage(p => p + 1)}
              className="border border-gray-200 bg-white text-slate-700 rounded-xl px-4 py-2 hover:bg-slate-50 transition disabled:opacity-40 font-medium"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}