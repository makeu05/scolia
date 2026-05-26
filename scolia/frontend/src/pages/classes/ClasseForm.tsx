import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

import {
  createClasse,
  getCycles,
  getClasse,
  updateClasse,
} from "../../service/classe_service";

export default function ClasseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    libelle: "",
    idCycle: "",
    idAdmin: "1",
  });

  async function load() {
    setLoading(true);
    try {
      const c = await getCycles();
      setCycles(c);

      if (isEdit && id) {
        const cl = await getClasse(Number(id));
        setForm({
          libelle: cl.libelle,
          idCycle: String(cl.idCycle),
          idAdmin: "1",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      if (isEdit) {
        await updateClasse(Number(id), form);
        alert("Classe modifiée avec succès !");
      } else {
        await createClasse(form);
        alert("Classe créée avec succès !");
      }
      navigate("/classes");
    } catch (err: any) {
      alert(err.message || "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/classes"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          Retour à la liste
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? "Modifier la Classe" : "Nouvelle Classe"}
        </h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Libellé de la classe *
            </label>
            <input
              type="text"
              placeholder="Ex: 6ème A, Terminale S2..."
              value={form.libelle}
              onChange={(e) =>
                setForm({ ...form, libelle: e.target.value })
              }
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cycle *
            </label>
            <select
              value={form.idCycle}
              onChange={(e) =>
                setForm({ ...form, idCycle: e.target.value })
              }
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
              required
            >
              <option value="">-- Sélectionner un cycle --</option>
              {cycles.map((c) => (
                <option key={c.idCycle} value={c.idCycle}>
                  {c.libelle}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#1a3a5c] hover:bg-[#16324f] text-white py-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <Save size={20} />
              {saving ? "Enregistrement..." : isEdit ? "Enregistrer les modifications" : "Créer la classe"}
            </button>

            <Link
              to="/classes"
              className="flex-1 border border-gray-300 text-gray-700 py-4 rounded-xl font-semibold text-center hover:bg-gray-50 transition"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}