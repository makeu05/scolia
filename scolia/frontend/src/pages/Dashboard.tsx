import {
  AlertTriangle,
  Award,
  Bell,
  BookOpen,
  UserCheck,
  Users,
  Wallet,
  TrendingUp,
  Menu,
} from "lucide-react";
import Sidebar from "./composants/sidebar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../service/auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

function getToken(): string {
  return localStorage.getItem("token") ?? "";
}

async function apiFetch(url: string) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
}

interface DashboardData {
  totalEleves: number;
  totalClasses: number;
  totalEnseignants: number;
  totalPaiements: number;
  totalDebiteurs: number;
  tauxReussite: number;
  paiementsRecents: {
    idPaie: number;
    montant: number;
    datePaie: string;
    eleve?: { nom: string; prenom: string };
    mode?: { libelle: string };
  }[];
  elevesActifs: number;
  paiementsMois: number;
  montantImpaye: number;
  parMois: { mois: string; total: number }[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav]     = useState("dashboard");
  const [annees, setAnnees]           = useState<any[]>([]);
  const [idAca, setIdAca]             = useState('');
  const [data, setData]               = useState<DashboardData | null>(null);
  const [loading, setLoading]         = useState(true);

  /* ─── Chargement années ─── */
  useEffect(() => {
  authFetch(`${API}/annees`)
    .then(r => r.json())
    .then((d: any) => {
      const list = Array.isArray(d) ? d : d.data ?? [];
      setAnnees(list);
      if (list.length > 0) setIdAca(String(list[list.length - 1].idAnnee));
    })
    .catch(() => {});
}, []);

  /* ─── Chargement stats selon année ─── */
  useEffect(() => {
    if (!idAca) return;
    loadDashboard();
  }, [idAca]);

