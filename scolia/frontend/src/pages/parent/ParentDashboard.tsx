import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, authFetch } from '../../service/auth';
import { getBulletin, getTrimestres, getAnnees } from '../../service/evaluation_service';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

interface EnfantInfo {
  matricule: number;
  nom: string;
  prenom: string;
  sexe: number;
  photoURL: string;
  actif: number;
}

export default function ParentDashboard() {
  const navigate = useNavigate();
  const user     = getUser();

  const [enfants, setEnfants]         = useState<EnfantInfo[]>([]);
  const [annees, setAnnees]           = useState<any[]>([]);
  const [trimestres, setTrimestres]   = useState<any[]>([]);
  const [idAca, setIdAca]             = useState('');
  const [idTrimestre, setIdTrimestre] = useState('');
  const [bulletins, setBulletins]     = useState<Record<number, any>>({});
  const [loading, setLoading]         = useState(false);
  const [loadingEnfants, setLoadingEnfants] = useState(true);
  const [error, setError]             = useState('');

  /* ─── Charger les enfants depuis l'API ─── */
  useEffect(() => {
    authFetch(`${API}/parent/enfants`)
      .then(r => r.json())
      .then(data => {
        // S'assurer que c'est bien un tableau
        const liste = Array.isArray(data) ? data : (data.data ?? []);
        setEnfants(liste);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoadingEnfants(false));
  }, []);

  /* ─── Années académiques ─── */
  useEffect(() => {
    getAnnees().then(data => {
      setAnnees(data);
      if (data.length > 0) {
        setIdAca(String(data[data.length - 1].idAnnee));
      }
    }).catch(() => {});
  }, []);

  /* ─── Trimestres selon année ─── */
  useEffect(() => {
    if (!idAca) return;
    getTrimestres(idAca).then(setTrimestres).catch(() => {});
  }, [idAca]);

  /* ─── Charger les bulletins ─── */
  async function chargerBulletins() {
    if (!idTrimestre || enfants.length === 0) return;
    setLoading(true);
    setError('');

    const results: Record<number, any> = {};

    for (const enfant of enfants) {
      try {
        const data = await getBulletin(enfant.matricule, idTrimestre);
        results[enfant.matricule] = data;
      } catch {
        results[enfant.matricule] = null;
      }
    }

    setBulletins(results);
    setLoading(false);
  }

  if (loadingEnfants) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Chargement...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Espace Parent</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bonjour <span className="font-medium">{user?.name}</span> —{' '}
          {enfants.length} enfant(s) suivi(s)
        </p>
      </div>

      {/* ERREUR */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}

      {/* FILTRES */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-sm mb-2">Année académique</label>
            <select
              value={idAca}
              onChange={e => { setIdAca(e.target.value); setIdTrimestre(''); setBulletins({}); }}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm"
            >
              <option value="">-- Sélectionner --</option>
              {annees.map(a => (
                <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[160px]">
            <label className="block text-sm mb-2">Trimestre</label>
            <select
              value={idTrimestre}
              onChange={e => { setIdTrimestre(e.target.value); setBulletins({}); }}
              disabled={!idAca || trimestres.length === 0}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm disabled:opacity-50"
            >
              <option value="">-- Sélectionner --</option>
              {trimestres.map(t => (
                <option key={t.idTrimes} value={t.idTrimes}>
                  {t.libelle}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={chargerBulletins}
              disabled={!idTrimestre || loading || enfants.length === 0}
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Chargement...' : 'Voir les notes'}
            </button>
          </div>
        </div>
      </div>

      {/* LISTE ENFANTS */}
      {enfants.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-2xl">
          <p className="text-4xl mb-3">👨‍👧</p>
          <p className="text-muted-foreground text-sm">
            Aucun enfant associé à votre compte
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Contactez l'administration
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {enfants.map(enfant => {
            const bulletin = bulletins[enfant.matricule];

            return (
              <div key={enfant.matricule} className="bg-card border border-border rounded-2xl overflow-hidden">

                {/* EN-TÊTE ENFANT */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                      {enfant.sexe === 0 ? '👧' : '👦'}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {enfant.prenom} {enfant.nom}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Matricule #{enfant.matricule}
                      </p>
                    </div>
                  </div>

                  {bulletin && (
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        bulletin.moyenneGenerale >= 10 ? 'text-green-500' : 'text-red-400'
                      }`}>
                        {bulletin.moyenneGenerale}/20
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Rang {bulletin.classement?.rang}/{bulletin.classement?.total}
                      </p>
                    </div>
                  )}
                </div>

                {/* BULLETIN */}
                {bulletin ? (
                  <div className="p-5">

                    {/* Mention */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        bulletin.moyenneGenerale >= 16 ? 'bg-green-500/10 text-green-500' :
                        bulletin.moyenneGenerale >= 12 ? 'bg-blue-500/10 text-blue-400' :
                        bulletin.moyenneGenerale >= 10 ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-400'
                      }`}>
                        {bulletin.mention}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {bulletin.trimestre?.libelle}
                      </span>
                    </div>

                    {/* Tableau des notes */}
                    <table className="w-full text-sm">
                      <thead className="text-muted-foreground text-xs uppercase border-b border-border">
                        <tr>
                          <th className="pb-2 text-left">Matière</th>
                          <th className="pb-2 text-center">Coeff.</th>
                          <th className="pb-2 text-center">Moyenne</th>
                          <th className="pb-2 text-left">Appréciation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {bulletin.resultats?.map((r: any, i: number) => (
                          <tr key={i} className="hover:bg-muted/20 transition">
                            <td className="py-2 font-medium">{r.cours}</td>
                            <td className="py-2 text-center text-muted-foreground">
                              {r.coefficient}
                            </td>
                            <td className={`py-2 text-center font-bold ${
                              r.moyenne >= 10 ? 'text-green-500' : 'text-red-400'
                            }`}>
                              {r.moyenne}
                            </td>
                            <td className="py-2 text-muted-foreground text-xs">
                              {r.appreciation}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Bouton bulletin complet */}
                    <button
                      onClick={() => navigate(`/notes/bulletin?matricule=${enfant.matricule}`)}
                      className="mt-4 w-full py-2 rounded-xl border border-border hover:bg-muted/30 transition text-sm text-primary"
                    >
                      Voir le bulletin complet →
                    </button>
                  </div>
                ) : (
                  <div className="px-5 py-6 text-center text-muted-foreground text-sm">
                    {idTrimestre
                      ? 'Aucune note disponible pour ce trimestre'
                      : 'Sélectionne une année et un trimestre pour voir les notes'
                    }
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}