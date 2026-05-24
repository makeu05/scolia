import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Key, UserCheck, UserX } from 'lucide-react';
import { authFetch } from '../../service/auth';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

interface UserDetail {
  id: string;
  sourceId: number;
  source: 'admin' | 'personne';
  nom: string;
  username: string;
  role: string;
  actif: number;
  mobile?: string;
  created?: string;
  prenom?: string;
  dateNaissance?: string;
}

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUser = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await authFetch(`${API}/admin/utilisateurs/${id}`);
      const data = await res.json();
      setUser(data);
    } catch (err: any) {
      setError("Impossible de charger les informations de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const toggleActif = async () => {
    if (!id || !user) return;
    if (!confirm("Changer le statut de cet utilisateur ?")) return;

    try {
      await authFetch(`${API}/admin/utilisateurs/${id}/toggle-actif`, { method: 'PUT' });
      fetchUser();
    } catch (err: any) {
      alert(err.message || "Une erreur est survenue");
    }
  };

  const resetPassword = async () => {
    if (!id) return;
    const newPassword = prompt("Entrez le nouveau mot de passe :");
    if (!newPassword || newPassword.length < 6) {
      alert("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      await authFetch(`${API}/admin/utilisateurs/${id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword, password_confirmation: newPassword }),
      });
      alert("Mot de passe réinitialisé avec succès !");
    } catch (err: any) {
      alert(err.message || "Erreur lors de la réinitialisation");
    }
  };

  const deleteUser = async () => {
    if (!id || !confirm("⚠️ Supprimer définitivement cet utilisateur ? Cette action est irréversible.")) return;

    try {
      await authFetch(`${API}/admin/utilisateurs/${id}`, { method: 'DELETE' });
      alert("Utilisateur supprimé avec succès");
      navigate('/admin/utilisateurs');
    } catch (err: any) {
      alert(err.message || "Impossible de supprimer l'utilisateur");
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-gray-500">Chargement des informations...</div>;
  }

  if (error || !user) {
    return (
      <div className="p-10 text-center text-red-600">
        {error || "Utilisateur introuvable"}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/utilisateurs" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={28} />
        </Link>
        <h1 className="text-3xl font-bold">Détails de l'utilisateur</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-semibold">{user.nom}</h2>
            <p className="text-gray-500">@{user.username}</p>
          </div>

          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            user.actif 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {user.actif ? 'Actif' : 'Désactivé'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Rôle</p>
              <p className="text-xl font-medium capitalize">{user.role}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Type de compte</p>
              <p className="font-medium">
                {user.source === 'admin' ? 'Administrateur' : 'Enseignant / Parent'}
              </p>
            </div>

            {user.mobile && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Téléphone</p>
                <p className="font-medium">{user.mobile}</p>
              </div>
            )}

            {user.dateNaissance && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Date de naissance</p>
                <p className="font-medium">{new Date(user.dateNaissance).toLocaleDateString('fr-FR')}</p>
              </div>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Date de création</p>
            <p className="font-medium">
              {user.created ? new Date(user.created).toLocaleDateString('fr-FR') : 'N/A'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to={`/admin/utilisateurs/${id}/modifier`}
            className="flex items-center gap-2 bg-[#1a3a5c] text-white px-6 py-3 rounded-xl hover:bg-[#132d4a] transition"
          >
            <Edit size={20} />
            Modifier
          </Link>

          <button
            onClick={resetPassword}
            className="flex items-center gap-2 border border-gray-300 px-6 py-3 rounded-xl hover:bg-gray-50 transition"
          >
            <Key size={20} />
            Réinitialiser mot de passe
          </button>

          <button
            onClick={toggleActif}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition ${
              user.actif 
                ? 'border border-red-300 text-red-600 hover:bg-red-50' 
                : 'border border-green-300 text-green-600 hover:bg-green-50'
            }`}
          >
            {user.actif ? <UserX size={20} /> : <UserCheck size={20} />}
            {user.actif ? 'Désactiver' : 'Activer'}
          </button>

          <button
            onClick={deleteUser}
            className="flex items-center gap-2 border border-red-300 text-red-600 px-6 py-3 rounded-xl hover:bg-red-50 transition"
          >
            <Trash2 size={20} />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}