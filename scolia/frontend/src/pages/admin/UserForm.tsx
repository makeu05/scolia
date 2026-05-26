import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { authFetch } from '../../service/auth';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

export default function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    username: '',
    password: '',
    role: 'admin',
    mobile: '',
    dateNaissance: '',
    lieuNaissance: '',
    type: 'admin', // admin ou personne
  });

  // Chargement en mode édition
  useEffect(() => {
    if (isEdit && id) {
      const loadUser = async () => {
        try {
          setLoading(true);
          const res = await authFetch(`${API}/admin/utilisateurs/${id}`);
          const data = await res.json();

          setForm({
            nom: data.nom?.split(' ')[0] || data.nom || '',
            prenom: data.nom?.includes(' ') ? data.nom.split(' ').slice(1).join(' ') : '',
            username: data.username || '',
            password: '',
            role: data.role || 'admin',
            mobile: data.mobile || '',
            dateNaissance: data.dateNaissance || '',
            lieuNaissance: '',
            type: data.source || 'admin',
          });
        } catch (err: any) {
          setError("Impossible de charger l'utilisateur");
        } finally {
          setLoading(false);
        }
      };
      loadUser();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        nom: form.nom,
        prenom: form.type === 'personne' ? form.prenom : undefined,
        username: form.username,
        password: form.password || undefined,
        role: form.role,
        mobile: form.mobile,
        dateNaissance: form.type === 'personne' ? form.dateNaissance : undefined,
        lieuNaissance: form.type === 'personne' ? 'INDEFINI' : undefined,
      };

      const url = isEdit 
        ? `${API}/admin/utilisateurs/${id}` 
        : `${API}/admin/utilisateurs`;

      const method = isEdit ? 'PUT' : 'POST';

      const res = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Erreur lors de la sauvegarde');
      }

      alert(isEdit ? 'Utilisateur mis à jour avec succès' : 'Utilisateur créé avec succès');
      navigate('/admin/utilisateurs');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const update = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="p-10 text-center">Chargement...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/utilisateurs" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
        
        {/* Type d'utilisateur */}
        <div>
          <label className="block text-sm font-medium mb-2">Type d'utilisateur</label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => update('type', 'admin')}
              className={`flex-1 py-3 rounded-xl border ${form.type === 'admin' ? 'border-[#1a3a5c] bg-[#1a3a5c] text-white' : 'border-gray-300'}`}
            >
              Administrateur
            </button>
            <button
              type="button"
              onClick={() => update('type', 'personne')}
              className={`flex-1 py-3 rounded-xl border ${form.type === 'personne' ? 'border-[#1a3a5c] bg-[#1a3a5c] text-white' : 'border-gray-300'}`}
            >
              Enseignant / Parent
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nom</label>
            <input
              type="text"
              value={form.nom}
              onChange={(e) => update('nom', e.target.value)}
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            />
          </div>

          {form.type === 'personne' && (
            <div>
              <label className="block text-sm font-medium mb-2">Prénom</label>
              <input
                type="text"
                value={form.prenom}
                onChange={(e) => update('prenom', e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Nom d'utilisateur</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => update('username', e.target.value)}
            required
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {isEdit ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
          </label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            {...(!isEdit && { required: true })}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            placeholder={isEdit ? "Laisser vide si inchangé" : ""}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Rôle</label>
          <select
            value={form.role}
            onChange={(e) => update('role', e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
          >
            <option value="root">Root (Super Admin)</option>
            <option value="admin">Administrateur</option>
            <option value="fondateur">Fondateur</option>
            <option value="directeur">Directeur</option>
            <option value="enseignant">Enseignant</option>
            <option value="parent">Parent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Téléphone</label>
          <input
            type="tel"
            value={form.mobile}
            onChange={(e) => update('mobile', e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
          />
        </div>

        {form.type === 'personne' && (
          <div>
            <label className="block text-sm font-medium mb-2">Date de naissance</label>
            <input
              type="date"
              value={form.dateNaissance}
              onChange={(e) => update('dateNaissance', e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
            />
          </div>
        )}

        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-[#1a3a5c] text-white py-4 rounded-xl font-semibold hover:bg-[#132d4a] transition disabled:opacity-70 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer les modifications' : 'Créer l’utilisateur'}
          </button>

          <Link
            to="/admin/utilisateurs"
            className="flex-1 border border-gray-300 text-gray-700 py-4 rounded-xl font-semibold text-center hover:bg-gray-50"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}