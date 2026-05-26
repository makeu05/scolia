import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit, Trash2, BookOpen, Users, Award } from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import { getCoursById, deleteCours, type Cours } from "../../service/cours_service";

export default function CoursDetail() {
  const { idCours }  = useParams<{ idCours: string }>();
  const navigate     = useNavigate();
  const [cours, setCours]     = useState<Cours | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!idCours) return;
    setLoading(true);
    getCoursById(idCours)
      .then(setCours)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [idCours]);

  const handleDelete = async () => {
    if (!confirm("Supprimer ce cours ? Action irréversible.")) return;
    try {
      await deleteCours(idCours!);
      navigate("/cours");
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="space-y-3 w-full max-w-md px-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-2xl" />
        ))}
      </div>
    </div>
  );

  if (error || !cours) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 mb-3">{error || "Cours non trouvé"}</p>
        <button onClick={() => navigate("/cours")} className="btn-secondary">Retour</button>
      </div>
    </div>
  );

  return (
    <PageLayout
      title={cours.libelle}
      subtitle={`ID cours #${cours.idCours}`}
      backTo="/cours"
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/cours/${cours.idCours}/modifier`)}
            className="btn-secondary gap-2"
          >
            <Edit className="w-4 h-4" /> Modifier
          </button>
          <button
            onClick={handleDelete}
            className="btn-secondary gap-2 text-red-600 hover:bg-red-50 border-red-200"
          >
            <Trash2 className="w-4 h-4" /> Supprimer
          </button>
        </div>
      }
    >
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Coefficient",
            value: `×${cours.coefficient ?? "—"}`,
            icon: Award,
            bg: "bg-amber-50", color: "text-amber-600",
          },
          {
            label: "Note max",
            value: cours.note ? `${cours.note}/20` : "20/20",
            icon: Award,
            bg: "bg-blue-50", color: "text-blue-600",
          },
          {
            label: "Classe",
            value: cours.classe?.libelle ?? "—",
            icon: Users,
            bg: "bg-violet-50", color: "text-violet-600",
          },
          {
            label: "Statut",
            value: cours.actif ? "Actif" : "Inactif",
            icon: BookOpen,
            bg: cours.actif ? "bg-emerald-50" : "bg-slate-50",
            color: cours.actif ? "text-emerald-600" : "text-slate-500",
          },
        ].map(kpi => (
          <div key={kpi.label} className="card p-4">
            <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <p className="text-lg font-bold text-slate-900" style={{ letterSpacing: "-0.02em" }}>
              {kpi.value}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Informations */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Informations du cours</h3>
          <div className="space-y-3">
            {[
              { label: "Matière",      value: cours.libelle },
              { label: "Classe",       value: cours.classe?.libelle ?? "—" },
              { label: "Cycle",        value: cours.classe?.cycle?.libelle ?? "—" },
              { label: "Coefficient",  value: String(cours.coefficient ?? "—") },
              { label: "Note max",     value: cours.note ? `${cours.note}/20` : "20/20" },
              { label: "Statut",       value: cours.actif ? "Actif" : "Inactif" },
            ].map(row => (
              <div key={row.label} className="flex justify-between gap-3 py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-400">{row.label}</span>
                <span className="text-sm font-medium text-slate-900">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Enseignant */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Enseignant assigné</h3>
          {cours.enseignant?.personne ? (
            <div
              className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => navigate(`/enseignants/${cours.enseignant?.idEnseignant}`)}
            >
              <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-violet-600">
                  {cours.enseignant.personne.prenom?.[0]}{cours.enseignant.personne.nom?.[0]}
                </span>
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {cours.enseignant.personne.prenom} {cours.enseignant.personne.nom}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {cours.enseignant.personne.mobile}
                </p>
              </div>
              <div className="ml-auto">
                <span className={`badge ${cours.enseignant.Actif ? "badge-green" : "badge-red"}`}>
                  {cours.enseignant.Actif ? "Actif" : "Inactif"}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
              <Users className="w-8 h-8 opacity-30" />
              <p className="text-sm">Aucun enseignant assigné</p>
              <button
                onClick={() => navigate(`/cours/${cours.idCours}/modifier`)}
                className="btn-secondary text-xs py-1.5 px-3 mt-1"
              >
                Assigner un enseignant
              </button>
            </div>
          )}

          {/* Description */}
          {cours.description && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-2">Description</p>
              <p className="text-sm text-slate-600 leading-relaxed">{cours.description}</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}