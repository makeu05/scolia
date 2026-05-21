import { useEffect, useState } from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
    getSalle,
 getSalles,
  type Salle,
} from "../../service/salle_service";

export default function SalleDetails() {
  const { id } = useParams();

  const [salle, setSalle] =
    useState<Salle | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ================= LOAD ================= */

  useEffect(() => {
    loadSalle();
  }, []);

  async function loadSalle() {
    try {
      setLoading(true);

      const data = await getSalle(
        Number(id)
      );

      setSalle(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">
          Chargement...
        </p>
      </div>
    );
  }

  if (error || !salle) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
          {error ||
            "Salle introuvable"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">

        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {salle.libelle}
          </h1>

          <p className="text-sm text-muted-foreground">
            Détails de la salle
          </p>
        </div>

        <Link
          to={`/salles/${salle.idSalle}/modifier`}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:opacity-90 transition"
        >
          Modifier
        </Link>

      </div>

      {/* CARD */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">

        {/* INFOS */}
        <div className="grid md:grid-cols-2 gap-6">

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              Classe
            </p>

            <p className="text-sm font-medium">
              {salle.classe
                ?.libelle ?? "—"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              Position
            </p>

            <p className="text-sm font-medium">
              {salle.position || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              Surface
            </p>

            <p className="text-sm font-medium">
              {salle.surface || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              Statut
            </p>

            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                salle.actif
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {salle.actif
                ? "Active"
                : "Inactive"}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}