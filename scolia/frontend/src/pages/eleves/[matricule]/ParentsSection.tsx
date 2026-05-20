'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/auth';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

interface Personne {
  idPers: number;
  nom: string;
  prenom: string;
  mobile: string;
  phone: string;
  typePersonne: number;
}

interface Parent {
  idParent: number;
  idPers: number;
  matricule: number;
  personne: Personne;
}

interface Props {
  matricule: number;
}

export default function ParentsSection({ matricule }: Props) {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    mobile: '',
    phone: '',
    lieuNaissance: '',
    dateNaissance: '',
    typePersonne: '4',
    idAdmin: '1',
  });

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function fetchParents() {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/eleves/${matricule}/parents`);
      const data = await res.json();
      setParents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchParents();
  }, [matricule]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API}/eleves/${matricule}/parents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message ?? 'Erreur lors de l\'ajout');
      }

      setForm({
        nom: '', prenom: '', mobile: '', phone: '',
        lieuNaissance: '', dateNaissance: '',
        typePersonne: '4', idAdmin: '1',
      });
      setShowForm(false);
      fetchParents();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(idParent: number) {
    if (!confirm('Retirer ce parent ?')) return;
    const token = localStorage.getItem('token');
    await fetch(`${API}/eleves/${matricule}/parents/${idParent}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchParents();
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 mt-4">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-foreground">
          Parents / Tuteurs
          <span className="ml-2 text-xs text-muted-foreground">({parents.length})</span>
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:opacity-90 transition"
        >
          {showForm ? 'Annuler' : '+ Ajouter'}
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-secondary/30 border border-border rounded-lg p-4 mb-4 space-y-3">
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-xs rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wide">Nom</label>
              <input
                type="text"
                required
                value={form.nom}
                onChange={e => update('nom', e.target.value)}
                placeholder="DUPONT"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wide">Prénom</label>
              <input
                type="text"
                required
                value={form.prenom}
                onChange={e => update('prenom', e.target.value)}
                placeholder="Marie"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wide">Mobile</label>
              <input
                type="text"
                value={form.mobile}
                onChange={e => update('mobile', e.target.value)}
                placeholder="6XXXXXXXX"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wide">Téléphone</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => update('phone', e.target.value)}
                placeholder="2XXXXXXXX"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wide">Date de naissance</label>
              <input
                type="date"
                value={form.dateNaissance}
                onChange={e => update('dateNaissance', e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1 uppercase tracking-wide">Type</label>
              <select
                value={form.typePersonne}
                onChange={e => update('typePersonne', e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground text-sm outline-none focus:border-primary transition-colors"
              >
                <option value="4">Parent</option>
                <option value="5">Tuteur</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition font-medium"
            >
              {submitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}

      {/* Liste des parents */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement...</p>
      ) : parents.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun parent enregistré</p>
      ) : (
        <div className="space-y-3">
          {parents.map(parent => (
            <div
              key={parent.idParent}
              className="flex items-center justify-between bg-secondary/30 border border-border rounded-lg px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary text-sm font-medium">
                    {parent.personne.nom[0]}{parent.personne.prenom[0]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {parent.personne.nom} {parent.personne.prenom}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {parent.personne.mobile !== '000' ? parent.personne.mobile : ''}
                    {parent.personne.phone !== '000' ? ` · ${parent.personne.phone}` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(parent.idParent)}
                className="text-xs text-red-400 hover:text-red-300 transition"
              >
                Retirer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}