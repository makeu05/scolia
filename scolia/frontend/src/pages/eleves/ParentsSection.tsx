import { useEffect, useState } from "react";
import { authFetch } from "../../service/auth";
import { Search, Plus, X, User, Phone, Trash2, UserCheck } from "lucide-react";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

interface Personne {
  idPers: number;
  nom: string;
  prenom: string;
  mobile: string;
  phone?: string;
  typePersonne: number;
}

interface Parent {
  idParent: number;
  idPers: number;
  matricule: number;
  lien?: string;
  personne: Personne;
}

interface Props { matricule: number; }

type Mode = 'liste' | 'recherche' | 'nouveau';

const LIENS_PARENTE = [
  'Père', 'Mère', 'Tuteur', 'Tutrice',
  'Oncle', 'Tante', 'Grand-père', 'Grand-mère',
  'Frère aîné', 'Sœur aînée', 'Autre',
];

export default function ParentsSection({ matricule }: Props) {
  const [parents, setParents]               = useState<Parent[]>([]);
  const [loading, setLoading]               = useState(true);
  const [mode, setMode]                     = useState<Mode>('liste');
  const [submitting, setSubmitting]         = useState(false);
  const [error, setError]                   = useState('');
  const [success, setSuccess]               = useState('');

  // Recherche
  const [searchQ, setSearchQ]               = useState('');
  const [resultats, setResultats]           = useState<Personne[]>([]);
  const [searching, setSearching]           = useState(false);
  const [personneSelectee, setPersonneSelectee] = useState<Personne | null>(null);
  const [lienSelecte, setLienSelecte]       = useState('Père');

  // Formulaire nouveau
  const [form, setForm] = useState({
    nom: '', prenom: '', mobile: '', phone: '',
    typePersonne: '4', lien: 'Père', idAdmin: '1',
  });

  async function fetchParents() {
    try {
      setLoading(true);
      const res  = await authFetch(`${API}/eleves/${matricule}/parents`);
      const data = await res.json();
      setParents(Array.isArray(data) ? data : (data.data ?? []));
    } catch { setParents([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { if (matricule) fetchParents(); }, [matricule]);

  // ── Recherche ────────────────────────────────────────────────────────────
  async function handleSearch() {
    if (!searchQ || searchQ.trim().length < 2) return;
    setSearching(true); setResultats([]);
    try {
      // Chercher dans tous les types de personnes (parents + tuteurs)
      const res  = await authFetch(
        `${API}/personnes?search=${encodeURIComponent(searchQ)}`
      );
      const data = await res.json();
      const all  = Array.isArray(data) ? data : (data.data ?? []);
      // Filtrer : typePersonne 4 (parent) ou 5 (tuteur) ou tout si pas de type
      setResultats(all.filter((p: Personne) => !p.typePersonne || [4, 5].includes(p.typePersonne)));
    } catch { setResultats([]); }
    finally { setSearching(false); }
  }

  // ── Lier personne existante ───────────────────────────────────────────────
  async function handleLier() {
    if (!personneSelectee) return;
    setSubmitting(true); setError(''); setSuccess('');
    try {
      const res = await authFetch(`${API}/eleves/${matricule}/parents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idPers:   personneSelectee.idPers,
          lien:     lienSelecte,
          idAdmin:  1,
          existant: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Erreur');
      setSuccess(`${personneSelectee.prenom} ${personneSelectee.nom} ajouté(e) comme ${lienSelecte}`);
      reset(); fetchParents();
    } catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  // ── Créer et lier ─────────────────────────────────────────────────────────
  async function handleCreer(e: React.FormEvent) {
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
      reset(); fetchParents();
    } catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  }

  // ── Supprimer ─────────────────────────────────────────────────────────────
  async function handleDelete(idParent: number) {
    if (!confirm('Supprimer ce parent ?')) return;
    await authFetch(`${API}/eleves/${matricule}/parents/${idParent}`, { method: 'DELETE' });
    fetchParents();
  }

  function reset() {
    setMode('liste'); setError(''); setSuccess('');
    setSearchQ(''); setResultats([]); setPersonneSelectee(null);
    setLienSelecte('Père');
    setForm({ nom:'', prenom:'', mobile:'', phone:'', typePersonne:'4', lien:'Père', idAdmin:'1' });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <User className="w-4 h-4 text-violet-500" />
          Parents / Tuteurs
          <span className="text-xs font-normal text-slate-400">({parents.length})</span>
        </h2>
        {mode === 'liste' ? (
          <div className="flex gap-2">
            <button onClick={() => setMode('recherche')}
              className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition">
              <Search className="w-3.5 h-3.5" /> Personne existante
            </button>
            <button onClick={() => setMode('nouveau')}
              className="flex items-center gap-1.5 text-xs bg-[#1a3a5c] hover:bg-[#16324f] text-white px-3 py-1.5 rounded-lg transition">
              <Plus className="w-3.5 h-3.5" /> Nouveau parent
            </button>
          </div>
        ) : (
          <button onClick={reset} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" /> Annuler
          </button>
        )}
      </div>

      {/* Alertes */}
      {error   && <div className="bg-red-50   border border-red-200   text-red-600   px-3 py-2 rounded-lg text-xs mb-3">⚠ {error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-xs mb-3">✓ {success}</div>}

      {/* ── MODE RECHERCHE ── */}
      {mode === 'recherche' && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 space-y-3">
          <p className="text-xs font-medium text-slate-600">
            Rechercher par nom, prénom ou numéro de téléphone
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); }}}
              placeholder="Ex : Fouda, Albert, 699..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a3a5c]"
            />
            <button onClick={handleSearch} disabled={searching || searchQ.length < 2}
              className="bg-[#1a3a5c] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#16324f] disabled:opacity-50 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              {searching ? '…' : 'Chercher'}
            </button>
          </div>

          {/* Résultats */}
          {resultats.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {resultats.map(p => (
                <button key={p.idPers} type="button"
                  onClick={() => setPersonneSelectee(personneSelectee?.idPers === p.idPers ? null : p)}
                  className={`w-full text-left px-4 py-3 text-sm border-b border-gray-100 last:border-0 transition flex items-center justify-between ${
                    personneSelectee?.idPers === p.idPers
                      ? 'bg-violet-50 text-violet-700'
                      : 'bg-white hover:bg-gray-50'
                  }`}>
                  <div>
                    <span className="font-semibold">{p.prenom} {p.nom}</span>
                    <span className="text-gray-400 text-xs ml-2">
                      {p.mobile}{p.phone ? ` · ${p.phone}` : ''}
                    </span>
                  </div>
                  {personneSelectee?.idPers === p.idPers && (
                    <UserCheck className="w-4 h-4 text-violet-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}

          {searchQ.length >= 2 && !searching && resultats.length === 0 && (
            <p className="text-xs text-slate-400">
              Aucun résultat. <button type="button" onClick={() => setMode('nouveau')} className="text-[#1a3a5c] underline">Créer une nouvelle personne</button>
            </p>
          )}

          {/* Lien de parenté + confirmation */}
          {personneSelectee && (
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="bg-violet-50 border border-violet-200 rounded-lg px-4 py-3">
                <p className="text-sm font-semibold text-violet-800">{personneSelectee.prenom} {personneSelectee.nom}</p>
                <p className="text-xs text-slate-400 mt-0.5">{personneSelectee.mobile}</p>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Lien de parenté *</label>
                <select value={lienSelecte} onChange={e => setLienSelecte(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a3a5c]">
                  {LIENS_PARENTE.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <button onClick={handleLier} disabled={submitting}
                className="w-full bg-[#1a3a5c] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#16324f] disabled:opacity-50">
                {submitting ? 'Ajout…' : `Ajouter comme ${lienSelecte}`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── MODE NOUVEAU PARENT ── */}
      {mode === 'nouveau' && (
        <form onSubmit={handleCreer}
          className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 space-y-3">
          <p className="text-xs font-medium text-slate-600">Créer un nouveau parent et l'ajouter</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Nom *</label>
              <input required value={form.nom}
                onChange={e => setForm(f => ({ ...f, nom: e.target.value.toUpperCase() }))}
                placeholder="FOUDA" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Prénom *</label>
              <input required value={form.prenom}
                onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                placeholder="Albert" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Mobile *</label>
              <input required type="tel" value={form.mobile}
                onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
                placeholder="+237 699 000 000" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Téléphone fixe</label>
              <input type="tel" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+237 222 000 000" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Lien de parenté *</label>
              <select value={form.lien} onChange={e => setForm(f => ({ ...f, lien: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                {LIENS_PARENTE.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Type</label>
              <select value={form.typePersonne} onChange={e => setForm(f => ({ ...f, typePersonne: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="4">Parent</option>
                <option value="5">Tuteur / Autre</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50">
            {submitting ? 'Création…' : 'Créer et ajouter'}
          </button>
        </form>
      )}

      {/* ── LISTE ── */}
      {mode === 'liste' && (
        loading ? (
          <p className="text-sm text-gray-400">Chargement...</p>
        ) : parents.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <div className="text-3xl mb-2">👨‍👧</div>
            <p className="text-sm">Aucun parent enregistré</p>
          </div>
        ) : (
          <div className="space-y-2">
            {parents.map(p => (
              <div key={p.idParent}
                className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600 flex-shrink-0">
                    {p.personne?.prenom?.[0]}{p.personne?.nom?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {p.personne?.prenom} {p.personne?.nom}
                      {p.lien && (
                        <span className="ml-2 text-xs bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded-full font-normal">
                          {p.lien}
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {p.personne?.mobile && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Phone className="w-3 h-3" /> {p.personne.mobile}
                        </span>
                      )}
                      {p.personne?.typePersonne === 5 && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Tuteur</span>
                      )}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDelete(p.idParent)}
                  className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}