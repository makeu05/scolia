// ─────────────────────────────────────────────────────────────
// SIDEBAR SGS
// ─────────────────────────────────────────────────────────────

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
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    section: "principal",
    path: "/dashboard",
  },
  {
    id: "eleves",
    label: "Élèves",
    icon: Users,
    section: "gestion",
    path: "/eleves",
  },
  {
    id: "enseignants",
    label: "Enseignants",
    icon: Users,
    section: "gestion",
    path: "/enseignants",
  },
  {
    id: "structure",
    label: "Structure pédagogique",
    icon: BookOpen,
    section: "gestion",
    path: "/cours",
  },
  {
    id: "inscriptions",
    label: "Inscriptions",
    icon: BookOpen,
    section: "gestion",
    path: "/inscriptions",
  },
  {
    id: "notes",
    label: "Notes & Évaluations",
    icon: ClipboardList,
    section: "gestion",
    path: "/notes",
  },
  {
    id: "annees",
    label: "Années académiques",
    icon: GraduationCap,
    section: "gestion",
    path: "/annees",
  },
  {
    id: "classes",
    label: "Classes et cycles",
    icon: GraduationCap,
    section: "gestion",
    path: "/classes",
  },
  {
    id: "salles",
    label: "Salles de classe",
    icon: GraduationCap,
    section: "gestion",
    path: "/salles",
  },
  {
    id: "emploi",
    label: "Emploi du temps",
    icon: Calendar,
    section: "gestion",
    path: "/emploi-du-temps",
  },
  {
    id: "finance",
    label: "Finance",
    icon: CreditCard,
    section: "gestion",
    path: "/finance",
  },
  {
    id: "communication",
    label: "Communication",
    icon: MessageSquare,
    section: "outils",
    path: "/communication",
  },
  {
    id: "discipline",
    label: "Discipline",
    icon: AlertTriangle,
    section: "outils",
    path: "/discipline",
  },

    {
    id: "livres",
    label: "Livres",
    icon: Library,
    section: "outils",
    path: "/livres",
  },
  {
    id: "bibliotheque",
    label: "Bibliothèque",
    icon: Library,
    section: "outils",
    path: "/bibliotheque",
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

  const sections = ["principal", "gestion", "outils"];

  const sectionLabels: Record<string, string> = {
    principal: "Principal",
    gestion: "Gestion scolaire",
    outils: "Outils",
  };

  function getInitials(name?: string): string {
    if (!name) return "SG";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const userFullname = user?.name  ?? "Utilisateur";
  const userEmail    = user?.email ?? "email@example.com";
  const userRole     = user?.role  ?? "admin";

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
        className={`
          fixed top-0 left-0 h-full z-40 flex flex-col
          w-[250px] bg-white border-r border-gray-100
          transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:flex-shrink-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
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
                {NAV_ITEMS.filter(
                  (item) => item.section === section
                ).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNav(item.id);
                      if (item.path) navigate(item.path);
                      onClose();
                    }}
                    className={`
                      flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
                      transition-all duration-200 text-sm text-left
                      ${
                        activeNav === item.id
                          ? "bg-[#eaf0f8] text-[#1a3a5c] font-semibold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                  >
                    <item.icon
                      className={`h-4 w-4 flex-shrink-0 ${
                        activeNav === item.id
                          ? "text-[#1a3a5c]"
                          : "text-gray-400"
                      }`}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge && (
                      <span className="bg-red-100 text-red-600 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-100 relative">
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
                {userEmail}
              </p>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* Dropdown */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-xl border border-gray-100 shadow-xl z-20 overflow-hidden">
                <div className="px-3 py-2 border-b border-gray-50">
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wider">
                    {userRole}
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