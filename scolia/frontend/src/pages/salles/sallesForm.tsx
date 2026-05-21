import { useEffect, useState } from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
    createSalle,
  getClasses,
  getSalle,
  getSalles,
  updateSalle,
  type Classe,
} from "../../service/salle_service";

export default function SalleForm() {
  const navigate = useNavigate();

  const { id } = useParams();

  const isEdit = !!id;

  const [classes, setClasses] =
    useState<Classe[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [form, setForm] =
    useState({
      libelle: "",
      position: "",
      surface: "",
      actif: "1",
      idClasse: "",
      idAdmin: "1",
    });

  /* ================= LOAD ================= */

 useEffect(() => {
  getClasses()
    .then(setClasses)
    .catch(err => setError(err.message)); // ← ajoute ça

  if (isEdit) {
    loadSalle();
  }
}, []);

  async function loadSalle() {
  try {
    setLoading(true);

    const data = await getSalle(
      Number(id)
    );

    setForm({
      libelle:
        data.libelle ?? "",

      position:
        data.position ?? "",

      surface:
        data.surface ?? "",

      actif: data.actif
        ? "1"
        : "0",

      idClasse: String(
        data.idClasse ?? ""
      ),

      idAdmin: "1",
    });
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

  /* ================= UPDATE ================= */

  function update(
    field: string,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      setLoading(true);

      if (isEdit) {
        await updateSalle(
          Number(id),
          form
        );
      } else {
        await createSalle(form);
      }

      navigate("/salles");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {isEdit
            ? "Modifier la salle"
            : "Ajouter une salle"}
        </h1>

        <p className="text-sm text-muted-foreground">
          Gestion des salles
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-2xl p-6 space-y-5"
      >

        {/* LIBELLE */}
        <div>
          <label className="block text-sm mb-2">
            Libellé
          </label>

          <input
            type="text"
            required
            value={form.libelle}
            onChange={(e) =>
              update(
                "libelle",
                e.target.value
              )
            }
            placeholder="Ex: Salle A1"
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm"
          />
        </div>

        {/* POSITION + SURFACE */}
        <div className="grid md:grid-cols-2 gap-4">

          <div>
            <label className="block text-sm mb-2">
              Position
            </label>

            <input
              type="text"
              value={form.position}
              onChange={(e) =>
                update(
                  "position",
                  e.target.value
                )
              }
              placeholder="Ex: Bâtiment A"
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">
              Surface
            </label>

            <input
              type="text"
              value={form.surface}
              onChange={(e) =>
                update(
                  "surface",
                  e.target.value
                )
              }
              placeholder="Ex: 40m²"
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm"
            />
          </div>

        </div>

        {/* CLASSE */}
        <div>
          <label className="block text-sm mb-2">
            Classe
          </label>

          <select
            required
            value={form.idClasse}
            onChange={(e) =>
              update(
                "idClasse",
                e.target.value
              )
            }
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm"
          >
            <option value="">
              Sélectionner une classe
            </option>

            {classes.map((c) => (
              <option
                key={c.idClasse}
                value={c.idClasse}
              >
                {c.libelle}
              </option>
            ))}
          </select>
        </div>

        {/* STATUT */}
        <div>
          <label className="block text-sm mb-2">
            Statut
          </label>

          <select
            value={form.actif}
            onChange={(e) =>
              update(
                "actif",
                e.target.value
              )
            }
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm"
          >
            <option value="1">
              Active
            </option>

            <option value="0">
              Inactive
            </option>
          </select>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 pt-2">

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground px-5 py-3 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {loading
              ? "Enregistrement..."
              : isEdit
              ? "Mettre à jour"
              : "Créer"}
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/salles")
            }
            className="bg-secondary px-5 py-3 rounded-lg text-sm"
          >
            Annuler
          </button>

        </div>
      </form>
    </div>
  );
}