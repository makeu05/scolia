import { Routes, Route, Navigate, Link } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

import EmploiDuTempsPage  from "./pages/emploi-du-temps/EmploiDuTempsPage";
import BibliothequePage   from "./pages/bibliotheque/BibliothequePage";
import CommunicationPage  from "./pages/communication/CommunicationPage";

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
import EnseignantDashboard from "./pages/enseignants/EnseignantDashboard";

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

// ==================== ADMIN & PROFIL ====================
import UserManagementPage from "./pages/admin/UserManagementPage";
import UserForm from "./pages/admin/UserForm";
import UserDetail from "./pages/admin/UserDetail";
import MonProfil from "./pages/mon-profil/MonProfil";
import ParentDashboard from "./pages/parent/ParentDashboard";

import { getUser } from './service/auth';


// ─── Redirection intelligente selon rôle ─────────────────────
function HomeRedirect() {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case "parent":     return <Navigate to="/dashboard-parent"     replace />;
    case "enseignant": return <Navigate to="/dashboard-enseignant" replace />;
    case "fondateur":  return <Navigate to="/finance"              replace />;
    default:           return <Navigate to="/dashboard"            replace />;
  }
}

// ─── Rôles ───────────────────────────────────────────────────
const ADMIN_ROLES   = ["root", "admin", "directeur"];
const FINANCE_ROLES = ["root", "admin", "directeur", "fondateur"];
const NOTES_ROLES   = ["root", "admin", "directeur", "enseignant"];
const ALL_ROLES     = ["root", "admin", "directeur", "fondateur", "enseignant", "parent"];

