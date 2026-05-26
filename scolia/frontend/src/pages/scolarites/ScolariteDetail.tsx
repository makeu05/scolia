import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

import {
  getScolarite,
  addTranche,
  deleteTranche,
  formatMontant,
  type Scolarite,
  type Tranche,
} from '../../service/paiement_service';

export default function ScolariteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [scolarite, setScolarite] = useState<Scolarite | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Formulaire nouvelle tranche
  const [showForm, setShowForm] = useState(false);
  const [tranche, setTranche] = useState({
    libelle: '',
    montant: '',
    delai_mois: '01',
    delai_jour: '01',
    idFondateur: '1',
  });
  const [loadingTranche, setLoadingTranche] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const data = await getScolarite(Number(id));
      setScolarite(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleAddTranche(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoadingTranche(true);
      setError('');
      setSuccess('');
      await addTranche(Number(id), {
        libelle: tranche.libelle,
        montant: Number(tranche.montant),
        delai_mois: tranche.delai_mois,
        delai_jour: tranche.delai_jour,
        idFondateur: Number(tranche.idFondateur),
      });
      setSuccess('Tranche ajoutée avec succès');
      setTranche({ libelle: '', montant: '', delai_mois: '01', delai_jour: '01', idFondateur: '1' });
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingTranche(false);
    }
  }

  async function handleDeleteTranche(idTranche: number) {
    if (!confirm('Supprimer cette tranche ?')) return;
    try {
      await deleteTranche(idTranche);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  function updateTranche(field: string, value: string) {
    setTranche(prev => ({ ...prev, [field]: value }));
  }

  const mois = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const jours = Array.from({ length: 28 }, (_, i) => String(i + 1).padStart(2, '0'));

  if (loading) return <div className="p-6 text-center">Chargement...</div>;
  if (!scolarite) return null;

  const total = scolarite.inscription + scolarite.pension;
  const totalTranches = scolarite.tranches?.reduce((acc, t) => acc + t.montant, 0) ?? 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/paiements/scolarites" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
          Retour aux tarifs
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {scolarite.cycle?.libelle ?? `Cycle ${scolarite.idCycle}`}
        </h1>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-2xl mb-6">
          ✓ {success}
        </div>
      )}

      {/* Carte Principale */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-semibold">{scolarite.cycle?.libelle}</h2>
            <p className="text-gray-500 mt-1">{scolarite.description || 'Tarif de scolarité'}</p>
          </div>
          <button
            onClick={() => navigate(`/paiements/scolarites/${id}/modifier`)}
            className="text-[#1a3a5c] hover:underline"
          >
            Modifier les tarifs
          </button>
        </div>

        {/* Montants */}
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center bg-gray-50 rounded-2xl p-6">
            <p className="text-sm text-gray-500">Inscription</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {formatMontant(scolarite.inscription)}
            </p>
          </div>
          <div className="text-center bg-gray-50 rounded-2xl p-6">
            <p className="text-sm text-gray-500">Pension Annuelle</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {formatMontant(scolarite.pension)}
            </p>
          </div>
          <div className="text-center bg-[#1a3a5c] text-white rounded-2xl p-6">
            <p className="text-sm opacity-75">Total Annuel</p>
            <p className="text-3xl font-bold mt-2">
              {formatMontant(total)}
            </p>
          </div>
        </div>
      </div>

      {/* Tranches */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <h2 className="font-semibold text-lg">Tranches de Paiement ({scolarite.tranches?.length ?? 0})</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 text-[#1a3a5c] hover:underline"
          >
            <Plus size={18} />
            {showForm ? 'Annuler' : 'Ajouter une tranche'}
          </button>
        </div>

        {/* Formulaire d'ajout */}
        {showForm && (
          <form onSubmit={handleAddTranche} className="p-6 border-b bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Libellé de la tranche</label>
                <input
                  type="text"
                  required
                  value={tranche.libelle}
                  onChange={e => updateTranche('libelle', e.target.value)}
                  placeholder="1ère Tranche - Septembre"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Montant (FCFA)</label>
                <input
                  type="number"
                  required
                  value={tranche.montant}
                  onChange={e => updateTranche('montant', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Délai</label>
                <div className="flex gap-2">
                  <select
                    value={tranche.delai_mois}
                    onChange={e => updateTranche('delai_mois', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-xl px-3 py-3"
                  >
                    {mois.map(m => <option key={m} value={m}>Mois {m}</option>)}
                  </select>
                  <select
                    value={tranche.delai_jour}
                    onChange={e => updateTranche('delai_jour', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-xl px-3 py-3"
                  >
                    {jours.map(j => <option key={j} value={j}>Jour {j}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={loadingTranche}
              className="mt-4 bg-[#1a3a5c] text-white px-6 py-3 rounded-xl hover:bg-[#16324f] disabled:opacity-70"
            >
              {loadingTranche ? 'Ajout en cours...' : 'Ajouter la tranche'}
            </button>
          </form>
        )}

        {/* Liste des tranches */}
        {scolarite.tranches && scolarite.tranches.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">Tranche</th>
                <th className="px-6 py-4 text-left">Délai</th>
                <th className="px-6 py-4 text-right">Montant</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {scolarite.tranches.map((t: Tranche) => (
                <tr key={t.idTranche} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{t.libelle}</td>
                  <td className="px-6 py-4 text-gray-600">
                    Mois {t.delai_mois} • Jour {t.delai_jour}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-green-600">
                    {formatMontant(t.montant)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDeleteTranche(t.idTranche)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-500">
            Aucune tranche définie pour ce cycle.
          </div>
        )}
      </div>
    </div>
  );
}