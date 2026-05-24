import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

import {
  getScolarites,
  formatMontant,
  type Scolarite,
} from '../../service/paiement_service';

export default function ScolaritePage() {
  const navigate = useNavigate();

  const [scolarites, setScolarites] = useState<Scolarite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      setLoading(true);
      const data = await getScolarites();
      setScolarites(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tarifs de Scolarité</h1>
          <p className="text-gray-500 mt-1">Gestion des frais scolaires par cycle</p>
        </div>

        <button
          onClick={() => navigate('/paiements/scolarites/ajouter')}
          className="flex items-center gap-2 bg-[#1a3a5c] text-white px-5 py-3 rounded-xl hover:bg-[#16324f] transition"
        >
          <Plus size={20} />
          Nouveau Tarif
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-20 text-gray-500">Chargement des tarifs...</div>
      ) : scolarites.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
          <p className="text-6xl mb-4">🎓</p>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun tarif défini</h3>
          <p className="text-gray-500 mb-6">Commencez par ajouter les tarifs de scolarité par cycle.</p>
          <button
            onClick={() => navigate('/paiements/scolarites/ajouter')}
            className="bg-[#1a3a5c] text-white px-6 py-3 rounded-xl hover:bg-[#16324f]"
          >
            Ajouter le premier tarif
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scolarites.map((s) => (
            <div
              key={s.idScolarite}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition"
            >
              {/* En-tête de la carte */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#1a3a5c]/10 rounded-2xl flex items-center justify-center text-3xl">
                    🎓
                  </div>
                  <div>
                    <h2 className="font-semibold text-xl text-gray-900">
                      {s.cycle?.libelle ?? `Cycle ${s.idCycle}`}
                    </h2>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {s.description || 'Aucune description'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/paiements/scolarites/${s.idScolarite}`)}
                  className="text-[#1a3a5c] hover:underline text-sm font-medium mt-1"
                >
                  Gérer →
                </button>
              </div>

              {/* Montants */}
              <div className="grid grid-cols-3 divide-x divide-gray-100">
                <div className="px-5 py-6 text-center">
                  <p className="text-xs text-gray-500 mb-1">Inscription</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatMontant(s.inscription)}
                  </p>
                </div>
                <div className="px-5 py-6 text-center">
                  <p className="text-xs text-gray-500 mb-1">Pension</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatMontant(s.pension)}
                  </p>
                </div>
                <div className="px-5 py-6 text-center bg-gray-50">
                  <p className="text-xs text-gray-500 mb-1">Total</p>
                  <p className="text-2xl font-bold text-[#1a3a5c]">
                    {formatMontant(s.inscription + s.pension)}
                  </p>
                </div>
              </div>

              {/* Tranches */}
              {s.tranches && s.tranches.length > 0 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
                    Tranches ({s.tranches.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {s.tranches.map((t) => (
                      <span
                        key={t.idTranche}
                        className="inline-block bg-white border border-gray-200 text-xs px-4 py-2 rounded-xl"
                      >
                        {t.libelle} — <span className="font-medium">{formatMontant(t.montant)}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}