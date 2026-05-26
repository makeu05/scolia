import { useEffect, useState } from 'react';
import {
  getAnnees,
  getTrimestres,
  getClasses,
  getClassement,
  getMention,
  type AnneeAcademique,
  type Trimestre,
  type Classe,
  type ClassementItem,
} from '../../service/evaluation_service';

export default function NotesClassement() {
  const [annees, setAnnees] = useState<AnneeAcademique[]>([]);
  const [trimestres, setTrimestres] = useState<Trimestre[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [classement, setClassement] = useState<ClassementItem[]>([]);

  const [idAcademi, setIdAcademi] = useState('');
  const [idTrimestre, setIdTrimestre] = useState('');
  const [idClasse, setIdClasse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getAnnees().then(setAnnees).catch(() => {});
    getClasses().then(setClasses).catch(() => {});
  }, []);

  useEffect(() => {
    if (!idAcademi) { 
      setTrimestres([]); 
      setIdTrimestre(''); 
      return; 
    }
    getTrimestres(idAcademi).then(setTrimestres).catch(() => {});
  }, [idAcademi]);

  async function handleAfficher() {
    if (!idClasse || !idTrimestre) return;
    try {
      setLoading(true);
      setError('');
      setClassement([]);
      
      const data = await getClassement(idClasse, idTrimestre);
      setClassement(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement du classement");
    } finally {
      setLoading(false);
    }
  }

  function getMedalOrRank(rang: number) {
    if (rang === 1) return { icon: '🥇', color: 'text-yellow-500' };
    if (rang === 2) return { icon: '🥈', color: 'text-gray-400' };
    if (rang === 3) return { icon: '🥉', color: 'text-amber-600' };
    return { icon: String(rang), color: 'text-gray-600' };
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Classement des Élèves</h1>
        <p className="text-gray-500 mt-1">Classement par moyenne pondérée</p>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">Filtres</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Année Académique</label>
            <select
              value={idAcademi}
              onChange={(e) => { setIdAcademi(e.target.value); setIdTrimestre(''); }}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            >
              <option value="">-- Sélectionner --</option>
              {annees.map(a => (
                <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trimestre</label>
            <select
              value={idTrimestre}
              onChange={(e) => setIdTrimestre(e.target.value)}
              disabled={!idAcademi}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c] disabled:opacity-50"
            >
              <option value="">-- Sélectionner --</option>
              {trimestres.map(t => (
                <option key={t.idTrimes} value={t.idTrimes}>{t.libelle}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Classe</label>
            <select
              value={idClasse}
              onChange={(e) => setIdClasse(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            >
              <option value="">-- Sélectionner --</option>
              {classes.map(c => (
                <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleAfficher}
          disabled={!idClasse || !idTrimestre || loading}
          className="mt-6 bg-[#1a3a5c] hover:bg-[#16324f] text-white px-8 py-3 rounded-xl font-semibold transition disabled:opacity-50"
        >
          {loading ? 'Chargement du classement...' : 'Afficher le Classement'}
        </button>
      </div>

      {/* Tableau du Classement */}
      {classement.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-500">
              {classement.length} élève(s) classé(s)
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-center">Rang</th>
                  <th className="px-6 py-4 text-left">Élève</th>
                  <th className="px-6 py-4 text-center">Matricule</th>
                  <th className="px-6 py-4 text-center">Moyenne</th>
                  <th className="px-6 py-4 text-left">Mention</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {classement.map((e, index) => {
                  const { icon, color } = getMedalOrRank(e.rang);
                  return (
                    <tr key={e.matricule} className={`hover:bg-gray-50 transition-colors ${e.rang <= 3 ? 'bg-amber-50/50' : ''}`}>
                      <td className={`px-6 py-4 text-center text-2xl ${color}`}>
                        {icon}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {e.prenom} {e.nom}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500">
                        {e.matricule}
                      </td>
                      <td className={`px-6 py-4 text-center font-bold text-lg ${e.moyenne >= 10 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {e.moyenne.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {getMention(e.moyenne)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Message vide */}
      {!loading && idClasse && idTrimestre && classement.length === 0 && (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
          <p className="text-5xl mb-4">📊</p>
          <p className="text-gray-500">Aucune note enregistrée pour cette sélection.</p>
        </div>
      )}
    </div>
  );
}