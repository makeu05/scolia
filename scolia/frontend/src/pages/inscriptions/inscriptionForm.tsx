import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getInscription,
  createInscription,
  updateInscription,
  getClasses,
  getSallesByClasse,
  getAnnees,
  searchEleves,
  type Classe,
  type Salle,
  type AnneeAcademique,
  type Eleve,
} from '../../service/inscription_service';

export default function InscriptionForm() {
  const navigate  = useNavigate();
  const { id }    = useParams();
  const isEdit    = !!id;

  const [classes, setClasses]   = useState<Classe[]>([]);
  const [salles, setSalles]     = useState<Salle[]>([]);
  const [annees, setAnnees]     = useState<AnneeAcademique[]>([]);
  const [eleves, setEleves]     = useState<Eleve[]>([]);
  const [searchQ, setSearchQ]   = useState('');
  const [eleveLabel, setEleveLabel] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const [form, setForm] = useState({
    matricule:   '',
    idSalle:     '',
    idAcademi:   '',
    idClasse:    '',
    commentaire: '',
    idAdmin:     '1',
  });

  /* ─── Chargement initial ─── */

  useEffect(() => {
    getClasses().then(setClasses).catch(() => {});
    getAnnees().then(setAnnees).catch(() => {});

    if (isEdit) loadInscription();
  }, []);

  async function loadInscription() {
    try {
      setLoading(true);
      const data = await getInscription(Number(id));

      const idClasse = String(data.salle?.idClasse ?? '');

      setForm({
        matricule:   String(data.matricule),
        idSalle:     String(data.idSalle),
        idAcademi:   String(data.idAcademi),
        idClasse,
        commentaire: data.commentaire ?? '',
        idAdmin:     '1',
      });

      setEleveLabel(
        `${data.eleve?.prenom ?? ''} ${data.eleve?.nom ?? ''} — ${data.matricule}`
      );

      if (idClasse) {
        const s = await getSallesByClasse(idClasse);
        setSalles(s);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* ─── Recherche élève ─── */

 async function handleSearchEleve() {
  if (!searchQ || searchQ.trim().length < 2) {
    setEleves([]);
    return;
  }
  try {
    setLoading(true);
    const data = await searchEleves(searchQ.trim());
    setEleves(data);
    if (data.length === 0) {
      setError('Aucun élève trouvé pour cette recherche');
      // Effacer l'erreur après 3s
      setTimeout(() => setError(''), 3000);
    }
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

  function selectEleve(el: Eleve) {
    setForm(f => ({ ...f, matricule: String(el.matricule) }));
    setEleveLabel(`${el.prenom} ${el.nom} — ${el.matricule}`);
    setEleves([]);
    setSearchQ('');
  }

  /* ─── Changement de classe → charger les salles ─── */

  async function handleClasseChange(idClasse: string) {
    setForm(f => ({ ...f, idClasse, idSalle: '' }));
    if (!idClasse) { setSalles([]); return; }
    try {
      const data = await getSallesByClasse(idClasse);
      setSalles(data);
    } catch (err: any) {
      setError(err.message);
    }
  }

  /* ─── Update champ ─── */

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  /* ─── Submit ─── */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEdit) {
        await updateInscription(Number(id), {
          idSalle:     Number(form.idSalle),
          commentaire: form.commentaire,
        });
      } else {
        await createInscription({
          matricule:   Number(form.matricule),
          idSalle:     Number(form.idSalle),
          idAcademi:   Number(form.idAcademi),
          commentaire: form.commentaire,
          idAdmin:     Number(form.idAdmin),
        });
      }
      navigate('/inscriptions');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {isEdit ? "Modifier l'inscription" : 'Inscrire un élève'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit ? 'Modifier la classe ou la salle' : 'Affecter un élève à une classe'}
        </p>
      </div>

      {/* ERREUR */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-2xl p-6 space-y-5"
      >

        {/* RECHERCHE ÉLÈVE — masqué en mode édition */}
{!isEdit && (
  <div>
    <label className="block text-sm mb-2">Élève</label>

    {form.matricule ? (
      <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-lg px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-primary text-lg">✓</span>
          <span className="text-sm font-medium">{eleveLabel}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm(f => ({ ...f, matricule: '' }));
            setEleveLabel('');
            setEleves([]);
          }}
          className="text-xs text-muted-foreground hover:text-red-400 transition"
        >
          Changer
        </button>
      </div>
    ) : (
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQ}
            onChange={e => {
              setSearchQ(e.target.value);
              // Vider les résultats si on efface
              if (!e.target.value) setEleves([]);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchEleve();
              }
              // Fermer avec Escape
              if (e.key === 'Escape') setEleves([]);
            }}
            placeholder="Nom, prénom ou matricule..."
            className="flex-1 bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={handleSearchEleve}
            disabled={loading}
            className="bg-secondary px-4 py-3 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? '...' : 'Rechercher'}
          </button>
        </div>

        {/* Dropdown résultats */}
        {eleves.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-xl overflow-hidden shadow-xl">
            <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border">
              {eleves.length} résultat(s)
            </div>
            {eleves.map(el => (
              <button
                key={el.matricule}
                type="button"
                onClick={() => selectEleve(el)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition border-b border-border last:border-0 flex items-center justify-between"
              >
                <div>
                  <span className="font-medium">{el.prenom} {el.nom}</span>
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                    el.sexe === 0
                      ? 'bg-pink-500/10 text-pink-400'
                      : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {el.sexe === 0 ? 'F' : 'G'}
                  </span>
                </div>
                <span className="text-muted-foreground text-xs">
                  #{el.matricule}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Pas de résultats */}
        {searchQ.length >= 2 && eleves.length === 0 && !loading && (
          <p className="text-xs text-muted-foreground mt-1">
            Tape au moins 2 caractères et clique Rechercher
          </p>
        )}
      </div>
    )}
  </div>
)}

        {/* ÉLÈVE EN MODE ÉDITION */}
        {isEdit && eleveLabel && (
          <div>
            <label className="block text-sm mb-2">Élève</label>
            <div className="bg-muted/30 border border-border rounded-lg px-4 py-3 text-sm text-muted-foreground">
              {eleveLabel}
            </div>
          </div>
        )}

        {/* ANNÉE ACADÉMIQUE — masqué en mode édition */}
        {!isEdit && (
          <div>
            <label className="block text-sm mb-2">Année académique</label>
            <select
              required
              value={form.idAcademi}
              onChange={e => update('idAcademi', e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm"
            >
              <option value="">Sélectionner une année</option>
              {annees.map(a => (
                <option key={a.idAnnee} value={a.idAnnee}>
                  {a.libelle} — {a.periode}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* CLASSE */}
        <div>
          <label className="block text-sm mb-2">Classe</label>
          <select
            required={!isEdit}
            value={form.idClasse}
            onChange={e => handleClasseChange(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm"
          >
            <option value="">Sélectionner une classe</option>
            {classes.map(c => (
              <option key={c.idClasse} value={c.idClasse}>
                {c.libelle} {c.cycle ? `— ${c.cycle.libelle}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* SALLE */}
        <div>
          <label className="block text-sm mb-2">Salle</label>
          <select
            required
            value={form.idSalle}
            onChange={e => update('idSalle', e.target.value)}
            disabled={salles.length === 0}
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm disabled:opacity-50"
          >
            <option value="">Sélectionner une salle</option>
            {salles.map(s => (
              <option key={s.idSalle} value={s.idSalle}>
                {s.libelle} ({s.surface})
              </option>
            ))}
          </select>
          {form.idClasse && salles.length === 0 && (
            <p className="text-xs text-yellow-500 mt-1">
              Aucune salle active pour cette classe
            </p>
          )}
        </div>

        {/* COMMENTAIRE */}
        <div>
          <label className="block text-sm mb-2">Commentaire (optionnel)</label>
          <input
            type="text"
            value={form.commentaire}
            onChange={e => update('commentaire', e.target.value)}
            placeholder="RAS"
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || (!isEdit && !form.matricule)}
            className="bg-primary text-primary-foreground px-5 py-3 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Inscrire'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/inscriptions')}
            className="bg-secondary px-5 py-3 rounded-lg text-sm hover:opacity-80 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}