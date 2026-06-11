import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { useAuth } from '../../service/auth';
import { createEpreuve, getEpreuve, updateEpreuve } from '../../service/epreuve_service';
import { getNatures, type Nature } from '../../service/nature_service';

export default function EpreuveForm() {
  const { idEpreuve } = useParams<{ idEpreuve?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!idEpreuve;

  const [libelle, setLibelle]     = useState('');
  const [idNature, setIdNature]   = useState('');
  const [auteur, setAuteur]       = useState('');
  const [document, setDocument]   = useState<File | null>(null);
  const [previewName, setPreviewName] = useState('');
  const [natures, setNatures]     = useState<Nature[]>([]);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    getNatures().then(setNatures).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit || !idEpreuve) return;
    getEpreuve(Number(idEpreuve))
      .then(data => {
        setLibelle(data.libelle || '');
        setIdNature(String(data.idNature || ''));
        setAuteur(data.auteur !== 'INDEFINI' ? data.auteur : user?.name || '');
      })
      .catch(err => setError(err.message));
  }, [idEpreuve, isEdit, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Seuls les fichiers PDF sont acceptés');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 10 Mo');
      return;
    }
    setDocument(file);
    setPreviewName(file.name);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!libelle || !idNature) {
      setError("Le libellé et la nature sont obligatoires");
      setSaving(false);
      return;
    }

    // ✅ Extraction sécurisée + conversion numérique explicite
    const rawId = user?.idPers ?? user?.id;
    const numericIdPers = rawId !== undefined && rawId !== null
      ? Number(rawId)
      : null;

    if (!numericIdPers || isNaN(numericIdPers)) {
      setError("Impossible d'identifier l'enseignant connecté. Veuillez vous reconnecter.");
      setSaving(false);
      return;
    }

    const formData = new FormData();
    formData.append('libelle', libelle);
    formData.append('idNature', idNature);
    formData.append('idPers', String(numericIdPers)); // ex: "42" garanti numérique
    formData.append('auteur', auteur || user?.name || 'INDEFINI');

    if (document) {
      // ✅ Blob avec type MIME explicite pour éviter "failed to upload"
      const blob = new Blob([document], { type: 'application/pdf' });
      formData.append('document', blob, document.name);
    }

    try {
      if (isEdit && idEpreuve) {
        await updateEpreuve(Number(idEpreuve), formData);
        alert('Épreuve modifiée avec succès !');
      } else {
        await createEpreuve(formData);
        alert('Épreuve créée avec succès !');
      }
      navigate('/epreuves');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/epreuves" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition">
          <ArrowLeft size={18} /> Retour
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">
          {isEdit ? "Modifier l'Épreuve" : "Nouvelle Épreuve"}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm shadow-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm space-y-6">

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Libellé de l'épreuve *</label>
          <input
            type="text"
            required
            value={libelle}
            onChange={(e) => setLibelle(e.target.value)}
            placeholder="Ex: Devoir de Mathématiques 3ème"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#fda085] bg-white transition"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nature de l'évaluation *</label>
            <select
              required
              value={idNature}
              onChange={(e) => setIdNature(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#fda085] bg-white transition cursor-pointer"
            >
              <option value="">Sélectionner une nature</option>
              {natures.map(n => (
                <option key={n.idNature} value={n.idNature}>{n.libelle}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Auteur / Enseignant</label>
            <input
              type="text"
              value={auteur}
              onChange={(e) => setAuteur(e.target.value)}
              placeholder="Nom de l'auteur"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#fda085] bg-white transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Document Sujet (PDF)</label>
          <label className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-[#fda085] hover:bg-slate-50/50 cursor-pointer block transition">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-3 text-sm font-semibold text-slate-800">
              {previewName ? previewName : "Cliquez ou glissez pour charger le sujet d'épreuve"}
            </p>
            <p className="text-xs text-slate-400 mt-1">Fichier PDF uniquement (Max: 10Mo)</p>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="pt-4 flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 text-white py-3.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 disabled:opacity-70"
            style={{ background: "linear-gradient(135deg,#f6d365 0%,#fda085 100%)", boxShadow: "0 2px 12px rgba(253,160,133,0.3)" }}
          >
            <Save size={18} />
            {saving ? "Enregistrement..." : isEdit ? "Enregistrer les modifications" : "Créer l'épreuve"}
          </button>
          <Link to="/epreuves" className="flex-1 border border-gray-200 text-slate-600 py-3.5 rounded-xl font-semibold text-sm text-center hover:bg-slate-50 transition flex items-center justify-center">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}