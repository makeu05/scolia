import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getEpreuve,
  createEpreuve,
  updateEpreuve,
  getDocumentUrl,
} from '../../service/epreuve_service';
import { getNatures, type Nature } from '../../service/nature_service';

export default function EpreuveForm() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isEdit   = !!id;
  const fileRef  = useRef<HTMLInputElement>(null);

  const [natures, setNatures]     = useState<Nature[]>([]);
  const [fileName, setFileName]   = useState('');
  const [docActuel, setDocActuel] = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const [form, setForm] = useState({
    libelle:  '',
    auteur:   '',
    idNature: '',
    idPers:   '1',
  });

  useEffect(() => {
    getNatures().then(setNatures).catch(() => {});
    if (isEdit) loadEpreuve();
  }, []);

  async function loadEpreuve() {
    try {
      setLoading(true);
      const data = await getEpreuve(Number(id));
      setForm({
        libelle:  data.libelle,
        auteur:   data.auteur !== 'INDEFINI' ? (data.auteur ?? '') : '',
        idNature: String(data.idNature),
        idPers:   String(data.idPers),
      });
      const url = getDocumentUrl(data.urlDoc);
      if (url) setDocActuel(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    try {
      setLoading(true);
      if (isEdit) {
        await updateEpreuve(Number(id), form, file);
      } else {
        await createEpreuve(form, file);
      }
      navigate('/epreuves');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {isEdit ? "Modifier l'épreuve" : "Ajouter une épreuve"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit ? 'Mettre à jour les informations' : 'Créer une nouvelle épreuve'}
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

        {/* LIBELLE */}
        <div>
          <label className="block text-sm mb-2">Libellé</label>
          <input
            type="text"
            required
            value={form.libelle}
            onChange={e => update('libelle', e.target.value)}
            placeholder="ex: Devoir 1, Examen final..."
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* NATURE */}
        <div>
          <label className="block text-sm mb-2">Nature de l'épreuve</label>
          <select
            required
            value={form.idNature}
            onChange={e => update('idNature', e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm"
          >
            <option value="">Sélectionner une nature</option>
            {natures.map(n => (
              <option key={n.idNature} value={n.idNature}>{n.libelle}</option>
            ))}
          </select>
          {natures.length === 0 && (
            <p className="text-xs text-yellow-500 mt-1">
              Aucune nature disponible.{' '}
              <button
                type="button"
                onClick={() => navigate('/natures/ajouter')}
                className="underline"
              >
                En créer une
              </button>
            </p>
          )}
        </div>

        {/* AUTEUR */}
        <div>
          <label className="block text-sm mb-2">Auteur (optionnel)</label>
          <input
            type="text"
            value={form.auteur}
            onChange={e => update('auteur', e.target.value)}
            placeholder="Nom de l'auteur..."
            className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* DOCUMENT ACTUEL */}
        {isEdit && docActuel && !fileName && (
          <div className="bg-muted/30 border border-border rounded-lg px-4 py-3">
            <p className="text-xs text-muted-foreground mb-2">Document actuel :</p>
            
              <a href={docActuel}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <span>📄</span>
              <span>Voir le PDF actuel</span>
            </a>
           </div>
        )};
       

        {/* UPLOAD PDF */}
        <div>
          <label className="block text-sm mb-2">
            {isEdit && docActuel ? 'Remplacer le document PDF' : 'Document PDF (optionnel)'}
          </label>
          <div
            onClick={() => fileRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-xl px-4 py-6 text-center cursor-pointer transition ${
              fileName
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground'
            }`}
          >
            <input
              type="file"
              ref={fileRef}
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            {fileName ? (
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">📄</span>
                <div className="text-left">
                  <p className="text-sm font-medium text-primary">{fileName}</p>
                  <p className="text-xs text-muted-foreground">Cliquer pour changer</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-3xl mb-2">📎</p>
                <p className="text-sm text-muted-foreground">
                  {isEdit && docActuel
                    ? 'Cliquer pour remplacer le PDF existant'
                    : 'Cliquer pour sélectionner un PDF'
                  }
                </p>
                <p className="text-xs text-muted-foreground/50 mt-1">Max 10 MB</p>
              </div>
            )}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground px-5 py-3 rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/epreuves')}
            className="bg-secondary px-5 py-3 rounded-lg text-sm hover:opacity-80 transition"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}