import { useEffect, useState } from "react";
import {
  createClasse,
  getCycles,
  getClasse,
  updateClasse,
} from "../../service/classe_service";

import { useNavigate, useParams } from "react-router-dom";

export default function ClasseForm() {
  const navigate = useNavigate();

  const { id } = useParams();

  const isEdit = !!id;

  const [cycles, setCycles] = useState<any[]>([]);

  const [form, setForm] = useState({
    libelle: "",
    idCycle: "",
    idAdmin: "1",
  });

  async function load() {
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
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isEdit) {
      await updateClasse(Number(id), form);
    } else {
      await createClasse(form);
    }

    navigate("/classes");
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">

      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {isEdit ? "Modifier" : "Nouvelle"} classe
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-xl p-5 space-y-4"
      >
        <input
          type="text"
          placeholder="Libellé"
          value={form.libelle}
          onChange={(e) =>
            setForm({
              ...form,
              libelle: e.target.value,
            })
          }
          className="w-full bg-background border border-border rounded-lg px-4 py-2"
        />

        <select
          value={form.idCycle}
          onChange={(e) =>
            setForm({
              ...form,
              idCycle: e.target.value,
            })
          }
          className="w-full bg-background border border-border rounded-lg px-4 py-2"
        >
          <option value="">Choisir un cycle</option>

          {cycles.map((c) => (
            <option key={c.idCycle} value={c.idCycle}>
              {c.libelle}
            </option>
          ))}
        </select>

        <button className="bg-primary text-primary-foreground px-5 py-2 rounded-lg">
          Enregistrer
        </button>
      </form>
    </div>
  );
}