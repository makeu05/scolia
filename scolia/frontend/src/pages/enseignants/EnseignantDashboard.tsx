import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, authFetch } from '../../service/auth';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

export default function EnseignantDashboard() {
  const navigate    = useNavigate();
  const user        = getUser();
  const [cours, setCours] = useState<any>(null);

  useEffect(() => {
    if (!user?.idCours) return;
    authFetch(`${API}/cours/${user.idCours}`)
      .then(r => r.json())
      .then(setCours);
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Espace Enseignant
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bonjour {user?.name}
        </p>
      </div>

      {/* Cours assigné */}
      {cours && (
        <div className="bg-card border border-border rounded-2xl p-5 mb-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Mon cours
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg">{cours.libelle}</p>
              <p className="text-sm text-muted-foreground">
                {cours.classe?.libelle} — Coefficient {cours.coefficient}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              cours.actif
                ? 'bg-green-500/10 text-green-400'
                : 'bg-red-500/10 text-red-400'
            }`}>
              {cours.actif ? 'Actif' : 'Inactif'}
            </span>
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            label: 'Saisir des notes',
            desc:  'Entrer les notes de mes élèves',
            icon:  '✏️',
            path:  '/notes/saisie',
            color: 'bg-blue-50 hover:bg-blue-100',
          },
          {
            label: 'Voir le classement',
            desc:  'Classement de ma classe',
            icon:  '📊',
            path:  '/notes/classement',
            color: 'bg-violet-50 hover:bg-violet-100',
          },
          {
            label: 'Bulletins',
            desc:  'Générer les bulletins',
            icon:  '📄',
            path:  '/notes/bulletin',
            color: 'bg-emerald-50 hover:bg-emerald-100',
          },
          {
            label: 'Mes épreuves',
            desc:  'Gérer mes épreuves',
            icon:  '📝',
            path:  '/epreuves',
            color: 'bg-amber-50 hover:bg-amber-100',
          },
        ].map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`${item.color} rounded-2xl p-5 text-left transition-colors border border-transparent hover:border-gray-200`}
          >
            <span className="text-3xl block mb-3">{item.icon}</span>
            <p className="font-semibold text-gray-800 text-sm">{item.label}</p>
            <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}