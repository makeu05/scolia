import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../service/auth';
import { getBulletin, getTrimestres, getAnnees } from '../../service/evaluation_service';

export default function ParentDashboard() {
  const navigate  = useNavigate();
  const user      = getUser();
  const enfants   = user?.enfants ?? [];

  const [annees, setAnnees]           = useState<any[]>([]);
  const [trimestres, setTrimestres]   = useState<any[]>([]);
  const [idAca, setIdAca]             = useState('');
  const [idTrimestre, setIdTrimestre] = useState('');
  const [bulletins, setBulletins]     = useState<Record<number, any>>({});
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    getAnnees().then(data => {
      setAnnees(data);
      if (data.length > 0) setIdAca(String(data[data.length - 1].idAnnee));
    });
  }, []);

  useEffect(() => {
    if (!idAca) return;
    getTrimestres(idAca).then(setTrimestres);
  }, [idAca]);

  async function chargerBulletins() {
    if (!idTrimestre || enfants.length === 0) return;
    setLoading(true);
    const results: Record<number, any> = {};
    for (const matricule of enfants) {
      try {
        const data = await getBulletin(matricule, idTrimestre);
        results[matricule] = data;
      } catch {
        results[matricule] = null;
      }
    }
    setBulletins(results);
    setLoading(false);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Espace Parent
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bonjour {user?.name} — {enfants.length} enfant(s) suivi(s)
        </p>
      </div>

      {/* Filtres */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-sm mb-2">Année académique</label>
            <select
              value={idAca}
              onChange={e => { setIdAca(e.target.value); setIdTrimestre(''); }}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm"
            >
              {annees.map(a => (
                <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-sm mb-2">Trimestre</label>
            <select
              value={idTrimestre}
              onChange={e => setIdTrimestre(e.target.value)}
              disabled={!idAca}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm disabled:opacity-50"
            >
              <option value="">-- Sélectionner --</option>
              {trimestres.map(t => (
                <option key={t.idTrimes} value={t.idTrimes}>{t.libelle}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={chargerBulletins}
              disabled={!idTrimestre || loading}
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Chargement...' : 'Voir les notes'}
            </button>
          </div>
        </div>
      </div>

      {/* Bulletins */}
      {enfants.map(matricule => {
        const bulletin = bulletins[matricule];
        if (!bulletin) return null;

        return (
          <div key={matricule} className="bg-card border border-border rounded-2xl p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-foreground">
                  {bulletin.eleve?.prenom} {bulletin.eleve?.nom}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {bulletin.classe?.libelle} — Rang {bulletin.classement?.rang}/{bulletin.classement?.total}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${
                  bulletin.moyenneGenerale >= 10 ? 'text-green-500' : 'text-red-400'
                }`}>
                  {bulletin.moyenneGenerale}/20
                </p>
                <p className="text-xs text-muted-foreground">{bulletin.mention}</p>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead className="text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="pb-2 text-left">Matière</th>
                  <th className="pb-2 text-center">Coeff.</th>
                  <th className="pb-2 text-center">Moyenne</th>
                  <th className="pb-2 text-left">Appréciation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bulletin.resultats?.map((r: any, i: number) => (
                  <tr key={i}>
                    <td className="py-2 font-medium">{r.cours}</td>
                    <td className="py-2 text-center text-muted-foreground">{r.coefficient}</td>
                    <td className={`py-2 text-center font-bold ${
                      r.moyenne >= 10 ? 'text-green-500' : 'text-red-400'
                    }`}>
                      {r.moyenne}
                    </td>
                    <td className="py-2 text-muted-foreground text-xs">{r.appreciation}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={() => navigate(`/notes/bulletin?matricule=${matricule}`)}
              className="mt-3 text-xs text-primary hover:underline"
            >
              Voir le bulletin complet →
            </button>
          </div>
        );
      })}

      {enfants.length === 0 && (
        <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-2xl">
          <p className="text-4xl mb-3">👨‍👧</p>
          <p className="text-sm">Aucun enfant associé à votre compte</p>
        </div>
      )}
    </div>
  );
}