import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../../service/auth';
import { useAuth } from '../../service/auth';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

export default function EnseignantDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cours, setCours] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.idCours) {
      setLoading(false);
      return;
    }

    const loadCours = async () => {
      try {
        const res = await authFetch(`${API}/cours/${user.idCours}`);
        if (res.ok) {
          const data = await res.json();
          setCours(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCours();
  }, [user]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Espace Enseignant</h1>
        <p className="text-gray-500 mt-1">
          Bienvenue, {user?.name?.split(' ')[0] || 'Enseignant'}
        </p>
      </div>

      {/* Cours Assigné */}
      {loading ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
          Chargement de vos cours...
        </div>
      ) : cours ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-7 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{cours.libelle}</h2>
              <p className="text-gray-500 mt-1">
                {cours.classe?.libelle} • Coefficient {cours.coefficient}
              </p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              cours.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {cours.actif ? 'Actif' : 'Inactif'}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-500">
          Aucun cours assigné pour le moment.
        </div>
      )}

      {/* Actions Rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            label: "Saisir des notes",
            desc: "Entrer les notes de mes élèves",
            icon: "✏️",
            path: "/notes/saisie",
            color: "hover:bg-blue-50 border-blue-100",
          },
          {
            label: "Voir le classement",
            desc: "Classement de ma classe",
            icon: "📊",
            path: "/notes/classement",
            color: "hover:bg-violet-50 border-violet-100",
          },
          {
            label: "Mes épreuves",
            desc: "Gérer mes évaluations",
            icon: "📝",
            path: "/epreuves",
            color: "hover:bg-amber-50 border-amber-100",
          },
          {
            label: "Bulletins",
            desc: "Consulter les bulletins",
            icon: "📄",
            path: "/notes/bulletin",
            color: "hover:bg-emerald-50 border-emerald-100",
          },
        ].map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className={`group bg-white border border-gray-100 rounded-2xl p-6 text-left hover:border-gray-300 transition-all ${item.color}`}
          >
            <div className="text-4xl mb-4 transition-transform group-hover:scale-110">
              {item.icon}
            </div>
            <p className="font-semibold text-lg text-gray-800">{item.label}</p>
            <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}