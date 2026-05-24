import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAnnees,
  type AnneeAcademique,
} from '../../service/evaluation_service';

export default function NotesHome() {
  const navigate = useNavigate();
  const [annees, setAnnees]   = useState<AnneeAcademique[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnnees()
      .then(setAnnees)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const menuItems = [
    {
      title: 'Saisie des notes',
      description: 'Entrer les notes des élèves par épreuve et par cours',
      path: '/notes/saisie',
      icon: '✏️',
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      title: 'Moyennes & Classement',
      description: 'Consulter les moyennes par cours et le classement par classe',
      path: '/notes/classement',
      icon: '📊',
      color: 'bg-green-500/10 text-green-400 border-green-500/20',
    },
    {
      title: 'Bulletins de notes',
      description: 'Générer et imprimer les bulletins PDF par élève',
      path: '/notes/bulletin',
      icon: '📄',
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Notes & Bulletins
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestion des évaluations, moyennes et bulletins scolaires
        </p>
      </div>

      {/* MENU */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {menuItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="bg-card border border-border rounded-2xl p-6 text-left hover:border-primary/50 transition group"
          >
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 text-2xl ${item.color}`}>
              {item.icon}
            </div>
            <h2 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition">
              {item.title}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {item.description}
            </p>
          </button>
        ))}
      </div>

      {/* ANNÉES ACADÉMIQUES */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Années académiques
        </h2>

        {loading ? (
          <p className="text-muted-foreground text-sm">Chargement...</p>
        ) : annees.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground text-sm mb-3">
              Aucune année académique
            </p>
            <button
              onClick={() => navigate('/annees')}
              className="text-primary text-sm hover:underline"
            >
              Créer une année académique →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {annees.map(annee => (
              <div
                key={annee.idAnnee}
                className="flex items-center justify-between bg-background border border-border rounded-xl px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{annee.libelle}</p>
                  <p className="text-xs text-muted-foreground">{annee.periode}</p>
                </div>
                <button
                  onClick={() => navigate(`/notes/saisie?idAnnee=${annee.idAnnee}`)}
                  className="text-xs text-primary hover:underline"
                >
                  Saisir notes →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}