// src/pages/notes/NotesHome.tsx — Version colorée premium
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Edit, BarChart2, FileText, Award, BookOpen, ArrowRight } from "lucide-react";
import { getUser } from "../../service/auth";

export default function NotesHome() {
  const navigate  = useNavigate();
  const user      = getUser();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const isEnseignant = user?.role === "enseignant";
  const isParent     = user?.role === "parent";

  const ACTIONS = [
    {
      label: "Saisir des notes",
      desc: "Entrer les notes des élèves par épreuve",
      icon: Edit,
      path: "/notes/saisie",
      gradient: "linear-gradient(135deg,#667eea,#764ba2)",
      shadow: "rgba(102,126,234,0.35)",
      roles: ["root","admin","directeur","enseignant"],
    },
    {
      label: "Voir le classement",
      desc: "Classement des élèves par classe et trimestre",
      icon: BarChart2,
      path: "/notes/classement",
      gradient: "linear-gradient(135deg,#4facfe,#00f2fe)",
      shadow: "rgba(79,172,254,0.35)",
      roles: ["root","admin","directeur","enseignant","parent"],
    },
    {
      label: "Bulletins de notes",
      desc: "Générer et consulter les bulletins trimestriels",
      icon: FileText,
      path: "/notes/bulletin",
      gradient: "linear-gradient(135deg,#43e97b,#38f9d7)",
      shadow: "rgba(67,233,123,0.35)",
      roles: ["root","admin","directeur","enseignant","parent"],
    },
    {
      label: "Moyennes & Résultats",
      desc: "Consulter les moyennes générales",
      icon: Award,
      path: "/notes/classement",
      gradient: "linear-gradient(135deg,#f6d365,#fda085)",
      shadow: "rgba(246,211,101,0.35)",
      roles: ["root","admin","directeur","enseignant","parent"],
    },
  ].filter(a => a.roles.includes(user?.role ?? ""));

  const INFO_CARDS = [
    { label: "Notes sur 20", desc: "Système de notation", icon: "📝", color: "#667eea" },
    { label: "Coefficients", desc: "Pondération par matière", icon: "⚖️", color: "#f093fb" },
    { label: "Bulletins PDF", desc: "Génération automatique", icon: "📄", color: "#43e97b" },
    { label: "Classements", desc: "Par classe et trimestre", icon: "🏆", color: "#f6d365" },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Bannière */}
      <div className={`rounded-2xl p-5 relative overflow-hidden transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
        style={{ background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)", boxShadow: "0 4px 24px rgba(102,126,234,0.4)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(255,255,255,0.15) 0%,transparent 70%)" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="w-4 h-4 text-purple-200" />
            <p className="text-purple-200 text-xs font-semibold uppercase tracking-wider">Évaluation scolaire</p>
          </div>
          <h1 className="text-white text-2xl font-bold" style={{ letterSpacing: "-0.03em" }}>
            Notes & Évaluations
          </h1>
          <p className="text-purple-200/70 text-sm mt-1">
            {isEnseignant ? "Gérez les notes de vos élèves" :
             isParent ? "Consultez les résultats de votre enfant" :
             "Gestion complète des évaluations et bulletins"}
          </p>
        </div>
      </div>

      {/* Actions principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
        {ACTIONS.map((action) => (
          <button key={action.path} onClick={() => navigate(action.path)}
            className="relative rounded-2xl p-6 text-white text-left overflow-hidden group transition-all duration-200 active:scale-[0.98] animate-fade-in"
            style={{ background: action.gradient, boxShadow: `0 4px 16px ${action.shadow}` }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 32px ${action.shadow}`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${action.shadow}`; }}>
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full"
              style={{ background: "radial-gradient(circle,rgba(255,255,255,0.15) 0%,transparent 70%)" }} />
            <div className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize: "30px 30px" }} />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <p className="font-bold text-lg" style={{ letterSpacing: "-0.02em" }}>{action.label}</p>
              <p className="text-white/70 text-sm mt-1">{action.desc}</p>
              <div className="flex items-center gap-1 mt-4 text-white/80 text-sm font-semibold">
                Accéder <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Info cards */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Fonctionnalités du module</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {INFO_CARDS.map((card, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-fade-in"
              style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
              <div className="text-3xl mb-2">{card.icon}</div>
              <p className="font-bold text-sm text-slate-900">{card.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick nav pour enseignant */}
      {isEnseignant && (
        <div className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg,rgba(102,126,234,0.08),rgba(118,75,162,0.08))", border: "1px solid rgba(102,126,234,0.2)" }}>
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-600" /> Raccourcis enseignant
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Saisir notes", path: "/notes/saisie" },
              { label: "Classement", path: "/notes/classement" },
              { label: "Bulletins", path: "/notes/bulletin" },
            ].map(item => (
              <button key={item.path} onClick={() => navigate(item.path)}
                className="py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.97]"
                style={{ background: "linear-gradient(135deg,#667eea,#764ba2)", boxShadow: "0 2px 8px rgba(102,126,234,0.3)" }}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}