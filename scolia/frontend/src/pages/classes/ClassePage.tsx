import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, Eye, Edit } from "lucide-react";

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

  // Cycle Form
  const [showCycleForm, setShowCycleForm] = useState(false);
  const [cycleForm, setCycleForm] = useState({
    libelle: "",
    description: "",
    idAdmin: "1",
  });

  const fetchClassesData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClasses(page, idCycle, search);
      setClasses(data.data || []);
      setMeta(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, idCycle, search]);

  const fetchCyclesData = async () => {
    try {
      const data = await getCycles();
      setCycles(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCyclesData();
  }, []);

  useEffect(() => {
    fetchClassesData();
  }, [fetchClassesData]);

  async function handleCreateCycle(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createCycle(cycleForm);
      setCycleForm({ libelle: "", description: "", idAdmin: "1" });
      setShowCycleForm(false);
      fetchCyclesData();
      fetchClassesData();
    } catch (err) {
      alert("Erreur lors de la création du cycle");
    }
  }

  async function handleDeleteClasse(id: number) {
    if (!confirm("Supprimer cette classe ?")) return;
    await deleteClasse(id);
    fetchClassesData();
  }

  async function handleDeleteCycle(id: number) {
    if (!confirm("Supprimer ce cycle ?")) return;
    await deleteCycle(id);
    fetchCyclesData();
    fetchClassesData();
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Classes</h1>
          <p className="text-gray-500 mt-1">Cycles et Classes</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowCycleForm(!showCycleForm)}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-5 py-3 rounded-xl text-sm font-medium transition"
          >
            {showCycleForm ? "Annuler" : "+ Cycle"}
          </button>

          <Link
            to="/classes/nouveau"
            className="flex items-center gap-2 bg-[#1a3a5c] text-white px-5 py-3 rounded-xl hover:bg-[#16324f] transition"
          >
            <Plus size={20} />
            Nouvelle Classe
          </Link>
        </div>
      </div>

      {/* Formulaire Cycle */}
      {showCycleForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Nouveau Cycle</h2>
          <form onSubmit={handleCreateCycle} className="space-y-4">
            <input
              type="text"
              placeholder="Libellé du cycle (ex: Primaire, Secondaire...)"
              value={cycleForm.libelle}
              onChange={(e) => setCycleForm({ ...cycleForm, libelle: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
              required
            />

            <textarea
              placeholder="Description (optionnel)"
              value={cycleForm.description}
              onChange={(e) => setCycleForm({ ...cycleForm, description: e.target.value })}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
              rows={3}
            />

            <button
              type="submit"
              className="bg-[#1a3a5c] text-white px-6 py-3 rounded-xl hover:bg-[#16324f] transition"
            >
              Enregistrer le Cycle
            </button>
          </form>
        </div>
      )}

      {/* Liste des Cycles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {cycles.map((cycle) => (
          <div key={cycle.idCycle} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{cycle.libelle}</h3>
                <p className="text-gray-500 text-sm mt-1">
                  {cycle.description || "Aucune description"}
                </p>
              </div>
              <button
                onClick={() => handleDeleteCycle(cycle.idCycle)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              {cycle.classes?.length ?? 0} classe(s)
            </p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Rechercher une classe..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
        />

        <select
          value={idCycle}
          onChange={(e) => {
            setIdCycle(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#1a3a5c]"
        >
          <option value="">Tous les cycles</option>
          {cycles.map((c) => (
            <option key={c.idCycle} value={c.idCycle}>
              {c.libelle}
            </option>
          ))}
        </select>
      </div>

      {/* Tableau des Classes */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left">Classe</th>
              <th className="px-6 py-4 text-left">Cycle</th>
              <th className="px-6 py-4 text-left">Nombre de Cours</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-500">
                  Chargement...
                </td>
              </tr>
            ) : classes.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-500">
                  Aucune classe trouvée
                </td>
              </tr>
            ) : (
              classes.map((cl) => (
                <tr key={cl.idClasse} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{cl.libelle}</td>
                  <td className="px-6 py-4 text-gray-600">{cl.cycle?.libelle ?? "—"}</td>
                  <td className="px-6 py-4 text-gray-600">{cl.cours_count ?? 0}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-4">
                      <Link to={`/classes/${cl.idClasse}`} className="text-blue-600 hover:text-blue-700">
                        <Eye size={20} />
                      </Link>
                      <Link to={`/classes/${cl.idClasse}/modifier`} className="text-amber-600 hover:text-amber-700">
                        <Edit size={20} />
                      </Link>
                      <button onClick={() => handleDeleteClasse(cl.idClasse)} className="text-red-600 hover:text-red-700">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between mt-6">
          <span className="text-sm text-gray-500">
            {meta.total} classe(s)
          </span>

          <div className="flex items-center gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-5 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50"
            >
              Précédent
            </button>

            <span className="text-sm text-gray-600">
              Page <strong>{page}</strong> sur {meta.last_page}
            </span>

            <button
              disabled={page === meta.last_page}
              onClick={() => setPage((p) => p + 1)}
              className="px-5 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}