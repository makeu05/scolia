'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authFetch } from '@/lib/auth';
import ParentsSection from './ParentsSection';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

interface Eleve {
  matricule: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  sexe: number;
  langue: string;
  photoURL: string;
  actif: number;
  villeNaissance?: { libelle: string };
}

const SEXE_LABELS: Record<number, string> = { 0: 'Fille', 1: 'Garçon', 2: 'Autre' };

export default function EleveDetailPage() {
  const router = useRouter();
  const params = useParams();
  const matricule = params.matricule;

  const [eleve, setEleve] = useState<Eleve | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(`${API}/eleves/${matricule}`)
      .then(r => r.json())
      .then(setEleve)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [matricule]);

  async function handleArchiver() {
    if (!confirm('Archiver cet élève ?')) return;
    await authFetch(`${API}/eleves/${matricule}/archiver`, { method: 'PATCH' });
    router.push('/dashboard/eleves');
  }

  async function handleReactiver() {
    await authFetch(`${API}/eleves/${matricule}/reactiver`, { method: 'PATCH' });
    setEleve(prev => prev ? { ...prev, actif: 1 } : prev);
  }

  if (loading) return (
    <div className="p-6 text-muted-foreground">Chargement...</div>
  );

  if (!eleve) return (
    <div className="p-6 text-muted-foreground">Élève introuvable.</div>
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* En-tête */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-muted-foreground text-sm hover:text-foreground mb-3 flex items-center gap-1"
        >
          ← Retour
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Fiche élève</h1>
          <div className="flex gap-2">
            <a
              href={`/dashboard/eleves/${matricule}/modifier`}
              className="px-4 py-2 text-sm border border-border text-foreground rounded-lg hover:bg-secondary transition"
            >
              Modifier
            </a>
            {eleve.actif === 1 ? (
              <button
                onClick={handleArchiver}
                className="px-4 py-2 text-sm bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition"
              >
                Archiver
              </button>
            ) : (
              <button
                onClick={handleReactiver}
                className="px-4 py-2 text-sm bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition"
              >
                Réactiver
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Carte principale */}
      <div className="bg-card border border-border rounded-xl p-6 mb-4">
        <div className="flex items-center gap-5 mb-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-secondary border border-border overflow-hidden flex items-center justify-center shrink-0">
            {eleve.photoURL && eleve.photoURL !== 'INDEFINI' ? (
              <img
                src={`http://localhost:8000/storage/${eleve.photoURL}`}
                alt={eleve.nom}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            )}
          </div>
          {/* Nom + statut */}
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {eleve.nom} {eleve.prenom}
            </h2>
            <p className="text-muted-foreground text-sm">Matricule #{eleve.matricule}</p>
            <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              eleve.actif === 1
                ? 'bg-green-500/10 text-green-400'
                : 'bg-red-500/10 text-red-400'
            }`}>
              {eleve.actif === 1 ? 'Actif' : 'Archivé'}
            </span>
          </div>
        </div>

        {/* Informations */}
        <div className="grid grid-cols-2 gap-4">
          <InfoItem label="Date de naissance" value={new Date(eleve.dateNaissance).toLocaleDateString('fr-FR')} />
          <InfoItem label="Sexe" value={SEXE_LABELS[eleve.sexe] ?? '-'} />
          <InfoItem label="Lieu de naissance" value={eleve.lieuNaissance} />
          <InfoItem label="Ville de naissance" value={eleve.villeNaissance?.libelle ?? '-'} />
          <InfoItem label="Langue" value={eleve.langue || '-'} />
        </div>
      </div>
       <ParentsSection matricule={eleve.matricule} />
    </div>
  );
 
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-foreground font-medium">{value}</p>
    </div>
  );
  
}
