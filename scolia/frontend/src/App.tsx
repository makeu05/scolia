import { Routes, Route, Navigate } from "react-router-dom";

// Pages Auth
import Login    from "./pages/Login";
import Register from "./pages/register";

// Pages Principales
import Dashboard from "./pages/Dashboard";

// Élèves
import ElevesList   from "./pages/eleves/eleve";
import EleveDetails from "./pages/eleves/EleveDetails";
import EleveForm    from "./pages/eleves/EleveForm";

// Années
import AnneesPage from "./pages/annees/annee";

// Classes
import ClassesPage   from "./pages/classes/ClassePage";
import ClasseDetails from "./pages/classes/ClasseDetails";
import ClasseForm    from "./pages/classes/ClasseForm";

// Salles
import SallesPage   from "./pages/salles/sallesPage";
import SalleDetails from "./pages/salles/sallesDetails";
import SalleForm    from "./pages/salles/sallesForm";

// Sessions
import SessionPage    from "./pages/sessions/sessionPage";
import SessionDetails from "./pages/sessions/sessionDetail";
import SessionForm    from "./pages/sessions/sessionForm";

// Cours
import CoursPage   from "./pages/cours/coursPage";
import CoursForm   from "./pages/cours/coursForm";
import CoursDetail from "./pages/cours/coursDetails";

// Enseignants
import EnseignantDetail from "./pages/enseignants/enseignantDetail";
import EnseignantForm   from "./pages/enseignants/enseignantForm";
import EnseignantPage   from "./pages/enseignants/enseignantPage";

// Inscriptions
import InscriptionPage   from "./pages/inscriptions/inscriptionPage";
import InscriptionForm   from "./pages/inscriptions/inscriptionForm";
import InscriptionDetail from "./pages/inscriptions/inscriptionDetail";

// ── Modules BAALAWE LIONEL / MAGUENA ALLAN ──────────────────
import BibliothequeList from "./pages/bibliotheque/bibliotheque";
import LivreForm        from "./pages/bibliotheque/LivreForm";
import DisciplinePage   from "./pages/discipline/disciplinePage";
import DisciplineForm   from "./pages/discipline/DisciplineForm";
import EmploiDuTempsPage from "./pages/emploi-du-temps/emploiPage";
import CommunicationPage from "./pages/communication/communicationPage";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token");
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => children;

export default function App() {
  return (
    <Routes>
      {/* Redirection racine */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Routes Publiques */}
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      {/* ── Élèves ── */}
      <Route path="/eleves"                    element={<ProtectedRoute><ElevesList /></ProtectedRoute>} />
      <Route path="/eleves/nouveau"            element={<ProtectedRoute><EleveForm /></ProtectedRoute>} />
      <Route path="/eleves/:matricule"         element={<ProtectedRoute><EleveDetails /></ProtectedRoute>} />
      <Route path="/eleves/:matricule/modifier" element={<ProtectedRoute><EleveForm /></ProtectedRoute>} />

      {/* ── Années ── */}
      <Route path="/annees" element={<ProtectedRoute><AnneesPage /></ProtectedRoute>} />

      {/* ── Classes ── */}
      <Route path="/classes"             element={<ProtectedRoute><ClassesPage /></ProtectedRoute>} />
      <Route path="/classes/nouveau"     element={<ProtectedRoute><ClasseForm /></ProtectedRoute>} />
      <Route path="/classes/:id"         element={<ProtectedRoute><ClasseDetails /></ProtectedRoute>} />
      <Route path="/classes/:id/modifier" element={<ProtectedRoute><ClasseForm /></ProtectedRoute>} />

      {/* ── Salles ── */}
      <Route path="/salles"             element={<ProtectedRoute><SallesPage /></ProtectedRoute>} />
      <Route path="/salles/nouveau"     element={<ProtectedRoute><SalleForm /></ProtectedRoute>} />
      <Route path="/salles/:id"         element={<ProtectedRoute><SalleDetails /></ProtectedRoute>} />
      <Route path="/salles/:id/modifier" element={<ProtectedRoute><SalleForm /></ProtectedRoute>} />

      {/* ── Sessions ── */}
      <Route path="/sessions"             element={<ProtectedRoute><SessionPage /></ProtectedRoute>} />
      <Route path="/sessions/nouveau"     element={<ProtectedRoute><SessionForm /></ProtectedRoute>} />
      <Route path="/sessions/:id"         element={<ProtectedRoute><SessionDetails /></ProtectedRoute>} />
      <Route path="/sessions/:id/modifier" element={<ProtectedRoute><SessionForm /></ProtectedRoute>} />

      {/* ── Cours ── */}
      <Route path="/cours"             element={<ProtectedRoute><CoursPage /></ProtectedRoute>} />
      <Route path="/cours/nouveau"     element={<ProtectedRoute><CoursForm /></ProtectedRoute>} />
      <Route path="/cours/:id"         element={<ProtectedRoute><CoursDetail /></ProtectedRoute>} />
      <Route path="/cours/:id/modifier" element={<ProtectedRoute><CoursForm /></ProtectedRoute>} />

      {/* ── Enseignants ── */}
      <Route path="/enseignants"             element={<ProtectedRoute><EnseignantPage /></ProtectedRoute>} />
      <Route path="/enseignants/nouveau"     element={<ProtectedRoute><EnseignantForm /></ProtectedRoute>} />
      <Route path="/enseignants/:id"         element={<ProtectedRoute><EnseignantDetail /></ProtectedRoute>} />
      <Route path="/enseignants/:id/modifier" element={<ProtectedRoute><EnseignantForm /></ProtectedRoute>} />

      {/* ── Inscriptions ── */}
      <Route path="/inscriptions"             element={<InscriptionPage />} />
      <Route path="/inscriptions/ajouter"     element={<InscriptionForm />} />
      <Route path="/inscriptions/:id"         element={<InscriptionDetail />} />
      <Route path="/inscriptions/:id/modifier" element={<InscriptionForm />} />

      {/* ══════════════════════════════════════════════════════
          MODULES BAALAWE LIONEL / MAGUENA ALLAN
      ══════════════════════════════════════════════════════ */}

      {/* ── Bibliothèque ── */}
      <Route path="/bibliotheque"             element={<ProtectedRoute><BibliothequeList /></ProtectedRoute>} />
      <Route path="/bibliotheque/nouveau"     element={<ProtectedRoute><LivreForm /></ProtectedRoute>} />
      <Route path="/bibliotheque/:id/modifier" element={<ProtectedRoute><LivreForm /></ProtectedRoute>} />

      {/* ── Discipline ── */}
      <Route path="/discipline"         element={<ProtectedRoute><DisciplinePage /></ProtectedRoute>} />
      <Route path="/discipline/nouveau" element={<ProtectedRoute><DisciplineForm /></ProtectedRoute>} />

      {/* ── Emploi du temps ── */}
      <Route path="/emploi-du-temps" element={<ProtectedRoute><EmploiDuTempsPage /></ProtectedRoute>} />

      {/* ── Communication ── */}
      <Route path="/communication" element={<ProtectedRoute><CommunicationPage /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
