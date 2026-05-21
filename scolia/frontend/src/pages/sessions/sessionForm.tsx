import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  createSession,
  updateSession,
  getSession,
} from "../../service/sessions_service";

export default function SessionForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    libelle: "",
    description: "",
    idTrimestre: "",
    idAdmin: "1",
  });

  useEffect(() => {
    if (isEdit) load();
  }, []);

  async function load() {
    try {
      const data = await getSession(Number(id));

      setForm({
        libelle: data.libelle ?? "",
        description: data.description ?? "",
        idTrimestre: data.idTrimestre ?? "",
        idAdmin: "1",
      });
    } catch (e: any) {
      setError(e.message);
    }
  }

  function update(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);

      if (isEdit) {
        await updateSession(Number(id), form);
      } else {
        await createSession(form);
      }

      navigate("/sessions");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto text-white">

      <h1 className="text-xl mb-4 text-[#1D9E75]">
        {isEdit ? "Modifier session" : "Ajouter session"}
      </h1>

      {error && (
        <p className="text-red-400 mb-3">{error}</p>
      )}

      <form
        onSubmit={submit}
        className="bg-gray-900 p-4 rounded space-y-3"
      >
        <input
          placeholder="Libellé"
          value={form.libelle}
          onChange={(e) => update("libelle", e.target.value)}
          className="w-full p-2 bg-gray-800"
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className="w-full p-2 bg-gray-800"
        />

        <button className="bg-[#1D9E75] px-4 py-2 rounded">
          {loading ? "..." : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}