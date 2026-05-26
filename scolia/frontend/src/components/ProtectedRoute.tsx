import { Navigate } from 'react-router-dom';
import { getUser } from '../service/auth';

interface Props {
  children: React.ReactNode;
  roles?: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  roles,
  redirectTo = '/login',
}: Props) {
  const user = getUser();

  // Non connecté
  if (!user) return <Navigate to={redirectTo} replace />;

  // Vérification du rôle
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/non-autorise" replace />;
  }

  return <>{children}</>;
}