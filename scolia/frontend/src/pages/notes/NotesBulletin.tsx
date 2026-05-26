import { useEffect, useRef, useState } from 'react';
import {
  getAnnees,
  getTrimestres,
  getClasses,
  getElevesByClasse,
  getBulletin,
  getMention,
  type AnneeAcademique,
  type Trimestre,
  type Classe,
  type EleveSimple,
  type BulletinData,
} from '../../service/evaluation_service';

export default function NotesBulletin() {
  const printRef = useRef<HTMLDivElement>(null);

  const [annees, setAnnees] = useState<AnneeAcademique[]>([]);
  const [trimestres, setTrimestres] = useState<Trimestre[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [eleves, setEleves] = useState<EleveSimple[]>([]);
  const [bulletin, setBulletin] = useState<BulletinData | null>(null);

  const [idAcademi, setIdAcademi] = useState('');
  const [idTrimestre, setIdTrimestre] = useState('');
  const [idClasse, setIdClasse] = useState('');
  const [matricule, setMatricule] = useState('');
  
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

  useEffect(() => {
    if (!idClasse || !idAcademi) { 
      setEleves([]); 
      setMatricule(''); 
      return; 
    }
    getElevesByClasse(idClasse, idAcademi).then(setEleves).catch(() => {});
  }, [idClasse, idAcademi]);

  async function handleGenerer() {
    if (!matricule || !idTrimestre) return;
    try {
      setLoading(true);
      setError('');
      setBulletin(null);
      
      const data = await getBulletin(matricule, idTrimestre);
      setBulletin(data);
    } catch (err: any) {
      setError(err.message || "Impossible de générer le bulletin");
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bulletin de Notes</h1>
          <p className="text-gray-500 mt-1">Générer le bulletin d'un élève</p>
        </div>

        {bulletin && (
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#1a3a5c] text-white px-5 py-3 rounded-xl hover:bg-[#16324f] transition"
          >
            🖨 Imprimer / PDF
          </button>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 print:hidden">
          {error}
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm print:hidden">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">Filtres</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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
              onChange={(e) => { setIdClasse(e.target.value); setMatricule(''); }}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            >
              <option value="">-- Sélectionner --</option>
              {classes.map(c => (
                <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Élève</label>
            <select
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              disabled={eleves.length === 0}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c] disabled:opacity-50"
            >
              <option value="">-- Sélectionner un élève --</option>
              {eleves.map(el => (
                <option key={el.matricule} value={el.matricule}>
                  {el.prenom} {el.nom} — #{el.matricule}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerer}
          disabled={!matricule || !idTrimestre || loading}
          className="mt-6 bg-[#1a3a5c] hover:bg-[#16324f] text-white px-8 py-3 rounded-xl font-semibold transition disabled:opacity-50 w-full md:w-auto"
        >
          {loading ? 'Génération du bulletin...' : 'Générer le Bulletin'}
        </button>
      </div>

      {/* BULLETIN (Zone imprimable) */}
      {bulletin && (
        <div ref={printRef} className="bg-white text-gray-900 rounded-2xl p-8 border border-gray-200 print:shadow-none print:rounded-none">
          
          {/* En-tête */}
          <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
            <div>
              <h2 className="text-2xl font-bold">SCOLIA</h2>
              <p className="text-sm text-gray-500">École • Collège • Lycée</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold uppercase tracking-wider">Bulletin de Notes</h3>
              <p className="mt-1 text-gray-600">
                {bulletin.trimestre?.libelle} — {bulletin.trimestre?.periode}
              </p>
            </div>
            <div className="text-right text-sm">
              <p>Année : {bulletin.classe?.annee}</p>
            </div>
          </div>

          {/* Informations Élève */}
          <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
            <div className="space-y-2">
              <p><span className="font-semibold">Nom & Prénom :</span> {bulletin.eleve?.prenom} {bulletin.eleve?.nom}</p>
              <p><span className="font-semibold">Matricule :</span> {bulletin.eleve?.matricule}</p>
              <p><span className="font-semibold">Classe :</span> {bulletin.classe?.libelle}</p>
            </div>
            <div className="space-y-2">
              <p><span className="font-semibold">Classement :</span> <span className="font-bold">{bulletin.classement?.rang} / {bulletin.classement?.total}</span></p>
              <p><span className="font-semibold">Moyenne Générale :</span> <span className="font-bold text-lg">{bulletin.moyenneGenerale}</span></p>
              <p><span className="font-semibold">Mention :</span> <span className="font-bold">{bulletin.mention}</span></p>
            </div>
          </div>

          {/* Tableau des Notes */}
          <table className="w-full border-collapse border border-gray-300 mb-8 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-3 text-left">Matière</th>
                <th className="border border-gray-300 px-4 py-3 text-center">Coeff.</th>
                <th className="border border-gray-300 px-4 py-3 text-center">Moyenne</th>
                <th className="border border-gray-300 px-4 py-3 text-center">Moy × Coeff</th>
                <th className="border border-gray-300 px-4 py-3 text-left">Appréciation</th>
              </tr>
            </thead>
            <tbody>
              {bulletin.resultats?.map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-4 py-3 font-medium">{r.cours}</td>
                  <td className="border border-gray-300 px-4 py-3 text-center">{r.coefficient}</td>
                  <td className={`border border-gray-300 px-4 py-3 text-center font-bold ${r.moyenne >= 10 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {r.moyenne}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center text-gray-600">
                    {(r.moyenne * r.coefficient).toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-3">{r.appreciation}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-8 mt-16 text-center text-sm">
            {['Le Directeur', 'Le Professeur Principal', 'Parent / Tuteur'].map((role) => (
              <div key={role}>
                <p className="font-semibold mb-12">{role}</p>
                <div className="border-t border-gray-400 pt-1 text-xs text-gray-500">Signature et Cachet</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}