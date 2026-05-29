import { useEffect, useRef, useState } from 'react';
import {
  getAnnees,
  getTrimestres,
  getClasses,
  getElevesByClasse,
  getBulletin,
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
          <h1 className="text-3xl font-bold">Bulletin de Notes</h1>
          <p className="text-gray-500 mt-1">Génération du bulletin officiel</p>
        </div>

        {bulletin && (
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#1a3a5c] text-white px-6 py-3 rounded-xl hover:bg-[#132d4a] transition"
          >
            🖨 Imprimer le Bulletin
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 print:hidden">
          {error}
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-sm font-medium mb-2">Année Académique</label>
            <select
              value={idAcademi}
              onChange={(e) => { setIdAcademi(e.target.value); setIdTrimestre(''); }}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#1a3a5c]"
            >
              <option value="">-- Sélectionner --</option>
              {annees.map(a => (
                <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Trimestre</label>
            <select
              value={idTrimestre}
              onChange={(e) => setIdTrimestre(e.target.value)}
              disabled={!idAcademi}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#1a3a5c] disabled:opacity-50"
            >
              <option value="">-- Sélectionner --</option>
              {trimestres.map(t => (
                <option key={t.idTrimes} value={t.idTrimes}>{t.libelle}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Classe</label>
            <select
              value={idClasse}
              onChange={(e) => { setIdClasse(e.target.value); setMatricule(''); }}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#1a3a5c]"
            >
              <option value="">-- Sélectionner --</option>
              {classes.map(c => (
                <option key={c.idClasse} value={c.idClasse}>{c.libelle}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Élève</label>
            <select
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              disabled={!idClasse}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#1a3a5c] disabled:opacity-50"
            >
              <option value="">-- Sélectionner --</option>
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
          className="mt-6 w-full md:w-auto bg-[#1a3a5c] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#132d4a] transition disabled:opacity-50"
        >
          {loading ? 'Génération...' : 'Générer le Bulletin'}
        </button>
      </div>

      {/* ====================== BULLETIN ====================== */}
      {bulletin && (
        <div ref={printRef} className="bg-white text-black p-10 border-2 border-gray-800 rounded-none print:shadow-none">
          
          {/* En-tête officiel */}
          <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">SCOLIA</h1>
              <p className="text-sm text-gray-600">Établissement d'Enseignement Secondaire</p>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold uppercase">Bulletin Trimestriel</h2>
              <p className="mt-1 text-lg">{bulletin.trimestre?.libelle}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">Année Scolaire</p>
              <p>{bulletin.classe?.annee || '—'}</p>
            </div>
          </div>

          {/* Informations Élève */}
          <div className="grid grid-cols-2 gap-10 mb-10 text-sm">
            <div>
              <p className="text-gray-600">Nom et Prénom</p>
              <p className="text-2xl font-semibold mt-1">
                {bulletin.eleve?.prenom} {bulletin.eleve?.nom}
              </p>
              <p className="mt-3">Matricule : <span className="font-mono">{bulletin.eleve?.matricule}</span></p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">Classe</p>
              <p className="text-2xl font-semibold mt-1">{bulletin.classe?.libelle}</p>
              <p className="mt-4">
                Classement : <span className="font-bold">{bulletin.classement?.rang || '—'} / {bulletin.classement?.total || '—'}</span>
              </p>
            </div>
          </div>

          {/* Tableau des notes */}
          <table className="w-full border-collapse border border-gray-800 mb-10 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-800 px-4 py-3 text-left font-semibold">Matière</th>
                <th className="border border-gray-800 px-4 py-3 text-center font-semibold">Coeff.</th>
                <th className="border border-gray-800 px-4 py-3 text-center font-semibold">Note</th>
                <th className="border border-gray-800 px-4 py-3 text-center font-semibold">Total</th>
                <th className="border border-gray-800 px-4 py-3 text-left font-semibold">Appréciation</th>
              </tr>
            </thead>
            <tbody>
              {bulletin.resultats?.map((r: any, i: number) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="border border-gray-800 px-4 py-3 font-medium">{r.cours}</td>
                  <td className="border border-gray-800 px-4 py-3 text-center">{r.coefficient}</td>
                  <td className={`border border-gray-800 px-4 py-3 text-center font-bold ${r.moyenne >= 10 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {r.moyenne}
                  </td>
                  <td className="border border-gray-800 px-4 py-3 text-center font-medium">
                    {(r.moyenne * r.coefficient).toFixed(2)}
                  </td>
                  <td className="border border-gray-800 px-4 py-3 text-sm italic">{r.appreciation}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Moyenne Générale */}
          <div className="flex justify-end mb-12">
            <div className="border-2 border-black px-10 py-6 text-center">
              <p className="uppercase text-sm tracking-widest">Moyenne Générale</p>
              <p className="text-5xl font-bold mt-2">{bulletin.moyenneGenerale}</p>
              <p className="text-xl font-medium mt-1">{bulletin.mention}</p>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-12 text-center mt-20">
            {['Le Directeur', 'Le Professeur Principal', 'Le Parent / Tuteur'].map((title, i) => (
              <div key={i}>
                <div className="border-t-2 border-black pt-8 mb-8"></div>
                <p className="font-semibold">{title}</p>
                <p className="text-xs text-gray-500 mt-1">Signature et Cachet</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}