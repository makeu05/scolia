import { Routes, Route, Navigate, Link } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

// Pages Auth
import Login from "./pages/Login";
import Register from "./pages/register";
import NonAutorise from "./pages/NonAutorise";

// ==================== DASHBOARD ====================
import Dashboard from "./pages/Dashboard";

// Pages Élèves
import ElevesList from "./pages/eleves/eleve";
import EleveDetails from "./pages/eleves/EleveDetails";
import EleveForm from "./pages/eleves/EleveForm";
import AnneesPage from "./pages/annees/annee";
import ClassesPage from "./pages/classes/ClassePage";
import ClasseDetails from "./pages/classes/ClasseDetails";
import ClasseForm from "./pages/classes/ClasseForm";
import SallesPage from "./pages/salles/sallesPage";
import SalleDetails from "./pages/salles/sallesDetails";
import SalleForm from "./pages/salles/sallesForm";
import SessionPage from "./pages/sessions/sessionPage";
import SessionDetails from "./pages/sessions/sessionDetail";
import SessionForm from "./pages/sessions/sessionForm";
import CoursPage from "./pages/cours/coursPage";
import CoursForm from "./pages/cours/coursForm";
import CoursDetail from "./pages/cours/coursDetails";
import EnseignantDetail from "./pages/enseignants/enseignantDetail";
import EnseignantForm from "./pages/enseignants/enseignantForm";
import EnseignantPage from "./pages/enseignants/enseignantPage";
import InscriptionPage from "./pages/inscriptions/inscriptionPage";
import InscriptionForm from "./pages/inscriptions/inscriptionForm";
import InscriptionDetail from "./pages/inscriptions/inscriptionDetail";

const PublicRoute = ({ children }: { children: React.ReactNode }) => children;

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // TODO: Ajouter une vraie vérification d'authentification ici plus tard
  const isAuthenticated = true; // Remplace par ta logique réelle (token, context, etc.)
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Routes>
      {/* Redirection racine */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Routes Publiques */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Routes Protégées */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      {/* ==================== SECTION ÉLÈVES ==================== */}
      <Route path="/eleves" element={
        <ProtectedRoute>
          <ElevesList />
        </ProtectedRoute>
      } />

      <Route path="/eleves/nouveau" element={
        <ProtectedRoute>
          <EleveForm />
        </ProtectedRoute>
      } />

      <Route path="/eleves/:matricule" element={
        <ProtectedRoute>
          <EleveDetails />
        </ProtectedRoute>
      } />

      <Route path="/eleves/:matricule/modifier" element={
        <ProtectedRoute>
          <EleveForm />
        </ProtectedRoute>
      } />

      <Route path="/annees" element={
        <ProtectedRoute>
          <AnneesPage />
        </ProtectedRoute>
      } />

      <Route path="/classes" element={
        <ProtectedRoute>
          <ClassesPage />
        </ProtectedRoute>
      } />

      <Route path="/classes/:id" element={
        <ProtectedRoute>
          <ClasseDetails />
        </ProtectedRoute>
      } />
      <Route path="/classes/nouveau" element={
        <ProtectedRoute>
          <ClasseForm />
        </ProtectedRoute>
      } />
      <Route path="/classes/:id/modifier" element={
        <ProtectedRoute>
          <ClasseForm />
        </ProtectedRoute>
      } />
      <Route path="/salles" element={
        <ProtectedRoute>
          <SallesPage />
        </ProtectedRoute>
      } />

     <Route path="/salles/nouveau" element={
        <ProtectedRoute>
          <SalleForm />
        </ProtectedRoute>
      } />
      <Route path="/salles/:id" element={
        <ProtectedRoute>
          <SalleDetails />
        </ProtectedRoute>
      } />
      <Route path="/salles/:id/modifier" element={
        <ProtectedRoute>
          <SalleForm />
        </ProtectedRoute>
      } />
      <Route path="/sessions" element={
        <ProtectedRoute>
          <SessionPage />
        </ProtectedRoute>
      } />

     <Route path="/sessions/nouveau" element={
        <ProtectedRoute>
          <SessionForm />
        </ProtectedRoute>
      } />
      <Route path="/sessions/:id/modifier" element={
        <ProtectedRoute>
          <SessionForm />
         </ProtectedRoute>
      } />
      <Route path="/sessions/:id" element={
        <ProtectedRoute>
          <SessionDetails />
        </ProtectedRoute>
      } />

      <Route path="/cours" element={
        <ProtectedRoute>
          <CoursPage />
        </ProtectedRoute>
      } />

     <Route path="/cours/nouveau" element={
        <ProtectedRoute>
          <CoursForm />
        </ProtectedRoute>
      } />
      <Route path="/cours/:id/modifier" element={
        <ProtectedRoute>
          <CoursForm />
         </ProtectedRoute>
      } />
      <Route path="/cours/:id" element={
        <ProtectedRoute>
          <CoursDetail />
        </ProtectedRoute>
      } />
      <Route path="/enseignants" element={
        <ProtectedRoute>
          <EnseignantPage />
        </ProtectedRoute>
      } />

     <Route path="/enseignants/nouveau" element={
        <ProtectedRoute>
          <EnseignantForm />
        </ProtectedRoute>
      } />
      <Route path="/enseignants/:id/modifier" element={
        <ProtectedRoute>
          <EnseignantForm />
         </ProtectedRoute>
      } />
      <Route path="/enseignants/:id" element={
        <ProtectedRoute>
          <EnseignantDetail />
        </ProtectedRoute>
      } />

      <Route path="/inscriptions"                    element={<InscriptionPage />} />
<Route path="/inscriptions/ajouter"            element={<InscriptionForm />} />
<Route path="/inscriptions/:id"                element={<InscriptionDetail />} />
<Route path="/inscriptions/:id/modifier"       element={<InscriptionForm />} />

    </Routes>
  );
}
