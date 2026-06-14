// src/pages/composants/sidebar.tsx — SCOLIA Navigation groupée
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, BookOpen, ClipboardList,
  CreditCard, GraduationCap, LogOut, ChevronDown, ChevronRight,
  X, BarChart2, UserCircle, Building2, Calendar,
  Home, Shield, Clock, MessageSquare, FileText, User,
} from "lucide-react";
import Logo from "../../components/ui/Logo";
import { useAuth } from "../../service/auth";

/* ─── Types ──────────────────────────────────────────────── */
interface NavItem {
  id:    string;
  label: string;
  icon:  React.ElementType;
  path:  string;
  roles?: string[];
}

interface NavGroup {
  id:     string;
  label:  string;
  color:  string;
  items:  NavItem[];
}

/* ─── Navigation data ────────────────────────────────────── */
const NAV_GROUPS: NavGroup[] = [
  {
    id: "accueil",
    label: "Accueil",
    color: "#3b82f6",
    items: [
      { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, path: "/dashboard",
        roles: ["root","admin","directeur","fondateur","enseignant","parent"] },
    ],
  },
  {
    id: "academique",
    label: "Académique",
    color: "#8b5cf6",
    items: [
      { id: "eleves",       label: "Élèves",      icon: Users,        path: "/eleves",       roles: ["root","admin","directeur"] },
      { id: "enseignants",  label: "Enseignants",  icon: GraduationCap,path: "/enseignants",  roles: ["root","admin","directeur"] },
      { id: "classes",      label: "Classes",      icon: Building2,    path: "/classes",      roles: ["root","admin","directeur"] },
      { id: "sections",     label: "Sections",     icon: Building2,    path: "/sections",     roles: ["root","admin","directeur"] },
      { id: "cours",        label: "Cours",        icon: BookOpen,     path: "/cours",        roles: ["root","admin","directeur"] },
      { id: "inscriptions", label: "Inscriptions", icon: FileText,     path: "/inscriptions", roles: ["root","admin","directeur"] },
    ],
  },
  {
    id: "evaluations",
    label: "Évaluations",
    color: "#0ea5e9",
    items: [
      { id: "notes",    label: "Notes & Bulletins", icon: ClipboardList, path: "/notes",    roles: ["root","admin","directeur","enseignant","parent"] },
      { id: "epreuves", label: "Épreuves",          icon: FileText,      path: "/epreuves", roles: ["root","admin","directeur","enseignant"] },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    color: "#10b981",
    items: [
      { id: "finance",    label: "Paiements",    icon: CreditCard, path: "/finance",         roles: ["root","admin","directeur","fondateur"] },
      { id: "scolarites", label: "Scolarités",   icon: CreditCard, path: "/scolarites",      roles: ["root","admin","fondateur"] },
      { id: "stats",      label: "Statistiques", icon: BarChart2,  path: "/paiements/stats", roles: ["root","admin","directeur","fondateur"] },
    ],
  },
  {
    id: "vie-scolaire",
    label: "Vie scolaire",
    color: "#f59e0b",
    items: [
      { id: "emploi-du-temps", label: "Emploi du temps", icon: Clock,         path: "/emploi-du-temps", roles: ["root","admin","directeur","enseignant"] },
      { id: "discipline",      label: "Discipline",       icon: Shield,        path: "/discipline",      roles: ["root","admin","directeur","enseignant","parent"] },
      { id: "absences",        label: "Absences",         icon: User,          path: "/absences",        roles: ["root","admin","directeur","enseignant"] },
      { id: "bibliotheque",    label: "Bibliothèque",     icon: BookOpen,      path: "/bibliotheque",    roles: ["root","admin","directeur","enseignant","parent"] },
      { id: "communication",   label: "Communication",    icon: MessageSquare, path: "/communication",   roles: ["root","admin","directeur","fondateur"] },
    ],
  },
  {
    id: "administration",
    label: "Administration",
    color: "#ef4444",
    items: [
      { id: "annees",       label: "Années scolaires", icon: Calendar, path: "/annees",             roles: ["root","admin"] },
      { id: "salles",       label: "Salles",           icon: Home,     path: "/salles",             roles: ["root","admin","directeur"] },
      { id: "utilisateurs", label: "Utilisateurs",     icon: Users,    path: "/admin/utilisateurs", roles: ["root","admin"] },
    ],
  },
];

const ROLE_COLORS: Record<string, string> = {
  root:       "bg-red-100 text-red-700",
  admin:      "bg-blue-100 text-blue-700",
  directeur:  "bg-violet-100 text-violet-700",
  fondateur:  "bg-amber-100 text-amber-700",
  enseignant: "bg-emerald-100 text-emerald-700",
  parent:     "bg-pink-100 text-pink-700",
};

const ROLE_LABELS: Record<string, string> = {
  root: "Super Admin", admin: "Administrateur", fondateur: "Fondateur",
  directeur: "Directeur", enseignant: "Enseignant", parent: "Parent",
};

/* ─── Props ──────────────────────────────────────────────── */
interface SidebarProps {
  open:    boolean;
  onClose: () => void;
  activeNav?: string;
  onNav?:     (id: string) => void;
}

/* ─── Component ──────────────────────────────────────────── */
export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();

  const userRole     = user?.role ?? "";
  const userFullname = user?.name ?? "Utilisateur";

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const defaults: Record<string, boolean> = { accueil: true };
    NAV_GROUPS.forEach(g => {
      if (g.items.some(item => location.pathname.startsWith(item.path))) {
        defaults[g.id] = true;
      }
    });
    return defaults;
  });

  const toggleGroup = (id: string) =>
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  function getInitials(name: string) {
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  }

  function handleNav(path: string) {
    navigate(path);
    onClose();
  }

  const visibleGroups = NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => !item.roles || item.roles.includes(userRole)),
  })).filter(group => group.items.length > 0);

  const sidebarContent = (
    <>
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <Logo variant="full" theme="light" size="sm"/>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
          aria-label="Fermer le menu"
        >
          <X className="w-4 h-4"/>
        </button>
      </div>

      {/* ── Navigation ─────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 scrollbar-hide">
        {visibleGroups.map(group => {
          const groupOpen = openGroups[group.id] ?? false;
          const hasActive = group.items.some(item => isActive(item.path));

          return (
            <div key={group.id} className="mb-1">
              <button
                onClick={() => toggleGroup(group.id)}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2 rounded-xl
                  text-xs font-bold uppercase tracking-wide transition-all duration-150
                  ${hasActive
                    ? "text-slate-800 bg-slate-50"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }
                `}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: hasActive ? group.color : "#cbd5e1" }}
                />
                <span className="flex-1 text-left">{group.label}</span>
                {groupOpen
                  ? <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 opacity-50"/>
                  : <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 opacity-50"/>
                }
              </button>

              {groupOpen && (
                <div
                  className="ml-2.5 mt-0.5 space-y-0.5 border-l-2 pl-3"
                  style={{ borderColor: `${group.color}25` }}
                >
                  {group.items.map(item => {
                    const active = isActive(item.path);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNav(item.path)}
                        className={`
                          flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl
                          text-sm font-medium text-left transition-all duration-150
                          ${active
                            ? "shadow-sm"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }
                        `}
                        style={active ? {
                          background: `linear-gradient(135deg, #0f1f3d 0%, #1a3a5c 100%)`,
                          color: "white",
                          boxShadow: "0 2px 8px rgba(15,31,61,0.25)",
                        } : undefined}
                      >
                        <item.icon
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: active ? "white" : group.color }}
                        />
                        <span className="flex-1 truncate">{item.label}</span>
                        {active && (
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: group.color }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Footer ─────────────────────────────────────── */}
      <div className="p-3 border-t border-slate-100 space-y-1 flex-shrink-0">
        <button
          onClick={() => { navigate("/mon-profil"); onClose(); }}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          <UserCircle className="w-4 h-4 text-slate-400"/>
          <span>Mon profil</span>
        </button>

        <div className="bg-gradient-to-r from-slate-50 to-slate-50 rounded-2xl p-3 flex items-center gap-3"
          style={{ border: "1px solid rgba(15,31,61,0.06)" }}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #0f1f3d 0%, #1a3a5c 100%)" }}
          >
            {getInitials(userFullname)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate leading-tight">{userFullname}</p>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 inline-block ${ROLE_COLORS[userRole] ?? "bg-slate-100 text-slate-600"}`}>
              {ROLE_LABELS[userRole] ?? userRole}
            </span>
          </div>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4"/>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/*
        Outer aside:
        - Mobile: fixed overlay, translate-based show/hide
        - Desktop: relative (in flex flow), width-based show/hide (w-0 collapses it)
        Inner div: always w-[260px] so content never reflows during transition
      */}
      <aside
        className={`
          flex-shrink-0 flex flex-col overflow-hidden
          bg-white border-r border-slate-100
          transition-all duration-300 ease-in-out
          fixed top-0 left-0 h-full z-40
          lg:relative lg:z-auto lg:h-screen
          ${open
            ? "w-[260px] translate-x-0"
            : "-translate-x-full w-[260px] lg:translate-x-0 lg:w-0"
          }
        `}
        style={{ boxShadow: open ? "4px 0 24px rgba(15,31,61,0.08)" : "none" }}
      >
        {/* Fixed inner width — prevents content reflow during width animation */}
        <div className="w-[260px] flex flex-col h-full">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
}
