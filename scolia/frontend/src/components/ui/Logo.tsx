// src/components/ui/Logo.tsx
// Composant logo SCOLIA — utilisable partout dans l'app

interface LogoProps {
    variant?: "full" | "icon" | "pdf";
    theme?: "light" | "dark";
    size?: "sm" | "md" | "lg";
    className?: string;
  }
  
  // Dimensions selon la taille
  const SIZES = {
    sm: { icon: 28, fontSize: 16, total: 120 },
    md: { icon: 36, fontSize: 20, total: 150 },
    lg: { icon: 44, fontSize: 24, total: 180 },
  };
  
  export default function Logo({
    variant = "full",
    theme = "light",
    size = "md",
    className = "",
  }: LogoProps) {
    const s = SIZES[size];
    const i = s.icon;
  
    // Couleurs selon le thème
    const bgColor    = theme === "dark" ? "rgba(255,255,255,0.12)" : "#0f1f3d";
    const strokeColor = "white";
    const accentColor = theme === "dark" ? "#60a5fa" : "#3b82f6";
    const textColor  = theme === "dark" ? "white" : "#0f1f3d";
  
    // Chemin du S adapté à la taille de l'icône
           // centre X
    const left  = i * 0.22; // bord gauche du S
    const right = i * 0.72; // bord droit du S
    const y1 = i * 0.28;    // haut
    const y2 = i * 0.50;    // milieu
    const y3 = i * 0.72;    // bas
    const sw  = Math.max(2, i * 0.075); // stroke-width
  
    // Petit carré accent
    const dotSize = Math.max(3, i * 0.11);
    const dotX    = right - dotSize / 2;
    const dotY    = i * 0.13;
    const dotRx   = Math.max(1, dotSize * 0.35);
  
    const SIcon = () => (
      <svg width={i} height={i} viewBox={`0 0 ${i} ${i}`} fill="none">
        <rect width={i} height={i} rx={i * 0.22} fill={bgColor} />
        <path
          d={`M${right} ${y1} C${right} ${y1} ${left} ${y1 - i*0.02} ${left} ${y2} C${left} ${y2 + i*0.14} ${right} ${y2 - i*0.02} ${right} ${y3} C${right} ${y3 + i*0.14} ${left} ${y3 + i*0.02} ${left} ${y3 + i*0.02}`}
          stroke={strokeColor}
          strokeWidth={sw}
          strokeLinecap="round"
          fill="none"
        />
        <rect x={dotX} y={dotY} width={dotSize} height={dotSize} rx={dotRx} fill={accentColor} />
      </svg>
    );
  
    // Variante icône seule
    if (variant === "icon") {
      return (
        <span className={className}>
          <SIcon />
        </span>
      );
    }
  
    // Variante PDF — avec sous-titre
    if (variant === "pdf") {
      const pdfIconSize = 32;
      const pdfI = pdfIconSize;
      const pLeft  = pdfI * 0.22;
      const pRight = pdfI * 0.72;
      const pY1 = pdfI * 0.28; const pY2 = pdfI * 0.50; const pY3 = pdfI * 0.72;
      const pSw = Math.max(2, pdfI * 0.075);
      const pDotSize = Math.max(3, pdfI * 0.11);
      const pDotX = pRight - pDotSize / 2;
      const pDotY = pdfI * 0.13;
      const pDotRx = Math.max(1, pDotSize * 0.35);
  
      return (
        <div className={`flex items-center gap-3 ${className}`}>
          <svg width={pdfIconSize} height={pdfIconSize} viewBox={`0 0 ${pdfI} ${pdfI}`} fill="none">
            <rect width={pdfI} height={pdfI} rx={pdfI * 0.22} fill="#0f1f3d" />
            <path
              d={`M${pRight} ${pY1} C${pRight} ${pY1} ${pLeft} ${pY1 - pdfI*0.02} ${pLeft} ${pY2} C${pLeft} ${pY2 + pdfI*0.14} ${pRight} ${pY2 - pdfI*0.02} ${pRight} ${pY3} C${pRight} ${pY3 + pdfI*0.14} ${pLeft} ${pY3 + pdfI*0.02} ${pLeft} ${pY3 + pdfI*0.02}`}
              stroke="white"
              strokeWidth={pSw}
              strokeLinecap="round"
              fill="none"
            />
            <rect x={pDotX} y={pDotY} width={pDotSize} height={pDotSize} rx={pDotRx} fill="#3b82f6" />
          </svg>
          <div>
            <p className="font-bold text-slate-900 leading-none" style={{ fontSize: 18, letterSpacing: "-0.03em" }}>
              SCOLIA
            </p>
            <p className="text-slate-400 leading-none mt-1" style={{ fontSize: 11 }}>
              Système de Gestion Scolaire
            </p>
          </div>
        </div>
      );
    }
  
    // Variante complète (défaut) — icône + texte
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <SIcon />
        <div>
          <p
            className="font-bold leading-none"
            style={{
              fontSize: s.fontSize,
              letterSpacing: "-0.03em",
              color: textColor,
            }}
          >
            SCOLIA
          </p>
          {size === "lg" && (
            <p className="leading-none mt-0.5" style={{ fontSize: 11, color: theme === "dark" ? "rgba(255,255,255,0.4)" : "#94a3b8" }}>
              Gestion Scolaire
            </p>
          )}
        </div>
      </div>
    );
  }