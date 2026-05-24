import { Routes, Route, Navigate, Link } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

// ==================== AUTH ====================
import Login from "./pages/Login";
import Register from "./pages/register";
import NonAutorise from "./pages/NonAutorise";

// ==================== DASHBOARD ====================
import Dashboard from "./pages/Dashboard";

// ==================== ÉLÈVES ====================
import ElevesList from "./pages/eleves/eleve";
import EleveDetails from "./pages/eleves/EleveDetails";
import EleveForm from "./pages/eleves/EleveForm";

// ==================== ANNÉES ====================
import AnneesPage from "./pages/annees/annee";

// ==================== CLASSES ====================
import ClassesPage from "./pages/classes/ClassePage";
import ClasseDetails from "./pages/classes/ClasseDetails";
import ClasseForm from "./pages/classes/ClasseForm";

// ==================== SALLES ====================
import SallesPage from "./pages/salles/sallesPage";
import SalleDetails from "./pages/salles/sallesDetails";
import SalleForm from "./pages/salles/sallesForm";

// ==================== SESSIONS ====================
import SessionPage from "./pages/sessions/sessionPage";
import SessionDetails from "./pages/sessions/sessionDetail";
import SessionForm from "./pages/sessions/sessionForm";

// ==================== COURS ====================
import CoursPage from "./pages/cours/coursPage";
import CoursForm from "./pages/cours/coursForm";
import CoursDetail from "./pages/cours/coursDetails";

// ==================== ENSEIGNANTS ====================
import EnseignantPage from "./pages/enseignants/enseignantPage";
import EnseignantDetail from "./pages/enseignants/enseignantDetail";
import EnseignantForm from "./pages/enseignants/enseignantForm";

// ==================== FICHES ENSEIGNANT ====================
import FicheEnseignantPage from "./pages/fiches-enseignant/FicheEnseignantPage";
import FicheEnseignantForm from "./pages/fiches-enseignant/FicheEnseignantForm";

// ==================== INSCRIPTIONS ====================
import InscriptionPage from "./pages/inscriptions/inscriptionPage";
import InscriptionForm from "./pages/inscriptions/inscriptionForm";
import InscriptionDetail from "./pages/inscriptions/inscriptionDetail";

// ==================== NOTES ====================
import NotesHome from "./pages/notes/NotesHome";
import NotesForm from "./pages/notes/NotesSaisie";
import NotesClassement from "./pages/notes/NotesClassement";
import NotesBulletin from "./pages/notes/NotesBulletin";

// ==================== PAIEMENTS ====================
import PaiementDashboard from "./pages/paiements/PaiementDashboard";
import PaiementPage from "./pages/paiements/PaiementsPage";
import PaiementForm from "./pages/paiements/PaiementForm";
import PaiementSuivi from "./pages/paiements/PaiementSuivi";
import PaiementStats from "./pages/paiements/PaiementStats";
import PaiementParClasse from "./pages/paiements/PaiementParClasse";

// ==================== SCOLARITÉS ====================
import ScolariteForm from "./pages/scolarites/ScolariteForm";
import ScolariteDetail from "./pages/scolarites/ScolariteDetail";
import ScolaritePage from "./pages/scolarites/ScolaritePage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import UserForm from "./pages/admin/UserForm";
import UserDetail from "./pages/admin/UserDetail";
import MonProfil from "./pages/mon-profil/MonProfil";
import ParentDashboard from "./pages/parent/ParentDashboard";

import { getUser } from './service/auth';
import EnseignantDashboard from "./pages/enseignants/EnseignantDashboard";

// ─── Redirection intelligente selon rôle ───────────────────
function HomeRedirect() {
  const user = getUser();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'parent':     return <Navigate to="/dashboard-parent"     replace />;
    case 'enseignant': return <Navigate to="/dashboard-enseignant" replace />;
    case 'fondateur':  return <Navigate to="/finance"              replace />;
    case 'directeur':  return <Navigate to="/dashboard"            replace />;
    case 'admin':      return <Navigate to="/dashboard"            replace />;
    case 'root':       return <Navigate to="/dashboard"            replace />;
    default:           return <Navigate to="/login"                replace />;
  }
}

