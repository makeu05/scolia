import { Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Register from "./pages/register"
import ElevesPage from "./pages/eleves/eleve"


const PublicRoute = ({ children }: { children: React.ReactNode }) => children
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => children

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/eleves" element={
        <ProtectedRoute>
          <ElevesPage />
        </ProtectedRoute>
      } />
    </Routes>
  )
}