  async function loadDashboard() {
    setLoading(true);
    try {
      const [
        elevesData,
        classesData,
        enseignantsData,
        paiementsDash,
      ] = await Promise.all([
        apiFetch(`${API}/eleves?actif=1`),
        apiFetch(`${API}/classes`),
        apiFetch(`${API}/enseignants?actif=1`),
        apiFetch(`${API}/paiements/dashboard?idAca=${idAca}`),
      ]);

      // Calcul montant impayé
      const statsData = await apiFetch(`${API}/paiements/stats?idAca=${idAca}`);

      // Paiements ce mois
      const now = new Date();
      const moisCourant = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const paiementsMois = statsData.parMois?.find(
        (m: any) => m.mois === moisCourant
      )?.nb ?? 0;

      setData({
        totalEleves:      elevesData.total ?? 0,
        totalClasses:     (classesData.data ?? classesData).length ?? 0,
        totalEnseignants: (enseignantsData.data ?? enseignantsData).total ?? 0,
        totalPaiements:   paiementsDash.totalCollecte ?? 0,
        totalDebiteurs:   paiementsDash.nbDebiteurs ?? 0,
        tauxReussite:     92, // à connecter quand le module notes sera finalisé
        paiementsRecents: paiementsDash.recents ?? [],
        elevesActifs:     elevesData.total ?? 0,
        paiementsMois,
        montantImpaye:    Math.max(0, (statsData.totalAttendu ?? 0) - (statsData.totalCollecte ?? 0)),
        parMois:          statsData.parMois ?? [],
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function formatMontant(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
    return String(n);
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)   return "À l'instant";
    if (mins < 60)  return `Il y a ${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)   return `Il y a ${hrs}h`;
    return `Il y a ${Math.floor(hrs / 24)}j`;
  }

  const stats = data ? [
    {
      label: 'Élèves',
      value: data.totalEleves,
      icon: Users,
      bg: 'bg-blue-50',
      color: 'text-blue-600',
      trend: '+12%',
      trendColor: 'text-emerald-600 bg-emerald-50',
      path: '/eleves',
    },
    {
      label: 'Classes',
      value: data.totalClasses,
      icon: BookOpen,
      bg: 'bg-violet-50',
      color: 'text-violet-600',
      trend: '',
      trendColor: '',
      path: '/classes',
    },
    {
      label: 'Enseignants',
      value: data.totalEnseignants,
      icon: UserCheck,
      bg: 'bg-emerald-50',
      color: 'text-emerald-600',
      trend: '',
      trendColor: '',
      path: '/enseignants',
    },
    {
      label: 'Paiements (FCFA)',
      value: formatMontant(data.totalPaiements),
      icon: Wallet,
      bg: 'bg-amber-50',
      color: 'text-amber-600',
      trend: '',
      trendColor: '',
      path: '/finance',
    },
    {
      label: 'Débiteurs',
      value: data.totalDebiteurs,
      icon: AlertTriangle,
      bg: 'bg-red-50',
      color: 'text-red-600',
      trend: data.totalDebiteurs > 0 ? String(data.totalDebiteurs) : '✓',
      trendColor: data.totalDebiteurs > 0
        ? 'text-red-600 bg-red-50'
        : 'text-emerald-600 bg-emerald-50',
      path: '/paiements/par-classe',
    },
    {
      label: 'Taux de réussite',
      value: `${data.tauxReussite}%`,
      icon: Award,
      bg: 'bg-cyan-50',
      color: 'text-cyan-600',
      trend: '+18%',
      trendColor: 'text-emerald-600 bg-emerald-50',
      path: '/notes/classement',
    },
  ] : [];

  // Données graphique barres par mois
  const maxMois = data?.parMois?.length
    ? Math.max(...data.parMois.map(m => m.total))
    : 1;

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
            <div className="flex items-center gap-3">
              {/* Burger mobile */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                  Tableau de bord
                </p>
                <h1 className="text-2xl font-bold text-gray-900 mt-0.5">
                  Vue générale
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Statistiques et activité en temps réel
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Sélecteur année académique */}
              <select
                value={idAca}
                onChange={e => setIdAca(e.target.value)}
                className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-600 focus:outline-none focus:border-[#1a3a5c]/30 shadow-sm"
              >
                {annees.map(a => (
                  <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>
                ))}
              </select>

              {/* Refresh */}
              <button
                onClick={loadDashboard}
                disabled={loading}
                className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
              >
                {loading ? '...' : '↻ Actualiser'}
              </button>
            </div>
          </div>
        </div>

        {/* Contenu Scrollable */}
        <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto w-full">

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-[#1a3a5c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-400">Chargement des données...</p>
              </div>
            </div>
          ) : (
            <>
              {/* ── STATISTIQUES ── */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                {stats.map(s => (
                  <button
                    key={s.label}
                    onClick={() => navigate(s.path)}
                    className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all duration-200 text-left"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`${s.bg} p-3 rounded-xl`}>
                        <s.icon className={`h-5 w-5 ${s.color}`} />
                      </div>
                      {s.trend && (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.trendColor}`}>
                          {s.trend}
                        </span>
                      )}
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">{s.value}</h2>
                    <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                  </button>
                ))}
              </div>

              {/* ── GRAPHIQUES ── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Graphique paiements par mois */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">
                        Paiements par mois
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        Montants collectés — {annees.find(a => String(a.idAnnee) === idAca)?.libelle}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/paiements/stats')}
                      className="text-xs text-[#1a3a5c] font-medium hover:underline"
                    >
                      Voir plus
                    </button>
                  </div>

                  {data?.parMois && data.parMois.length > 0 ? (
                    <div className="h-[280px] flex items-end gap-2 px-2">
                      {data.parMois.map(m => {
                        const pct = maxMois > 0
                          ? Math.round((m.total / maxMois) * 100)
                          : 0;
                        const label = m.mois.split('-')[1]
                          ? ['Jan','Fév','Mar','Avr','Mai','Jun',
                             'Jul','Aoû','Sep','Oct','Nov','Déc'][
                               parseInt(m.mois.split('-')[1]) - 1
                             ]
                          : m.mois;

                        return (
                          <div
                            key={m.mois}
                            className="flex-1 flex flex-col items-center gap-1"
                          >
                            <span className="text-[10px] text-gray-400">
                              {formatMontant(m.total)}
                            </span>
                            <div className="w-full flex items-end" style={{ height: '220px' }}>
                              <div
                                className="w-full bg-[#1a3a5c] rounded-t-lg hover:bg-[#16324f] transition-all"
                                style={{ height: `${Math.max(pct, 4)}%` }}
                                title={`${m.mois} : ${m.total.toLocaleString()} FCFA`}
                              />
                            </div>
                            <span className="text-[10px] text-gray-500">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-[280px] rounded-2xl border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm bg-gray-50">
                      Aucune donnée pour cette année
                    </div>
                  )}
                </div>

                {/* Résumé global */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Résumé financier</h2>
                    <p className="text-xs text-gray-400 mt-1">
                      {annees.find(a => String(a.idAnnee) === idAca)?.libelle}
                    </p>
                  </div>

                  <div className="space-y-4 mt-6 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Élèves inscrits</span>
                      <span className="font-semibold text-gray-900">
                        {data?.elevesActifs?.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-px bg-gray-100" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Paiements ce mois</span>
                      <span className="font-semibold text-emerald-600">
                        {data?.paiementsMois}
                      </span>
                    </div>
                    <div className="w-full h-px bg-gray-100" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Total collecté</span>
                      <span className="font-semibold text-emerald-600">
                        {formatMontant(data?.totalPaiements ?? 0)} FCFA
                      </span>
                    </div>
                    <div className="w-full h-px bg-gray-100" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Montant impayé</span>
                      <span className={`font-semibold ${
                        (data?.montantImpaye ?? 0) > 0 ? 'text-red-500' : 'text-emerald-600'
                      }`}>
                        {formatMontant(data?.montantImpaye ?? 0)} FCFA
                      </span>
                    </div>
                    <div className="w-full h-px bg-gray-100" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Débiteurs</span>
                      <span className={`font-semibold ${
                        (data?.totalDebiteurs ?? 0) > 0 ? 'text-red-500' : 'text-emerald-600'
                      }`}>
                        {data?.totalDebiteurs} élève(s)
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/paiements/stats')}
                    className="mt-6 w-full py-3 rounded-xl bg-[#1a3a5c] hover:bg-[#16324f] text-white text-sm font-semibold transition-colors"
                  >
                    Voir les statistiques
                  </button>
                </div>
              </div>

              {/* ── ACTIVITÉ RÉCENTE ── */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">
                      Paiements récents
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      Derniers paiements enregistrés
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/paiements')}
                    className="text-xs text-[#1a3a5c] font-medium hover:underline"
                  >
                    Tout voir
                  </button>
                </div>

                {data?.paiementsRecents && data.paiementsRecents.length > 0 ? (
                  <div className="space-y-2">
                    {data.paiementsRecents.slice(0, 8).map(p => (
                      <div
                        key={p.idPaie}
                        onClick={() => navigate(`/paiements/${p.idPaie}`)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                          <Wallet className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {p.eleve?.prenom} {p.eleve?.nom}
                          </p>
                          <p className="text-xs text-gray-400">
                            {p.mode?.libelle ?? '—'} — {timeAgo(p.datePaie)}
                          </p>
                        </div>
                        <span className="text-sm text-emerald-600 font-semibold whitespace-nowrap">
                          +{p.montant.toLocaleString()} FCFA
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Aucun paiement récent</p>
                  </div>
                )}
              </div>

              {/* ── RACCOURCIS RAPIDES ── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Inscrire un élève',  path: '/inscriptions/ajouter', icon: '➕', color: 'bg-blue-50 hover:bg-blue-100' },
                  { label: 'Saisir des notes',   path: '/notes/saisie',         icon: '✏️', color: 'bg-violet-50 hover:bg-violet-100' },
                  { label: 'Nouveau paiement',   path: '/paiements/nouveau',    icon: '💳', color: 'bg-emerald-50 hover:bg-emerald-100' },
                  { label: 'Voir classement',    path: '/notes/classement',     icon: '🏆', color: 'bg-amber-50 hover:bg-amber-100' },
                ].map(item => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`${item.color} rounded-2xl p-4 text-left transition-colors border border-transparent hover:border-gray-200`}
                  >
                    <span className="text-2xl block mb-2">{item.icon}</span>
                    <p className="text-sm font-medium text-gray-700">{item.label}</p>
                  </button>
                ))}
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  );
}