// ==================== RÔLES ====================
const ADMIN_ROLES = ["root", "admin", "directeur"];

const FINANCE_ROLES = [
  "root",
  "admin",
  "directeur",
  "fondateur",
];

const NOTES_ROLES = [
  "root",
  "admin",
  "directeur",
  "enseignant",
];

const ALL_ROLES = [
  "root",
  "admin",
  "directeur",
  "fondateur",
  "enseignant",
  "parent",
];

export default function App() {
  return (
    <Routes>

      {/* ==================== REDIRECTION ==================== */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* ==================== PUBLIC ==================== */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/non-autorise" element={<NonAutorise />} />

      {/* ==================== DASHBOARD ==================== */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={ALL_ROLES}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* ==================== ÉLÈVES ==================== */}
      <Route
        path="/eleves"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <ElevesList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/eleves/nouveau"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <EleveForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/eleves/:matricule"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <EleveDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/eleves/:matricule/modifier"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <EleveForm />
          </ProtectedRoute>
        }
      />

      {/* ==================== ANNÉES ==================== */}
      <Route
        path="/annees"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <AnneesPage />
          </ProtectedRoute>
        }
      />

      {/* ==================== CLASSES ==================== */}
      <Route
        path="/classes"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <ClassesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/classes/nouveau"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <ClasseForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/classes/:id"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <ClasseDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/classes/:id/modifier"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <ClasseForm />
          </ProtectedRoute>
        }
      />

      {/* ==================== SALLES ==================== */}
      <Route
        path="/salles"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <SallesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/salles/nouveau"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <SalleForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/salles/:id"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <SalleDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/salles/:id/modifier"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <SalleForm />
          </ProtectedRoute>
        }
      />

      {/* ==================== SESSIONS ==================== */}
      <Route
        path="/sessions"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <SessionPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sessions/nouveau"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <SessionForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sessions/:id"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <SessionDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sessions/:id/modifier"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <SessionForm />
          </ProtectedRoute>
        }
      />

      {/* ==================== COURS ==================== */}
      <Route
        path="/cours"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <CoursPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cours/nouveau"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <CoursForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cours/:id"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <CoursDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cours/:id/modifier"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <CoursForm />
          </ProtectedRoute>
        }
      />

      {/* ==================== ENSEIGNANTS ==================== */}
      <Route
        path="/enseignants"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <EnseignantPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/enseignants/nouveau"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <EnseignantForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/enseignants/:idEnseignant"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <EnseignantDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/enseignants/:idEnseignant/modifier"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <EnseignantForm />
          </ProtectedRoute>
        }
      />

      {/* ==================== FICHES ENSEIGNANT ==================== */}
      <Route
        path="/enseignants/:idEnseignant/fiches"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <FicheEnseignantPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/enseignants/:idEnseignant/fiches/nouveau"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <FicheEnseignantForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/enseignants/:idEnseignant/fiches/:idRap/modifier"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <FicheEnseignantForm />
          </ProtectedRoute>
        }
      />

      {/* ==================== INSCRIPTIONS ==================== */}
      <Route
        path="/inscriptions"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <InscriptionPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/inscriptions/ajouter"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <InscriptionForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/inscriptions/:id"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <InscriptionDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/inscriptions/:id/modifier"
        element={
          <ProtectedRoute roles={ADMIN_ROLES}>
            <InscriptionForm />
          </ProtectedRoute>
        }
      />

      {/* ==================== NOTES ==================== */}
      <Route
        path="/notes"
        element={
          <ProtectedRoute roles={[...NOTES_ROLES, "parent"]}>
            <NotesHome />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notes/saisie"
        element={
          <ProtectedRoute roles={NOTES_ROLES}>
            <NotesForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notes/classement"
        element={
          <ProtectedRoute roles={NOTES_ROLES}>
            <NotesClassement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notes/bulletin"
        element={
          <ProtectedRoute roles={[...NOTES_ROLES, "parent"]}>
            <NotesBulletin />
          </ProtectedRoute>
        }
      />

      {/* ==================== FINANCE ==================== */}
      <Route
        path="/finance"
        element={
          <ProtectedRoute roles={FINANCE_ROLES}>
            <PaiementDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/paiements"
        element={
          <ProtectedRoute roles={FINANCE_ROLES}>
            <PaiementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/paiements/nouveau"
        element={
          <ProtectedRoute roles={FINANCE_ROLES}>
            <PaiementForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/paiements/suivi"
        element={
          <ProtectedRoute roles={FINANCE_ROLES}>
            <PaiementSuivi />
          </ProtectedRoute>
        }
      />

      <Route
        path="/paiements/:id/modifier"
        element={
          <ProtectedRoute roles={FINANCE_ROLES}>
            <PaiementForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/paiements/stats"
        element={
          <ProtectedRoute roles={FINANCE_ROLES}>
            <PaiementStats />
          </ProtectedRoute>
        }
      />

      <Route
        path="/paiements/par-classe"
        element={
          <ProtectedRoute roles={FINANCE_ROLES}>
            <PaiementParClasse />
          </ProtectedRoute>
        }
      />

      {/* ==================== SCOLARITÉS ==================== */}
      <Route
        path="/scolarites"
        element={
          <ProtectedRoute roles={FINANCE_ROLES}>
            <ScolaritePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/scolarites/ajouter"
        element={
          <ProtectedRoute roles={FINANCE_ROLES}>
            <ScolariteForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/scolarites/:id"
        element={
          <ProtectedRoute roles={FINANCE_ROLES}>
            <ScolariteDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/scolarites/:id/modifier"
        element={
          <ProtectedRoute roles={FINANCE_ROLES}>
            <ScolariteForm />
          </ProtectedRoute>
        }
      />

      {/* ==================== 404 ==================== */}
      <Route
        path="*"
        element={
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-300">404</h1>
              <p className="text-xl text-gray-500 mt-4">
                Page non trouvée
              </p>

              <Link
                to="/dashboard"
                className="text-blue-600 underline mt-6 inline-block"
              >
                Retour au tableau de bord
              </Link>
            </div>
          </div>
        }
      />
     {/* ==================== GESTION UTILISATEURS (Root + Admin) ==================== */}
<Route
  path="/admin/utilisateurs"
  element={
    <ProtectedRoute roles={['root', 'admin']}>
      <UserManagementPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/utilisateurs/nouveau"
  element={
    <ProtectedRoute roles={['root', 'admin']}>
      <UserForm />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/utilisateurs/:id/modifier"
  element={
    <ProtectedRoute roles={['root', 'admin']}>
      <UserForm />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/utilisateurs/:id"
  element={
    <ProtectedRoute roles={['root', 'admin']}>
      <UserDetail />
    </ProtectedRoute>
  }
/>
<Route
  path="/mon-profil"
  element={
    <ProtectedRoute>
      <MonProfil />
    </ProtectedRoute>
  }
/>

{/* ─── Redirection racine selon rôle ─── */}
<Route path="/" element={<HomeRedirect />} />

{/* Dashboard admin/directeur/root/fondateur */}
<Route
  path="/dashboard"
  element={
    <ProtectedRoute roles={['root', 'admin', 'directeur', 'fondateur']}>
      <Dashboard />
    </ProtectedRoute>
  }
/>

{/* Dashboard enseignant */}
<Route
  path="/dashboard-enseignant"
  element={
    <ProtectedRoute roles={['enseignant']}>
      <EnseignantDashboard />
    </ProtectedRoute>
  }
/>

{/* Dashboard parent */}
<Route
  path="/dashboard-parent"
  element={
    <ProtectedRoute roles={['parent']}>
      <ParentDashboard />
    </ProtectedRoute>
  }
/>
    </Routes>
  );
}