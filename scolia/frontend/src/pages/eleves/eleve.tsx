import { useEffect, useState, useCallback } from "react";
import { authFetch } from "../../auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

interface Eleve {
  matricule: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: number;
  actif: number;
  photoURL: string;
  langue: string;
}

interface PaginatedEleves {
  data: Eleve[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

const SEXE_LABELS: Record<number, string> = {
  0: "Fille",
  1: "Garçon",
  2: "Autre",
};

export default function ElevesPage() {
  const [eleves, setEleves] = useState<PaginatedEleves | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actif, setActif] = useState("");
  const [page, setPage] = useState(1);

  const fetchEleves = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (actif !== "") params.set("actif", actif);
      params.set("page", String(page));

      const res = await authFetch(`${API}/eleves?${params.toString()}`);
      const data = await res.json();

      setEleves(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, actif, page]);

  useEffect(() => {
    fetchEleves();
  }, [fetchEleves]);

  async function archiver(matricule: number) {
    if (!confirm("Archiver cet élève ?")) return;

    await authFetch(`${API}/eleves/${matricule}/archiver`, {
      method: "PATCH",
    });

    fetchEleves();
  }

  async function reactiver(matricule: number) {
    await authFetch(`${API}/eleves/${matricule}/reactiver`, {
      method: "PATCH",
    });

    fetchEleves();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Élèves</h1>

      <p className="text-sm text-gray-500">
        {eleves ? `${eleves.total} élèves` : "..."}
      </p>

      {/* Filtres */}
      <div className="flex gap-3 my-4">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Rechercher..."
          className="border px-3 py-2"
        />

        <select
          value={actif}
          onChange={(e) => {
            setActif(e.target.value);
            setPage(1);
          }}
          className="border px-3 py-2"
        >
          <option value="">Tous</option>
          <option value="1">Actifs</option>
          <option value="0">Archivés</option>
        </select>
      </div>

      {/* Table */}
      <table className="w-full border">
        <thead>
          <tr>
            <th>Matricule</th>
            <th>Nom</th>
            <th>Naissance</th>
            <th>Sexe</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6}>Chargement...</td>
            </tr>
          ) : (
            eleves?.data.map((e) => (
              <tr key={e.matricule}>
                <td>{e.matricule}</td>
                <td>
                  {e.nom} {e.prenom}
                </td>
                <td>
                  {new Date(e.dateNaissance).toLocaleDateString("fr-FR")}
                </td>
                <td>{SEXE_LABELS[e.sexe]}</td>
                <td>{e.actif ? "Actif" : "Archivé"}</td>

                <td>
                  {e.actif ? (
                    <button onClick={() => archiver(e.matricule)}>
                      Archiver
                    </button>
                  ) : (
                    <button onClick={() => reactiver(e.matricule)}>
                      Réactiver
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {eleves && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>

          <span>
            {eleves.current_page} / {eleves.last_page}
          </span>

          <button
            onClick={() =>
              setPage((p) => Math.min(eleves.last_page, p + 1))
            }
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}