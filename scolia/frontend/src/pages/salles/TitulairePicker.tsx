// components/salles/TitulairePicker.tsx
// Composant réutilisable : affecter/désaffecter/changer le prof principal d'une salle
// Utilisé dans SalleDetail et SalleForm

import { useEffect, useState } from 'react';
import { Users, UserCheck, UserMinus, ChevronDown, Loader2, History } from 'lucide-react';
import {
  getEnseignantsDisponiblesTitulaire,
  affecterTitulaire,
  desaffecterTitulaire,
  getHistoriqueTitulaire,
  type EnseignantDisponibleTitulaire,
  type Titulaire,
} from '../../service/titulaire_service';

interface Props {
  idSalle: number | string;
  /** Appelé après chaque changement pour rafraîchir le parent */
  onChanged?: () => void;
}

export default function TitulairePicker({ idSalle, onChanged }: Props) {
  const [enseignants, setEnseignants] = useState<EnseignantDisponibleTitulaire[]>([]);
  const [historique, setHistorique]   = useState<Titulaire[]>([]);
  const [loading, setLoading]         = useState(false);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');
  const [selected, setSelected]       = useState<number | null>(null);
  const [open, setOpen]               = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const load = () => {
    setLoading(true);
    getEnseignantsDisponiblesTitulaire(idSalle)
      .then((data) => {
        setEnseignants(data);
        const current = data.find((e) => e.titulaire);
        if (current) setSelected(current.idPers);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [idSalle]);

  const loadHistory = () => {
    getHistoriqueTitulaire(idSalle).then(setHistorique).catch(() => {});
    setShowHistory((v) => !v);
  };

  const handleAffecter = async () => {
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      const idAdmin = Number(localStorage.getItem('idAdmin') ?? 1);
      await affecterTitulaire(idSalle, selected, idAdmin);
      load();
      onChanged?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDesaffecter = async () => {
    if (!confirm('Désaffecter le prof principal de cette salle ?')) return;
    setSaving(true);
    setError('');
    try {
      await desaffecterTitulaire(idSalle);
      setSelected(null);
      load();
      onChanged?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const currentTeacher = enseignants.find((e) => e.idPers === selected);
  const alreadyTitulaire = enseignants.find((e) => e.titulaire);
  const hasChanged = selected !== (alreadyTitulaire?.idPers ?? null);

  if (loading) return (
    <div className="flex items-center gap-2 text-slate-400 text-sm py-3">
      <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
    </div>
  );

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
              {currentTeacher.titulaire && (
                <span className="text-xs px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">
                  Titulaire actuel
                </span>
              )}
            </span>
          ) : (
            <span className="flex items-center gap-2 text-slate-400">
              <Users className="w-4 h-4" />
              Sélectionner un prof principal…
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
            <ul className="max-h-52 overflow-y-auto divide-y divide-slate-50">
              <li>
                <button
                  type="button"
                  onClick={() => { setSelected(null); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-50"
                >
                  <Users className="w-4 h-4" /> Aucun titulaire
                </button>
              </li>
              {enseignants.length === 0 && (
                <li className="text-center text-sm text-slate-400 py-4">
                  Aucun enseignant disponible
                </li>
              )}
              {enseignants.map((e) => (
                <li key={e.idPers}>
                  <button
                    type="button"
                    onClick={() => { setSelected(e.idPers); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-violet-50 transition-colors ${
                      selected === e.idPers ? 'bg-violet-50 text-violet-700' : 'text-slate-700'
                    }`}
                  >
                    <span className="w-7 h-7 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-xs font-bold text-violet-600 flex-shrink-0">
                      {e.prenom?.[0]}{e.nom?.[0]}
                    </span>
                    <span className="flex-1 text-left">
                      <span className="font-medium">{e.prenom} {e.nom}</span>
                      {e.mobile && <span className="text-xs text-slate-400 ml-2">{e.mobile}</span>}
                    </span>
                    {e.titulaire && (
                      <span className="text-xs px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full">
                        Actuel
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Erreur */}
      {error && <p className="text-xs text-red-500">⚠ {error}</p>}

      {/* Boutons d'action */}
      <div className="flex gap-2">
        {selected && hasChanged && (
          <button
            type="button"
            onClick={handleAffecter}
            disabled={saving}
            className="btn-primary gap-2 flex-1 text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
            {alreadyTitulaire ? "Changer le titulaire" : "Affecter comme titulaire"}
          </button>
        )}
        {alreadyTitulaire && (
          <button
            type="button"
            onClick={handleDesaffecter}
            disabled={saving}
            className="btn-secondary gap-2 text-red-500 hover:bg-red-50 border-red-200 text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
            Désaffecter
          </button>
        )}
        <button
          type="button"
          onClick={loadHistory}
          className="btn-secondary gap-2 text-sm"
          title="Historique"
        >
          <History className="w-4 h-4" />
        </button>
      </div>

      {/* Historique */}
      {showHistory && (
        <div className="mt-2 border border-slate-100 rounded-2xl overflow-hidden">
          <p className="text-xs font-medium text-slate-500 px-4 py-2 bg-slate-50">
            Historique des titulaires
          </p>
          {historique.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-3">Aucun historique</p>
          ) : (
            <ul className="divide-y divide-slate-50">
              {historique.map((h) => (
                <li key={h.idTitulaire} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-sm text-slate-700">
                    {h.personne?.prenom} {h.personne?.nom}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    h.actif ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {h.actif ? 'Actif' : 'Ancien'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}