// ─── Wrapper page protégée avec layout ───────────────────────
function Page({ roles, children }: { roles?: string[]; children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={roles}>
      <AppLayout>
        {children}
      </AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>

      {/* ── PUBLIC ──────────────────────────────────────── */}
      <Route path="/login"        element={<Login />} />
      <Route path="/register"     element={<Register />} />
      <Route path="/non-autorise" element={<NonAutorise />} />
      <Route path="/"             element={<HomeRedirect />} />

      {/* ── DASHBOARD ───────────────────────────────────── */}
      <Route path="/dashboard"            element={<Page roles={ALL_ROLES}><Dashboard /></Page>} />
      <Route path="/dashboard-enseignant" element={<Page roles={["enseignant"]}><EnseignantDashboard /></Page>} />
      <Route path="/dashboard-parent"     element={<Page roles={["parent"]}><ParentDashboard /></Page>} />

      {/* ── ÉLÈVES ──────────────────────────────────────── */}
      <Route path="/eleves"                    element={<Page roles={ADMIN_ROLES}><ElevesList /></Page>} />
      <Route path="/eleves/nouveau"            element={<Page roles={ADMIN_ROLES}><EleveForm /></Page>} />
      <Route path="/eleves/:matricule"         element={<Page roles={ADMIN_ROLES}><EleveDetails /></Page>} />
      <Route path="/eleves/:matricule/modifier" element={<Page roles={ADMIN_ROLES}><EleveForm /></Page>} />

      {/* ── ANNÉES ──────────────────────────────────────── */}
      <Route path="/annees" element={<Page roles={ADMIN_ROLES}><AnneesPage /></Page>} />

      {/* ── CLASSES ─────────────────────────────────────── */}
      <Route path="/classes"           element={<Page roles={ADMIN_ROLES}><ClassesPage /></Page>} />
      <Route path="/classes/nouveau"   element={<Page roles={ADMIN_ROLES}><ClasseForm /></Page>} />
      <Route path="/classes/:id"       element={<Page roles={ADMIN_ROLES}><ClasseDetails /></Page>} />
      <Route path="/classes/:id/modifier" element={<Page roles={ADMIN_ROLES}><ClasseForm /></Page>} />

      {/* ── SALLES ──────────────────────────────────────── */}
      <Route path="/salles"           element={<Page roles={ADMIN_ROLES}><SallesPage /></Page>} />
      <Route path="/salles/nouveau"   element={<Page roles={ADMIN_ROLES}><SalleForm /></Page>} />
      <Route path="/salles/:id"       element={<Page roles={ADMIN_ROLES}><SalleDetails /></Page>} />
      <Route path="/salles/:id/modifier" element={<Page roles={ADMIN_ROLES}><SalleForm /></Page>} />

      {/* ── SESSIONS ────────────────────────────────────── */}
      <Route path="/sessions"           element={<Page roles={ADMIN_ROLES}><SessionPage /></Page>} />
      <Route path="/sessions/nouveau"   element={<Page roles={ADMIN_ROLES}><SessionForm /></Page>} />
      <Route path="/sessions/:id"       element={<Page roles={ADMIN_ROLES}><SessionDetails /></Page>} />
      <Route path="/sessions/:id/modifier" element={<Page roles={ADMIN_ROLES}><SessionForm /></Page>} />

      {/* ── COURS ───────────────────────────────────────── */}
      <Route path="/cours"           element={<Page roles={ADMIN_ROLES}><CoursPage /></Page>} />
      <Route path="/cours/nouveau"   element={<Page roles={ADMIN_ROLES}><CoursForm /></Page>} />
      <Route path="/cours/:idCours"  element={<Page roles={ADMIN_ROLES}><CoursDetail /></Page>} />
      <Route path="/cours/:idCours/modifier" element={<Page roles={ADMIN_ROLES}><CoursForm /></Page>} />

      {/* ── ENSEIGNANTS ─────────────────────────────────── */}
      <Route path="/enseignants"           element={<Page roles={ADMIN_ROLES}><EnseignantPage /></Page>} />
      <Route path="/enseignants/nouveau"   element={<Page roles={ADMIN_ROLES}><EnseignantForm /></Page>} />
      <Route path="/enseignants/:idEnseignant" element={<Page roles={ADMIN_ROLES}><EnseignantDetail /></Page>} />
      <Route path="/enseignants/:id/modifier"  element={<Page roles={ADMIN_ROLES}><EnseignantForm /></Page>} />

      {/* ── FICHES ENSEIGNANT ───────────────────────────── */}
      <Route path="/enseignants/:idEnseignant/fiches"             element={<Page roles={ADMIN_ROLES}><FicheEnseignantPage /></Page>} />
      <Route path="/enseignants/:idEnseignant/fiches/nouveau"     element={<Page roles={ADMIN_ROLES}><FicheEnseignantForm /></Page>} />
      <Route path="/enseignants/:idEnseignant/fiches/:idRap/modifier" element={<Page roles={ADMIN_ROLES}><FicheEnseignantForm /></Page>} />

      {/* ── INSCRIPTIONS ────────────────────────────────── */}
      <Route path="/inscriptions"           element={<Page roles={ADMIN_ROLES}><InscriptionPage /></Page>} />
      <Route path="/inscriptions/ajouter"   element={<Page roles={ADMIN_ROLES}><InscriptionForm /></Page>} />
      <Route path="/inscriptions/:id"       element={<Page roles={ADMIN_ROLES}><InscriptionDetail /></Page>} />
      <Route path="/inscriptions/:id/modifier" element={<Page roles={ADMIN_ROLES}><InscriptionForm /></Page>} />

      {/* ── NOTES ───────────────────────────────────────── */}
      <Route path="/notes"           element={<Page roles={[...NOTES_ROLES,"parent"]}><NotesHome /></Page>} />
      <Route path="/notes/saisie"    element={<Page roles={NOTES_ROLES}><NotesForm /></Page>} />
      <Route path="/notes/classement" element={<Page roles={NOTES_ROLES}><NotesClassement /></Page>} />
      <Route path="/notes/bulletin"  element={<Page roles={[...NOTES_ROLES,"parent"]}><NotesBulletin /></Page>} />

      {/* ── FINANCE ─────────────────────────────────────── */}
      <Route path="/finance"                element={<Page roles={FINANCE_ROLES}><PaiementDashboard /></Page>} />
      <Route path="/paiements"              element={<Page roles={FINANCE_ROLES}><PaiementPage /></Page>} />
      <Route path="/paiements/nouveau"      element={<Page roles={FINANCE_ROLES}><PaiementForm /></Page>} />
      <Route path="/paiements/suivi"        element={<Page roles={FINANCE_ROLES}><PaiementSuivi /></Page>} />
      <Route path="/paiements/stats"        element={<Page roles={FINANCE_ROLES}><PaiementStats /></Page>} />
      <Route path="/paiements/par-classe"   element={<Page roles={FINANCE_ROLES}><PaiementParClasse /></Page>} />
      <Route path="/paiements/:id/modifier" element={<Page roles={FINANCE_ROLES}><PaiementForm /></Page>} />

      {/* ── SCOLARITÉS ──────────────────────────────────── */}
      <Route path="/scolarites"           element={<Page roles={FINANCE_ROLES}><ScolaritePage /></Page>} />
      <Route path="/scolarites/ajouter"   element={<Page roles={FINANCE_ROLES}><ScolariteForm /></Page>} />
      <Route path="/scolarites/:id"       element={<Page roles={FINANCE_ROLES}><ScolariteDetail /></Page>} />
      <Route path="/scolarites/:id/modifier" element={<Page roles={FINANCE_ROLES}><ScolariteForm /></Page>} />

      {/* ── ADMIN ───────────────────────────────────────── */}
      <Route path="/admin/utilisateurs"           element={<Page roles={["root","admin"]}><UserManagementPage /></Page>} />
      <Route path="/admin/utilisateurs/nouveau"   element={<Page roles={["root","admin"]}><UserForm /></Page>} />
      <Route path="/admin/utilisateurs/:id"       element={<Page roles={["root","admin"]}><UserDetail /></Page>} />
      <Route path="/admin/utilisateurs/:id/modifier" element={<Page roles={["root","admin"]}><UserForm /></Page>} />

      <Route path="/emploi-du-temps" element={<Page><EmploiDuTempsPage /></Page>} />
      <Route path="/bibliotheque"    element={<Page><BibliothequePage /></Page>} />
      <Route path="/communication"   element={<Page><CommunicationPage /></Page>} />
      <Route path="/paiements/:id" element={<Page><PaiementPage /></Page>} />

      {/* ── PROFIL ──────────────────────────────────────── */}
      <Route path="/mon-profil" element={<Page><MonProfil /></Page>} />

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