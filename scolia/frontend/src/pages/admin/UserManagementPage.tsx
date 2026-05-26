import { useEffect, useState } from 'react';
import { Plus, Edit, Eye, UserX, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authFetch } from '../../service/auth';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

interface UserItem {
  id: string;
  nom: string;
  username: string;
  role: string;
  actif: number;
  source: 'admin' | 'personne';
  mobile?: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'admin' | 'personne'>('all');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await authFetch(
        `${API}/admin/utilisateurs?search=${encodeURIComponent(search)}&type=${typeFilter}`
      );
      const data = await res.json();
      setUsers(data.data || data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, typeFilter]);

  const toggleActif = async (id: string) => {
    if (!confirm("Changer le statut ?")) return;
    await authFetch(`${API}/admin/utilisateurs/${id}/toggle-actif`, { method: 'PUT' });
    fetchUsers();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
          <p className="text-gray-500">Root & Admin</p>
        </div>

        <Link
          to="/admin/utilisateurs/nouveau"
          className="bg-[#1a3a5c] text-white px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-[#132d4a]"
        >
          <Plus size={20} />
          Nouvel Utilisateur
        </Link>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Rechercher par nom ou username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-md border border-gray-300 rounded-xl px-4 py-3 focus:border-[#1a3a5c]"
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="border border-gray-300 rounded-xl px-4 py-3"
        >
          <option value="all">Tous les utilisateurs</option>
          <option value="admin">Administrateurs</option>
          <option value="personne">Enseignants & Parents</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left">Utilisateur</th>
              <th className="px-6 py-4 text-left">Rôle</th>
              <th className="px-6 py-4 text-left">Type</th>
              <th className="px-6 py-4 text-center">Statut</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{u.nom}</p>
                    <p className="text-sm text-gray-500">@{u.username}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="capitalize px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {u.source === 'admin' ? 'Administrateur' : 'Personnel'}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-sm ${u.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.actif ? 'Actif' : 'Désactivé'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-4">
                    <Link to={`/admin/utilisateurs/${u.id}`}>
                      <Eye size={20} className="text-gray-600 hover:text-gray-800" />
                    </Link>
                    <Link to={`/admin/utilisateurs/${u.id}/modifier`}>
                      <Edit size={20} className="text-amber-600 hover:text-amber-700" />
                    </Link>
                    <button onClick={() => toggleActif(u.id)}>
                      {u.actif ? <UserX size={20} className="text-red-600" /> : <UserCheck size={20} className="text-green-600" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}