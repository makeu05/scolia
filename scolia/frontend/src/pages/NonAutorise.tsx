import { useNavigate } from 'react-router-dom';
import { getUser } from '../service/auth';

export default function NonAutorise() {
  const navigate = useNavigate();
  const user     = getUser();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-6">
        <p className="text-6xl mb-4">🔒</p>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Accès refusé
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Votre rôle <span className="font-medium text-primary">({user?.role})</span> ne permet pas d'accéder à cette page.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-lg text-sm hover:opacity-90 transition mr-3"
        >
          ← Retour
        </button>
        <button
          onClick={() => navigate('/')}
          className="bg-secondary px-6 py-3 rounded-lg text-sm hover:opacity-80 transition"
        >
          Dashboard
        </button>
      </div>
    </div>
  );
}