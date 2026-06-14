// src/components/layout/PageLayout.tsx — Header premium réutilisable
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageLayoutProps {
  title:      string;
  subtitle?:  string;
  backTo?:    string;         // chemin explicite — si absent, utilise navigate(-1)
  backLabel?: string;
  actions?:   React.ReactNode;
  children:   React.ReactNode;
  maxWidth?:  "sm" | "md" | "lg" | "xl" | "full";
  noPad?:     boolean;
  accent?:    string;         // couleur CSS de la barre d'accent en haut
}

const MAX_WIDTHS = {
  sm:   "max-w-2xl",
  md:   "max-w-4xl",
  lg:   "max-w-6xl",
  xl:   "max-w-[1400px]",
  full: "max-w-none",
};

export default function PageLayout({
  title, subtitle, backTo, backLabel = "Retour",
  actions, children, maxWidth = "xl", noPad = false, accent,
}: PageLayoutProps) {
  const navigate = useNavigate();

  function handleBack() {
    backTo ? navigate(backTo) : navigate(-1);
  }

  return (
    <div className="min-h-[calc(100vh-56px)]" style={{ background: "var(--bg-app)" }}>

      {/* Barre d'accent colorée (optionnelle, pour chaque module) */}
      {accent && <div className="h-[3px] w-full" style={{ background: accent }} />}

      {/* Header sticky */}
      <div
        className="sticky top-0 z-10 border-b"
        style={{
          background: "rgba(247,248,252,0.92)",
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          borderColor: "var(--border)",
        }}
      >
        <div className={`${MAX_WIDTHS[maxWidth]} mx-auto px-5`}>
          <div className="flex items-center justify-between h-[52px] gap-4">

            {/* Gauche : bouton retour + titre */}
            <div className="flex items-center gap-2.5 min-w-0">
              <button onClick={handleBack} className="btn-back flex-shrink-0">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-xs">{backLabel}</span>
              </button>

              <div className="w-px h-4 flex-shrink-0" style={{ background: "var(--border)" }} />

              <div className="min-w-0">
                <h1 className="page-title truncate">{title}</h1>
                {subtitle && <p className="page-subtitle hidden sm:block truncate">{subtitle}</p>}
              </div>
            </div>

            {/* Droite : actions */}
            {actions && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className={`${MAX_WIDTHS[maxWidth]} mx-auto ${noPad ? "" : "px-5 py-5"} space-y-5 animate-fade-in`}>
        {children}
      </div>
    </div>
  );
}
