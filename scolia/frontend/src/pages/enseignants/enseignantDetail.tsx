import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Edit, Phone, BookOpen, UserCheck, UserX, Calendar, MapPin } from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import { getEnseignant, desactiverEnseignant, reactiverEnseignant } from "../../service/enseignant_service";
import { getFichesByEnseignant } from "../../service/fiche_enseignant_service";

export default function EnseignantDetail() {
  const { idEnseignant } = useParams<{ idEnseignant: string }>();
  const navigate = useNavigate();

  const [enseignant, setEnseignant] = useState<any>(null);
  const [fiches, setFiches]         = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [enseignantData, fichesData] = await Promise.all([
        getEnseignant(idEnseignant!),
        getFichesByEnseignant(idEnseignant!),
      ]);
      setEnseignant(enseignantData);
      setFiches(fichesData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (idEnseignant) loadData(); }, [idEnseignant]);

  const toggleStatut = async () => {
    if (!enseignant) return;
    try {
      enseignant.Actif
        ? await desactiverEnseignant(enseignant.idEnseignant)
        : await reactiverEnseignant(enseignant.idEnseignant);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
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

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 mb-3">{error}</p>
        <button onClick={() => navigate("/enseignants")} className="btn-secondary">Retour</button>
      </div>
    </div>
  );

  const initiales = `${enseignant?.personne?.prenom?.[0] ?? ""}${enseignant?.personne?.nom?.[0] ?? ""}`.toUpperCase();

  return (
    <PageLayout
      title={`${enseignant?.personne?.prenom} ${enseignant?.personne?.nom}`}
      subtitle="Fiche enseignant"
      backTo="/enseignants"
      actions={
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/enseignants/${idEnseignant}/modifier`)}
            className="btn-secondary gap-2"
          >
            <Edit className="w-4 h-4" /> Modifier
          </button>
          <button
            onClick={toggleStatut}
            className={`btn-secondary gap-2 ${
              enseignant?.Actif
                ? "text-red-600 hover:bg-red-50 border-red-200"
                : "text-emerald-600 hover:bg-emerald-50 border-emerald-200"
            }`}
          >
            {enseignant?.Actif
              ? <><UserX className="w-4 h-4" /> Désactiver</>
              : <><UserCheck className="w-4 h-4" /> Activer</>}
          </button>
        </div>
      }
    >
      {/* Hero */}
      <div className="card p-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-violet-600">{initiales}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900" style={{ letterSpacing: "-0.02em" }}>
                {enseignant?.personne?.prenom} {enseignant?.personne?.nom?.toUpperCase()}
              </h2>
              <span className={`badge ring-1 ${enseignant?.Actif ? "badge-green" : "badge-red"}`}>
                {enseignant?.Actif ? "Actif" : "Inactif"}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              {enseignant?.personne?.mobile && (
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Phone className="w-3.5 h-3.5" />
                  {enseignant.personne.mobile}
                </div>
              )}
              {enseignant?.personne?.dateNaissance && (
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(enseignant.personne.dateNaissance).toLocaleDateString("fr-FR")}
                </div>
              )}
              {enseignant?.personne?.lieuNaissance && (
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin className="w-3.5 h-3.5" />
                  {enseignant.personne.lieuNaissance}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Cours assigné */}
        <div className="card p-5">
          <h3 className="section-title mb-4">Cours enseigné</h3>
          {enseignant?.cours ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900">{enseignant.cours.libelle}</p>
                  {enseignant.cours.classe && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {enseignant.cours.classe.libelle} · Coeff. {enseignant.cours.coefficient}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">Aucun cours assigné</p>
          )}
        </div>

        {/* Infos compte */}
        <div className="card p-5 md:col-span-2">
          <h3 className="section-title mb-4">Informations du compte</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Nom d'utilisateur", value: enseignant?.personne?.username ?? "—" },
              { label: "Type",              value: "Enseignant" },
              { label: "ID enseignant",     value: `#${enseignant?.idEnseignant}` },
              { label: "Contact",           value: enseignant?.personne?.phone || enseignant?.personne?.mobile || "—" },
            ].map(row => (
              <div key={row.label} className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">{row.label}</p>
                <p className="text-sm font-medium text-slate-900">{row.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fiches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">
            Fiches disciplinaires
            {fiches.length > 0 && (
              <span className="ml-2 text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {fiches.length}
              </span>
            )}
          </h3>
          <button
            onClick={() => navigate(`/enseignants/${idEnseignant}/fiches/nouveau`)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" /> Nouvelle fiche
          </button>
        </div>

        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Libellé</th>
                <th className="table-th">Date</th>
                <th className="table-th">Points</th>
                <th className="table-th">Commentaire</th>
              </tr>
            </thead>
            <tbody>
              {fiches.length === 0 ? (
                <tr>
                  <td colSpan={4} className="table-td text-center py-12 text-slate-400 text-sm">
                    Aucune fiche enregistrée
                  </td>
                </tr>
              ) : (
                fiches.map(f => (
                  <tr key={f.idRap} className="table-row-hover">
                    <td className="table-td font-medium text-slate-900">{f.libelle}</td>
                    <td className="table-td text-sm text-slate-600">
                      {new Date(f.event_date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="table-td">
                      <span className={`badge ${f.points > 0 ? "badge-green" : "badge-red"}`}>
                        {f.points > 0 ? `+${f.points}` : f.points}
                      </span>
                    </td>
                    <td className="table-td text-sm text-slate-500">{f.commentaire || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  );
}