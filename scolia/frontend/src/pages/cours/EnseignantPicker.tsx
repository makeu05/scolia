// components/cours/EnseignantPicker.tsx
// Composant réutilisable : dropdown de sélection + bouton affecter/désaffecter
// Utilisé dans CoursForm (ajout) ET CoursDetail (consultation)

import { useEffect, useState } from "react";
import { Users, UserCheck, UserMinus, ChevronDown, Loader2 } from "lucide-react";
import {
  getEnseignantsDisponibles,
  affecterEnseignant,
  desaffecterEnseignant,
  type EnseignantDisponible,
} from "../../service/cours_service";

interface Props {
  /** ID du cours — null si le cours n'est pas encore créé (mode création) */
  idCours?: string | number | null;
  /** Appelé après une affectation/désaffectation réussie pour rafraîchir le parent */
  onChanged?: () => void;
  /**
   * Mode formulaire : l'affectation n'est pas envoyée immédiatement,
   * on remonte juste l'idEnseignant choisi via onChange.
   */
  formMode?: boolean;
  onChange?: (idEnseignant: number | null) => void;
  /** Valeur initiale en mode formulaire */
  value?: number | null;
}

export default function EnseignantPicker({
  idCours,
  onChanged,
  formMode = false,
  onChange,
  value,
}: Props) {
  const [enseignants, setEnseignants] = useState<EnseignantDisponible[]>([]);
  const [loading, setLoading]         = useState(false);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");
  const [selected, setSelected]       = useState<number | null>(value ?? null);
  const [open, setOpen]               = useState(false);

  // ── Charger la liste ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!idCours && !formMode) return;

    // En mode formulaire sans idCours, on ne peut pas charger les disponibles
    // On charge quand même si idCours est fourni
    if (!idCours) return;

    setLoading(true);
    getEnseignantsDisponibles(idCours)
      .then((data) => {
        setEnseignants(data);
        // Présélectionner l'enseignant déjà affecté
        const affecte = data.find((e) => e.affecte);
        if (affecte) setSelected(affecte.idEnseignant);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [idCours]);

  // ── Synchroniser la valeur externe (mode formulaire contrôlé) ────────────
  useEffect(() => {
    if (value !== undefined) setSelected(value);
  }, [value]);

  // ── Sélection ─────────────────────────────────────────────────────────────
  const handleSelect = (e: EnseignantDisponible) => {
    setSelected(e.idEnseignant);
    setOpen(false);
    if (formMode) onChange?.(e.idEnseignant);
  };

  // ── Affecter (mode détail) ────────────────────────────────────────────────
  const handleAffecter = async () => {
    if (!selected || !idCours) return;
    setSaving(true);
    setError("");
    try {
      await affecterEnseignant(idCours, selected);
      onChanged?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Désaffecter (mode détail) ─────────────────────────────────────────────
  const handleDesaffecter = async () => {
    if (!idCours) return;
    if (!confirm("Désaffecter l'enseignant de ce cours ?")) return;
    setSaving(true);
    setError("");
    try {
      await desaffecterEnseignant(idCours);
      setSelected(null);
      onChanged?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const currentTeacher = enseignants.find((e) => e.idEnseignant === selected);
  const alreadyAffected = enseignants.find((e) => e.affecte);
  const hasChanged = selected !== (alreadyAffected?.idEnseignant ?? null);

  // ── Rendu ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm py-3">
        <Loader2 className="w-4 h-4 animate-spin" />
        Chargement des enseignants…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm hover:border-violet-300 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-200"
        >
          {currentTeacher ? (
            <span className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-xs font-bold text-violet-600 flex-shrink-0">
                {currentTeacher.prenom?.[0]}{currentTeacher.nom?.[0]}
              </span>
              <span className="font-medium text-slate-900">
                {currentTeacher.prenom} {currentTeacher.nom}
              </span>
              {currentTeacher.affecte && (
                <span className="text-xs px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">
                  Actuel
                </span>
              )}
            </span>
          ) : (
            <span className="flex items-center gap-2 text-slate-400">
              <Users className="w-4 h-4" />
              Sélectionner un enseignant…
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {/* Options */}
        {open && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
            {enseignants.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                Aucun enseignant disponible
              </p>
            ) : (
              <ul className="max-h-52 overflow-y-auto divide-y divide-slate-50">
                {/* Option vide */}
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(null);
                      setOpen(false);
                      if (formMode) onChange?.(null);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-50 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    Aucun enseignant
                  </button>
                </li>
                {enseignants.map((e) => (
                  <li key={e.idEnseignant}>
                    <button
                      type="button"
                      onClick={() => handleSelect(e)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-violet-50 transition-colors ${
                        selected === e.idEnseignant
                          ? "bg-violet-50 text-violet-700"
                          : "text-slate-700"
                      }`}
                    >
                      <span className="w-7 h-7 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-xs font-bold text-violet-600 flex-shrink-0">
                        {e.prenom?.[0]}{e.nom?.[0]}
                      </span>
                      <span className="flex-1 text-left font-medium">
                        {e.prenom} {e.nom}
                      </span>
                      {e.affecte && (
                        <span className="text-xs px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">
                          Actuel
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}

      {/* Boutons d'action — seulement en mode détail */}
      {!formMode && idCours && (
        <div className="flex gap-2">
          {/* Affecter / Changer */}
          {selected && hasChanged && (
            <button
              type="button"
              onClick={handleAffecter}
              disabled={saving}
              className="btn-primary gap-2 flex-1 text-sm"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserCheck className="w-4 h-4" />
              )}
              {alreadyAffected ? "Changer l'enseignant" : "Affecter"}
            </button>
          )}

          {/* Désaffecter */}
          {alreadyAffected && (
            <button
              type="button"
              onClick={handleDesaffecter}
              disabled={saving}
              className="btn-secondary gap-2 text-red-500 hover:bg-red-50 border-red-200 text-sm"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserMinus className="w-4 h-4" />
              )}
              Désaffecter
            </button>
          )}
        </div>
      )}
    </div>
  );
}