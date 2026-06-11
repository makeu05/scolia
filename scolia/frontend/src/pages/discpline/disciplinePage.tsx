// pages/discipline/DisciplinePage.tsx
// Liste des incidents + filtres + création

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, AlertTriangle, Shield, Search } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import {
  getIncidents, type Incident, type Gravite,
  GRAVITE_LABEL, SANCTION_LABEL,
} from '../../service/discipline_service';

const GRAVITE_BADGE: Record<Gravite, string> = {
  leger: 'bg-yellow-50 text-yellow-600',
  moyen: 'bg-orange-50 text-orange-600',
  grave: 'bg-red-50 text-red-600',
};

export default function DisciplinePage() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [lastPage, setLastPage]   = useState(1);
  const [loading, setLoading]     = useState(false);

  // Filtres
  const [search, setSearch]   = useState('');
  const [gravite, setGravite] = useState('');

  const load = (p = 1) => {
    setLoading(true);
    getIncidents({ page: p, gravite: gravite as Gravite || undefined, type: search || undefined })
      .then((data) => {
        setIncidents(data.data);
        setTotal(data.total);
        setLastPage(data.last_page);
        setPage(p);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, [gravite]);

  return (
    <PageLayout
      title="Discipline"
      subtitle={`${total} incident${total > 1 ? 's' : ''} enregistré${total > 1 ? 's' : ''}`}
      actions={
        <button
          onClick={() => navigate('/discipline/nouveau')}
          className="btn-primary gap-2"
        >
          <Plus className="w-4 h-4" /> Signaler un incident
        </button>
      }
    >
      {/* Filtres */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load(1)}
            placeholder="Rechercher un type d'incident…"
            className="input w-full pl-9"
          />
        </div>
        <select
          value={gravite}
          onChange={(e) => setGravite(e.target.value)}
          className="input w-40"
        >
          <option value="">Toutes gravités</option>
          <option value="leger">Léger</option>
          <option value="moyen">Moyen</option>
          <option value="grave">Grave</option>
        </select>
        <button onClick={() => load(1)} className="btn-secondary gap-2">
          <Filter className="w-4 h-4" /> Filtrer
        </button>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : incidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <Shield className="w-12 h-12 opacity-20" />
          <p>Aucun incident enregistré</p>
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map((inc) => (
            <div
              key={inc.idIncident}
              onClick={() => navigate(`/discipline/${inc.idIncident}`)}
              className="card p-4 cursor-pointer hover:border-violet-200 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Icône gravité */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  inc.gravite === 'grave' ? 'bg-red-50' :
                  inc.gravite === 'moyen' ? 'bg-orange-50' : 'bg-yellow-50'
                }`}>
                  <AlertTriangle className={`w-5 h-5 ${
                    inc.gravite === 'grave' ? 'text-red-500' :
                    inc.gravite === 'moyen' ? 'text-orange-500' : 'text-yellow-500'
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900">
                      {inc.eleve?.nom} {inc.eleve?.prenom}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${GRAVITE_BADGE[inc.gravite]}`}>
                      {GRAVITE_LABEL[inc.gravite]}
                    </span>
                    {inc.sanctions && inc.sanctions.length > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-600">
                        {inc.sanctions.length} sanction{inc.sanctions.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{inc.type}</p>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{inc.description}</p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-slate-400">
                    {new Date(inc.dateIncident).toLocaleDateString('fr-FR')}
                  </p>
                  {inc.rapporteur && (
                    <p className="text-xs text-slate-400 mt-1">
                      Par {inc.rapporteur.prenom} {inc.rapporteur.nom}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => load(p)}
              className={`w-8 h-8 rounded-xl text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-violet-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-violet-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </PageLayout>
  );
}