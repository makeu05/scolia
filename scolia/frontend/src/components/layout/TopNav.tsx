// src/components/layout/TopNav.tsx — Header strip only (navigation moved to Sidebar)
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu, ChevronDown, LogOut, UserCircle, Settings,
} from "lucide-react";
import { useAuth } from "../../service/auth";
import { useAnnee } from "../../context/AnneeContext";
import NotificationBell from "../../pages/composants/NotificationBell";

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

const ROLE_LABELS: Record<string, string> = {
  root: "Super Admin", admin: "Administrateur", fondateur: "Fondateur",
  directeur: "Directeur", enseignant: "Enseignant", parent: "Parent",
};

const ROLE_COLORS: Record<string, string> = {
  root:       "bg-red-50 text-red-700",
  admin:      "bg-blue-50 text-blue-700",
  fondateur:  "bg-amber-50 text-amber-700",
  directeur:  "bg-violet-50 text-violet-700",
  enseignant: "bg-emerald-50 text-emerald-700",
  parent:     "bg-pink-50 text-pink-700",
};

const STATUT_BADGE: Record<string, string> = {
  active:   " ✓",
  cloturee: " 🔒",
  brouillon: "",
};

interface TopNavProps {
  onMenuToggle: () => void;
}

export default function TopNav({ onMenuToggle }: TopNavProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { annees, idAca, setIdAca, anneeActive } = useAnnee();

  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  const userRole = user?.role ?? "";
  const userName = user?.name ?? "Utilisateur";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node))
        setUserOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header
      className="sticky top-0 z-20 bg-white border-b border-slate-100 flex items-center h-14 px-4 gap-3"
      style={{ boxShadow: "0 1px 0 #f1f5f9, 0 2px 8px rgba(15,31,61,0.04)" }}
    >
      {/* Hamburger — always visible, toggles sidebar */}
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors flex-shrink-0"
        aria-label="Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Logo — shown only when sidebar is hidden on mobile */}
      <div
        className="flex items-center gap-2 cursor-pointer flex-shrink-0 lg:hidden"
        onClick={() => navigate("/dashboard")}
      >
        <ScoliaLogo />
        <span className="text-sm font-bold text-slate-900" style={{ letterSpacing: "-0.02em" }}>
          SCOLIA
        </span>
      </div>

      <div className="flex-1" />

      {/* Year selector */}
      {annees.length > 0 && (
        <div className="flex items-center gap-2">
          {anneeActive?.statut === "active" && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 hidden sm:inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Active
            </span>
          )}
          {anneeActive?.statut === "cloturee" && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 hidden sm:inline-flex items-center gap-1">
              🔒 Clôturée
            </span>
          )}
          <select
            value={idAca}
            onChange={e => setIdAca(e.target.value)}
            className="appearance-none bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium px-3 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all cursor-pointer"
            style={{ maxWidth: 200 }}
          >
            {annees.map(a => (
              <option key={a.idAnnee} value={a.idAnnee}>
                {a.libelle}{STATUT_BADGE[(a as any).statut] ?? ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <NotificationBell />

      {/* User dropdown */}
      <div className="relative" ref={userRef}>
        <button
          onClick={() => setUserOpen(v => !v)}
          className="flex items-center gap-2 pl-1 pr-2.5 py-1.5 rounded-xl hover:bg-slate-50 transition-colors"
        >
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
            <div
              className="absolute top-full right-0 mt-1.5 w-56 bg-white rounded-2xl border border-slate-100 z-50 overflow-hidden"
              style={{ boxShadow: "0 8px 32px rgba(15,31,61,0.12)" }}
            >
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
                <button
                  onClick={() => { navigate("/mon-profil"); setUserOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <UserCircle className="w-4 h-4 text-slate-400" /> Mon profil
                </button>
                {(userRole === "root" || userRole === "admin") && (
                  <button
                    onClick={() => { navigate("/admin/utilisateurs"); setUserOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" /> Paramètres
                  </button>
                )}
              </div>
              <div className="border-t border-slate-50 py-1">
                <button
                  onClick={() => { logout(); navigate("/login"); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Se déconnecter
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
