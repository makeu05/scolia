/**
 * Dashboard.tsx — SGS (Système de Gestion Scolaire)
 *
 * Stack : React 18 + TypeScript + Recharts + Tailwind CSS + Shadcn/ui
 *
 * Dépendances npm :
 *   recharts
 *   lucide-react
 *   @tanstack/react-query  (pour les appels API réels)
 *
 * Intégration Laravel :
 *   Chaque section indique l'endpoint prévu en commentaire // API: GET /api/...
 *   Remplacer les MOCK_* par des appels useQuery() vers votre backend Sanctum.
 *
 * Responsive : mobile (320px+) / tablette (768px+) / desktop (1280px+)
 */

import React, { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Users, BookOpen, TrendingUp, Wallet, Bell, Settings,
  Menu, X, ChevronRight, GraduationCap, LayoutDashboard,
  ClipboardList, Calendar, CreditCard, MessageSquare,
  AlertTriangle, Library, LogOut, Search, RefreshCw,
  ArrowUpRight, ArrowDownRight, Minus, UserCheck, Award,
  ChevronDown, CheckCircle2, Clock, AlertCircle,
} from "lucide-react";

import { useAuth } from "../auth"

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface StatCard {
  id: string;
  label: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  trend: "up" | "down" | "neutral";
  trendValue: string;
  color: string;
  bg: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  section?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA  —  remplacer par React Query + API Laravel
// ─────────────────────────────────────────────────────────────────────────────

// API: GET /api/dashboard/stats
const MOCK_STATS: StatCard[] = [
  {
    id: "eleves",
    label: "Total élèves",
    value: 847,
    sub: "inscrits cette année",
    icon: Users,
    trend: "up",
    trendValue: "+12 ce mois",
    color: "text-blue-700",
    bg: "bg-blue-50",
  },
  {
    id: "actifs",
    label: "Élèves actifs",
    value: 812,
    sub: "95,9% du total",
    icon: UserCheck,
    trend: "neutral",
    trendValue: "stable",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
  },
  {
    id: "moyenne",
    label: "Moyenne générale",
    value: "13,4 / 20",
    sub: "trimestre 1 · 2024-2025",
    icon: Award,
    trend: "up",
    trendValue: "+0,8 pts",
    color: "text-violet-700",
    bg: "bg-violet-50",
  },
  {
    id: "paiement",
    label: "Taux de paiement",
    value: "78%",
    sub: "scolarité collectée",
    icon: Wallet,
    trend: "down",
    trendValue: "-3% vs. mois dernier",
    color: "text-amber-700",
    bg: "bg-amber-50",
  },
  {
    id: "classes",
    label: "Classes actives",
    value: 24,
    sub: "3 cycles · 6 niveaux",
    icon: BookOpen,
    trend: "neutral",
    trendValue: "inchangé",
    color: "text-cyan-700",
    bg: "bg-cyan-50",
  },
  {
    id: "enseignants",
    label: "Enseignants",
    value: 38,
    sub: "en service ce trimestre",
    icon: GraduationCap,
    trend: "up",
    trendValue: "+2 nouveaux",
    color: "text-rose-700",
    bg: "bg-rose-50",
  },
];

// API: GET /api/dashboard/evolution-eleves
const MOCK_EVOLUTION = [
  { mois: "Sep", inscrits: 720, actifs: 690 },
  { mois: "Oct", inscrits: 780, actifs: 752 },
  { mois: "Nov", inscrits: 800, actifs: 770 },
  { mois: "Déc", inscrits: 810, actifs: 779 },
  { mois: "Jan", inscrits: 830, actifs: 796 },
  { mois: "Fév", inscrits: 847, actifs: 812 },
];

// API: GET /api/dashboard/repartition-cycles
const MOCK_CYCLES = [
  { name: "Collège", value: 412, color: "#3b82f6" },
  { name: "Lycée", value: 298, color: "#8b5cf6" },
  { name: "Terminal", value: 137, color: "#06b6d4" },
];

// API: GET /api/dashboard/paiements-mensuels
const MOCK_PAIEMENTS = [
  { mois: "Sep", collecté: 4200000, attendu: 5100000 },
  { mois: "Oct", collecté: 4800000, attendu: 5100000 },
  { mois: "Nov", collecté: 3900000, attendu: 5100000 },
  { mois: "Déc", collecté: 4100000, attendu: 5100000 },
  { mois: "Jan", collecté: 4600000, attendu: 5100000 },
  { mois: "Fév", collecté: 3980000, attendu: 5100000 },
];

// API: GET /api/dashboard/evenements-recents
const MOCK_EVENTS = [
  { id: 1, type: "inscription", label: "Nouvelle inscription", detail: "FOUDA Jean · 3ème B", time: "Il y a 12 min", status: "success" },
  { id: 2, type: "paiement", label: "Paiement reçu", detail: "MBARGA Sophie · 85 000 FCFA", time: "Il y a 34 min", status: "success" },
  { id: 3, type: "alerte", label: "Retard de paiement", detail: "12 élèves · Délai dépassé", time: "Il y a 2h", status: "warning" },
  { id: 4, type: "note", label: "Notes saisies", detail: "Maths · Terminale C · M. ATEBA", time: "Il y a 3h", status: "info" },
  { id: 5, type: "discipline", label: "Incident signalé", detail: "ONDOA Eric · Absence injustifiée", time: "Il y a 5h", status: "error" },
];

// API: GET /api/dashboard/alertes
const MOCK_ALERTS = [
  { id: 1, msg: "22 élèves n'ont pas réglé la scolarité du trimestre", niveau: "error" },
  { id: 2, msg: "5 enseignants n'ont pas saisi leurs notes (Trim. 1)", niveau: "warning" },
  { id: 3, msg: "Conseil de classe prévu le 28 fév · 3 jours restants", niveau: "info" },
];

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard, section: "principal" },
  { id: "eleves", label: "Élèves", icon: Users, badge: 847, section: "gestion" },
  { id: "structure", label: "Structure pédagogique", icon: BookOpen, section: "gestion" },
  { id: "notes", label: "Notes & Évaluations", icon: ClipboardList, section: "gestion" },
  { id: "emploi", label: "Emploi du temps", icon: Calendar, section: "gestion" },
  { id: "finance", label: "Finance", icon: CreditCard, badge: 22, section: "gestion" },
  { id: "communication", label: "Communication", icon: MessageSquare, section: "outils" },
  { id: "discipline", label: "Discipline", icon: AlertTriangle, badge: 5, section: "outils" },
  { id: "bibliotheque", label: "Bibliothèque", icon: Library, section: "outils" },
];

