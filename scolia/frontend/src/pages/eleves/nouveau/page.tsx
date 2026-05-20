'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/auth';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

interface VilleNaissance {
  idVille: number;
  libelle: string;
}

export default function NouvelElevePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [villes, setVilles] = useState<VilleNaissance[]>([]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    dateNaissance: '',
    lieuNaissance: '',
    sexe: '0',
    langue: '',
    idVilleNaissance: '',
    idAdmin: '1',
  });

  useEffect(() => {
    authFetch(`${API}/villes`)
      .then(r => r.json())
      .then(setVilles)
      .catch(() => {});
  }, []);

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (photo) formData.append('photo', photo);

    const token = localStorage.getItem('token');

    const res = await fetch(`${API}/eleves`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // Pas de Content-Type ici — le browser le gère pour FormData
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message ?? 'Erreur lors de la création');
    }

    router.push('/dashboard/eleves');
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : 'Erreur inconnue');
  } finally {
    setLoading(false);
  }
}

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
        <h1 className="text-2xl font-bold text-foreground">Ajouter un élève</h1>
        <p className="text-muted-foreground text-sm">Remplissez les informations de l&apos;élève</p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Photo */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-medium text-foreground mb-4">Photo de l&apos;élève</h2>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-secondary border border-border overflow-hidden flex items-center justify-center">
              {photoPreview ? (
                <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              )}
            </div>
            <div>
              <label className="cursor-pointer bg-secondary border border-border text-foreground text-sm px-4 py-2 rounded-lg hover:bg-secondary/70 transition">
                Choisir une photo
                <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              </label>
              <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG — max 2 Mo</p>
            </div>
          </div>
        </div>

        {/* Informations personnelles */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-medium text-foreground mb-4">Informations personnelles</h2>
          <div className="space-y-4">

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                Matricule
              </label>
              <input
                type="number"
                required
                value={form.matricule}
                onChange={e => update('matricule', e.target.value)}
                placeholder="Ex: 10234"
                className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-foreground text-sm placeholder-muted-foreground outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Nom</label>
                <input
                  type="text"
                  required
                  value={form.nom}
                  onChange={e => update('nom', e.target.value)}
                  placeholder="DUPONT"
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-foreground text-sm placeholder-muted-foreground outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Prénom</label>
                <input
                  type="text"
                  required
                  value={form.prenom}
                  onChange={e => update('prenom', e.target.value)}
                  placeholder="Jean"
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-foreground text-sm placeholder-muted-foreground outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Date de naissance</label>
                <input
                  type="date"
                  required
                  value={form.dateNaissance}
                  onChange={e => update('dateNaissance', e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-foreground text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Sexe</label>
                <select
                  value={form.sexe}
                  onChange={e => update('sexe', e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-foreground text-sm outline-none focus:border-primary transition-colors"
                >
                  <option value="0">Fille</option>
                  <option value="1">Garçon</option>
                  <option value="2">Autre</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Lieu de naissance</label>
                <input
                  type="text"
                  required
                  value={form.lieuNaissance}
                  onChange={e => update('lieuNaissance', e.target.value)}
                  placeholder="Yaoundé"
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-foreground text-sm placeholder-muted-foreground outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Ville de naissance</label>
                <select
                  value={form.idVilleNaissance}
                  onChange={e => update('idVilleNaissance', e.target.value)}
                  required
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-foreground text-sm outline-none focus:border-primary transition-colors"
                >
                  <option value="">Sélectionner...</option>
                  {villes.map(v => (
                    <option key={v.idVille} value={v.idVille}>{v.libelle}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Langue</label>
              <input
                type="text"
                value={form.langue}
                onChange={e => update('langue', e.target.value)}
                placeholder="Français"
                className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-foreground text-sm placeholder-muted-foreground outline-none focus:border-primary transition-colors"
              />
            </div>

          </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 text-sm border border-border text-muted-foreground rounded-lg hover:text-foreground transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition font-medium"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer l\'élève'}
          </button>
        </div>

      </form>
    </div>
  );
}