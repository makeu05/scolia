// src/components/Sidebar.tsx
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  Calendar,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  Library,
  GraduationCap,
  LogOut,
  ChevronDown,
  X,
  BarChart2,
  UserCircle,
} from "lucide-react";

import { useState } from "react";
import { useAuth } from "../../service/auth";
import { useNavigate } from "react-router-dom";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  section?: string;
  path?: string;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    section: "principal",
    path: "/dashboard",
    roles: ["root", "admin", "directeur", "fondateur", "enseignant", "parent"],
  },
  {
    id: "eleves",
    label: "Élèves",
    icon: Users,
    section: "gestion",
    path: "/eleves",
    roles: ["root", "admin", "directeur"],
  },
  {
    id: "enseignants",
    label: "Enseignants",
    icon: Users,
    section: "gestion",
    path: "/enseignants",
    roles: ["root", "admin", "directeur"],
  },
  {
    id: "structure",
    label: "Structure pédagogique",
    icon: BookOpen,
    section: "gestion",
    path: "/cours",
    roles: ["root", "admin", "directeur"],
  },
  {
    id: "inscriptions",
    label: "Inscriptions",
    icon: BookOpen,
    section: "gestion",
    path: "/inscriptions",
    roles: ["root", "admin", "directeur"],
  },
  {
    id: "notes",
    label: "Notes & Évaluations",
    icon: ClipboardList,
    section: "gestion",
    path: "/notes",
    roles: ["root", "admin", "directeur", "enseignant", "parent"],
  },
  {
    id: "annees",
    label: "Années académiques",
    icon: GraduationCap,
    section: "gestion",
    path: "/annees",
    roles: ["root", "admin"],
  },
  {
    id: "classes",
    label: "Classes et cycles",
    icon: GraduationCap,
    section: "gestion",
    path: "/classes",
    roles: ["root", "admin", "directeur"],
  },
  {
    id: "salles",
    label: "Salles de classe",
    icon: GraduationCap,
    section: "gestion",
    path: "/salles",
    roles: ["root", "admin", "directeur"],
  },
  {
    id: "scolarites",
    label: "Scolarités",
    icon: CreditCard,
    section: "gestion",
    path: "/scolarites",
    roles: ["root", "admin", "fondateur"],
  },
  {
    id: "finance",
    label: "Finances",
    icon: CreditCard,
    section: "gestion",
    path: "/finance",
    roles: ["root", "admin", "directeur", "fondateur"],
  },
  {
    id: "paiements-stats",
    label: "Statistiques Paiements",
    icon: BarChart2,
    section: "gestion",
    path: "/paiements/stats",
    roles: ["root", "admin", "directeur", "fondateur"],
  },
];

interface SidebarProps {
  activeNav: string;
  onNav: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onNav,
  open,
  onClose,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const sections = ["principal", "gestion"];
  const sectionLabels: Record<string, string> = {
    principal: "Principal",
    gestion: "Gestion scolaire",
  };

  const userRole = user?.role ?? "";
  const userFullname = user?.name ?? "Utilisateur";

  // Filtrage selon le rôle de l'utilisateur
  const NAV_ITEMS_FILTERED = NAV_ITEMS.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(userRole);
  });

  function getInitials(name?: string): string {
    if (!name) return "SG";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const goToProfile = () => {
    navigate("/mon-profil");
    onClose();
  };

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-40 flex flex-col w-[250px] bg-white border-r border-gray-100 transition-transform duration-300 lg:relative lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#1a3a5c] flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">SGS</p>
              <p className="text-[10px] text-gray-400">Gestion scolaire</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {sections.map((section) => (
            <div key={section} className="mb-5">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                {sectionLabels[section]}
              </p>

              <div className="mt-2 space-y-1">
                {NAV_ITEMS_FILTERED.filter((item) => item.section === section).map(
                  (item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNav(item.id);
                        if (item.path) navigate(item.path);
                        onClose();
                      }}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200 text-sm text-left ${
                        activeNav === item.id
                          ? "bg-[#eaf0f8] text-[#1a3a5c] font-semibold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <item.icon
                        className={`h-4 w-4 flex-shrink-0 ${
                          activeNav === item.id ? "text-[#1a3a5c]" : "text-gray-400"
                        }`}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </nav>

        {/* ===================== MON PROFIL ===================== */}
        <div className="p-3 border-t border-gray-100">
          {/* Bouton Mon Profil */}
          <button
            onClick={goToProfile}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 text-gray-700 hover:text-[#1a3a5c] transition mb-3"
          >
            <UserCircle className="h-5 w-5" />
            <span className="font-medium">Mon Profil</span>
          </button>

          {/* Informations utilisateur + Dropdown */}
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition"
          >
            <div className="h-9 w-9 rounded-full bg-[#1a3a5c] flex items-center justify-center text-white text-xs font-bold uppercase">
              {getInitials(userFullname)}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">
                {userFullname}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {user?.username}
              </p>
            </div>

            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-xl border border-gray-100 shadow-xl z-20 overflow-hidden">
                <div className="px-3 py-2 border-b border-gray-50">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wider">
                    {userRole.toUpperCase()}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;