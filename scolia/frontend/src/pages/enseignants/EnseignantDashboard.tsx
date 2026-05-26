import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser, authFetch } from "../../service/auth";
import {
  BookOpen, ClipboardList, BarChart2, FileText,
  ArrowRight, GraduationCap, Bell,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export default function EnseignantDashboard() {
  const navigate = useNavigate();
  const user     = getUser();
  const [cours, setCours]     = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!user?.idCours) return;
    authFetch(`${API}/cours/${user.idCours}`)
      .then(r => r.json())
      .then(setCours)
      .catch(() => {});
  }, []);

  const ACTIONS = [
    { label: "Saisir des notes",  desc: "Entrer les notes de mes élèves", icon: ClipboardList, path: "/notes/saisie",      color: "bg-blue-50 hover:bg-blue-100 text-blue-700" },
    { label: "Voir le classement",desc: "Classement de ma classe",        icon: BarChart2,     path: "/notes/classement",  color: "bg-violet-50 hover:bg-violet-100 text-violet-700" },
    { label: "Bulletins",         desc: "Générer les bulletins",          icon: FileText,      path: "/notes/bulletin",    color: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700" },
    { label: "Mes épreuves",      desc: "Gérer mes épreuves",             icon: BookOpen,      path: "/epreuves",          color: "bg-amber-50 hover:bg-amber-100 text-amber-700" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-3.5 flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0f1f3d] flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-sm" style={{ letterSpacing: "-0.02em" }}>SCOLIA</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <Bell className="w-4 h-4 text-slate-500" />
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
              <span className="text-violet-700 text-xs font-bold">
                {user?.name?.[0]?.toUpperCase() ?? "E"}
              </span>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-900 leading-none">{user?.name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Enseignant</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Bienvenue */}
        <div className={`transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
          <p className="text-sm text-slate-400 font-medium">Bonjour 👋</p>
          <h1 className="text-2xl font-bold text-slate-900 mt-1" style={{ letterSpacing: "-0.03em" }}>
            {user?.name}
          </h1>
        </div>

        {/* Cours assigné */}
        {cours && (
          <div className="card p-5 animate-fade-in">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Mon cours</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">{cours.libelle}</p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {cours.classe?.libelle && <span>{cours.classe.libelle} · </span>}
                  Coefficient {cours.coefficient}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${cours.actif ? "badge-green" : "badge-red"}`}>
                  {cours.actif ? "Actif" : "Inactif"}
                </span>
                <button
                  onClick={() => navigate(`/cours/${cours.idCours}`)}
                  className="btn-ghost gap-1 text-xs"
                >
                  Voir <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Actions rapides */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Actions rapides</p>
          <div className="grid grid-cols-2 gap-3">
            {ACTIONS.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-start gap-3 p-5 rounded-2xl text-left transition-all duration-150 active:scale-[0.98] border border-transparent hover:shadow-sm ${item.color}`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-xs opacity-70 mt-0.5">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Liens utiles */}
        <div className="card p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Navigation</p>
          <div className="space-y-1">
            {[
              { label: "Mes notes & évaluations", path: "/notes" },
              { label: "Classement de la classe", path: "/notes/classement" },
              { label: "Mon profil",              path: "/mon-profil" },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-sm text-slate-600 hover:text-slate-900"
              >
                <span>{item.label}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}