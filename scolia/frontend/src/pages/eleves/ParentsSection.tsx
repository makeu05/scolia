import { useEffect, useState } from "react";
import { authFetch } from "../../service/auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

interface Personne {
  idPers: number;
  nom: string;
  prenom: string;
  mobile: string;
  phone: string;
  typePersonne: number;
}

interface Parent {
  idParent: number;
  idPers: number;
  matricule: number;
  personne: Personne;
}

interface Props {
  matricule: number;
}

type Mode = 'liste' | 'recherche' | 'nouveau';

export default function ParentsSection({ matricule }: Props) {
  const [parents, setParents]       = useState<Parent[]>([]);
  const [loading, setLoading]       = useState(true);
  const [mode, setMode]             = useState<Mode>('liste');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  // Recherche personne existante
  const [searchQ, setSearchQ]             = useState('');
  const [resultats, setResultats]         = useState<Personne[]>([]);
  const [searching, setSearching]         = useState(false);
  const [personneSelectee, setPersonneSelectee] = useState<Personne | null>(null);

  // Formulaire nouvelle personne
  const [form, setForm] = useState({
    nom:          '',
    prenom:       '',
    mobile:       '',
    phone:        '',
    typePersonne: '4',
    idAdmin:      '1',
  });

  /* ─── Charger les parents ─── */
  async function fetchParents() {
    try {
      setLoading(true);
      const res  = await authFetch(`${API}/eleves/${matricule}/parents`);
      const data = await res.json();
      const liste = Array.isArray(data) ? data : (data.data ?? []);
      setParents(liste);
    } catch {
      setParents([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (matricule) fetchParents();
  }, [matricule]);

  /* ─── Recherche personne existante ─── */
  async function handleSearch() {
    if (!searchQ || searchQ.trim().length < 2) return;
    try {
      setSearching(true);
      setResultats([]);
      // Chercher dans les Personnes de typePersonne 4 ou 5
      const res  = await authFetch(
        `${API}/personnes?search=${encodeURIComponent(searchQ)}&typePersonne=4`
      );
      const data = await res.json();
      const liste = Array.isArray(data) ? data : (data.data ?? []);
      setResultats(liste);
    } catch {
      setResultats([]);
    } finally {
      setSearching(false);
    }
  }

  /* ─── Lier une personne existante ─── */
  async function handleLierPersonne() {
    if (!personneSelectee) return;
    setSubmitting(true); setError(''); setSuccess('');
    try {
      const res = await authFetch(`${API}/eleves/${matricule}/parents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idPers:  personneSelectee.idPers,
          idAdmin: '1',
          existant: true, // indique qu'on lie une personne existante
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Erreur');
      setSuccess('Parent ajouté avec succès');
      setPersonneSelectee(null);
      setSearchQ('');
      setResultats([]);
      setMode('liste');
      fetchParents();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  /* ─── Créer une nouvelle personne + lier ─── */
  async function handleCreerEtLier(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError(''); setSuccess('');
    try {
      const res = await authFetch(`${API}/eleves/${matricule}/parents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, existant: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Erreur');
      setSuccess('Parent créé et ajouté avec succès');
      setForm({ nom: '', prenom: '', mobile: '', phone: '', typePersonne: '4', idAdmin: '1' });
      setMode('liste');
      fetchParents();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  /* ─── Supprimer ─── */
  async function handleDelete(idParent: number) {
    if (!confirm('Supprimer ce parent ?')) return;
    await authFetch(`${API}/eleves/${matricule}/parents/${idParent}`, {
      method: 'DELETE',
    });
    fetchParents();
  }

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function reset() {
    setMode('liste');
    setError('');
    setSuccess('');
    setSearchQ('');
    setResultats([]);
    setPersonneSelectee(null);
    setForm({ nom: '', prenom: '', mobile: '', phone: '', typePersonne: '4', idAdmin: '1' });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 mt-4 shadow-sm">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-gray-800">
          Parents / Tuteurs ({parents.length})
        </h2>
        {mode === 'liste' && (
          <div className="flex gap-2">
            <button
              onClick={() => setMode('recherche')}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition"
            >
              🔍 Personne existante
            </button>
            <button
              onClick={() => setMode('nouveau')}
              className="text-xs bg-[#1a3a5c] hover:bg-[#16324f] text-white px-3 py-1.5 rounded-lg transition"
            >
              + Nouveau parent
            </button>
          </div>
        )}
        {mode !== 'liste' && (
          <button
            onClick={reset}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Annuler
          </button>
        )}
      </div>

      {/* ALERTES */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs mb-3">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-3 py-2 rounded-lg text-xs mb-3">
          ✓ {success}
        </div>
      )}

      {/* ── MODE RECHERCHE PERSONNE EXISTANTE ── */}
      {mode === 'recherche' && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
          <p className="text-xs font-medium text-gray-600 mb-3">
            Rechercher une personne déjà enregistrée
          </p>

          {/* Barre de recherche */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } }}
              placeholder="Nom, prénom ou numéro..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a3a5c]"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching}
              className="bg-[#1a3a5c] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#16324f] transition disabled:opacity-50"
            >
              {searching ? '...' : 'Chercher'}
            </button>
          </div>

          {/* Résultats */}
          {resultats.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
              {resultats.map(p => (
                <button
                  key={p.idPers}
                  type="button"
                  onClick={() => setPersonneSelectee(p)}
                  className={`w-full text-left px-4 py-2.5 text-sm border-b border-gray-100 last:border-0 transition ${
                    personneSelectee?.idPers === p.idPers
                      ? 'bg-blue-50 text-[#1a3a5c]'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium">{p.prenom} {p.nom}</span>
                  <span className="text-gray-400 text-xs ml-2">— {p.mobile}</span>
                  {personneSelectee?.idPers === p.idPers && (
                    <span className="ml-2 text-blue-600 text-xs">✓ Sélectionné</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {searchQ.length >= 2 && resultats.length === 0 && !searching && (
            <p className="text-xs text-gray-400 mb-3">
              Aucun résultat. Vous pouvez{' '}
              <button
                type="button"
                onClick={() => setMode('nouveau')}
                className="text-[#1a3a5c] underline"
              >
                créer une nouvelle personne
              </button>
            </p>
          )}

          {/* Personne sélectionnée */}
          {personneSelectee && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-3">
              <p className="text-sm font-medium text-[#1a3a5c]">
                {personneSelectee.prenom} {personneSelectee.nom}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {personneSelectee.mobile}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleLierPersonne}
            disabled={!personneSelectee || submitting}
            className="w-full bg-[#1a3a5c] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#16324f] transition disabled:opacity-50"
          >
            {submitting ? 'Ajout en cours...' : 'Ajouter ce parent'}
          </button>
        </div>
      )}

      {/* ── MODE NOUVEAU PARENT ── */}
      {mode === 'nouveau' && (
        <form
          onSubmit={handleCreerEtLier}
          className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4 space-y-3"
        >
          <p className="text-xs font-medium text-gray-600">
            Créer une nouvelle personne et l'ajouter comme parent
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nom</label>
              <input
                required
                placeholder="ex: FONO"
                value={form.nom}
                onChange={e => update('nom', e.target.value.toUpperCase())}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a3a5c] uppercase"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Prénom</label>
              <input
                required
                placeholder="ex: Albert"
                value={form.prenom}
                onChange={e => update('prenom', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a3a5c]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Mobile *</label>
              <input
                required
                placeholder="ex: 699000000"
                value={form.mobile}
                onChange={e => update('mobile', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a3a5c]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Téléphone</label>
              <input
                placeholder="ex: 222000000"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a3a5c]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Type</label>
            <select
              value={form.typePersonne}
              onChange={e => update('typePersonne', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a3a5c]"
            >
              <option value="4">Parent</option>
              <option value="5">Tuteur / Autre</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            {submitting ? 'Création en cours...' : 'Créer et ajouter'}
          </button>
        </form>
      )}

      {/* ── LISTE DES PARENTS ── */}
      {mode === 'liste' && (
        loading ? (
          <p className="text-sm text-gray-400">Chargement...</p>
        ) : parents.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <p className="text-3xl mb-2">👨‍👧</p>
            <p className="text-sm">Aucun parent enregistré</p>
          </div>
        ) : (
          <div className="space-y-2">
            {parents.map(p => (
              <div
                key={p.idParent}
                className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 bg-gray-50 hover:bg-gray-100 transition"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {p.personne?.prenom} {p.personne?.nom}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {p.personne?.mobile}
                    {p.personne?.typePersonne === 5 && (
                      <span className="ml-2 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px]">
                        Tuteur
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(p.idParent)}
                  className="text-red-400 hover:text-red-600 text-xs transition"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}