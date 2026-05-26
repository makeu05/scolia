import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";

import {
  getFicheEnseignant,
  createFicheEnseignant,
  updateFicheEnseignant,
} from "../../service/fiche_enseignant_service";

export default function FicheEnseignantForm() {
  const { idEnseignant, idRap } = useParams();

  const navigate = useNavigate();
  const isEdit = !!idRap;

  const [form, setForm] = useState({
    libelle: "",
    points: "",
    idAdministratif: "1",
    idAca: "1",
    commentaire: "",
    event_date: "",
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  /* LOAD EDIT */
  useEffect(() => {
    if (isEdit && idRap) {
      const load = async () => {
        const data = await getFicheEnseignant(idRap);

        setForm({
          libelle: data.libelle,
          points: data.points?.toString() || "",
          idAdministratif: data.idAdministratif.toString(),
          idAca: data.idAca.toString(),
          commentaire: data.commentaire || "",
          event_date: data.event_date.split("T")[0],
        });
      };

      load();
    }
  }, [idRap]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...form,
        idEnseignant,
      };

      if (isEdit) {
        await updateFicheEnseignant(idRap!, payload);
      } else {
        await createFicheEnseignant(payload);
      }

      navigate(`/enseignants/${idEnseignant}/fiches`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">

      <div className="flex items-center gap-4 mb-8">
        <Link
          to={`/enseignants/${idEnseignant}/fiches`}
          className="flex items-center gap-2 text-gray-600"
        >
          <ArrowLeft size={20} />
          Retour
        </Link>

        <h1 className="text-2xl font-bold">
          {isEdit ? "Modifier fiche" : "Nouvelle fiche"}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 mb-4 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl">

        <input
          placeholder="Libellé"
          className="input mb-3"
          value={form.libelle}
          onChange={(e) =>
            setForm({ ...form, libelle: e.target.value })
          }
          required
        />

        <input
          type="number"
          placeholder="Points"
          className="input mb-3"
          value={form.points}
          onChange={(e) =>
            setForm({ ...form, points: e.target.value })
          }
        />

        <input
          type="date"
          className="input mb-3"
          value={form.event_date}
          onChange={(e) =>
            setForm({ ...form, event_date: e.target.value })
          }
          required
        />

        <textarea
          className="input mb-3"
          placeholder="Commentaire"
          value={form.commentaire}
          onChange={(e) =>
            setForm({ ...form, commentaire: e.target.value })
          }
        />

        <button className="btn-primary w-full">
          <Save size={18} />
          {saving ? "En cours..." : "Enregistrer"}
        </button>

      </form>
    </div>
  );
}