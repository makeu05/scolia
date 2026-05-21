import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getInscriptions,
  deleteInscription,
  getClasses,
  getAnnees,
  type Inscription,
  type Classe,
  type AnneeAcademique,
} from '../../service/inscription_service';

export default function InscriptionPage() {
  const navigate = useNavigate();

  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [classes, setClasses]           = useState<Classe[]>([]);
  const [annees, setAnnees]             = useState<AnneeAcademique[]>([]);
  const [idClasse, setIdClasse]         = useState('');
  const [idAcademi, setIdAcademi]       = useState('');
  const [search, setSearch]             = useState('');
  const [page, setPage]                 = useState(1);
  const [lastPage, setLastPage]         = useState(1);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  /* ─── Chargement ─── */

  async function load() {
    try {
      setLoading(true);
      const data = await getInscriptions({ page, search, idClasse, idAcademi });
      setInscriptions(data.data);
      setLastPage(data.last_page);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getClasses().then(setClasses).catch(() => {});
    getAnnees().then(setAnnees).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [page, idClasse, idAcademi]);

  /* ─── Suppression ─── */

  async function handleDelete(id: number) {
    if (!confirm('Supprimer cette inscription ?')) return;
    try {
      await deleteInscription(id);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  /* ─── Recherche ─── */

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    load();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inscriptions</h1>
          <p className="text-sm text-muted-foreground">
            Gestion des inscriptions des élèves
          </p>
        </div>
        <button
          onClick={() => navigate('/inscriptions/ajouter')}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:opacity-90 transition"
        >
          + Inscrire un élève
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
            placeholder="Rechercher un élève..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] bg-background border border-border rounded-lg px-4 py-2 text-sm"
          />
          <select
            value={idAcademi}
            onChange={e => { setIdAcademi(e.target.value); setPage(1); }}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Toutes les années</option>
            {annees.map(a => (
              <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>
            ))}
          </select>
          <select
            value={idClasse}
            onChange={e => { setIdClasse(e.target.value); setPage(1); }}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Toutes les classes</option>
            {classes.map(c => (
              <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>
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
                <th className="px-4 py-3 text-left">Élève</th>
                <th className="px-4 py-3 text-left">Matricule</th>
                <th className="px-4 py-3 text-left">Classe</th>
                <th className="px-4 py-3 text-left">Salle</th>
                <th className="px-4 py-3 text-left">Année</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {inscriptions.map(i => (
                <tr
                  key={i.idFrequente}
                  className="hover:bg-muted/30 transition"
                >
                  <td className="px-4 py-3 font-medium">
                    {i.eleve?.prenom} {i.eleve?.nom}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {i.eleve?.matricule}
                  </td>
                  <td className="px-4 py-3">
                    {i.salle?.classe?.libelle ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {i.salle?.libelle ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {i.annee_academique?.libelle ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/inscriptions/${i.idFrequente}`)}
                        className="text-primary hover:underline text-xs"
                      >
                        Voir
                      </button>
                      <button
                        onClick={() => navigate(`/inscriptions/${i.idFrequente}/modifier`)}
                        className="text-blue-400 hover:underline text-xs"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(i.idFrequente)}
                        className="text-red-400 hover:underline text-xs"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {inscriptions.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    Aucune inscription trouvée
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
          <span>{total} inscription(s)</span>
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