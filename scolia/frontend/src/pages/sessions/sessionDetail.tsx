import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getSession, type Session } from "../../service/sessions_service";

export default function SessionDetails() {
  const { id } = useParams();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    getSession(Number(id)).then(setSession);
  }, []);

  if (!session) return <p className="text-white">Chargement...</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-xl text-[#1D9E75]">
        {session.libelle}
      </h1>

      <p className="text-gray-400 mt-2">
        {session.description}
      </p>

      <Link
        to={`/sessions/${session.idSession}/modifier`}
        className="text-blue-400 mt-4 inline-block"
      >
        Modifier
      </Link>
    </div>
  );
}