import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, BookOpen, Tag, X, Check, AlertCircle } from 'lucide-react';
import {
  getLivres, deleteLivre, getSpecialites,
  createSpecialite, updateSpecialite, deleteSpecialite,
  type Livre, type LivrePaginate, type Specialite,
} from '../../service/bibliotheque_service';
import { getUser } from '../../service/auth';

const SPEC_COLORS: Record<number, string> = {
  1: 'bg-blue-100 text-blue-700',   2: 'bg-green-100 text-green-700',
  3: 'bg-amber-100 text-amber-700', 4: 'bg-pink-100 text-pink-700',
  5: 'bg-purple-100 text-purple-700',
};
function specColor(id: number): string {
  return SPEC_COLORS[id] ?? 'bg-gray-100 text-gray-600';
}

// ════════════════════════════════════════════════════════════
//  MODALE GESTION SPÉCIALITÉS
// ════════════════════════════════════════════════════════════
function ModaleSpecialites({
  specialites,
  onClose,
  onChange,
}: {
  specialites: Specialite[];
  onClose:  () => void;
  onChange: (updated: Specialite[]) => void;
}) {
  const user = getUser();
  const [liste, setListe]         = useState<Specialite[]>(specialites);
  const [nouveau, setNouveau]     = useState('');
  const [editId, setEditId]       = useState<number | null>(null);
  const [editVal, setEditVal]     = useState('');
  const [loading, setLoading]     = useState(false);
  const [erreur, setErreur]       = useState<string | null>(null);
  const [succes, setSucces]       = useState<string | null>(null);

  const flash = (msg: string, type: 'ok' | 'err') => {
    if (type === 'ok') { setSucces(msg); setTimeout(() => setSucces(null), 3000); }
    else               { setErreur(msg); setTimeout(() => setErreur(null), 4000); }
  };

  // ── Ajouter ────────────────────────────────────────────────
  const handleAjouter = async () => {
    if (!nouveau.trim()) { flash('Le libellé ne peut pas être vide.', 'err'); return; }
    setLoading(true);
    try {
      const res = await createSpecialite(nouveau.trim(), user?.id ?? 1);
      const updated = [...liste, res.specialite];
      setListe(updated);
      onChange(updated);
      setNouveau('');
      flash(`"${res.specialite.libelle}" ajoutée en base de données ✓`, 'ok');
    } catch (e: unknown) {
      flash(e instanceof Error ? e.message : 'Erreur serveur', 'err');
    } finally { setLoading(false); }
  };

  // ── Modifier ───────────────────────────────────────────────
  const handleModifier = async (id: number) => {
    if (!editVal.trim()) { flash('Le libellé ne peut pas être vide.', 'err'); return; }
    setLoading(true);
    try {
      const res = await updateSpecialite(id, editVal.trim());
      const updated = liste.map(s => s.idSpecialite === id ? res.specialite : s);
      setListe(updated);
      onChange(updated);
      setEditId(null);
      flash(`Spécialité modifiée ✓`, 'ok');
    } catch (e: unknown) {
      flash(e instanceof Error ? e.message : 'Erreur serveur', 'err');
    } finally { setLoading(false); }
  };

  // ── Supprimer ──────────────────────────────────────────────
  const handleSupprimer = async (id: number, libelle: string) => {
    if (!confirm(`Supprimer la spécialité "${libelle}" ?\nAttention : impossible si des livres l'utilisent.`)) return;
    setLoading(true);
    try {
      await deleteSpecialite(id);
      const updated = liste.filter(s => s.idSpecialite !== id);
      setListe(updated);
      onChange(updated);
      flash(`"${libelle}" supprimée ✓`, 'ok');
    } catch (e: unknown) {
      flash(e instanceof Error ? e.message : 'Erreur serveur', 'err');
    } finally { setLoading(false); }
  };

  const inp = "flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-[#1a3a5c]" />
            <h2 className="text-lg font-bold text-gray-900">Gestion des spécialités</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Alerts */}
        <div className="px-6 pt-4">
          {succes && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl text-sm mb-3">
              <Check className="h-4 w-4 shrink-0" /> {succes}
            </div>
          )}
          {erreur && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm mb-3">
              <AlertCircle className="h-4 w-4 shrink-0" /> {erreur}
            </div>
          )}
        </div>

        {/* Formulaire ajout */}
        <div className="px-6 pb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Nouvelle spécialité</p>
          <div className="flex gap-2">
            <input
              className={inp}
              value={nouveau}
              onChange={e => setNouveau(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAjouter()}
              placeholder="Ex : Philosophie, Économie..."
              disabled={loading}
            />
            <button
              onClick={handleAjouter}
              disabled={loading || !nouveau.trim()}
              className="px-4 py-2 bg-[#1a3a5c] text-white rounded-xl text-sm font-medium hover:bg-[#15304d] disabled:opacity-50 transition flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              {loading ? '...' : 'Ajouter'}
            </button>
          </div>
        </div>

        {/* Liste */}
        <div className="px-6 pb-6 max-h-72 overflow-y-auto space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            {liste.length} spécialité(s) en base de données
          </p>

          {liste.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">
              Aucune spécialité. Ajoutez-en une ci-dessus.
            </div>
          ) : (
            liste.map(s => (
              <div key={s.idSpecialite} className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 group transition">
                <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${specColor(s.idSpecialite)}`}>
                  #{s.idSpecialite}
                </span>

                {editId === s.idSpecialite ? (
                  /* Mode édition */
                  <>
                    <input
                      className="flex-1 px-2 py-1.5 text-sm border border-[#1a3a5c]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20"
                      value={editVal}
                      onChange={e => setEditVal(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter')  handleModifier(s.idSpecialite);
                        if (e.key === 'Escape') setEditId(null);
                      }}
                      autoFocus
                      disabled={loading}
                    />
                    <button onClick={() => handleModifier(s.idSpecialite)} disabled={loading}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => setEditId(null)}
                      className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition">
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  /* Mode affichage */
                  <>
                    <span className="flex-1 text-sm text-gray-800 font-medium">{s.libelle}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => { setEditId(s.idSpecialite); setEditVal(s.libelle); }}
                        className="p-1.5 text-gray-400 hover:text-[#1a3a5c] hover:bg-blue-50 rounded-lg transition"
                        title="Modifier"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleSupprimer(s.idSpecialite, s.libelle)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  PAGE BIBLIOTHÈQUE
// ════════════════════════════════════════════════════════════
export default function BibliothequeList() {
  const [livres, setLivres]           = useState<LivrePaginate | null>(null);
  const [specialites, setSpecial]     = useState<Specialite[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [search, setSearch]           = useState('');
  const [idSpecialite, setSpec]       = useState('');
  const [page, setPage]               = useState(1);
  const [showSpecModal, setShowSpec]  = useState(false);

  const fetchLivres = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await getLivres({
        page,
        search:       search.trim() || undefined,
        idSpecialite: idSpecialite || undefined,
      });
      setLivres(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les livres');
    } finally { setLoading(false); }
  }, [search, idSpecialite, page]);

  useEffect(() => { fetchLivres(); }, [fetchLivres]);
  useEffect(() => { getSpecialites().then(setSpecial).catch(() => {}); }, []);

  const handleSupprimer = async (id: number, titre: string) => {
    if (!confirm(`Supprimer "${titre}" du catalogue ?`)) return;
    try {
      await deleteLivre(id);
      fetchLivres();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erreur suppression');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── En-tête ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bibliothèque</h1>
            <p className="text-sm text-gray-500 mt-1">{livres?.total ?? 0} livre(s) · {specialites.length} spécialité(s)</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSpec(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
            >
              <Tag className="h-4 w-4" /> Spécialités
            </button>
            <Link
              to="/bibliotheque/nouveau"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a5c] text-white rounded-xl text-sm font-medium hover:bg-[#15304d] transition"
            >
              <Plus className="h-4 w-4" /> Ajouter un livre
            </Link>
          </div>
        </div>

        {/* ── Filtres ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par titre ou auteur..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20"
            />
          </div>
          <select
            value={idSpecialite}
            onChange={e => { setSpec(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20"
          >
            <option value="">Toutes spécialités</option>
            {specialites.map(s => (
              <option key={s.idSpecialite} value={s.idSpecialite}>{s.libelle}</option>
            ))}
          </select>
        </div>

        {/* ── Erreur ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {/* ── Contenu ── */}
        {loading ? (
          <div className="flex justify-center items-center py-20 text-gray-400">Chargement...</div>
        ) : !livres?.data.length ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
            <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun livre trouvé.</p>
            <Link to="/bibliotheque/nouveau" className="mt-4 inline-block text-sm text-[#1a3a5c] font-medium hover:underline">
              Ajouter le premier livre
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {livres.data.map(livre => (
              <div key={livre.idLivre} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 leading-tight truncate">{livre.titre}</p>
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{livre.auteurs}</p>
                  </div>
                  {livre.specialite && (
                    <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${specColor(livre.idSpecialite)}`}>
                      {livre.specialite.libelle}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                  {livre.edition && livre.edition !== 'INDEFINI' && <span>{livre.edition}</span>}
                  {livre.annee_parution && <span>{new Date(livre.annee_parution).getFullYear()}</span>}
                  <span className="font-semibold text-gray-700">{Number(livre.prix).toLocaleString()} FCFA</span>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-50 mt-auto">
                  <Link
                    to={`/bibliotheque/${livre.idLivre}/modifier`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600"
                  >
                    <Pencil className="h-3 w-3" /> Modifier
                  </Link>
                  <button
                    onClick={() => handleSupprimer(livre.idLivre, livre.titre)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition"
                  >
                    <Trash2 className="h-3 w-3" /> Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {livres && livres.last_page > 1 && (
          <div className="flex justify-center items-center gap-3 mt-6">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition">
              Précédent
            </button>
            <span className="text-sm text-gray-500">Page {page} / {livres.last_page}</span>
            <button onClick={() => setPage(p => Math.min(livres.last_page, p + 1))} disabled={page === livres.last_page}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition">
              Suivant
            </button>
          </div>
        )}
      </div>

      {/* ── Modale spécialités ── */}
      {showSpecModal && (
        <ModaleSpecialites
          specialites={specialites}
          onClose={() => setShowSpec(false)}
          onChange={updated => {
            setSpecial(updated);
            // Recharger les livres pour refléter les nouvelles spécialités
            fetchLivres();
          }}
        />
      )}
    </div>
  );
}
