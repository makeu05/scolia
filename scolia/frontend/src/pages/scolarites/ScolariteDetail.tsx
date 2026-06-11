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
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [scolarite, setScolarite]           = useState<Scolarite | null>(null);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [success, setSuccess]               = useState('');
  const [showForm, setShowForm]             = useState(false);
  const [loadingTranche, setLoadingTranche] = useState(false);
  const [tranche, setTranche] = useState({
    libelle:     '',
    montant:     '',
    delai_mois:  '09',
    delai_jour:  '30',
    idFondateur: '1',
  });

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

  useEffect(() => { load(); }, [id]);

  async function handleAddTranche(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoadingTranche(true);
      setError('');
      setSuccess('');
      await addTranche(Number(id), {
        libelle:     tranche.libelle,
        montant:     Number(tranche.montant),
        delai_mois:  tranche.delai_mois,
        delai_jour:  tranche.delai_jour,
        idFondateur: Number(tranche.idFondateur),
      });
      setSuccess('Tranche ajoutée avec succès');
      setTranche({ libelle: '', montant: '', delai_mois: '09', delai_jour: '30', idFondateur: '1' });
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

  const mois  = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const jours = Array.from({ length: 28 }, (_, i) => String(i + 1).padStart(2, '0'));

  if (loading) return <div className="p-6 text-center">Chargement...</div>;
  if (!scolarite) return null;

  const total         = scolarite.inscription + scolarite.pension;
  const totalTranches = scolarite.tranches?.reduce((acc, t) => acc + t.montant, 0) ?? 0;
  const diff          = total - totalTranches;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        {/* ✅ Lien corrigé */}
        <Link to="/scolarites" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
          Retour aux tarifs
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {scolarite.cycle?.libelle ?? `Cycle ${scolarite.idCycle}`}
        </h1>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-2xl">
          ✓ {success}
        </div>
      )}

      {/* Carte montants */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-semibold">{scolarite.cycle?.libelle}</h2>
            <p className="text-gray-500 mt-1">{scolarite.description || 'Tarif de scolarité'}</p>
          </div>
          {/* ✅ Lien corrigé */}
          <button
            onClick={() => navigate(`/scolarites/${id}/modifier`)}
            className="text-[#1a3a5c] hover:underline"
          >
            Modifier les tarifs
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="text-center bg-gray-50 rounded-2xl p-6">
            <p className="text-sm text-gray-500">Inscription</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{formatMontant(scolarite.inscription)}</p>
          </div>
          <div className="text-center bg-gray-50 rounded-2xl p-6">
            <p className="text-sm text-gray-500">Pension annuelle</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{formatMontant(scolarite.pension)}</p>
          </div>
          <div className="text-center bg-[#1a3a5c] text-white rounded-2xl p-6">
            <p className="text-sm opacity-75">Total annuel</p>
            <p className="text-3xl font-bold mt-2">{formatMontant(total)}</p>
          </div>
        </div>

        {/* Indicateur équilibre tranches */}
        {scolarite.tranches && scolarite.tranches.length > 0 && (
          <div className={`mt-4 px-4 py-3 rounded-xl text-sm font-medium ${
            diff === 0
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-amber-50 text-amber-700'
          }`}>
            {diff === 0
              ? '✓ Les tranches couvrent exactement le total annuel'
              : `⚠ Écart de ${formatMontant(Math.abs(diff))} FCFA entre les tranches (${formatMontant(totalTranches)}) et le total (${formatMontant(total)})`}
          </div>
        )}
      </div>

      {/* Tranches */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <h2 className="font-semibold text-lg">
            Tranches de paiement ({scolarite.tranches?.length ?? 0})
          </h2>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 text-[#1a3a5c] hover:underline"
          >
            <Plus size={18} />
            {showForm ? 'Annuler' : 'Ajouter une tranche'}
          </button>
        </div>

        {/* Formulaire ajout */}
        {showForm && (
          <form onSubmit={handleAddTranche} className="p-6 border-b bg-gray-50 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="block text-sm font-medium">Libellé *</label>
                <input
                  type="text"
                  required
                  value={tranche.libelle}
                  onChange={e => setTranche(t => ({ ...t, libelle: e.target.value }))}
                  placeholder="Ex : Tranche 1 - Inscription"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium">Montant (FCFA) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={tranche.montant}
                  onChange={e => setTranche(t => ({ ...t, montant: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium">Échéance (mois / jour)</label>
                <div className="flex gap-2">
                  <select
                    value={tranche.delai_mois}
                    onChange={e => setTranche(t => ({ ...t, delai_mois: e.target.value }))}
                    className="flex-1 border border-gray-300 rounded-xl px-3 py-3"
                  >
                    {mois.map(m => <option key={m} value={m}>Mois {m}</option>)}
                  </select>
                  <select
                    value={tranche.delai_jour}
                    onChange={e => setTranche(t => ({ ...t, delai_jour: e.target.value }))}
                    className="flex-1 border border-gray-300 rounded-xl px-3 py-3"
                  >
                    {jours.map(j => <option key={j} value={j}>Jour {j}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Prévisualisation échéance */}
            <p className="text-xs text-gray-400">
              Cette tranche sera due chaque année le jour {tranche.delai_jour} du mois {tranche.delai_mois}.
            </p>

            <button
              type="submit"
              disabled={loadingTranche}
              className="bg-[#1a3a5c] text-white px-6 py-3 rounded-xl hover:bg-[#16324f] disabled:opacity-70 transition"
            >
              {loadingTranche ? 'Ajout en cours…' : 'Ajouter la tranche'}
            </button>
          </form>
        )}

        {/* Liste tranches */}
        {scolarite.tranches && scolarite.tranches.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">#</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tranche</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Échéance</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Montant</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {scolarite.tranches.map((t: Tranche, i: number) => (
                <tr key={t.idTranche} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-400">{i + 1}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{t.libelle}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    Jour {t.delai_jour} du mois {t.delai_mois}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                    {formatMontant(t.montant)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDeleteTranche(t.idTranche)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t">
              <tr>
                <td colSpan={3} className="px-6 py-4 text-sm font-semibold text-gray-600">
                  Total des tranches
                </td>
                <td className={`px-6 py-4 text-right font-bold text-base ${
                  diff === 0 ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {formatMontant(totalTranches)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-400">
            <p className="font-medium">Aucune tranche définie</p>
            <p className="text-sm mt-1">Cliquez sur "Ajouter une tranche" pour commencer.</p>
          </div>
        )}
      </div>
    </div>
  );
}