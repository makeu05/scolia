import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authFetch } from '../../service/auth';
import { useAuth } from '../../service/auth';
import { getAnnees, getTrimestres, getBulletin } from '../../service/evaluation_service';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

interface Enfant {
  matricule: number;
  nom: string;
  prenom: string;
  sexe: number;
  photoURL?: string;
  actif: number;
  classe?: string;
}

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [enfants, setEnfants] = useState<Enfant[]>([]);
  const [annees, setAnnees] = useState<any[]>([]);
  const [trimestres, setTrimestres] = useState<any[]>([]);
  const [idAca, setIdAca] = useState('');
  const [idTrimestre, setIdTrimestre] = useState('');
  const [bulletins, setBulletins] = useState<Record<number, any>>({});
  
  const [loadingEnfants, setLoadingEnfants] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* ─── Charger les enfants du parent ─── */
  useEffect(() => {
    const loadEnfants = async () => {
  try {
    console.log("Appel API →", `${API}/parent/enfants`);
    const res = await authFetch(`${API}/parent/enfants`);
    
    console.log("Status:", res.status);
    
    if (!res.ok) {
      console.error("Erreur API:", res.status, await res.text());
      return;
    }

    const data = await res.json();
    console.log("Données reçues :", data);
    
    const liste = Array.isArray(data) ? data : (data.data || []);
    setEnfants(liste);
  } catch (err) {
    console.error("Exception:", err);
    setError("Impossible de charger les enfants");
  } finally {
    setLoadingEnfants(false);
  }
};

    loadEnfants();
  }, []);

  /* ─── Charger années académiques ─── */
  useEffect(() => {
    getAnnees()
      .then(data => {
        setAnnees(data);
        if (data.length > 0) setIdAca(String(data[data.length - 1].idAnnee));
      })
      .catch(() => {});
  }, []);

  /* ─── Charger trimestres ─── */
  useEffect(() => {
    if (!idAca) return;
    getTrimestres(idAca).then(setTrimestres).catch(() => {});
  }, [idAca]);

  const chargerBulletins = async () => {
    if (!idTrimestre || enfants.length === 0) return;
    
    setLoading(true);
    const results: Record<number, any> = {};

    for (const enfant of enfants) {
      try {
        const data = await getBulletin(enfant.matricule, idTrimestre);
        results[enfant.matricule] = data;
      } catch {
        results[enfant.matricule] = null;
      }
    }

    setBulletins(results);
    setLoading(false);
  };

  if (loadingEnfants) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p>Chargement de vos enfants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Espace Parent</h1>
        <p className="text-gray-500 mt-1">
          Bonjour {user?.name} • {enfants.length} enfant(s)
        </p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">{error}</div>}

      {/* Filtres */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-2">Année académique</label>
            <select
              value={idAca}
              onChange={(e) => { setIdAca(e.target.value); setIdTrimestre(''); }}
              className="w-full border border-gray-300 rounded-xl px-4 py-3"
            >
              <option value="">Sélectionner une année</option>
              {annees.map(a => (
                <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2">Trimestre</label>
            <select
              value={idTrimestre}
              onChange={(e) => setIdTrimestre(e.target.value)}
              disabled={!idAca}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 disabled:opacity-50"
            >
              <option value="">Sélectionner un trimestre</option>
              {trimestres.map(t => (
                <option key={t.idTrimes} value={t.idTrimes}>{t.libelle}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={chargerBulletins}
              disabled={!idTrimestre || loading}
              className="w-full bg-[#1a3a5c] text-white py-3 rounded-xl hover:bg-[#132d4a] disabled:opacity-50"
            >
              {loading ? "Chargement..." : "Voir les bulletins"}
            </button>
          </div>
        </div>
      </div>

      {/* Liste des enfants */}
      <div className="space-y-6">
        {enfants.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
            <p className="text-5xl mb-4">👨‍👧‍👦</p>
            <p className="text-lg font-medium">Aucun enfant associé</p>
            <p className="text-gray-500 mt-2">Contactez l'administration pour associer vos enfants</p>
          </div>
        ) : (
          enfants.map((enfant) => {
            const bulletin = bulletins[enfant.matricule];

            return (
              <div key={enfant.matricule} className="bg-white border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                      {enfant.sexe === 0 ? '👧' : '👦'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {enfant.prenom} {enfant.nom}
                      </h3>
                      <p className="text-sm text-gray-500">Matricule : {enfant.matricule}</p>
                    </div>
                  </div>

                  {bulletin && (
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600">
                        {bulletin.moyenneGenerale ?? '—'}/20
                      </p>
                    </div>
                  )}
                </div>

                {bulletin && (
                  <div className="mt-4 text-sm">
                    Mention : <span className="font-medium">{bulletin.mention}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}