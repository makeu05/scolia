import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, FileText } from 'lucide-react';
import {
  getEpreuve,
  deleteEpreuve,
  getDocumentUrl,
  type Epreuve,
} from '../../service/epreuve_service';

export default function EpreuveDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [epreuve, setEpreuve] = useState<Epreuve | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    try {
      setLoading(true);
      const data = await getEpreuve(Number(id));
      setEpreuve(data);
    } catch (err: any) {
      setError(err.message || "Impossible de charger l'épreuve");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Supprimer cette épreuve ? Cette action est irréversible.")) return;
    try {
      await deleteEpreuve(Number(id));
      navigate('/epreuves');
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#1a3a5c] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Chargement de l'épreuve...</p>
        </div>
      </div>
    );
  }

  if (!epreuve) {
    return <div className="p-6 text-center text-red-500">Épreuve non trouvée</div>;
  }

  const docUrl = getDocumentUrl(epreuve.urlDoc);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/epreuves')}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <ArrowLeft size={28} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{epreuve.libelle}</h1>
            <p className="text-gray-500 mt-1">
              {epreuve.nature?.libelle || 'Nature non définie'}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            to={`/epreuves/${id}/modifier`}
            className="flex items-center gap-2 bg-[#1a3a5c] text-white px-5 py-3 rounded-xl hover:bg-[#132d4a] transition"
          >
            <Edit size={18} />
            Modifier
          </Link>

          <button
            onClick={handleDelete}
            className="flex items-center gap-2 border border-red-300 text-red-600 px-5 py-3 rounded-xl hover:bg-red-50 transition"
          >
            <Trash2 size={18} />
            Supprimer
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-7">
            <h2 className="uppercase text-xs font-semibold tracking-widest text-gray-400 mb-4">
              Informations
            </h2>
            <div className="grid grid-cols-2 gap-y-6 text-sm">
              <div>
                <p className="text-gray-500">Libellé</p>
                <p className="font-medium mt-1">{epreuve.libelle}</p>
              </div>
              <div>
                <p className="text-gray-500">Nature</p>
                <p className="font-medium mt-1">{epreuve.nature?.libelle || '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">Auteur</p>
                <p className="font-medium mt-1">{epreuve.auteur !== 'INDEFINI' ? epreuve.auteur : '—'}</p>
              </div>
              <div>
                <p className="text-gray-500">Date de création</p>
                {/* <p className="font-medium mt-1">
                  {epreuve.created_at 
                    ? new Date(epreuve.created_at).toLocaleDateString('fr-FR') 
                    : '—'}
                </p> */}
              </div>
            </div>
          </div>

          {/* Document */}
          <div className="bg-white border border-gray-100 rounded-2xl p-7">
            <h2 className="uppercase text-xs font-semibold tracking-widest text-gray-400 mb-4">
              Document
            </h2>
            {docUrl ? (
              <a
                href={docUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 border border-gray-200 hover:border-[#1a3a5c] rounded-2xl p-5 transition group"
              >
                <FileText className="h-10 w-10 text-[#1a3a5c]" />
                <div>
                  <p className="font-medium group-hover:text-[#1a3a5c]">Ouvrir le document</p>
                  <p className="text-sm text-gray-500">PDF • Cliquer pour télécharger</p>
                </div>
              </a>
            ) : (
              <p className="text-gray-500 italic">Aucun document joint à cette épreuve.</p>
            )}
          </div>
        </div>

        {/* Évaluations */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-100 rounded-2xl p-7 h-full">
            <h2 className="uppercase text-xs font-semibold tracking-widest text-gray-400 mb-5">
              Évaluations ({epreuve.evaluations?.length ?? 0})
            </h2>

            {epreuve.evaluations && epreuve.evaluations.length > 0 ? (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
                {epreuve.evaluations.map((ev: any) => (
                  <div key={ev.idEval} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {ev.eleve?.prenom} {ev.eleve?.nom}
                        </p>
                        <p className="text-xs text-gray-500">Mat. {ev.eleve?.matricule}</p>
                      </div>
                      <div className={`text-xl font-bold ${ev.note >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                        {ev.note}
                      </div>
                    </div>
                    {ev.appreciation && (
                      <p className="text-sm text-gray-600 mt-2 italic">« {ev.appreciation} »</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 text-center">
                Aucune évaluation enregistrée pour cette épreuve
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}