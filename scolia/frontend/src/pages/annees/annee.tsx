import { useEffect, useState } from "react";
import { Link } from "react-router-dom";                    // ← Correction importante
import { Plus, Trash2 } from "lucide-react";

import {
  getAnnees,
  createAnnee,
  deleteAnnee,
  createTrimestre,
  deleteTrimestre,
  type AnneeAcademique,
} from "../../service/annee_service";

export default function AnneesPage() {
  const [annees, setAnnees] = useState<AnneeAcademique[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showTrimestreForm, setShowTrimestreForm] = useState<number | null>(null);

  const [formAnnee, setFormAnnee] = useState({
    libelle: "",
    periode: "",
    idAdmin: "1",
  });

  const [formTrimestre, setFormTrimestre] = useState({
    libelle: "",
    periode: "",
    idAca: "",
    idAdmin: "1",
  });

  async function load() {
    try {
      setLoading(true);
      const data = await getAnnees();
      setAnnees(data);
    } catch (err: any) {
      setError(err.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAddAnnee(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createAnnee(formAnnee);
      setFormAnnee({ libelle: "", periode: "", idAdmin: "1" });
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDeleteAnnee(id: number) {
    if (!confirm("Supprimer cette année académique ?")) return;
    await deleteAnnee(id);
    load();
  }

  async function handleAddTrimestre(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createTrimestre(formTrimestre);
      setFormTrimestre({ libelle: "", periode: "", idAca: "", idAdmin: "1" });
      setShowTrimestreForm(null);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDeleteTrimestre(id: number) {
    if (!confirm("Supprimer ce trimestre ?")) return;
    await deleteTrimestre(id);
    load();
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Années Académiques</h1>
          <p className="text-gray-500 mt-1">
            {annees.length} année{annees.length > 1 ? "s" : ""} enregistrée{annees.length > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex gap-3">
          {/* Bouton Sessions */}
          <Link
            to="/sessions"
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2"
          >
            Sessions
          </Link>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2"
          >
            <Plus size={18} />
            {showForm ? "Annuler" : "Nouvelle Année"}
          </button>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Formulaire Ajout Année */}
      {showForm && (
        <form
          onSubmit={handleAddAnnee}
          className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
              placeholder="Libellé (ex: 2024-2025)"
              value={formAnnee.libelle}
              onChange={(e) => setFormAnnee({ ...formAnnee, libelle: e.target.value })}
              required
            />
            <input
              className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
              placeholder="Période (ex: Sept 2024 - Juin 2025)"
              value={formAnnee.periode}
              onChange={(e) => setFormAnnee({ ...formAnnee, periode: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
          >
            Enregistrer l'année
          </button>
        </form>
      )}

      {/* Liste des Années */}
      {loading ? (
        <p className="text-center py-10 text-gray-500">Chargement...</p>
      ) : (
        <div className="space-y-6">
          {annees.map((annee) => (
            <div
              key={annee.idAnnee}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{annee.libelle}</h2>
                  <p className="text-gray-500">{annee.periode}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowTrimestreForm(
                        showTrimestreForm === annee.idAnnee ? null : annee.idAnnee
                      );
                      setFormTrimestre({
                        ...formTrimestre,
                        idAca: String(annee.idAnnee),
                      });
                    }}
                    className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl text-sm transition"
                  >
                    + Trimestre
                  </button>

                  <button
                    onClick={() => handleDeleteAnnee(annee.idAnnee)}
                    className="text-red-600 hover:text-red-700 px-3 py-2 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Formulaire Trimestre */}
              {showTrimestreForm === annee.idAnnee && (
                <form
                  onSubmit={handleAddTrimestre}
                  className="bg-gray-50 border border-gray-200 p-5 rounded-xl mb-5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      placeholder="Libellé du trimestre"
                      value={formTrimestre.libelle}
                      onChange={(e) =>
                        setFormTrimestre({ ...formTrimestre, libelle: e.target.value })
                      }
                      className="border border-gray-300 rounded-xl px-4 py-3"
                      required
                    />
                    <input
                      placeholder="Période"
                      value={formTrimestre.periode}
                      onChange={(e) =>
                        setFormTrimestre({ ...formTrimestre, periode: e.target.value })
                      }
                      className="border border-gray-300 rounded-xl px-4 py-3"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700"
                  >
                    Ajouter Trimestre
                  </button>
                </form>
              )}

              {/* Liste des Trimestres */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {annee.trimestres?.map((t) => (
                  <div
                    key={t.idTrimes}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-center"
                  >
                    <span className="font-medium">{t.libelle}</span>
                    <button
                      onClick={() => handleDeleteTrimestre(t.idTrimes)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}