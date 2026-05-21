import { useEffect, useState } from "react";

import { useParams, Link } from "react-router-dom";

import { getClasse } from "../../service/classe_service";

export default function ClasseDetails() {
  const { id } = useParams();

  const [classe, setClasse] = useState<any>(null);

  useEffect(() => {
    if (id) {
      getClasse(Number(id)).then(setClasse);
    }
  }, [id]);

  if (!classe) {
    return <p className="p-6">Chargement...</p>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {classe.libelle}
          </h1>

          <p className="text-muted-foreground">
            {classe.cycle?.libelle}
          </p>
        </div>

        <Link
          to={`/classes/${classe.idClasse}/modifier`}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg"
        >
          Modifier
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-sm">
          Nombre de cours :{" "}
          <strong>{classe.cours_count ?? 0}</strong>
        </p>
      </div>
    </div>
  );
}