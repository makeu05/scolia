// src/context/AnneeContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { authFetch } from "../service/auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

interface Annee {
  idAnnee: number;
  libelle: string;
  periode: string;
  statut: "brouillon" | "active" | "cloturee";
}

interface AnneeContextType {
  anneeActive: Annee | null;
  annees: Annee[];
  idAca: string;
  setIdAca: (id: string) => void;
  loading: boolean;
  reload: () => void;
}

const AnneeContext = createContext<AnneeContextType | null>(null);

export function AnneeProvider({ children }: { children: React.ReactNode }) {
  const [annees, setAnnees]           = useState<Annee[]>([]);
  const [idAca, setIdAcaState]        = useState<string>(() => localStorage.getItem("idAca") ?? "");
  const [loading, setLoading]         = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res  = await authFetch(`${API}/annees`);
      const data = await res.json();
      const list: Annee[] = Array.isArray(data) ? data : (data.data ?? []);
      setAnnees(list);

      // Priorité : année active → dernière année → rien
      const active = list.find(a => a.statut === "active");
      const stored = localStorage.getItem("idAca");
      const exists = list.find(a => String(a.idAnnee) === stored);

      if (!exists) {
        // Si l'année stockée n'existe plus, prendre l'active ou la dernière
        const defaut = active ?? list[list.length - 1] ?? null;
        if (defaut) {
          setIdAcaState(String(defaut.idAnnee));
          localStorage.setItem("idAca", String(defaut.idAnnee));
        }
      } else if (active && String(active.idAnnee) !== stored) {
        // Si une année est active et différente de celle stockée, la préférer
        setIdAcaState(String(active.idAnnee));
        localStorage.setItem("idAca", String(active.idAnnee));
      }
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const setIdAca = (id: string) => {
    setIdAcaState(id);
    localStorage.setItem("idAca", id);
  };

  const anneeActive = annees.find(a => String(a.idAnnee) === idAca) ?? null;

  return (
    <AnneeContext.Provider value={{ anneeActive, annees, idAca, setIdAca, loading, reload: load }}>
      {children}
    </AnneeContext.Provider>
  );
}

export function useAnnee() {
  const ctx = useContext(AnneeContext);
  if (!ctx) throw new Error("useAnnee must be used inside AnneeProvider");
  return ctx;
}