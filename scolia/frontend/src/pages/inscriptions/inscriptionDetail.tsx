import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';

import {
  getInscription,
  deleteInscription,
  type Inscription,
} from '../../service/inscription_service';

export default function InscriptionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inscription, setInscription] = useState<Inscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    try {
      setLoading(true);
      const data = await getInscription(Number(id));
      setInscription(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Supprimer cette inscription ?')) return;
    try {
      await deleteInscription(Number(id));
      navigate('/inscriptions');
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading) return (
    <div className="p-6 text-center text-gray-500">Chargement des informations...</div>
  );

  if (!inscription) return null;

  const eleve = inscription.eleve;
  const salle = inscription.salle;
  const annee = inscription.annee_academique;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/inscriptions" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={20} />
          Retour aux inscriptions
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">
          {eleve?.prenom} {eleve?.nom}
        </h1>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl mb-6">
          {error}
        </div>
      )}

      {/* Informations Élève */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
        <h2 className="text-lg font-semibold mb-5">Informations de l'élève</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-gray-500 text-xs mb-1">Nom complet</p>
            <p className="font-medium">{eleve?.prenom} {eleve?.nom}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">Matricule</p>
            <p className="font-medium">#{eleve?.matricule}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">Sexe</p>
            <p className="font-medium">
              {eleve?.sexe === 0 ? 'Fille' : eleve?.sexe === 1 ? 'Garçon' : 'Autre'}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">Statut</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              eleve?.actif 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {eleve?.actif ? 'Actif' : 'Archivé'}
            </span>
          </div>
        </div>
      </div>

      {/* Détails Inscription */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
        <h2 className="text-lg font-semibold mb-5">Détails de l'inscription</h2>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-gray-500 text-xs mb-1">Année Académique</p>
            <p className="font-medium">{annee?.libelle}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">Classe</p>
            <p className="font-medium">{salle?.classe?.libelle ?? '—'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">Salle</p>
            <p className="font-medium">{salle?.libelle ?? '—'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1">Commentaire</p>
            <p className="font-medium text-gray-700">
              {inscription.commentaire || 'RAS'}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate(`/inscriptions/${id}/modifier`)}
          className="flex items-center gap-2 bg-[#1a3a5c] text-white px-6 py-3 rounded-xl hover:bg-[#16324f] transition"
        >
          <Edit size={18} />
          Modifier l'inscription
        </button>

        <button
          onClick={handleDelete}
          className="flex items-center gap-2 border border-red-300 text-red-600 px-6 py-3 rounded-xl hover:bg-red-50 transition"
        >
          <Trash2 size={18} />
          Supprimer
        </button>

        <button
          onClick={() => navigate('/inscriptions')}
          className="flex-1 border border-gray-300 py-3 rounded-xl hover:bg-gray-50 transition"
        >
          Retour à la liste
        </button>
      </div>
    </div>
  );
}