// ─────────────────────────────────────────────────────────────────────────────
// SOUS-COMPOSANTS
// ─────────────────────────────────────────────────────────────────────────────

const TrendIcon: React.FC<{ trend: "up" | "down" | "neutral" }> = ({ trend }) => {
  if (trend === "up") return <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />;
  if (trend === "down") return <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />;
  return <Minus className="h-3.5 w-3.5 text-gray-400" />;
};

const EventIcon: React.FC<{ status: string }> = ({ status }) => {
  const cls = "h-4 w-4 flex-shrink-0";
  if (status === "success") return <CheckCircle2 className={`${cls} text-emerald-500`} />;
  if (status === "warning") return <Clock className={`${cls} text-amber-500`} />;
  if (status === "error") return <AlertCircle className={`${cls} text-red-500`} />;
  return <Bell className={`${cls} text-blue-500`} />;
};

const formatFCFA = (n: number) =>
  new Intl.NumberFormat("fr-CM", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(n);

const CustomTooltipBar: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2.5 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="leading-5">
          {p.name} : <span className="font-semibold">{formatFCFA(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

const CustomTooltipArea: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2.5 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="leading-5">
          {p.name} : <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────

interface SidebarProps {
  activeNav: string;
  onNav: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeNav, onNav, open, onClose }) => {
  const sections = ["principal", "gestion", "outils"];
  const { logout } = useAuth();
  const sectionLabels: Record<string, string> = {
    principal: "Principal",
    gestion: "Gestion scolaire",
    outils: "Outils",
  };

  // Dans le composant Sidebar :
 

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
          w-[240px] bg-white border-r border-gray-100
          transition-transform duration-250 ease-in-out
          lg:relative lg:translate-x-0 lg:flex-shrink-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#1a3a5c] flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">SGS</p>
              <p className="text-[10px] text-gray-400 leading-tight">Gestion scolaire</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {sections.map((sec) => (
            <div key={sec} className="mb-3">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                {sectionLabels[sec]}
              </p>
              {NAV_ITEMS.filter((n) => n.section === sec).map((item) => (
                <button
                  key={item.id}
                  onClick={() => { onNav(item.id); onClose(); }}
                  className={`
                    flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm
                    mb-0.5 transition-all duration-150 text-left
                    ${activeNav === item.id
                      ? "bg-[#eaf0f8] text-[#1a3a5c] font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <item.icon className={`h-4 w-4 flex-shrink-0 ${activeNav === item.id ? "text-[#1a3a5c]" : "text-gray-400"}`} />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      item.id === "finance" || item.id === "discipline"
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* Profil bas */}
        <div className="px-3 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="h-8 w-8 rounded-full bg-[#1a3a5c] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">Administrateur</p>
              <p className="text-[10px] text-gray-400 truncate">admin@sgs-ecole.cm</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          </div>
          <button
  onClick={logout}
  className="flex items-center gap-2 w-full px-2 py-1.5 mt-1 rounded-lg text-xs text-red-500 hover:bg-red-50 transition-colors"
>
  <LogOut className="h-3.5 w-3.5" />
  Déconnexion
</button>
        </div>
      </aside>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TOPBAR
// ─────────────────────────────────────────────────────────────────────────────

interface TopbarProps {
  onMenuToggle: () => void;
  onRefresh: () => void;
  refreshing: boolean;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuToggle, onRefresh, refreshing }) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Menu burger (mobile/tablette) */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label="Ouvrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Titre page + date */}
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-gray-900 leading-tight">Tableau de bord</h1>
          <p className="text-xs text-gray-400 leading-tight capitalize hidden sm:block">{dateStr}</p>
        </div>

        {/* Actions droite */}
        <div className="flex items-center gap-2">
          {/* Recherche */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              placeholder="Rechercher…"
              className="pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:outline-none focus:border-[#1a3a5c]/30 focus:bg-white w-40 transition-all"
            />
          </div>

          {/* Actualiser */}
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title="Actualiser"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>

          {/* Paramètres */}
          <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD CONTENT
// ─────────────────────────────────────────────────────────────────────────────

const DashboardContent: React.FC = () => {
  const annee = "2024-2025";
  const trimestre = "Trimestre 1";

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">

      {/* ── Alertes ── */}
      {MOCK_ALERTS.length > 0 && (
        <div className="space-y-2">
          {MOCK_ALERTS.map((a) => (
            <div
              key={a.id}
              className={`flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm border ${
                a.niveau === "error"
                  ? "bg-red-50 border-red-200 text-red-700"
                  : a.niveau === "warning"
                  ? "bg-amber-50 border-amber-200 text-amber-700"
                  : "bg-blue-50 border-blue-200 text-blue-700"
              }`}
            >
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span className="flex-1">{a.msg}</span>
              <button className="text-current opacity-50 hover:opacity-100 transition-opacity flex-shrink-0">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── En-tête contexte ── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
            Année scolaire · {annee}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{trimestre} en cours</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-600 focus:outline-none focus:border-[#1a3a5c]/30">
            <option>Trimestre 1</option>
            <option>Trimestre 2</option>
            <option>Trimestre 3</option>
          </select>
          <select className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-600 focus:outline-none focus:border-[#1a3a5c]/30">
            <option>2024-2025</option>
            <option>2023-2024</option>
          </select>
        </div>
      </div>

      {/* ── Cartes stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {MOCK_STATS.map((stat) => (
          <div
            key={stat.id}
            className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm transition-shadow group cursor-default"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`${stat.bg} rounded-xl p-2`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div className={`flex items-center gap-0.5 text-[10px] font-medium ${
                stat.trend === "up" ? "text-emerald-600"
                : stat.trend === "down" ? "text-red-500"
                : "text-gray-400"
              }`}>
                <TrendIcon trend={stat.trend} />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900 leading-tight">{stat.value}</p>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{stat.label}</p>
            <p className={`text-[10px] mt-1.5 font-medium ${
              stat.trend === "up" ? "text-emerald-600"
              : stat.trend === "down" ? "text-red-500"
              : "text-gray-400"
            }`}>
              {stat.trendValue}
            </p>
          </div>
        ))}
      </div>

      {/* ── Graphiques ligne 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Évolution des inscrits (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Évolution des inscrits</h2>
              <p className="text-xs text-gray-400 mt-0.5">Sep 2024 — Fév 2025</p>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-gray-500">
                <span className="h-2 w-4 rounded-full bg-[#3b82f6] inline-block" />
                Inscrits
              </span>
              <span className="flex items-center gap-1.5 text-gray-500">
                <span className="h-2 w-4 rounded-full bg-[#10b981] inline-block" />
                Actifs
              </span>
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_EVOLUTION} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInscrits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorActifs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip content={<CustomTooltipArea />} />
                <Area
                  type="monotone" dataKey="inscrits" name="Inscrits"
                  stroke="#3b82f6" strokeWidth={2}
                  fill="url(#colorInscrits)" dot={{ r: 3, fill: "#3b82f6" }}
                  activeDot={{ r: 5 }}
                />
                <Area
                  type="monotone" dataKey="actifs" name="Actifs"
                  stroke="#10b981" strokeWidth={2}
                  fill="url(#colorActifs)" dot={{ r: 3, fill: "#10b981" }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition par cycle (1/3) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-900">Répartition par cycle</h2>
            <p className="text-xs text-gray-400 mt-0.5">847 élèves au total</p>
          </div>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_CYCLES} cx="50%" cy="50%"
                  innerRadius={45} outerRadius={72}
                  paddingAngle={3} dataKey="value"
                >
                  {MOCK_CYCLES.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [value + " élèves", name]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {MOCK_CYCLES.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="text-gray-600">{c.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">{c.value}</span>
                  <span className="text-gray-400">{Math.round((c.value / 847) * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Graphiques ligne 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Paiements (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Collecte des paiements</h2>
              <p className="text-xs text-gray-400 mt-0.5">Collecté vs. attendu (FCFA)</p>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-gray-500">
                <span className="h-2 w-3 rounded bg-[#1a3a5c] inline-block" />
                Collecté
              </span>
              <span className="flex items-center gap-1.5 text-gray-500">
                <span className="h-2 w-3 rounded bg-[#e2e8f0] inline-block" />
                Attendu
              </span>
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_PAIEMENTS} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} width={38}
                />
                <Tooltip content={<CustomTooltipBar />} />
                <Bar dataKey="attendu" name="Attendu" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="collecté" name="Collecté" fill="#1a3a5c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Taux de paiement gauge + résumé (1/3) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Taux de recouvrement</h2>
            <p className="text-xs text-gray-400 mt-0.5">Trimestre 1 · en cours</p>
          </div>

          {/* Barre circulaire simulée avec div */}
          <div className="flex flex-col items-center py-2">
            <div className="relative h-32 w-32">
              <svg viewBox="0 0 100 100" className="rotate-[-90deg] h-full w-full">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke="#1a3a5c" strokeWidth="10"
                  strokeDasharray={`${78 * 2.513} ${(100 - 78) * 2.513}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">78%</span>
                <span className="text-[10px] text-gray-400">collecté</span>
              </div>
            </div>
          </div>

          {/* Résumé */}
          <div className="space-y-2.5 text-xs">
            {[
              { label: "Total attendu", val: "30 600 000 FCFA", color: "text-gray-700" },
              { label: "Collecté", val: "23 868 000 FCFA", color: "text-emerald-700" },
              { label: "Restant", val: "6 732 000 FCFA", color: "text-red-600" },
            ].map((r) => (
              <div key={r.label} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-gray-500">{r.label}</span>
                <span className={`font-semibold ${r.color}`}>{r.val}</span>
              </div>
            ))}
          </div>

          <button className="mt-auto w-full py-2 rounded-xl bg-[#1a3a5c] hover:bg-[#16324f] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5">
            Voir les impayés
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Ligne 3 : Événements + Raccourcis ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Activité récente (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Activité récente</h2>
            <button className="text-xs text-[#1a3a5c] font-medium hover:underline flex items-center gap-1">
              Tout voir <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-3">
            {MOCK_EVENTS.map((ev) => (
              <div
                key={ev.id}
                className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50/60 rounded-lg px-2 -mx-2 transition-colors cursor-default"
              >
                <EventIcon status={ev.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800">{ev.label}</p>
                  <p className="text-xs text-gray-500 truncate">{ev.detail}</p>
                </div>
                <span className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5">{ev.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Raccourcis + résumé classes (1/3) */}
        <div className="space-y-4">

          {/* Accès rapides */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Accès rapides</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Ajouter élève", icon: Users, color: "bg-blue-50 text-blue-700" },
                { label: "Saisir notes", icon: ClipboardList, color: "bg-violet-50 text-violet-700" },
                { label: "Paiement", icon: CreditCard, color: "bg-emerald-50 text-emerald-700" },
                { label: "Emploi temps", icon: Calendar, color: "bg-amber-50 text-amber-700" },
              ].map((r) => (
                <button
                  key={r.label}
                  className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-center"
                >
                  <div className={`${r.color} rounded-lg p-2`}>
                    <r.icon className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] text-gray-600 font-medium leading-tight">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Top classes */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-3">Top classes · moyenne</h2>
            <div className="space-y-2.5">
              {[
                { classe: "Terminale C", moy: 14.8, fill: 74 },
                { classe: "3ème A", moy: 13.9, fill: 69.5 },
                { classe: "2nde B", moy: 13.2, fill: 66 },
                { classe: "6ème A", moy: 12.8, fill: 64 },
              ].map((c, i) => (
                <div key={c.classe}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-gray-400">#{i + 1}</span>
                      {c.classe}
                    </span>
                    <span className="font-semibold text-gray-800">{c.moy}/20</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1a3a5c] rounded-full transition-all"
                      style={{ width: `${c.fill}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT RACINE
// ─────────────────────────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [refreshing, setRefreshing] = useState(false);

  // Fermer sidebar sur resize vers desktop
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    // TODO: invalider toutes les queries React Query ici
    // queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar
        activeNav={activeNav}
        onNav={setActiveNav}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Zone principale */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          onMenuToggle={() => setSidebarOpen((v) => !v)}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
        <main className="flex-1 overflow-y-auto">
          {activeNav === "dashboard" ? (
            <DashboardContent />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Module « {NAV_ITEMS.find((n) => n.id === activeNav)?.label} » — à développer
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
