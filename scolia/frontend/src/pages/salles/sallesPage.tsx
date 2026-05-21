import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import {
  getSalles,
  deleteSalle,
  getClasses,
  type Salle,
  type Classe,
} from "../../service/salle_service";

export default function SallesPage() {
  const [salles, setSalles] =
    useState<Salle[]>([]);

  const [classes, setClasses] =
    useState<Classe[]>([]);

  const [idClasse, setIdClasse] =
    useState("");

  const [actif, setActif] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [meta, setMeta] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(false);

  /* ================= FETCH ================= */

  async function fetchData() {
    try {
      setLoading(true);

      const data = await getSalles(
        page,
        idClasse,
        actif
      );

      setSalles(data.data ?? data);

      setMeta(
        data.last_page ? data : null
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getClasses().then(setClasses);
  }, []);

  useEffect(() => {
    fetchData();
  }, [page, idClasse, actif]);

  /* ================= DELETE ================= */

  async function handleDelete(
    id: number
  ) {
    if (
      !confirm(
        "Supprimer cette salle ?"
      )
    )
      return;

    await deleteSalle(id);

    fetchData();
  }

  /* ================= UI ================= */

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Salles
          </h1>

          <p className="text-sm text-muted-foreground">
            Gestion des salles
          </p>
        </div>

        <Link
          to="/salles/nouveau"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:opacity-90 transition"
        >
          + Ajouter
        </Link>
      </div>

      {/* FILTRES */}
      <div className="flex gap-3 mb-6">

        {/* CLASSE */}
        <select
          value={idClasse}
          onChange={(e) => {
            setIdClasse(
              e.target.value
            );

            setPage(1);
          }}
          className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">
            Toutes les classes
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

        {/* ACTIF */}
        <select
          value={actif}
          onChange={(e) => {
            setActif(
              e.target.value
            );

            setPage(1);
          }}
          className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">
            Toutes
          </option>

          <option value="1">
            Actives
          </option>

          <option value="0">
            Inactives
          </option>
        </select>
      </div>

      {/* TABLE */}
      {loading ? (
        <p className="text-muted-foreground text-sm">
          Chargement...
        </p>
      ) : (
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full text-sm">

            {/* HEAD */}
            <thead className="bg-card">
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left">
                  Libellé
                </th>

                <th className="px-4 py-3 text-left">
                  Classe
                </th>

                <th className="px-4 py-3 text-left">
                  Position
                </th>

                <th className="px-4 py-3 text-left">
                  Surface
                </th>

                <th className="px-4 py-3 text-left">
                  Statut
                </th>

                <th className="px-4 py-3 text-left">
                  Actions
                </th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {salles.map((s) => (
                <tr
                  key={s.idSalle}
                  className="border-b border-border hover:bg-secondary/30 transition"
                >
                  <td className="px-4 py-3 font-medium">
                    {s.libelle}
                  </td>

                  <td className="px-4 py-3">
                    {s.classe
                      ?.libelle ?? "—"}
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">
                    {s.position}
                  </td>

                  <td className="px-4 py-3 text-muted-foreground">
                    {s.surface}
                  </td>

                  {/* STATUS */}
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        s.actif
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {s.actif
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4 py-3 flex gap-3">

                    <Link
                      to={`/salles/${s.idSalle}`}
                      className="text-primary text-xs hover:underline"
                    >
                      Voir
                    </Link>

                    <Link
                      to={`/salles/${s.idSalle}/modifier`}
                      className="text-blue-400 text-xs hover:underline"
                    >
                      Modifier
                    </Link>

                    <button
                      onClick={() =>
                        handleDelete(
                          s.idSalle
                        )
                      }
                      className="text-red-400 text-xs hover:underline"
                    >
                      Supprimer
                    </button>

                  </td>
                </tr>
              ))}

              {/* EMPTY */}
              {salles.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-muted-foreground"
                  >
                    Aucune salle trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      {meta && (
        <div className="flex justify-between items-center mt-4">

          <span className="text-sm text-muted-foreground">
            {meta.total} salle(s)
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
              {page} /{" "}
              {meta.last_page}
            </span>

            <button
              disabled={
                page ===
                meta.last_page
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