import { AlertTriangle, Award, Bell, BookOpen, UserCheck, Users, Wallet } from "lucide-react";
import Sidebar from "./composants/sidebar";
import { useState } from "react";

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeNav={activeNav}
        onNav={setActiveNav}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Contenu Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b bg-white px-4 md:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                Tableau de bord
              </p>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">
                Vue générale
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Statistiques et activité en temps réel
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-600 focus:outline-none focus:border-[#1a3a5c]/30 shadow-sm">
                <option>Année scolaire 2025-2026</option>
              </select>

              <select className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-600 focus:outline-none focus:border-[#1a3a5c]/30 shadow-sm">
                <option>Tout le trimestre</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contenu Scrollable */}
        <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto w-full">
          
          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-50 p-3 rounded-xl">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  +12%
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">19</h2>
              <p className="text-sm text-gray-500 mt-1">Élèves</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-violet-50 p-3 rounded-xl">
                  <BookOpen className="h-5 w-5 text-violet-600" />
                </div>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  +4%
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">42</h2>
              <p className="text-sm text-gray-500 mt-1">Classes</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-emerald-50 p-3 rounded-xl">
                  <UserCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  +2%
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">68</h2>
              <p className="text-sm text-gray-500 mt-1">Enseignants</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-amber-50 p-3 rounded-xl">
                  <Wallet className="h-5 w-5 text-amber-600" />
                </div>
                <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                  -3%
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">8.4M</h2>
              <p className="text-sm text-gray-500 mt-1">Paiements (FCFA)</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-red-50 p-3 rounded-xl">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
                  7
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">7</h2>
              <p className="text-sm text-gray-500 mt-1">Alertes</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-cyan-50 p-3 rounded-xl">
                  <Award className="h-5 w-5 text-cyan-600" />
                </div>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  +18%
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">92%</h2>
              <p className="text-sm text-gray-500 mt-1">Taux de réussite</p>
            </div>
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Graphique principal */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    Évolution des statistiques
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Données provenant de l’API
                  </p>
                </div>
                <button className="text-xs text-[#1a3a5c] font-medium hover:underline">
                  Voir plus
                </button>
              </div>

              <div className="h-[340px] rounded-2xl border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm bg-gray-50">
                Graphique dynamique (Chart.js / Recharts / etc.)
              </div>
            </div>

            {/* Résumé global */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Résumé global</h2>
                <p className="text-xs text-gray-400 mt-1">Informations en temps réel</p>
              </div>

              <div className="space-y-5 mt-8 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Élèves actifs aujourd’hui</span>
                  <span className="font-semibold text-gray-900">1 189</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Paiements effectués ce mois</span>
                  <span className="font-semibold text-emerald-600">142</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Montant impayé</span>
                  <span className="font-semibold text-red-500">2.85M FCFA</span>
                </div>
              </div>

              <button className="mt-auto w-full py-3 rounded-xl bg-[#1a3a5c] hover:bg-[#16324f] text-white text-sm font-semibold transition-colors">
                Voir les détails
              </button>
            </div>
          </div>

          {/* Activité récente */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Activité récente</h2>
                <p className="text-xs text-gray-400 mt-1">Dernières actions enregistrées</p>
              </div>
              <button className="text-xs text-[#1a3a5c] font-medium hover:underline">
                Tout voir
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Bell className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    Paiement reçu - Jean Dupont (CM2A)
                  </p>
                  <p className="text-xs text-gray-400">Il y a 12 minutes</p>
                </div>
                <span className="text-xs text-emerald-600 font-medium">+75 000 FCFA</span>
              </div>

              {/* Tu pourras ajouter d'autres éléments ici via map plus tard */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;