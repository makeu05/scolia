import { useEffect, useState } from 'react';
import { href, useNavigate, useParams } from 'react-router-dom';
import {
  getEpreuve,
  deleteEpreuve,
  getDocumentUrl,
  type Epreuve,
} from '../../service/epreuve_service';

export default function EpreuveDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [epreuve, setEpreuve] = useState<Epreuve | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => { load(); }, [id]);

  async function load() {
    try {
      setLoading(true);
      const data = await getEpreuve(Number(id));
      setEpreuve(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Supprimer cette épreuve ?")) return;
    try {
      await deleteEpreuve(Number(id));
      navigate('/epreuves');
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) return (
    <div className="p-6 text-center text-muted-foreground text-sm">Chargement...</div>
  );

  if (!epreuve) return null;

  const docUrl = getDocumentUrl(epreuve.urlDoc);

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* HEADER */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{epreuve.libelle}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {epreuve.nature?.libelle ?? '—'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/epreuves/${id}/modifier`)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm hover:opacity-90 transition"
          >
            Modifier
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm hover:bg-red-500/20 transition"
          >
            Supprimer
          </button>
          <button
            onClick={() => navigate('/epreuves')}
            className="bg-secondary px-4 py-2 rounded-lg text-sm hover:opacity-80 transition"
          >
            Retour
          </button>
        </div>
      </div>

      {/* ERREUR */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}

      {/* INFOS */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Informations
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ['Libellé', epreuve.libelle],
            ['Nature',  epreuve.nature?.libelle ?? '—'],
            ['Auteur',  epreuve.auteur !== 'INDEFINI' ? epreuve.auteur : '—'],
          ].map(([label, val]) => (
            <div key={label}>
              <p className="text-muted-foreground text-xs mb-0.5">{label}</p>
              <p className="font-medium">{val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DOCUMENT */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Document
        </h2>
        {docUrl ? (
          
            <a href={docUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-muted/30 border border-border rounded-xl px-4 py-3 hover:border-primary transition"
          >
            <span className="text-3xl">📄</span>
            <div>
              <p className="text-sm font-medium text-primary">Voir le document PDF</p>
              <p className="text-xs text-muted-foreground">Cliquer pour ouvrir</p>
            </div>
          </a>
        ) : (
          <p className="text-muted-foreground text-sm">Aucun document joint</p>
        )}
      </div>

      {/* EVALUATIONS */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Évaluations ({epreuve.evaluations?.length ?? 0})
        </h2>
        {epreuve.evaluations && epreuve.evaluations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="pb-2 text-left">Élève</th>
                  <th className="pb-2 text-center">Note</th>
                  <th className="pb-2 text-left">Appréciation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {epreuve.evaluations.map((ev: any) => (
                  <tr key={ev.idEval}>
                    <td className="py-2 font-medium">
                      {ev.eleve?.prenom} {ev.eleve?.nom}
                    </td>
                    <td className={`py-2 text-center font-bold ${
                      ev.note >= 10 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {ev.note}
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {ev.appreciation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Aucune évaluation pour cette épreuve
          </p>
        )}
      </div>
    </div>
  );
}