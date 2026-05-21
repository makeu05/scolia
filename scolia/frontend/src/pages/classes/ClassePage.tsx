import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getClasses,
  deleteClasse,
  type Classe,
} from "../../service/classe_service";

import {
  getCycles,
  createCycle,
  deleteCycle,
  type Cycle,
} from "../../service/cycle_service";

export default function ClassesPage() {
  const [classes, setClasses] = useState<Classe[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);

  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);

  const [search, setSearch] = useState("");
  const [idCycle, setIdCycle] = useState("");

  /* ================= CYCLE FORM ================= */

  const [showCycleForm, setShowCycleForm] =
    useState(false);

  const [cycleForm, setCycleForm] = useState({
    libelle: "",
    description: "",
    idAdmin: "1",
  });

  /* ================= LOAD ================= */

  async function fetchClassesData() {
    try {
      setLoading(true);

      const data = await getClasses(
        page,
        idCycle,
        search
      );

      setClasses(data.data);
      setMeta(data);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCyclesData() {
    const data = await getCycles();
    setCycles(data);
  }

  useEffect(() => {
    fetchCyclesData();
  }, []);

  useEffect(() => {
    fetchClassesData();
  }, [page, idCycle]);

  /* ================= DELETE CLASSE ================= */

  async function handleDeleteClasse(id: number) {
    if (!confirm("Supprimer cette classe ?")) return;

    await deleteClasse(id);

    fetchClassesData();
  }

  /* ================= CREATE CYCLE ================= */

  async function handleCreateCycle(
    e: React.FormEvent
  ) {
    e.preventDefault();

    await createCycle(cycleForm);

    setCycleForm({
      libelle: "",
      description: "",
      idAdmin: "1",
    });

    setShowCycleForm(false);

    fetchCyclesData();
  }

  /* ================= DELETE CYCLE ================= */

  async function handleDeleteCycle(id: number) {
    if (!confirm("Supprimer ce cycle ?")) return;

    await deleteCycle(id);

    fetchCyclesData();
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">

        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Classes
          </h1>

          <p className="text-sm text-muted-foreground">
            Gestion des classes et cycles
          </p>
        </div>

        <div className="flex gap-3">

          <button
            onClick={() =>
              setShowCycleForm(!showCycleForm)
            }
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm"
          >
            {showCycleForm
              ? "Annuler"
              : "+ Cycle"}
          </button>

          <Link
            to="/classes/nouveau"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm"
          >
            + Ajouter Classe
          </Link>

        </div>
      </div>

      {/* FORMULAIRE CYCLE */}
      {showCycleForm && (
        <form
          onSubmit={handleCreateCycle}
          className="bg-card border border-border rounded-xl p-4 mb-6 space-y-3"
        >

          <h2 className="text-sm font-medium text-foreground">
            Nouveau cycle
          </h2>

          <input
            type="text"
            placeholder="Libellé"
            value={cycleForm.libelle}
            onChange={(e) =>
              setCycleForm({
                ...cycleForm,
                libelle: e.target.value,
              })
            }
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
            required
          />

          <textarea
            placeholder="Description"
            value={cycleForm.description}
            onChange={(e) =>
              setCycleForm({
                ...cycleForm,
                description: e.target.value,
              })
            }
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
          />

          <button
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm"
          >
            Enregistrer
          </button>

        </form>
      )}

      {/* LISTE DES CYCLES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

        {cycles.map((cycle) => (
          <div
            key={cycle.idCycle}
            className="bg-card border border-border rounded-xl p-4"
          >

            <div className="flex justify-between items-start mb-2">

              <div>
                <h2 className="font-semibold text-foreground">
                  {cycle.libelle}
                </h2>

                <p className="text-sm text-muted-foreground">
                  {cycle.description ||
                    "Aucune description"}
                </p>
              </div>

              <button
                onClick={() =>
                  handleDeleteCycle(cycle.idCycle)
                }
                className="text-red-400 text-xs"
              >
                Supprimer
              </button>

            </div>

            <div className="text-xs text-muted-foreground">
              {cycle.classes?.length ?? 0} classe(s)
            </div>

          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="flex gap-3 mb-6">

        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setPage(1);
              fetchClassesData();
            }
          }}
          className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm"
        />

        <select
          value={idCycle}
          onChange={(e) => {
            setIdCycle(e.target.value);
            setPage(1);
          }}
          className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">
            Tous les cycles
          </option>

          {cycles.map((c) => (
            <option
              key={c.idCycle}
              value={c.idCycle}
            >
              {c.libelle}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      {loading ? (
        <p className="text-muted-foreground">
          Chargement...
        </p>
      ) : (
        <div className="overflow-x-auto border border-border rounded-xl">

          <table className="w-full text-sm">

            <thead className="bg-card">
              <tr className="border-b border-border">

                <th className="text-left px-4 py-3">
                  Classe
                </th>

                <th className="text-left px-4 py-3">
                  Cycle
                </th>

                <th className="text-left px-4 py-3">
                  Cours
                </th>

                <th className="text-left px-4 py-3">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>

              {classes.map((cl) => (
                <tr
                  key={cl.idClasse}
                  className="border-b border-border hover:bg-secondary/30"
                >

                  <td className="px-4 py-3 font-medium">
                    {cl.libelle}
                  </td>

                  <td className="px-4 py-3">
                    {cl.cycle?.libelle ?? "—"}
                  </td>

                  <td className="px-4 py-3">
                    {cl.cours_count ?? 0}
                  </td>

                  <td className="px-4 py-3 flex gap-3">

                    <Link
                      to={`/classes/${cl.idClasse}`}
                      className="text-primary text-xs"
                    >
                      Voir
                    </Link>

                    <Link
                      to={`/classes/${cl.idClasse}/modifier`}
                      className="text-blue-400 text-xs"
                    >
                      Modifier
                    </Link>

                    <button
                      onClick={() =>
                        handleDeleteClasse(
                          cl.idClasse
                        )
                      }
                      className="text-red-400 text-xs"
                    >
                      Supprimer
                    </button>

                  </td>

                </tr>
              ))}

            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      {meta && (
        <div className="flex justify-between mt-4">

          <span className="text-sm text-muted-foreground">
            {meta.total} classe(s)
          </span>

          <div className="flex gap-2">

            <button
              disabled={page === 1}
              onClick={() =>
                setPage((p) => p - 1)
              }
              className="bg-secondary px-3 py-1 rounded text-sm disabled:opacity-40"
            >
              ←
            </button>

            <span className="px-3 py-1 text-sm">
              {page} / {meta.last_page}
            </span>

            <button
              disabled={
                page === meta.last_page
              }
              onClick={() =>
                setPage((p) => p + 1)
              }
              className="bg-secondary px-3 py-1 rounded text-sm disabled:opacity-40"
            >
              →
            </button>

          </div>

        </div>
      )}
    </div>
  );
}