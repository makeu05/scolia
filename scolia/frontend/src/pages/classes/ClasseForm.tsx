import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { authFetch } from "../../service/auth";
import {
  createClasse, getCycles, getClasse, updateClasse,
} from "../../service/classe_service";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export default function ClasseForm() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = !!id;

  const [cycles, setCycles]   = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const [form, setForm] = useState({
    libelle:   '',
    idCycle:   '',
    idSection: '',   // ✅ nouveau
    idAdmin:   '1',
  });

  async function load() {
    setLoading(true);
    try {
      const [c, s] = await Promise.all([
        getCycles(),
        authFetch(`${API}/sections`).then(r => r.json()),
      ]);
      setCycles(Array.isArray(c) ? c : []);
      setSections(Array.isArray(s) ? s : (s.data ?? []));

      if (isEdit && id) {
        const cl = await getClasse(Number(id));
        setForm({
          libelle:   cl.libelle,
          idCycle:   String(cl.idCycle),
          idSection: String(cl.idSection ?? ''),
          idAdmin:   '1',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        idSection: form.idSection || null,  // null si pas de section
      };
      if (isEdit) {
        await updateClasse(Number(id), payload);
      } else {
        await createClasse(payload);
      }
      navigate('/classes');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-10 text-center">Chargement...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/classes" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} /> Retour à la liste
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Modifier la classe' : 'Nouvelle classe'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Libellé */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Libellé de la classe *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: 6ème A, Terminale S2…"
              value={form.libelle}
              onChange={e => setForm({ ...form, libelle: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            />
          </div>

          {/* Cycle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cycle *
            </label>
            <select
              required
              value={form.idCycle}
              onChange={e => setForm({ ...form, idCycle: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            >
              <option value="">— Sélectionner un cycle —</option>
              {cycles.map(c => (
                <option key={c.idCycle} value={c.idCycle}>{c.libelle}</option>
              ))}
            </select>
          </div>

          {/* Section (optionnel) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <select
              value={form.idSection}
              onChange={e => setForm({ ...form, idSection: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            >
              <option value="">— Aucune section —</option>
              {sections.map(s => (
                <option key={s.idSection} value={s.idSection}>{s.libelle}</option>
              ))}
            </select>
            {sections.length === 0 && (
              <p className="text-xs text-slate-400 mt-1">
                Aucune section configurée.{' '}
                <a href="/sections" className="text-violet-500 hover:underline">
                  Créer une section
                </a>
              </p>
            )}
          </div>

          {/* Boutons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#1a3a5c] hover:bg-[#16324f] text-white py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <Save size={20} />
              {saving ? 'Enregistrement…' : isEdit ? 'Enregistrer les modifications' : 'Créer la classe'}
            </button>
            <Link to="/classes"
              className="flex-1 border border-gray-300 text-gray-700 py-4 rounded-xl font-semibold text-center hover:bg-gray-50 transition">
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}