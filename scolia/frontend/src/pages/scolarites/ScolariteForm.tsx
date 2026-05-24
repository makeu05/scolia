import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

import {
  getScolarite,
  createScolarite,
  updateScolarite,
  formatMontant,
  type Scolarite,
} from '../../service/paiement_service';

interface Cycle {
  idCycle: number;
  libelle: string;
}

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

function getToken(): string {
  return localStorage.getItem('token') ?? '';
}

async function getCycles(): Promise<Cycle[]> {
  const res = await fetch(`${API}/cycles`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  return data.data ?? data;
}

export default function ScolariteForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    inscription: '',
    pension: '',
    nbreTranche: '3',
    description: '',
    idCycle: '',
    idFondateur: '1',
  });

  useEffect(() => {
    getCycles().then(setCycles).catch(() => {});
    if (isEdit) loadScolarite();
  }, [isEdit]);

  async function loadScolarite() {
    try {
      setLoading(true);
      const data = await getScolarite(Number(id));
      setForm({
        inscription: String(data.inscription),
        pension: String(data.pension),
        nbreTranche: String(data.nbreTranche),
        description: data.description ?? '',
        idCycle: String(data.idCycle),
        idFondateur: '1',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  const total = (parseFloat(form.inscription) || 0) + (parseFloat(form.pension) || 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      if (isEdit) {
        await updateScolarite(Number(id), {
          inscription: Number(form.inscription),
          pension: Number(form.pension),
          nbreTranche: Number(form.nbreTranche),
          description: form.description,
        });
      } else {
        await createScolarite({
          inscription: Number(form.inscription),
          pension: Number(form.pension),
          nbreTranche: Number(form.nbreTranche),
          description: form.description,
          idCycle: Number(form.idCycle),
          idFondateur: Number(form.idFondateur),
        });
      }
      navigate('/paiements/scolarites');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/paiements/scolarites" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
          Retour aux tarifs
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Modifier le Tarif' : 'Nouveau Tarif de Scolarité'}
        </h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        
        {/* Cycle (visible seulement en création) */}
        {!isEdit && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cycle scolaire *</label>
            <select
              required
              value={form.idCycle}
              onChange={e => update('idCycle', e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            >
              <option value="">Sélectionner un cycle</option>
              {cycles.map(c => (
                <option key={c.idCycle} value={c.idCycle}>
                  {c.libelle}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frais d'inscription (FCFA) *</label>
            <input
              type="number"
              required
              min="0"
              step="500"
              value={form.inscription}
              onChange={e => update('inscription', e.target.value)}
              placeholder="25000"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            />
            {form.inscription && (
              <p className="text-xs text-green-600 mt-1">{formatMontant(Number(form.inscription))}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pension Annuelle (FCFA) *</label>
            <input
              type="number"
              required
              min="0"
              step="500"
              value={form.pension}
              onChange={e => update('pension', e.target.value)}
              placeholder="150000"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            />
            {form.pension && (
              <p className="text-xs text-green-600 mt-1">{formatMontant(Number(form.pension))}</p>
            )}
          </div>
        </div>

        {/* Total */}
        {total > 0 && (
          <div className="mt-6 bg-[#1a3a5c]/5 border border-[#1a3a5c]/20 rounded-2xl p-5">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total annuel estimé</span>
              <span className="text-2xl font-bold text-[#1a3a5c]">
                {formatMontant(total)}
              </span>
            </div>
          </div>
        )}

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de tranches</label>
          <select
            value={form.nbreTranche}
            onChange={e => update('nbreTranche', e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
          >
            {[1, 2, 3, 4, 6, 12].map(n => (
              <option key={n} value={n}>{n} tranche(s)</option>
            ))}
          </select>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description (optionnel)</label>
          <textarea
            value={form.description}
            onChange={e => update('description', e.target.value)}
            rows={3}
            placeholder="Informations complémentaires sur ce tarif..."
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
          />
        </div>

        {/* Boutons */}
        <div className="flex gap-4 mt-10">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#1a3a5c] text-white py-4 rounded-xl font-semibold hover:bg-[#16324f] transition flex items-center justify-center gap-2 disabled:opacity-70"
          >
            <Save size={20} />
            {loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer le Tarif'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/paiements/scolarites')}
            className="flex-1 border border-gray-300 py-4 rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}