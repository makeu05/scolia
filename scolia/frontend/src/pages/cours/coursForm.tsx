import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, BookOpen } from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import { getCoursById, createCours, updateCours, type CoursPayload } from "../../service/cours_service";
import { authFetch } from "../../service/auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export default function CoursForm() {
  const { idCours } = useParams<{ idCours?: string }>();
  const navigate    = useNavigate();
  const isEditing   = !!idCours;

  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  const [form, setForm] = useState<CoursPayload>({
    libelle: "", coefficient: 1, description: "", idClasse: "", idAdmin: "1",
  });

  // Charger les classes
  useEffect(() => {
    authFetch(`${API}/classes`)
      .then(r => r.json())
      .then(data => setClasses(data.data ?? data))
      .catch(() => setClasses([]));
  }, []);

  // Charger le cours en mode édition
  useEffect(() => {
    if (!isEditing || !idCours) return;
    setLoading(true);
    getCoursById(idCours).then(cours => {
      setForm({
        libelle: cours.libelle,
        coefficient: cours.coefficient || 1,
        description: cours.description || "",
        idClasse: cours.idClasse,
        idAdmin: String(cours.idAdmin ?? "1"),
      });
    }).catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [idCours, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === "idClasse" || name === "coefficient" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      isEditing ? await updateCours(idCours!, form) : await createCours(form);
      navigate("/cours");
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  // Classe sélectionnée pour l'aperçu
  const classeSelectee = classes.find(c => String(c.idClasse) === String(form.idClasse));

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="space-y-3 w-full max-w-md px-6">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <PageLayout
      title={isEditing ? "Modifier le cours" : "Nouveau cours"}
      subtitle={isEditing ? `Cours #${idCours}` : "Ajouter un cours à la structure pédagogique"}
      backTo="/cours"
    >
      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-4xl">

        {/* Aperçu */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-emerald-600" />
            </div>

            <h3 className="font-semibold text-slate-900 text-base mb-1" style={{ letterSpacing: "-0.01em" }}>
              {form.libelle || <span className="text-slate-400 font-normal">Nom du cours…</span>}
            </h3>

            {classeSelectee && (
              <p className="text-sm text-slate-500 mt-1">
                {classeSelectee.libelle}
                {classeSelectee.cycle?.libelle && ` · ${classeSelectee.cycle.libelle}`}
              </p>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Coefficient</span>
                <span className="font-semibold text-slate-900">×{form.coefficient || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Classe</span>
                <span className="font-medium text-slate-700">{classeSelectee?.libelle || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="lg:col-span-2 space-y-5">

          <div className="card p-5 space-y-4">
            <h3 className="section-title">Informations du cours</h3>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Libellé *</label>
              <input
                required
                name="libelle"
                value={form.libelle}
                onChange={handleChange}
                placeholder="ex: Mathématiques, Physique-Chimie…"
                className="input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Coefficient *</label>
                <input
                  type="number" step="0.5" min="0.5"
                  name="coefficient"
                  value={form.coefficient}
                  onChange={handleChange}
                  required
                  className="input"
                />
                <p className="text-xs text-slate-400">Poids dans la moyenne générale</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Classe *</label>
                <select
                  required
                  name="idClasse"
                  value={form.idClasse}
                  onChange={handleChange}
                  className="input appearance-none"
                >
                  <option value="">Sélectionner une classe</option>
                  {classes.map(c => (
                    <option key={c.idClasse} value={c.idClasse}>
                      {c.libelle}{c.cycle?.libelle ? ` — ${c.cycle.libelle}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Décrivez le contenu du cours (optionnel)…"
                className="input resize-none"
              />
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 justify-center py-3 disabled:opacity-60"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enregistrement…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {isEditing ? "Enregistrer les modifications" : "Créer le cours"}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/cours")}
              className="btn-secondary px-8"
            >
              Annuler
            </button>
          </div>

        </div>
      </form>
    </PageLayout>
  );
}