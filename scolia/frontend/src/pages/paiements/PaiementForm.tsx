import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

import {
  getPaiement,
  createPaiement,
  updatePaiement,
  getModes,
  getAnnees,
  formatMontant,
  type Mode,
  type AnneeAcademique,
} from '../../service/paiement_service';

import { searchEleves } from '../../service/inscription_service';
import type { Eleve } from '../../service/inscription_service';

export default function PaiementForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [modes, setModes] = useState<Mode[]>([]);
  const [annees, setAnnees] = useState<AnneeAcademique[]>([]);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [searchQ, setSearchQ] = useState('');
  const [eleveLabel, setEleveLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    matricule: '',
    idAca: '',
    montant: '',
    idMode: '',
    datePaie: new Date().toISOString().split('T')[0],
    operation_ID: '',
    comentaire: '',
    idPers: '1',
  });

  // Chargement initial
  useEffect(() => {
    getModes().then(setModes).catch(() => {});
    getAnnees().then(data => {
      setAnnees(data);
      if (data.length > 0 && !isEdit) {
        setForm(f => ({ ...f, idAca: String(data[data.length - 1].idAnnee) }));
      }
    }).catch(() => {});

    if (isEdit) loadPaiement();
  }, [isEdit]);

  async function loadPaiement() {
    try {
      setLoading(true);
      const data = await getPaiement(Number(id));
      setForm({
        matricule: String(data.matricule),
        idAca: String(data.idAca),
        montant: String(data.montant),
        idMode: String(data.idMode),
        datePaie: data.datePaie,
        operation_ID: data.operation_ID !== 'INDEFINI' ? data.operation_ID : '',
        comentaire: data.comentaire !== 'RAS' ? data.comentaire : '',
        idPers: String(data.idPers),
      });
      setEleveLabel(`${data.eleve?.prenom ?? ''} ${data.eleve?.nom ?? ''} — #${data.matricule}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

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
    setForm(f => ({ ...f, matricule: String(el.matricule) }));
    setEleveLabel(`${el.prenom} ${el.nom} — #${el.matricule}`);
    setEleves([]);
    setSearchQ('');
  }

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      if (isEdit) {
        await updatePaiement(Number(id), {
          montant: Number(form.montant),
          idMode: Number(form.idMode),
          datePaie: form.datePaie,
          comentaire: form.comentaire,
          operation_ID: form.operation_ID,
        });
      } else {
        await createPaiement({
          matricule: Number(form.matricule),
          idAca: Number(form.idAca),
          montant: Number(form.montant),
          idMode: Number(form.idMode),
          datePaie: form.datePaie,
          idPers: Number(form.idPers),
          operation_ID: form.operation_ID,
          comentaire: form.comentaire,
        });
      }
      navigate('/paiements');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/paiements" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
          Retour à la liste
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Modifier le Paiement' : 'Nouveau Paiement'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        
        {/* Recherche Élève */}
        {!isEdit && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Élève *</label>
            
            {form.matricule ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="text-green-600">✓</div>
                  <div>
                    <p className="font-medium">{eleveLabel}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setForm(f => ({ ...f, matricule: '' })); setEleveLabel(''); }}
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
                    placeholder="Rechercher par nom, prénom ou matricule..."
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="bg-gray-100 hover:bg-gray-200 px-6 rounded-xl transition"
                  >
                    Chercher
                  </button>
                </div>

                {/* Résultats de recherche */}
                {eleves.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden max-h-80 overflow-y-auto">
                    {eleves.map(el => (
                      <button
                        key={el.matricule}
                        type="button"
                        onClick={() => selectEleve(el)}
                        className="w-full text-left px-5 py-4 hover:bg-gray-50 border-b border-gray-100 last:border-0 flex justify-between items-center"
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
        )}

        {/* Autres champs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Année Académique *</label>
            <select
              value={form.idAca}
              onChange={e => update('idAca', e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            >
              <option value="">Sélectionner une année</option>
              {annees.map(a => (
                <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Montant (FCFA) *</label>
            <input
              type="number"
              value={form.montant}
              onChange={e => update('montant', e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            />
            {form.montant && <p className="text-xs text-green-600 mt-1">{formatMontant(Number(form.montant))}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mode de Paiement *</label>
            <select
              value={form.idMode}
              onChange={e => update('idMode', e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            >
              <option value="">Sélectionner le mode</option>
              {modes.map(m => (
                <option key={m.idMode} value={m.idMode}>{m.libelle}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date du Paiement *</label>
            <input
              type="date"
              value={form.datePaie}
              onChange={e => update('datePaie', e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">N° Opération / Reçu (optionnel)</label>
          <input
            type="text"
            value={form.operation_ID}
            onChange={e => update('operation_ID', e.target.value)}
            placeholder="ex: OM-245678 ou REF-001"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
          />
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire</label>
          <textarea
            value={form.comentaire}
            onChange={e => update('comentaire', e.target.value)}
            rows={3}
            placeholder="RAS"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
          />
        </div>

        {/* Boutons */}
        <div className="flex gap-4 mt-10">
          <button
            type="submit"
            disabled={saving || (!isEdit && !form.matricule)}
            className="flex-1 bg-[#1a3a5c] text-white py-4 rounded-xl font-semibold hover:bg-[#16324f] transition disabled:opacity-70 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Enregistrer le Paiement'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/paiements')}
            className="flex-1 border border-gray-300 py-4 rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}