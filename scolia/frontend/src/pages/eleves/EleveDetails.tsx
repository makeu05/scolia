import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authFetch } from "../../service/auth";
import {
  Edit, Trash2, User, Calendar, MapPin, Globe,
  GraduationCap, Wallet, AlertTriangle, ChevronRight,
} from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import ParentsSection from "./ParentsSection";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

interface EleveDetails {
  matricule: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  sexe: number;
  actif: number;
  photoURL?: string;
  langue?: string;
  idVilleNaissance?: number;
  villeNaissance?: { libelle: string };
}

const SEXE: Record<number, { label: string; color: string }> = {
  0: { label: "Fille",   color: "bg-pink-50 text-pink-700 ring-pink-100" },
  1: { label: "Garçon",  color: "bg-blue-50 text-blue-700 ring-blue-100" },
  2: { label: "Autre",   color: "bg-slate-50 text-slate-600 ring-slate-100" },
};

type Tab = "profil" | "parents" | "finance";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profil",  label: "Profil",  icon: User },
  { id: "parents", label: "Parents", icon: GraduationCap },
  { id: "finance", label: "Finance", icon: Wallet },
];

export default function EleveDetails() {
  const { matricule } = useParams<{ matricule: string }>();
  const navigate      = useNavigate();
  const [eleve, setEleve]   = useState<EleveDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const [tab, setTab]       = useState<Tab>("profil");

  useEffect(() => {
    if (!matricule) return;
    setLoading(true);
    authFetch(`${API}/eleves/${matricule}`)
      .then(r => { if (!r.ok) throw new Error("Élève non trouvé"); return r.json(); })
      .then(setEleve)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [matricule]);

  const handleDelete = async () => {
    if (!confirm("Supprimer définitivement cet élève ? Action irréversible.")) return;
    try {
      await authFetch(`${API}/eleves/${matricule}`, { method: "DELETE" });
      navigate("/eleves");
    } catch { alert("Erreur lors de la suppression"); }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="space-y-3 w-full max-w-md px-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-12 rounded-2xl" />
        ))}
      </div>
    </div>
  );

  if (error || !eleve) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 mb-3">{error || "Élève non trouvé"}</p>
        <button onClick={() => navigate("/eleves")} className="btn-secondary">
          Retour à la liste
        </button>
      </div>
    </div>
  );

  const sexeInfo = SEXE[eleve.sexe] ?? SEXE[2];
  const initiales = `${eleve.prenom[0]}${eleve.nom[0]}`.toUpperCase();
  const photoSrc = eleve.photoURL && eleve.photoURL !== "INDEFINI"
    ? (eleve.photoURL.startsWith("http") ? eleve.photoURL : `http://localhost:8000/storage/${eleve.photoURL}`)
    : null;

  return (
    <PageLayout
      title={`${eleve.prenom} ${eleve.nom}`}
      subtitle={`Matricule ${eleve.matricule}`}
      backTo="/eleves"
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/eleves/${matricule}/modifier`)}
            className="btn-secondary gap-2"
          >
            <Edit className="w-4 h-4" /> Modifier
          </button>
          <button onClick={handleDelete} className="btn-secondary gap-2 text-red-600 hover:bg-red-50 border-red-200">
            <Trash2 className="w-4 h-4" /> Supprimer
          </button>
        </div>
      }
    >
      {/* Hero card */}
      <div className="card p-6">
        <div className="flex items-start gap-5">
          {/* Avatar / photo */}
          <div className="flex-shrink-0">
            {photoSrc ? (
              <img src={photoSrc} alt={`${eleve.prenom} ${eleve.nom}`}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-200" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">{initiales}</span>
              </div>
            )}
          </div>

          {/* Infos principales */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900" style={{ letterSpacing: "-0.02em" }}>
                {eleve.prenom} <span className="uppercase">{eleve.nom}</span>
              </h2>
              <span className={`badge ring-1 ${sexeInfo.color}`}>{sexeInfo.label}</span>
              <span className={`badge ring-1 ${eleve.actif ? "badge-green" : "badge-gray"}`}>
                {eleve.actif ? "Actif" : "Archivé"}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(eleve.dateNaissance).toLocaleDateString("fr-FR", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin className="w-3.5 h-3.5" />
                {eleve.villeNaissance?.libelle || eleve.lieuNaissance}
              </div>
              {eleve.langue && (
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Globe className="w-3.5 h-3.5" />
                  {eleve.langue}
                </div>
              )}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="hidden md:flex flex-col gap-2">
            <button onClick={() => navigate(`/notes/bulletin?matricule=${matricule}`)}
              className="btn-ghost text-xs gap-1.5">
              Voir bulletin <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => navigate(`/paiements/suivi?matricule=${matricule}`)}
              className="btn-ghost text-xs gap-1.5">
              Suivi paiements <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
              tab === t.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "profil" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
          <div className="card p-5 space-y-4">
            <h3 className="section-title">Informations personnelles</h3>
            <div className="divider" />
            {[
              { label: "Nom complet",        value: `${eleve.prenom} ${eleve.nom.toUpperCase()}` },
              { label: "Matricule",          value: String(eleve.matricule) },
              { label: "Date de naissance",  value: new Date(eleve.dateNaissance).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) },
              { label: "Lieu de naissance",  value: eleve.lieuNaissance },
              { label: "Ville de naissance", value: eleve.villeNaissance?.libelle ?? "—" },
              { label: "Sexe",               value: sexeInfo.label },
              { label: "Langue",             value: eleve.langue ?? "—" },
            ].map(row => (
              <div key={row.label} className="flex justify-between gap-3">
                <span className="text-sm text-slate-400">{row.label}</span>
                <span className="text-sm font-medium text-slate-900 text-right">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="card p-5">
            <h3 className="section-title mb-4">Actions rapides</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Modifier le profil",   path: `/eleves/${matricule}/modifier`,         icon: Edit,          color: "bg-blue-50 hover:bg-blue-100 text-blue-700" },
                { label: "Voir les notes",        path: `/notes/bulletin?matricule=${matricule}`, icon: GraduationCap, color: "bg-violet-50 hover:bg-violet-100 text-violet-700" },
                { label: "Suivi paiements",       path: `/paiements/suivi?matricule=${matricule}`, icon: Wallet,       color: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700" },
                { label: "Incidents discipline",  path: `/discipline?matricule=${matricule}`,    icon: AlertTriangle, color: "bg-amber-50 hover:bg-amber-100 text-amber-700" },
              ].map(item => (
                <button key={item.path} onClick={() => navigate(item.path)}
                  className={`flex flex-col items-start gap-2 p-4 rounded-2xl text-left transition-all duration-150 active:scale-[0.97] ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                  <p className="text-xs font-semibold leading-snug">{item.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "parents" && (
        <div className="animate-fade-in">
          <ParentsSection matricule={eleve.matricule} />
        </div>
      )}

      {tab === "finance" && (
        <div className="card p-8 text-center animate-fade-in">
          <Wallet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">
            Consultez le suivi complet des paiements
          </p>
          <button
            onClick={() => navigate(`/paiements/suivi?matricule=${matricule}`)}
            className="btn-primary mt-4 mx-auto"
          >
            Voir le suivi financier
          </button>
        </div>
      )}
    </PageLayout>
  );
}