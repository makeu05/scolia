import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  getLivres,
  deleteLivre,
  getSpecialites,
  createSpecialite,
  deleteSpecialite,
  type Livre,
  type Specialite,
} from "../../service/livres_service";

export default function LivresPage() {
  /* ================= STATE ================= */

  const [livres, setLivres] = useState<Livre[]>([]);
  const [specialites, setSpecialites] = useState<Specialite[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showSpecialiteForm, setShowSpecialiteForm] = useState(false);
  const [specialiteForm, setSpecialiteForm] = useState({
    libelle: "",
    idAdmin: 1,
  });

  /* ================= EFFECTS ================= */

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const [livresData, specialitesData] = await Promise.all([
          getLivres(),
          getSpecialites(),
        ]);
        if (!cancelled) {
          setLivres(livresData);
          setSpecialites(specialitesData);
        }
      } catch (error: unknown) {
        if (!cancelled) console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ================= FILTER ================= */

  const filteredLivres = useMemo(
    () =>
      livres.filter((livre) =>
        livre.titre.toLowerCase().includes(search.toLowerCase())
      ),
    [livres, search]
  );

  /* ================= HANDLERS ================= */

  const handleDeleteLivre = async (id: number) => {
    if (!confirm("Supprimer ce livre ?")) return;
    try {
      await deleteLivre(id);
      setLivres((prev) => prev.filter((l) => l.idLivre !== id));
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const handleCreateSpecialite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await createSpecialite(specialiteForm);
      setSpecialites((prev) => [...prev, created]);
      setSpecialiteForm({ libelle: "", idAdmin: 1 });
      setShowSpecialiteForm(false);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const handleDeleteSpecialite = async (id: number) => {
    if (!confirm("Supprimer cette spécialité ?")) return;
    try {
      await deleteSpecialite(id);
      setSpecialites((prev) =>
        prev.filter((sp) => sp.idSpecialite !== id)
      );
    } catch (error: unknown) {
      console.error(error);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Bibliothèque
            </h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Gestion des livres et spécialités
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSpecialiteForm((v) => !v)}
              className={[
                "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
                showSpecialiteForm
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700",
              ].join(" ")}
            >
              {showSpecialiteForm ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Annuler
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Spécialité
                </>
              )}
            </button>

            <Link
              to="/livres/nouveau"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Ajouter un livre
            </Link>
          </div>
        </div>

        {/* ── FORM SPÉCIALITÉ ── */}
        {showSpecialiteForm && (
          <div className="mb-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Nouvelle spécialité
            </h2>
            <form onSubmit={handleCreateSpecialite} className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Libellé de la spécialité"
                value={specialiteForm.libelle}
                onChange={(e) =>
                  setSpecialiteForm((prev) => ({ ...prev, libelle: e.target.value }))
                }
                className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors whitespace-nowrap"
              >
                Enregistrer
              </button>
            </form>
          </div>
        )}

        {/* ── SPÉCIALITÉS ── */}
        {specialites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
              Spécialités ({specialites.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {specialites.map((sp) => (
                <div
                  key={sp.idSpecialite}
                  className="group flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {sp.libelle}
                  </span>
                  <button
                    onClick={() => handleDeleteSpecialite(sp.idSpecialite)}
                    className="ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                    title="Supprimer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SEARCH ── */}
        <div className="relative mb-5">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher par titre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        {/* ── TABLE ── */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <svg className="w-6 h-6 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="ml-3 text-sm text-gray-500">Chargement...</span>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
            {/* stats bar */}
            <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {filteredLivres.length} livre{filteredLivres.length !== 1 ? "s" : ""}
                {search && ` · filtrés sur "${search}"`}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/50">
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                      Titre
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                      Auteur(s)
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                      Prix
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                      Spécialité
                    </th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredLivres.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16">
                        <svg className="mx-auto w-8 h-8 text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Aucun livre trouvé.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLivres.map((livre) => (
                      <tr
                        key={livre.idLivre}
                        className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors group"
                      >
                        <td className="px-5 py-3.5">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {livre.titre}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">
                          {livre.auteurs}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
                            {livre.prix.toLocaleString()} FCFA
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {livre.specialite?.libelle ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-medium">
                              {livre.specialite.libelle}
                            </span>
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              to={`/livres/${livre.idLivre}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Voir
                            </Link>
                            <Link
                              to={`/livres/${livre.idLivre}/modifier`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Modifier
                            </Link>
                            <button
                              onClick={() => handleDeleteLivre(livre.idLivre)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}