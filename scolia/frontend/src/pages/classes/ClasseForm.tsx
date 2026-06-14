import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, GraduationCap } from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import { authFetch } from "../../service/auth";
import {
  createClasse, getCycles, getClasse, updateClasse,
} from "../../service/classe_service";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export default function ClasseForm() {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const isEdit    = !!id;

  const [cycles, setCycles]     = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  const [form, setForm] = useState({
    libelle:   "",
    idCycle:   "",
    idSection: "",
    idAdmin:   "1",
  });

  async function load() {
    setLoading(true);
    try {
      const [c, s] = await Promise.all([
        getCycles(),
        authFetch(`${API}/sections`).then(r => r.json()),
      ]);
      setCycles(Array.isArray(c) ? c : []);
      setSections(Array.isArray(s) ? s : (s.data ?? []));

      if (isEdit && id) {
        const cl = await getClasse(Number(id));
        setForm({
          libelle:   cl.libelle,
          idCycle:   String(cl.idCycle),
          idSection: String(cl.idSection ?? ""),
          idAdmin:   "1",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        idSection: form.idSection || null,
      };
      if (isEdit) {
        await updateClasse(Number(id), payload);
      } else {
        await createClasse(payload);
      }
      navigate("/classes");
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const cycleSelectionne = cycles.find(c => String(c.idCycle) === form.idCycle);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="space-y-3 w-full max-w-md px-6">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <PageLayout
      title={isEdit ? "Modifier la classe" : "Nouvelle classe"}
      subtitle={isEdit ? `Classe #${id}` : "Ajouter une classe à la structure pédagogique"}
      backTo="/classes"
    >
      {error && <div className="alert-error">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-3xl">

        {/* Aperçu */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6 text-violet-600" />
            </div>
            <p className="font-bold text-slate-900 text-lg" style={{ letterSpacing: "-0.02em" }}>
              {form.libelle || <span className="text-slate-400 font-normal text-base">Nom de la classe…</span>}
            </p>
            {cycleSelectionne && (
              <p className="text-sm text-slate-500 mt-1">{cycleSelectionne.libelle}</p>
            )}
            {cycleSelectionne?.description && (
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{cycleSelectionne.description}</p>
            )}
          </div>
        </div>

        {/* Formulaire */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card p-5 space-y-5">
            <h3 className="section-title">Informations</h3>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Libellé de la classe *</label>
              <input
                required
                value={form.libelle}
                onChange={e => setForm({ ...form, libelle: e.target.value })}
                placeholder="ex: 6ème A, Terminale C, CP…"
                className="input"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Cycle *</label>
              <div className="grid grid-cols-1 gap-2">
                {cycles.map(c => (
                  <button
                    key={c.idCycle}
                    type="button"
                    onClick={() => setForm({ ...form, idCycle: String(c.idCycle) })}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-150 ${
                      form.idCycle === String(c.idCycle)
                        ? "border-[#0f1f3d] bg-[#0f1f3d]/5"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all ${
                      form.idCycle === String(c.idCycle)
                        ? "border-[#0f1f3d] bg-[#0f1f3d]"
                        : "border-slate-300"
                    }`}>
                      {form.idCycle === String(c.idCycle) && (
                        <div className="w-full h-full rounded-full scale-50 bg-white" />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${
                        form.idCycle === String(c.idCycle) ? "text-[#0f1f3d]" : "text-slate-700"
                      }`}>{c.libelle}</p>
                      {c.description && (
                        <p className="text-xs text-slate-400 mt-0.5">{c.description}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Section <span className="text-slate-400 font-normal text-xs">(optionnel)</span>
              </label>
              <select
                value={form.idSection}
                onChange={e => setForm({ ...form, idSection: e.target.value })}
                className="input w-full"
              >
                <option value="">— Aucune section —</option>
                {sections.map(s => (
                  <option key={s.idSection} value={s.idSection}>{s.libelle}</option>
                ))}
              </select>
              {sections.length === 0 && (
                <p className="text-xs text-slate-400">Aucune section configurée.</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving || !form.idCycle}
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
                    {isEdit ? "Enregistrer les modifications" : "Créer la classe"}
                  </span>
                )}
              </button>
              <button type="button" onClick={() => navigate("/classes")} className="btn-secondary px-8">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
