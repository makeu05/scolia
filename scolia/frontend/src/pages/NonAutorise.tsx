import { useNavigate } from 'react-router-dom';
import { getUser } from '../service/auth';
import { ShieldOff, ArrowLeft, LayoutDashboard } from 'lucide-react';

const ROLE_REDIRECTS: Record<string, string> = {
  root:       '/dashboard',
  admin:      '/dashboard',
  directeur:  '/dashboard',
  fondateur:  '/finance',
  enseignant: '/dashboard-enseignant',
  parent:     '/dashboard-parent',
};

const ROLE_LABELS: Record<string, string> = {
  root: 'Super Admin', admin: 'Administrateur', fondateur: 'Fondateur',
  directeur: 'Directeur', enseignant: 'Enseignant', parent: 'Parent',
};

const ROLE_COLORS: Record<string, string> = {
  root: '#ef4444', admin: '#3b82f6', fondateur: '#f59e0b',
  directeur: '#8b5cf6', enseignant: '#10b981', parent: '#ec4899',
};

export default function NonAutorise() {
  const navigate  = useNavigate();
  const user      = getUser();
  const role      = user?.role ?? '';
  const dashPath  = ROLE_REDIRECTS[role] ?? '/dashboard';
  const roleColor = ROLE_COLORS[role] ?? '#64748b';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "var(--bg-app)" }}
    >
      {/* Blobs décoratifs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-[0.05]"
          style={{ background: "var(--grad-brand)", filter: "blur(60px)" }}/>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-[0.04]"
          style={{ background: "var(--grad-accent)", filter: "blur(60px)" }}/>
      </div>

      <div className="relative w-full max-w-md animate-bounce-in">

        <div className="card-elevated p-10 text-center">

          {/* Icône */}
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.16)" }}>
            <ShieldOff className="w-10 h-10 text-red-500" />
          </div>

          {/* Code erreur */}
          <p className="text-7xl font-black mb-1 text-gradient-brand">403</p>

          <h1 className="text-xl font-bold mb-2" style={{ color: "var(--text-900)", letterSpacing: "-0.02em" }}>
            Accès refusé
          </h1>

          <p className="text-sm mb-5" style={{ color: "var(--text-400)" }}>
            Cette page n'est pas accessible avec votre rôle actuel.
          </p>

          {/* Badge rôle */}
          {role && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
              style={{ background: `${roleColor}12`, border: `1px solid ${roleColor}28` }}>
              <span className="w-2 h-2 rounded-full" style={{ background: roleColor }}/>
              <span className="text-xs font-bold" style={{ color: roleColor }}>
                {ROLE_LABELS[role] ?? role}
              </span>
            </div>
          )}

          <p className="text-xs mb-8" style={{ color: "var(--text-300)" }}>
            Contactez votre administrateur si vous pensez qu'il s'agit d'une erreur.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => navigate(-1)} className="btn-secondary flex-1">
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <button onClick={() => navigate(dashPath)} className="btn-primary flex-1">
              <LayoutDashboard className="w-4 h-4" /> Mon espace
            </button>
          </div>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: "var(--text-300)" }}>
          SCOLIA · Système de Gestion Scolaire · Cameroun
        </p>
      </div>
    </div>
  );
}
