import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, Eye, Edit } from "lucide-react";

import {
  getSessions,
  deleteSession,
  type Session,
} from "../../service/sessions_service";

export default function SessionPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [trimestre, setTrimestre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getSessions(trimestre);
      setSessions(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [trimestre]);

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cette session ?")) return;
    try {
      await deleteSession(id);
      load();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suppression");
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sessions</h1>
          <p className="text-gray-500 mt-1">
            {sessions.length} session{sessions.length > 1 ? "s" : ""}
          </p>
        </div>

        <Link
          to="/sessions/ajouter"
          className="flex items-center gap-2 bg-[#1a3a5c] text-white px-5 py-3 rounded-xl hover:bg-[#16324f] transition"
        >
          <Plus size={20} />
          Nouvelle Session
        </Link>
      </div>

      {/* Filtre Trimestre */}
      <div className="mb-6">
        <select
          value={trimestre}
          onChange={(e) => setTrimestre(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c] bg-white"
        >
          <option value="">Tous les trimestres</option>
          {/* Tu pourras mapper les trimestres ici plus tard */}
        </select>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Liste des Sessions */}
      {loading ? (
        <p className="text-center py-12 text-gray-500">Chargement des sessions...</p>
      ) : sessions.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-500">
          Aucune session trouvée
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => (
            <div
              key={s.idSession}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-xl text-gray-900">
                    {s.libelle}
                  </h3>
                  <p className="text-gray-500 mt-1">
                    {s.trimestre?.libelle || "Trimestre non défini"}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Link
                    to={`/sessions/${s.idSession}`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
                  >
                    <Eye size={20} />
                    Voir
                  </Link>

                  <Link
                    to={`/sessions/${s.idSession}/modifier`}
                    className="flex items-center gap-2 text-amber-600 hover:text-amber-700 transition"
                  >
                    <Edit size={20} />
                    Modifier
                  </Link>

                  <button
                    onClick={() => handleDelete(s.idSession)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 transition"
                  >
                    <Trash2 size={20} />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}