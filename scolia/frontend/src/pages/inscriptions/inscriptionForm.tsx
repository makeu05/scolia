import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

import {
  getInscription,
  createInscription,
  updateInscription,
  getClasses,
  getSallesByClasse,
  getAnnees,
  searchEleves,
  type Classe,
  type Salle,
  type AnneeAcademique,
  type Eleve,
} from '../../service/inscription_service';

export default function InscriptionForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [classes, setClasses] = useState<Classe[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [annees, setAnnees] = useState<AnneeAcademique[]>([]);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [searchQ, setSearchQ] = useState('');
  const [eleveLabel, setEleveLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    matricule: '',
    idSalle: '',
    idAcademi: '',
    idClasse: '',
    commentaire: '',
    idAdmin: '1',
  });

  /* ─── Chargement initial ─── */
  useEffect(() => {
    getClasses().then(setClasses).catch(() => {});
    getAnnees().then(setAnnees).catch(() => {});

    if (isEdit) loadInscription();
  }, [isEdit]);

  async function loadInscription() {
    try {
      setLoading(true);
      const data = await getInscription(Number(id));

      const idClasse = String(data.salle?.idClasse ?? '');

      setForm({
        matricule: String(data.matricule),
        idSalle: String(data.idSalle),
        idAcademi: String(data.idAcademi),
        idClasse,
        commentaire: data.commentaire ?? '',
        idAdmin: '1',
      });

      setEleveLabel(`${data.eleve?.prenom ?? ''} ${data.eleve?.nom ?? ''} — #${data.matricule}`);

      if (idClasse) {
        const s = await getSallesByClasse(idClasse);
        setSalles(s);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* ─── Recherche élève ─── */
  async function handleSearchEleve() {
    if (!searchQ || searchQ.trim().length < 2) {
      setEleves([]);
      return;
    }
    try {
      setLoading(true);
      const data = await searchEleves(searchQ.trim());
      setEleves(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function selectEleve(el: Eleve) {
    setForm(f => ({ ...f, matricule: String(el.matricule) }));
    setEleveLabel(`${el.prenom} ${el.nom} — #${el.matricule}`);
    setEleves([]);
    setSearchQ('');
  }

  /* ─── Changement de classe → charger les salles ─── */
  async function handleClasseChange(idClasse: string) {
    setForm(f => ({ ...f, idClasse, idSalle: '' }));
    if (!idClasse) {
      setSalles([]);
      return;
    }
    try {
      const data = await getSallesByClasse(idClasse);
      setSalles(data);
    } catch (err: any) {
      setError(err.message);
    }
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
        await updateInscription(Number(id), {
          idSalle: Number(form.idSalle),
          commentaire: form.commentaire,
        });
      } else {
        await createInscription({
          matricule: Number(form.matricule),
          idSalle: Number(form.idSalle),
          idAcademi: Number(form.idAcademi),
          commentaire: form.commentaire,
          idAdmin: Number(form.idAdmin),
        });
      }
      navigate('/inscriptions');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/inscriptions" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
          Retour aux inscriptions
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? "Modifier l'inscription" : 'Nouvelle Inscription'}
        </h1>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        
        {/* Recherche Élève */}
        {!isEdit && (
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Élève *</label>
            
            {form.matricule ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-green-600">✓</span>
                  <span className="font-medium">{eleveLabel}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setForm(f => ({ ...f, matricule: '' }));
                    setEleveLabel('');
                    setEleves([]);
                  }}
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
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearchEleve();
                      }
                    }}
                    placeholder="Nom, prénom ou matricule..."
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
                  />
                  <button
                    type="button"
                    onClick={handleSearchEleve}
                    className="bg-gray-100 hover:bg-gray-200 px-6 rounded-xl transition"
                  >
                    Chercher
                  </button>
                </div>

                {/* Résultats */}
                {eleves.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
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
        )}

        {/* Élève en mode édition */}
        {isEdit && eleveLabel && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Élève</label>
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-sm">
              {eleveLabel}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Année Académique */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Année Académique *</label>
              <select
                required
                value={form.idAcademi}
                onChange={e => update('idAcademi', e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
              >
                <option value="">Sélectionner une année</option>
                {annees.map(a => (
                  <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>
                ))}
              </select>
            </div>
          )}

          {/* Classe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Classe *</label>
            <select
              required
              value={form.idClasse}
              onChange={e => handleClasseChange(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            >
              <option value="">Sélectionner une classe</option>
              {classes.map(c => (
                <option key={c.idClasse} value={c.idClasse}>
                  {c.libelle} {c.cycle ? `— ${c.cycle.libelle}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Salle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Salle *</label>
            <select
              required
              value={form.idSalle}
              onChange={e => update('idSalle', e.target.value)}
              disabled={salles.length === 0}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c] disabled:opacity-50"
            >
              <option value="">Sélectionner une salle</option>
              {salles.map(s => (
                <option key={s.idSalle} value={s.idSalle}>
                  {s.libelle}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Commentaire */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire (optionnel)</label>
          <textarea
            value={form.commentaire}
            onChange={e => update('commentaire', e.target.value)}
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
            className="flex-1 bg-[#1a3a5c] text-white py-4 rounded-xl font-semibold hover:bg-[#16324f] transition flex items-center justify-center gap-2 disabled:opacity-70"
          >
            <Save size={20} />
            {saving ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Inscrire l\'élève'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/inscriptions')}
            className="flex-1 border border-gray-300 py-4 rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}