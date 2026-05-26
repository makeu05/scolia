// src/components/layout/TopNav.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, BookOpen, ClipboardList,
  CreditCard, GraduationCap, BarChart2,
  Bell, ChevronDown, LogOut, UserCircle, Settings,
  Building2, Calendar, Home, Shield,
} from "lucide-react";
import { useAuth } from "../../service/auth";

// Logo SVG inline
function ScoliaLogo() {
  const i = 32;
  const left = i * 0.22, right = i * 0.72;
  const y1 = i * 0.28, y2 = i * 0.50, y3 = i * 0.72;
  const sw = Math.max(2, i * 0.075);
  const ds = Math.max(3, i * 0.11);
  const dx = right - ds / 2, dy = i * 0.13;
  return (
    <svg width={i} height={i} viewBox={`0 0 ${i} ${i}`} fill="none">
      <rect width={i} height={i} rx={i * 0.22} fill="#0f1f3d" />
      <path
        d={`M${right} ${y1} C${right} ${y1} ${left} ${y1-i*.02} ${left} ${y2} C${left} ${y2+i*.14} ${right} ${y2-i*.02} ${right} ${y3} C${right} ${y3+i*.14} ${left} ${y3+i*.02} ${left} ${y3+i*.02}`}
        stroke="white" strokeWidth={sw} strokeLinecap="round" fill="none"
      />
      <rect x={dx} y={dy} width={ds} height={ds} rx={Math.max(1, ds * 0.35)} fill="#3b82f6" />
    </svg>
  );
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  roles?: string[];
}

// Navigation principale — tous les modules visibles
const NAV_MAIN: NavItem[] = [
  { id: "dashboard",      label: "Dashboard",    icon: LayoutDashboard, path: "/dashboard",          roles: ["root","admin","directeur","fondateur","enseignant","parent"] },
  { id: "eleves",         label: "Élèves",       icon: Users,           path: "/eleves",             roles: ["root","admin","directeur"] },
  { id: "enseignants",    label: "Enseignants",  icon: GraduationCap,   path: "/enseignants",        roles: ["root","admin","directeur"] },
  { id: "notes",          label: "Notes",        icon: ClipboardList,   path: "/notes",              roles: ["root","admin","directeur","enseignant","parent"] },
  { id: "finance",        label: "Finance",      icon: CreditCard,      path: "/finance",            roles: ["root","admin","directeur","fondateur"] },
  { id: "classes",        label: "Classes",      icon: Building2,       path: "/classes",            roles: ["root","admin","directeur"] },
  { id: "cours",          label: "Cours",        icon: BookOpen,        path: "/cours",              roles: ["root","admin","directeur"] },
  { id: "inscriptions",   label: "Inscriptions", icon: Users,           path: "/inscriptions",       roles: ["root","admin","directeur"] },
  { id: "annees",         label: "Années",       icon: Calendar,        path: "/annees",             roles: ["root","admin"] },
  { id: "salles",         label: "Salles",       icon: Home,            path: "/salles",             roles: ["root","admin","directeur"] },
  { id: "scolarites",     label: "Scolarités",   icon: CreditCard,      path: "/scolarites",         roles: ["root","admin","fondateur"] },
  { id: "stats",          label: "Statistiques", icon: BarChart2,       path: "/paiements/stats",    roles: ["root","admin","directeur","fondateur"] },
  { id: "utilisateurs",   label: "Utilisateurs", icon: Shield,          path: "/admin/utilisateurs", roles: ["root","admin"] },
];

const ROLE_LABELS: Record<string, string> = {
  root: "Super Admin", admin: "Administrateur", fondateur: "Fondateur",
  directeur: "Directeur", enseignant: "Enseignant", parent: "Parent",
};

const ROLE_COLORS: Record<string, string> = {
  root: "bg-red-50 text-red-700", admin: "bg-blue-50 text-blue-700",
  fondateur: "bg-amber-50 text-amber-700", directeur: "bg-violet-50 text-violet-700",
  enseignant: "bg-emerald-50 text-emerald-700", parent: "bg-pink-50 text-pink-700",
};

interface TopNavProps {
  annees?: { idAnnee: number; libelle: string }[];
  selectedAnnee?: string;
  onAnneeChange?: (id: string) => void;
}

export default function TopNav({ annees = [], selectedAnnee, onAnneeChange }: TopNavProps) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  const userRole = user?.role ?? "";
  const userName = user?.name ?? "Utilisateur";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = NAV_MAIN.filter(
    item => !item.roles || item.roles.includes(userRole)
  );

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-100"
      style={{ boxShadow: "0 1px 0 #f1f5f9, 0 2px 8px rgba(15,31,61,0.04)" }}>

      {/* Ligne 1 — Logo + Année + User */}
      <div className="flex items-center h-12 px-5 gap-3 border-b border-slate-50">
        <div className="flex items-center gap-2.5 flex-shrink-0 cursor-pointer"
          onClick={() => navigate("/dashboard")}>
          <ScoliaLogo />
          <div>
            <p className="text-sm font-bold text-slate-900 leading-none" style={{ letterSpacing: "-0.02em" }}>SCOLIA</p>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">Gestion scolaire</p>
          </div>
        </div>

        <div className="flex-1" />

        {/* Année */}
        {annees.length > 0 && (
          <select
            value={selectedAnnee}
            onChange={e => onAnneeChange?.(e.target.value)}
            className="appearance-none bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer"
            style={{ maxWidth: 180 }}
          >
            {annees.map(a => (
              <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>
            ))}
          </select>
        )}

        {/* Notif */}
        <button className="relative w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors">
          <Bell className="w-4 h-4 text-slate-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-1.5 ring-white" />
        </button>

        {/* User */}
        <div className="relative" ref={userRef}>
          <button onClick={() => setUserOpen(v => !v)}
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-[#0f1f3d] flex items-center justify-center text-white text-[10px] font-bold">
              {getInitials(userName)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-900 leading-none">{userName}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{ROLE_LABELS[userRole] ?? userRole}</p>
            </div>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${userOpen ? "rotate-180" : ""}`} />
          </button>

          {userOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserOpen(false)} />
              <div className="absolute top-full right-0 mt-1.5 w-56 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 overflow-hidden"
                style={{ boxShadow: "0 8px 32px rgba(15,31,61,0.12)" }}>
                <div className="p-3.5 border-b border-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#0f1f3d] flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(userName)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 leading-none">{userName}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${ROLE_COLORS[userRole] ?? "bg-slate-100 text-slate-600"}`}>
                        {ROLE_LABELS[userRole] ?? userRole}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <button onClick={() => { navigate("/mon-profil"); setUserOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                    <UserCircle className="w-4 h-4 text-slate-400" /> Mon profil
                  </button>
                  {(userRole === "root" || userRole === "admin") && (
                    <button onClick={() => { navigate("/admin/utilisateurs"); setUserOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                      <Settings className="w-4 h-4 text-slate-400" /> Paramètres
                    </button>
                  )}
                </div>
                <div className="border-t border-slate-50 py-1">
                  <button onClick={() => { logout(); navigate("/login"); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="w-4 h-4" /> Se déconnecter
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Ligne 2 — Tabs navigation (scroll horizontal) */}
      <div className="flex items-center overflow-x-auto scrollbar-hide px-3 h-10 gap-0.5">
        {filtered.map(item => {
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                whitespace-nowrap flex-shrink-0 transition-all duration-150
                ${active
                  ? "bg-[#0f1f3d] text-white"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }
              `}
            >
              <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}