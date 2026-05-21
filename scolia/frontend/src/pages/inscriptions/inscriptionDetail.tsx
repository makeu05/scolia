import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getInscription,
  deleteInscription,
  type Inscription,
} from '../../service/inscription_service';

export default function InscriptionDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [inscription, setInscription] = useState<Inscription | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

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
    <div className="p-6 text-center text-muted-foreground text-sm">
      Chargement...
    </div>
  );

  if (!inscription) return null;

  const eleve = inscription.eleve;
  const salle = inscription.salle;
  const annee = inscription.annee_academique;

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* HEADER */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {eleve?.prenom} {eleve?.nom}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Matricule #{eleve?.matricule}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/inscriptions/${id}/modifier`)}
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
            onClick={() => navigate('/inscriptions')}
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

      {/* INFOS ÉLÈVE */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Informations de l'élève
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ['Nom',        eleve?.nom],
            ['Prénom',     eleve?.prenom],
            ['Matricule',  eleve?.matricule],
            ['Sexe',       eleve?.sexe === 0 ? 'Fille' : eleve?.sexe === 1 ? 'Garçon' : 'Autre'],
            ['Statut',     eleve?.actif ? 'Actif' : 'Archivé'],
          ].map(([label, val]) => (
            <div key={String(label)}>
              <p className="text-muted-foreground text-xs mb-0.5">{label}</p>
              <p className="font-medium">{val ?? '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* INFOS INSCRIPTION */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Détails de l'inscription
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ['Année académique', annee?.libelle],
            ['Période',          annee?.periode],
            ['Classe',           salle?.classe?.libelle],
            ['Cycle',            salle?.classe?.cycle?.libelle],
            ['Salle',            salle?.libelle],
            ['Commentaire',      inscription.commentaire],
          ].map(([label, val]) => (
            <div key={String(label)}>
              <p className="text-muted-foreground text-xs mb-0.5">{label}</p>
              <p className="font-medium">{val ?? '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* STATUT BADGE */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Statut
        </h2>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
          eleve?.actif
            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            eleve?.actif ? 'bg-green-400' : 'bg-red-400'
          }`} />
          {eleve?.actif ? 'Élève actif' : 'Élève archivé'}
        </span>
      </div>

    </div>
  );
}