import { useEffect, useState } from "react";
import { authFetch } from "../../service/auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

interface Personne {
  idPers: number;
  nom: string;
  prenom: string;
  mobile: string;
  phone: string;
  typePersonne: number;
}

interface Parent {
  idParent: number;
  idPers: number;
  matricule: number;
  personne: Personne;
}

interface Props {
  matricule: number;
}

export default function ParentsSection({ matricule }: Props) {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    mobile: "",
    phone: "",
    typePersonne: "4",
    idAdmin: "1",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function fetchParents() {
    try {
      setLoading(true);

      const res = await authFetch(
        `${API}/eleves/${matricule}/parents`
      );

      const data = await res.json();
      setParents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (matricule) fetchParents();
  }, [matricule]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await authFetch(
        `${API}/eleves/${matricule}/parents`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erreur lors de l'ajout");
      }

      setForm({
        nom: "",
        prenom: "",
        mobile: "",
        phone: "",
        typePersonne: "4",
        idAdmin: "1",
      });

      setShowForm(false);
      fetchParents();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(idParent: number) {
    if (!confirm("Supprimer ce parent ?")) return;

    await authFetch(
      `${API}/eleves/${matricule}/parents/${idParent}`,
      {
        method: "DELETE",
      }
    );

    fetchParents();
  }

  return (
    <div className="bg-white border rounded-xl p-5 mt-4 shadow-sm">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-gray-800">
          Parents / Tuteurs ({parents.length})
        </h2>

        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? "Annuler" : "+ Ajouter"}
        </button>
      </div>

      {/* FORMULAIRE */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 border rounded-lg p-4 mb-4 space-y-3"
        >
          {error && (
            <div className="text-xs text-red-600">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Nom"
              value={form.nom}
              onChange={(e) => update("nom", e.target.value)}
              className="border rounded p-2 text-sm"
              required
            />

            <input
              placeholder="Prénom"
              value={form.prenom}
              onChange={(e) => update("prenom", e.target.value)}
              className="border rounded p-2 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Mobile"
              value={form.mobile}
              onChange={(e) => update("mobile", e.target.value)}
              className="border rounded p-2 text-sm"
            />

            <input
              placeholder="Téléphone"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="border rounded p-2 text-sm"
            />
          </div>

          <select
            value={form.typePersonne}
            onChange={(e) =>
              update("typePersonne", e.target.value)
            }
            className="border rounded p-2 text-sm w-full"
          >
            <option value="4">Parent</option>
            <option value="5">Tuteur</option>
          </select>

          <button
            disabled={submitting}
            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition"
          >
            {submitting ? "..." : "Ajouter"}
          </button>
        </form>
      )}

      {/* LISTE */}
      {loading ? (
        <p className="text-sm">Chargement...</p>
      ) : parents.length === 0 ? (
        <p className="text-sm text-gray-500">
          Aucun parent
        </p>
      ) : (
        parents.map((p) => (
          <div
            key={p.idParent}
            className="flex justify-between border p-3 rounded mb-2 bg-white"
          >
            <div className="text-sm text-gray-800">
              {p.personne.nom} {p.personne.prenom}
            </div>

            <button
              onClick={() => handleDelete(p.idParent)}
              className="text-red-500 text-xs hover:text-red-700"
            >
              Supprimer
            </button>
          </div>
        ))
      )}
    </div>
  );
}