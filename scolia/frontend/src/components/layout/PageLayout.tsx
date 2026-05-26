// src/components/layout/PageLayout.tsx
// Header de page réutilisable — s'insère dans AppLayout

import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

const MAX_WIDTHS = {
  sm:   "max-w-2xl",
  md:   "max-w-4xl",
  lg:   "max-w-6xl",
  xl:   "max-w-[1400px]",
  full: "max-w-none",
};

export default function PageLayout({
  title, subtitle, backTo, actions, children, maxWidth = "xl",
}: PageLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50">
      <div className={`${MAX_WIDTHS[maxWidth]} mx-auto px-6 py-6 space-y-6`}>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {backTo && (
              <button
                onClick={() => navigate(backTo)}
                className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-700 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-slate-900" style={{ letterSpacing: "-0.02em" }}>
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>

        {/* Contenu */}
        {children}
      </div>
    </div>
  );
}