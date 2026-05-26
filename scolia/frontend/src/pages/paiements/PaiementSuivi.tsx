import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';

import {
  getSuiviEleve,
  getAnnees,
  formatMontant,
  getStatutPaiement,
  type SuiviEleve,
  type AnneeAcademique,
} from '../../service/paiement_service';

import { searchEleves } from '../../service/inscription_service';
import type { Eleve } from '../../service/inscription_service';

export default function PaiementSuivi() {
  const navigate = useNavigate();

  const [annees, setAnnees] = useState<AnneeAcademique[]>([]);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [searchQ, setSearchQ] = useState('');
  const [eleveLabel, setEleveLabel] = useState('');
  const [suivi, setSuivi] = useState<SuiviEleve | null>(null);

  const [matricule, setMatricule] = useState('');
  const [idAca, setIdAca] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getAnnees().then(data => {
      setAnnees(data);
      if (data.length > 0) {
        setIdAca(String(data[data.length - 1].idAnnee));
      }
    }).catch(() => {});
  }, []);

  async function handleSearch() {
    if (!searchQ || searchQ.length < 2) return;
    try {
      const data = await searchEleves(searchQ);
      setEleves(data);
    } catch (err: any) {
      setError(err.message);
    }
  }

  function selectEleve(el: Eleve) {
    setMatricule(String(el.matricule));
    setEleveLabel(`${el.prenom} ${el.nom} — #${el.matricule}`);
    setEleves([]);
    setSearchQ('');
  }

  async function handleCharger() {
    if (!matricule || !idAca) return;
    try {
      setLoading(true);
      setError('');
      setSuivi(null);
      const data = await getSuiviEleve(matricule, idAca);
      setSuivi(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const statut = suivi ? getStatutPaiement(suivi.totalPaye, suivi.montantTotal) : null;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/paiements')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          Retour
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Suivi des Paiements</h1>
          <p className="text-gray-500">État détaillé des paiements d’un élève</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6">
          {error}
        </div>
      )}

      {/* Recherche */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Élève */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Élève *</label>
            {matricule ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-green-600 text-xl">✓</span>
                  <span className="font-medium">{eleveLabel}</span>
                </div>
                <button
                  onClick={() => { setMatricule(''); setEleveLabel(''); setSuivi(null); }}
                  className="text-sm text-gray-500 hover:text-red-600"
                >
                  Changer
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
                    placeholder="Nom, prénom ou matricule..."
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
                  />
                  <button
                    onClick={handleSearch}
                    className="bg-gray-100 hover:bg-gray-200 px-6 rounded-xl transition"
                  >
                    Chercher
                  </button>
                </div>

                {eleves.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-72 overflow-auto">
                    {eleves.map(el => (
                      <button
                        key={el.matricule}
                        type="button"
                        onClick={() => selectEleve(el)}
                        className="w-full text-left px-5 py-4 hover:bg-gray-50 border-b last:border-0 flex justify-between"
                      >
                        <span>{el.prenom} {el.nom}</span>
                        <span className="text-gray-400 text-sm">#{el.matricule}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Année Académique */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Année Académique</label>
            <select
              value={idAca}
              onChange={e => setIdAca(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            >
              {annees.map(a => (
                <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleCharger}
          disabled={!matricule || !idAca || loading}
          className="mt-6 w-full bg-[#1a3a5c] text-white py-4 rounded-xl hover:bg-[#16324f] transition disabled:opacity-70"
        >
          {loading ? 'Chargement du suivi...' : 'Charger le Suivi'}
        </button>
      </div>

      {/* Résultats */}
      {suivi && (
        <>
          {/* Résumé des Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total à payer', value: formatMontant(suivi.montantTotal), color: 'text-gray-900' },
              { label: 'Total payé', value: formatMontant(suivi.totalPaye), color: 'text-green-600' },
              { label: 'Reste à payer', value: formatMontant(suivi.resteAPayer), color: suivi.resteAPayer > 0 ? 'text-red-600' : 'text-green-600' },
              { label: 'Taux', value: `${suivi.tauxRecouvrement}%`, color: suivi.tauxRecouvrement >= 100 ? 'text-green-600' : 'text-amber-600' },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6">
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Barre de progression */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
            <div className="flex justify-between mb-3">
              <span className="font-medium">Progression des paiements</span>
              <span className={`font-semibold ${statut?.color}`}>{statut?.label}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all ${
                  suivi.tauxRecouvrement >= 100 ? 'bg-green-500' :
                  suivi.tauxRecouvrement >= 50 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(suivi.tauxRecouvrement, 100)}%` }}
              />
            </div>
          </div>

          {/* Historique des paiements */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-semibold">Historique des Paiements ({suivi.paiements.length})</h2>
              <button
                onClick={() => navigate('/paiements/nouveau')}
                className="flex items-center gap-2 text-[#1a3a5c] hover:underline"
              >
                <Plus size={18} /> Nouveau paiement
              </button>
            </div>

            {suivi.paiements.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left">Date</th>
                    <th className="px-6 py-4 text-left">Mode</th>
                    <th className="px-6 py-4 text-left">Référence</th>
                    <th className="px-6 py-4 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {suivi.paiements.map(p => (
                    <tr key={p.idPaie} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">{p.datePaie}</td>
                      <td className="px-6 py-4">{p.mode?.libelle || '—'}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {p.operation_ID !== 'INDEFINI' ? p.operation_ID : '—'}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-green-600">
                        {formatMontant(p.montant)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <p className="text-5xl mb-4">💸</p>
                <p className="text-gray-500">Aucun paiement enregistré pour cet élève</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}