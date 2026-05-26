// src/components/sidebar.tsx — SCOLIA SGS
// Design premium : même logique, finitions SaaS
// Ajoute cet import
import {
  LayoutDashboard, Users, BookOpen, ClipboardList,
  CreditCard, GraduationCap, LogOut, ChevronDown,
  X, BarChart2, UserCircle,
} from "lucide-react";

import Logo from "../../components/ui/Logo";
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

const ROLE_COLORS: Record<string, string> = {
  root:       "bg-red-50 text-red-700",
  admin:      "bg-blue-50 text-blue-700",
  directeur:  "bg-violet-50 text-violet-700",
  fondateur:  "bg-amber-50 text-amber-700",
  enseignant: "bg-emerald-50 text-emerald-700",
  parent:     "bg-pink-50 text-pink-700",
};

const Sidebar: React.FC<SidebarProps> = ({ activeNav, onNav, open, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const userRole     = user?.role ?? "";
  const userFullname = user?.name ?? "Utilisateur";

  const filtered = NAV_ITEMS.filter(item =>
    !item.roles || item.roles.includes(userRole)
  );

  function getInitials(name?: string): string {
    if (!name) return "SG";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  }

  const handleNav = (item: NavItem) => {
    onNav(item.id);
    if (item.path) navigate(item.path);
    onClose();
  };

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-40 flex flex-col
        w-[250px] bg-white border-r border-slate-100
        transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:relative
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}
        style={{ boxShadow: open ? "4px 0 24px rgba(15,31,61,0.07)" : "none" }}
      >

        {/* ── Logo ─────────────────────────────────────── */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
                <Logo variant="full" theme="light" size="sm" />
                <button
                  onClick={onClose}
                  className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

        {/* ── Navigation ───────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
          {["principal", "gestion"].map(section => {
            const items = filtered.filter(i => i.section === section);
            if (!items.length) return null;

            return (
              <div key={section}>
                <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  {section === "principal" ? "Principal" : "Gestion scolaire"}
                </p>
                <div className="space-y-0.5">
                  {items.map(item => {
                    const isActive = activeNav === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNav(item)}
                        className={`
                          flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl
                          text-sm font-medium text-left transition-all duration-150
                          ${isActive
                            ? "bg-[#0f1f3d] text-white"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }
                        `}
                      >
                        <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* ── Pied de page ─────────────────────────────── */}
        <div className="p-3 border-t border-slate-100 space-y-1">

          {/* Mon profil */}
          <button
            onClick={() => { navigate("/mon-profil"); onClose(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-150"
          >
            <UserCircle className="w-4 h-4 text-slate-400" />
            <span>Mon profil</span>
          </button>

          {/* Utilisateur */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(v => !v)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-all duration-150"
            >
              <div className="w-8 h-8 rounded-xl bg-[#0f1f3d] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {getInitials(userFullname)}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-semibold text-slate-900 truncate leading-tight">{userFullname}</p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{user?.username}</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl border border-slate-100 shadow-xl z-20 overflow-hidden"
                  style={{ boxShadow: "0 8px 32px rgba(15,31,61,0.12)" }}>
                  <div className="px-4 py-3 border-b border-slate-50">
                    <p className="text-xs text-slate-500 mb-1">Connecté en tant que</p>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[userRole] ?? "bg-slate-100 text-slate-600"}`}>
                      {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    </span>
                  </div>
                  <button
                    onClick={() => { logout(); navigate("/login"); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;