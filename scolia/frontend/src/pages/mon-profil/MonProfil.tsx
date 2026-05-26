import { useEffect, useState } from 'react';
import { ArrowLeft, Save, Key, UserCircle } from 'lucide-react';
import { useAuth } from '../../service/auth';
import { authFetch } from '../../service/auth';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

export default function MonProfil() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    username: '',
    mobile: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Charger les informations actuelles
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        nom: user.name || '',
        username: user.username || '',
      }));
    }
  }, [user]);

  const updateForm = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setError('');
    setSuccess('');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await authFetch(`${API}/mon-profil`, {
        method: 'PUT',
        body: JSON.stringify({
          nom: form.nom,
          prenom: form.prenom || undefined,
          mobile: form.mobile || undefined,
        }),
      });

      setSuccess('Profil mis à jour avec succès');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) {
      setError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    if (form.new_password.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await authFetch(`${API}/mon-profil/change-password`, {
        method: 'POST',
        body: JSON.stringify({
          current_password: form.current_password,
          new_password: form.new_password,
          confirm_password: form.confirm_password,
        }),
      });

      setSuccess('Mot de passe changé avec succès');
      setForm(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: '',
      }));
    } catch (err: any) {
      setError(err.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={28} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-500">Gérer mes informations personnelles</p>
        </div>
      </div>

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Colonne gauche - Photo & Infos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="mx-auto h-32 w-32 rounded-full bg-[#1a3a5c] flex items-center justify-center text-white text-5xl font-bold mb-6">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>

            <h2 className="text-2xl font-semibold">{user?.name}</h2>
            <p className="text-gray-500 mb-6">@{user?.username}</p>

            <div className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {user?.role?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Colonne droite - Formulaires */}
        <div className="lg:col-span-3 space-y-8">
          {/* 1. Informations personnelles */}
          <form onSubmit={handleUpdateProfile} className="bg-white rounded-2xl border border-gray-100 p-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              Informations personnelles
            </h3>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom</label>
                  <input
                    type="text"
                    value={form.nom}
                    onChange={(e) => updateForm('nom', e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#1a3a5c] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Prénom</label>
                  <input
                    type="text"
                    value={form.prenom}
                    onChange={(e) => updateForm('prenom', e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#1a3a5c] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={form.mobile}
                  onChange={(e) => updateForm('mobile', e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#1a3a5c] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 w-full bg-[#1a3a5c] text-white py-3.5 rounded-xl font-semibold hover:bg-[#132d4a] transition disabled:opacity-70"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </form>

          {/* 2. Changement de mot de passe */}
          <form onSubmit={handleChangePassword} className="bg-white rounded-2xl border border-gray-100 p-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Key className="h-5 w-5" />
              Changer mon mot de passe
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Mot de passe actuel</label>
                <input
                  type="password"
                  value={form.current_password}
                  onChange={(e) => updateForm('current_password', e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#1a3a5c] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={form.new_password}
                  onChange={(e) => updateForm('new_password', e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#1a3a5c] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value={form.confirm_password}
                  onChange={(e) => updateForm('confirm_password', e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#1a3a5c] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 w-full bg-red-600 text-white py-3.5 rounded-xl font-semibold hover:bg-red-700 transition disabled:opacity-70"
            >
              {saving ? 'Changement en cours...' : 'Changer le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}