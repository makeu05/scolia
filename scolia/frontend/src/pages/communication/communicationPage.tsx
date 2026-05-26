import { useEffect, useState, useCallback } from 'react';
import { Plus, MessageSquare, ChevronDown, ChevronUp, CheckCircle, X } from 'lucide-react';
import {
  getMessages, sendMessage, sendDiffusion, validerMessage,
  TYPE_LABELS, TYPE_COLORS, type Message, type MessagePaginate,
} from '../../service/communication_service';
import { getUser } from '../../service/auth';

// ─── Parents (on les charge depuis l'API élèves) ──────────────
interface ParentSimple {
  idParent: number;
  personne?: { nom: string; prenom: string };
  eleve?:   { nom: string; prenom: string };
}

async function getParents(): Promise<ParentSimple[]> {
  const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';
  const token = localStorage.getItem('token');
  const res = await fetch(`${API}/eleves?paginate=false`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  const data = await res.json();
  const eleves = Array.isArray(data) ? data : data.data ?? [];
  // Extraire les parents de chaque élève
  const parents: ParentSimple[] = [];
  for (const eleve of eleves) {
    if (eleve.parents) {
      for (const p of eleve.parents) {
        parents.push({ ...p, eleve: { nom: eleve.nom, prenom: eleve.prenom } });
      }
    }
  }
  return parents;
}

// ─── Modale Composition ──────────────────────────────────────
function ModaleMessage({ parents, onSave, onClose }: {
  parents: ParentSimple[];
  onSave: (m: Message) => void;
  onClose: () => void;
}) {
  const [type, setType]         = useState<0 | 1 | 2>(0);
  const [idParent, setIdParent] = useState('');
  const [objet, setObjet]       = useState('');
  const [info, setInfo]         = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [succes, setSucces]     = useState(false);
  const user      = getUser();
  const isDiff    = type === 1 || type === 2;
  const annee     = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!objet || !info) { setError('Objet et message sont obligatoires.'); return; }
    if (!isDiff && !idParent) { setError('Sélectionnez un destinataire.'); return; }
    setLoading(true); setError(null);
    try {
      if (isDiff) {
        await sendDiffusion({ idExp_Pers: user?.id ?? 1, objet, information: info, type_message: type as 1 | 2, AnneeAcade: annee });
        // Simuler un message retourné pour l'UI
        onSave({ idMessages: Date.now(), idExp_Pers: user?.id ?? 1, idParent: 0, objet, information: info, type_message: type, AnneeAcade: annee, valider: false, created_at: new Date().toISOString() });
      } else {
        const res = await sendMessage({ idExp_Pers: user?.id ?? 1, idParent: Number(idParent), objet, information: info, type_message: 0, AnneeAcade: annee });
        onSave(res.data);
      }
      setSucces(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur serveur');
    } finally { setLoading(false); }
  };

  const inp = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20";
  const lbl = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Composer un message</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="h-4 w-4" /></button>
        </div>

        {succes ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-1">Message envoyé avec succès !</p>
            <p className="text-sm text-gray-500 mb-1">
              {isDiff ? `Diffusé à tous les parents.` : 'Transmis au parent sélectionné.'}
            </p>
            <p className="text-xs text-gray-400 mb-5">Simulation — API Alanya non connectée, message sauvegardé en BD.</p>
            <button onClick={onClose} className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={envoyer} className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm">{error}</div>}

            {/* Type */}
            <div>
              <label className={lbl}>Type de message *</label>
              <div className="flex flex-wrap gap-2">
                {([0, 1, 2] as const).map(t => (
                  <button key={t} type="button"
                    onClick={() => { setType(t); setIdParent(''); }}
                    className={`px-4 py-2 rounded-xl text-sm border transition ${type === t ? 'border-[#1a3a5c] bg-[#eaf0f8] text-[#1a3a5c] font-semibold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Destinataire */}
            {!isDiff && (
              <div>
                <label className={lbl}>Destinataire *</label>
                <select className={inp} value={idParent} onChange={e => setIdParent(e.target.value)}>
                  <option value="">-- Sélectionner un parent --</option>
                  {parents.map(p => (
                    <option key={p.idParent} value={p.idParent}>
                      {p.personne?.nom} {p.personne?.prenom}
                      {p.eleve ? ` (parent de ${p.eleve.nom} ${p.eleve.prenom})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isDiff && (
              <div className={`text-sm px-4 py-2 rounded-xl ${TYPE_COLORS[type]}`}>
                Ce message sera envoyé à <strong>tous les parents</strong> enregistrés.
              </div>
            )}

            <div>
              <label className={lbl}>Objet *</label>
              <input className={inp} value={objet} onChange={e => setObjet(e.target.value)} placeholder="Objet du message" />
            </div>
            <div>
              <label className={lbl}>Message *</label>
              <textarea className={inp} rows={4} value={info} onChange={e => setInfo(e.target.value)} placeholder="Rédigez votre message..." />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading}
                className="flex-1 py-2.5 bg-[#1a3a5c] text-white rounded-xl text-sm font-medium hover:bg-[#15304d] disabled:opacity-60 transition">
                {loading ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Carte Message ────────────────────────────────────────────
function CarteMessage({ message, onValider }: { message: Message; onValider: (id: number) => void }) {
  const [ouvert, setOuvert] = useState(false);
  const user   = getUser();
  const isDir  = user?.role === 'Directeur' || user?.role === 'Administrateur';
  const fmtDate = (d?: string) => d
    ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900 truncate">{message.objet}</span>
              <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[message.type_message]}`}>
                {TYPE_LABELS[message.type_message]}
              </span>
              <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${message.valider ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {message.valider ? 'Validé' : 'En attente'}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {message.type_message === 0
                ? `→ ${message.parent?.personne?.nom ?? ''} ${message.parent?.personne?.prenom ?? ''}`
                : '→ Tous les parents'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{fmtDate(message.created_at)}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isDir && !message.valider && (
              <button onClick={() => onValider(message.idMessages)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs border border-green-200 text-green-700 rounded-xl hover:bg-green-50 transition">
                <CheckCircle className="h-3 w-3" /> Valider
              </button>
            )}
            <button onClick={() => setOuvert(!ouvert)} className="text-gray-400 hover:text-gray-700 transition">
              {ouvert ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {ouvert && (
          <div className="mt-3 px-3 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-600 leading-relaxed">
            {message.information}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page Principale ─────────────────────────────────────────
export default function CommunicationPage() {
  const [messages, setMessages]     = useState<Message[]>([]);
  const [parents, setParents]       = useState<ParentSimple[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [showModal, setShowModal]   = useState(false);
  const [filtreType, setFiltreType] = useState('');
  const [page, setPage]             = useState(1);
  const [lastPage, setLastPage]     = useState(1);

  const fetchMessages = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data: MessagePaginate = await getMessages(filtreType !== '' ? Number(filtreType) : undefined);
      setMessages(data.data);
      setLastPage(data.last_page);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally { setLoading(false); }
  }, [filtreType, page]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);
  useEffect(() => { getParents().then(setParents).catch(() => {}); }, []);

  const ajouterMessage = (m: Message) => {
    setMessages(p => [m, ...p]);
    setShowModal(false);
  };

  const handleValider = async (id: number) => {
    try {
      await validerMessage(id);
      setMessages(p => p.map(m => m.idMessages === id ? { ...m, valider: true } : m));
    } catch (err: unknown) { alert(err instanceof Error ? err.message : 'Erreur'); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Communication</h1>
            <p className="text-sm text-gray-500 mt-1">Messages aux parents · Simulation (API Alanya non connectée)</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1a3a5c] text-white rounded-xl text-sm font-medium hover:bg-[#15304d] transition"
          >
            <Plus className="h-4 w-4" /> Nouveau message
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {([0, 1, 2] as const).map(t => (
            <div key={t} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">{TYPE_LABELS[t]}</p>
              <p className="text-3xl font-bold text-[#1a3a5c]">
                {messages.filter(m => m.type_message === t).length}
              </p>
            </div>
          ))}
        </div>

        {/* Filtre */}
        <div className="mb-4">
          <select
            value={filtreType}
            onChange={e => { setFiltreType(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/20"
          >
            <option value="">Tous les types</option>
            <option value="0">Individuel</option>
            <option value="1">Diffusion générale</option>
            <option value="2">Rappel paiement</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-20 text-gray-400">Chargement...</div>
        ) : messages.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
            <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucun message trouvé.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map(m => (
              <CarteMessage key={m.idMessages} message={m} onValider={handleValider} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex justify-center items-center gap-3 mt-6">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition">
              Précédent
            </button>
            <span className="text-sm text-gray-500">Page {page} / {lastPage}</span>
            <button onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition">
              Suivant
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <ModaleMessage parents={parents} onSave={ajouterMessage} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
