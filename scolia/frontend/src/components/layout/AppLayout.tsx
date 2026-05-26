// src/components/layout/AppLayout.tsx
// Layout principal — TopNav + contenu de la page

import { useState, useEffect } from "react";
import { authFetch } from "../../service/auth";
import TopNav from "./TopNav";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [annees, setAnnees]         = useState<{ idAnnee: number; libelle: string }[]>([]);
  const [selectedAnnee, setSelectedAnnee] = useState<string>("");

  useEffect(() => {
    authFetch(`${API}/annees`)
      .then(r => r.json())
      .then((data: any) => {
        const list = Array.isArray(data) ? data : (data.data ?? []);
        setAnnees(list);
        if (list.length > 0) {
          setSelectedAnnee(String(list[list.length - 1].idAnnee));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopNav
        annees={annees}
        selectedAnnee={selectedAnnee}
        onAnneeChange={setSelectedAnnee}
      />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}