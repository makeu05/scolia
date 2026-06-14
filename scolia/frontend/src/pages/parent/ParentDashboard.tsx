// src/pages/parent/ParentDashboard.tsx

import { useEffect, useState, useRef, useCallback } from 'react';
import { authFetch, useAuth } from '../../service/auth';
import { getAnnees, getTrimestres } from '../../service/evaluation_service';
import {
  User, BookOpen, UserX, CreditCard, MessageSquare,
  CheckCircle, AlertTriangle, Clock, Send, Loader2, ChevronDown, ChevronUp,
} from 'lucide-react';

const API    = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';
const SERVER = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:8000';

const getPhotoUrl = (url?: string) => {
  if (!url || url === 'INDEFINI') return null;
  if (url.startsWith('http')) return url;
  return `${SERVER}/storage/${url}`;
};

function fmt(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtHeure(d: string) {
  return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

type Tab = 'enfants' | 'absences' | 'paiements' | 'messages';

const STATUT_ABSENCE = {
  non_justifiee: { label: 'Non justifiée', bg: 'bg-red-50',    text: 'text-red-600',    icon: AlertTriangle },
  justifiee:     { label: 'Justifiée',     bg: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircle  },
  retard:        { label: 'Retard',        bg: 'bg-amber-50',   text: 'text-amber-600',   icon: Clock        },
};

function couleurNote(note: number, max = 20) {
  const pct = note / max;
  if (pct >= 0.9)  return 'text-violet-600';
  if (pct >= 0.7)  return 'text-emerald-600';
  if (pct >= 0.5)  return 'text-blue-600';
  if (pct >= 0.3)  return 'text-amber-600';
  return 'text-red-500';
}

export default function ParentDashboard() {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Flags pour éviter les doubles appels ──
  const initDone       = useRef(false);
  const absenceLoaded  = useRef(false);
  const paiementLoaded = useRef(false);
  const messageLoaded  = useRef(false);

  const [tab, setTab]               = useState<Tab>('enfants');
  const [enfants, setEnfants]       = useState<any[]>([]);
  const [annees, setAnnees]         = useState<any[]>([]);
  const [trimestres, setTrimestres] = useState<any[]>([]);
  const [idAca, setIdAca]           = useState('');
  const [idTrimestre, setIdTrimestre] = useState('');
  const [bulletins, setBulletins]   = useState<Record<number, any>>({});
  const [absences, setAbsences]     = useState<any[]>([]);
  const [paiements, setPaiements]   = useState<any[]>([]);
  const [messages, setMessages]     = useState<any[]>([]);
  const [idParent, setIdParent]     = useState<number | null>(null);
  const [dernierMsg, setDernierMsg] = useState<string | null>(null);
  const [expandedEnfant, setExpandedEnfant] = useState<number | null>(null);

  const [loadingEnfants, setLoadingEnfants]     = useState(true);
  const [loadingBulletins, setLoadingBulletins] = useState(false);
  const [loadingAbsences, setLoadingAbsences]   = useState(false);
  const [loadingPaiements, setLoadingPaiements] = useState(false);
  const [loadingMessages, setLoadingMessages]   = useState(false);
  const [error, setError]     = useState('');
  const [newMsg, setNewMsg]   = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // ── Init — une seule fois ────────────────────────────────────────────────
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    authFetch(`${API}/parent/enfants`)
      .then(r => r.json())
      .then(d => {
        const list = Array.isArray(d) ? d : (d.data ?? []);
        // Déduplique par matricule
        const unique = list.filter((e: any, i: number, arr: any[]) =>
          arr.findIndex((x: any) => x.matricule === e.matricule) === i
        );
        setEnfants(unique);
      })
      .catch(() => setError("Impossible de charger les enfants"))
      .finally(() => setLoadingEnfants(false));

    authFetch(`${API}/parent/mon-id`)
      .then(r => r.json())
      .then(d => setIdParent(d.idParent ?? d.idPers ?? null))
      .catch(() => {
        const stored = localStorage.getItem('idPers');
        if (stored) setIdParent(Number(stored));
      });

    getAnnees().then(d => {
      setAnnees(d);
      if (d.length > 0) setIdAca(String(d[d.length - 1].idAnnee));
    }).catch(() => {});
  }, []);

  // ── Trimestres quand idAca change ───────────────────────────────────────
  useEffect(() => {
    if (!idAca) return;
    getTrimestres(idAca).then(setTrimestres).catch(() => {});
  }, [idAca]);

  // ── Scroll messages ─────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Polling messages ─────────────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const pollNouveaux = useCallback(async (depuis: string, parentId: number) => {
    try {
      const res  = await authFetch(`${API}/messages/conversation/${parentId}?depuis=${encodeURIComponent(depuis)}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      if (list.length > 0) {
        setMessages(prev => {
          const existingIds = new Set(prev.map((m: any) => m.idMessages));
          const nouveaux = list.filter((m: any) => !existingIds.has(m.idMessages));
          return nouveaux.length > 0 ? [...prev, ...nouveaux] : prev;
        });
        setDernierMsg(list[list.length - 1].created_at);
      }
    } catch { }
  }, []);

  // ── Chargement selon onglet ─────────────────────────────────────────────
  const loadAbsences = useCallback(async (enfantsList: any[], aca: string) => {
    if (absenceLoaded.current) return;
    absenceLoaded.current = true;
    setLoadingAbsences(true);
    const all: any[] = [];
    for (const e of enfantsList) {
      try {
        const res  = await authFetch(`${API}/eleves/${e.matricule}/absences${aca ? `?idAca=${aca}` : ''}`);
        if (!res.ok) continue;
        const data = await res.json();
        const list = (data.absences ?? []).map((a: any) => ({ ...a, enfant: e }));
        all.push(...list);
      } catch { }
    }
    // Déduplique par idAbsence
    const unique = all.filter((a, i, arr) =>
      arr.findIndex(x => x.idAbsence === a.idAbsence) === i
    );
    unique.sort((a, b) => new Date(b.date_absence).getTime() - new Date(a.date_absence).getTime());
    setAbsences(unique);
    setLoadingAbsences(false);
  }, []);

  const loadPaiements = useCallback(async (enfantsList: any[], aca: string) => {
    if (paiementLoaded.current) return;
    paiementLoaded.current = true;
    setLoadingPaiements(true);
    const results: any[] = [];
    const vus = new Set<number>();

    for (const e of enfantsList) {
      if (vus.has(e.matricule)) continue;
      vus.add(e.matricule);

      let found = false;
      if (aca) {
        try {
          const res  = await authFetch(`${API}/eleves/${e.matricule}/tranches?idAca=${aca}`);
          if (res.ok) {
            const data = await res.json();
            if (!data.message) { results.push({ enfant: e, ...data }); found = true; }
          }
        } catch { }
      }
      if (!found) {
        try {
          const res  = await authFetch(`${API}/eleves/${e.matricule}/tranches`);
          if (res.ok) {
            const data = await res.json();
            if (!data.message) results.push({ enfant: e, ...data });
          }
        } catch { }
      }
    }
    setPaiements(results);
    setLoadingPaiements(false);
  }, []);

  const loadMessages = useCallback(async (parentId: number) => {
    if (messageLoaded.current) return;
    messageLoaded.current = true;
    setLoadingMessages(true);
    try {
      const res  = await authFetch(`${API}/messages/conversation/${parentId}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      // Déduplique par idMessages
      const unique = list.filter((m: any, i: number, arr: any[]) =>
        arr.findIndex((x: any) => x.idMessages === m.idMessages) === i
      );
      setMessages(unique);
      if (unique.length > 0) setDernierMsg(unique[unique.length - 1].created_at);
    } catch { }
    finally { setLoadingMessages(false); }
  }, []);

  // ── Réagir au changement d'onglet ───────────────────────────────────────
  useEffect(() => {
    if (tab === 'absences' && enfants.length > 0) {
      absenceLoaded.current = false;
      loadAbsences(enfants, idAca);
    }
    if (tab === 'paiements' && enfants.length > 0) {
      paiementLoaded.current = false;
      loadPaiements(enfants, idAca);
    }
    if (tab === 'messages' && idParent) {
      messageLoaded.current = false;
      loadMessages(idParent);
    }
    if (tab !== 'messages') stopPolling();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Polling quand on est sur messages ───────────────────────────────────
  useEffect(() => {
    if (tab !== 'messages' || !idParent || !dernierMsg) return;
    stopPolling();
    pollingRef.current = setInterval(() => {
      pollNouveaux(dernierMsg, idParent);
    }, 5000);
    return stopPolling;
  }, [tab, idParent, dernierMsg, pollNouveaux, stopPolling]);

  // ── Bulletins ────────────────────────────────────────────────────────────
  const chargerBulletins = async () => {
    if (!idTrimestre || enfants.length === 0) return;
    setLoadingBulletins(true);
    const results: Record<number, any> = {};
    const vus = new Set<number>();

    for (const e of enfants) {
      if (vus.has(e.matricule)) continue;
      vus.add(e.matricule);
      try {
        const res = await authFetch(
          `${API}/evaluations/bulletin/${e.matricule}?idTrimestre=${idTrimestre}&idAca=${idAca}`
        );
        results[e.matricule] = res.ok ? await res.json() : null;
      } catch {
        results[e.matricule] = null;
      }
    }
    setBulletins(results);
    setLoadingBulletins(false);
    if (enfants.length > 0) setExpandedEnfant(enfants[0].matricule);
  };

  // ── Envoi message ────────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!newMsg.trim() || !idParent) return;
    setSendingMsg(true);
    const contenu = newMsg.trim();
    setNewMsg('');
    const tempId = Date.now();
    const optimistic = {
      idMessages: tempId, information: contenu,
      direction: 'parent_to_admin', created_at: new Date().toISOString(), optimistic: true,
    };
    setMessages(prev => [...prev, optimistic]);
    try {
      const idPers = Number(localStorage.getItem('idPers') ?? 1);
      await authFetch(`${API}/messages/parent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idParent, information: contenu, idExp_Pers: idPers }),
      });
      // Recharger les messages réels
      messageLoaded.current = false;
      const res  = await authFetch(`${API}/messages/conversation/${idParent}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const unique = list.filter((m: any, i: number, arr: any[]) =>
        arr.findIndex((x: any) => x.idMessages === m.idMessages) === i
      );
      setMessages(unique);
      if (unique.length > 0) setDernierMsg(unique[unique.length - 1].created_at);
    } catch {
      setMessages(prev => prev.filter(m => m.idMessages !== tempId));
    } finally {
      setSendingMsg(false);
    }
  };

  const nbAbsencesNonJust = absences.filter(a => a.statut === 'non_justifiee').length;
  // Enfants dédupliqués pour l'affichage
  const enfantsUniques = enfants.filter((e, i, arr) =>
    arr.findIndex(x => x.matricule === e.matricule) === i
  );

  if (loadingEnfants) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto" />
        <p className="text-slate-500">Chargement de votre espace…</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">

      {/* Header */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)', boxShadow: '0 4px 24px rgba(102,126,234,0.4)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <User className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-purple-200 text-xs font-semibold uppercase tracking-wider">Espace Parent</p>
            <h1 className="text-white text-2xl font-bold" style={{ letterSpacing: '-0.02em' }}>
              Bonjour, {user?.name}
            </h1>
            <p className="text-purple-200/70 text-sm mt-0.5">
              {enfantsUniques.length} enfant{enfantsUniques.length > 1 ? 's' : ''} suivi{enfantsUniques.length > 1 ? 's' : ''}
              {nbAbsencesNonJust > 0 && (
                <span className="ml-2 bg-red-400 text-white text-xs px-2 py-0.5 rounded-full">
                  {nbAbsencesNonJust} absence{nbAbsencesNonJust > 1 ? 's' : ''} non justifiée{nbAbsencesNonJust > 1 ? 's' : ''}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">{error}</div>}

      {/* Onglets */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl flex-wrap">
        {([
          { id: 'enfants',   label: 'Notes & Bulletins', icon: BookOpen      },
          { id: 'absences',  label: 'Absences',           icon: UserX         },
          { id: 'paiements', label: 'Paiements',          icon: CreditCard    },
          { id: 'messages',  label: 'Messages',           icon: MessageSquare },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-1 justify-center ${
              tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
            {t.id === 'absences' && nbAbsencesNonJust > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                {nbAbsencesNonJust}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB NOTES & BULLETINS ── */}
      {tab === 'enfants' && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 flex gap-3 flex-wrap items-end shadow-sm">
            <div className="flex-1 min-w-[180px] space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Année académique</label>
              <select value={idAca} onChange={e => { setIdAca(e.target.value); setIdTrimestre(''); setBulletins({}); }}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400">
                {annees.map(a => <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[180px] space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Trimestre</label>
              <select value={idTrimestre} onChange={e => setIdTrimestre(e.target.value)}
                disabled={!idAca}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400 disabled:opacity-50">
                <option value="">— Sélectionner —</option>
                {trimestres.map(t => <option key={t.idTrimes} value={t.idTrimes}>{t.libelle}</option>)}
              </select>
            </div>
            <button onClick={chargerBulletins} disabled={!idTrimestre || loadingBulletins}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
              {loadingBulletins ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
              Voir les bulletins
            </button>
          </div>

          {enfantsUniques.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-16 text-center text-slate-400 shadow-sm">
              <p className="text-4xl mb-3">👨‍👧‍👦</p>
              <p className="font-medium">Aucun enfant associé</p>
              <p className="text-sm mt-1">Contactez l'administration</p>
            </div>
          ) : (
            enfantsUniques.map(e => {
              const bulletin   = bulletins[e.matricule];
              const photo      = getPhotoUrl(e.photoURL);
              const isExpanded = expandedEnfant === e.matricule;

              return (
                <div key={e.matricule} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-5 flex items-center gap-4">
                    {photo ? (
                      <img src={photo} alt={e.nom} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center text-xl flex-shrink-0">
                        {e.sexe === 0 ? '👧' : '👦'}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-lg">{e.prenom} {e.nom}</h3>
                      <p className="text-sm text-slate-400">Matricule : {e.matricule}</p>
                      {e.classe && <p className="text-xs text-slate-400 mt-0.5">Classe : {e.classe}</p>}
                    </div>
                    {bulletin && (
                      <div className="text-right">
                        <p className={`text-3xl font-bold ${couleurNote(bulletin.moyenneGenerale ?? 0)}`}>
                          {bulletin.moyenneGenerale ?? '—'}/20
                        </p>
                        <p className="text-sm text-slate-400 font-medium">{bulletin.mention ?? ''}</p>
                        {bulletin.classement && (
                          <p className="text-xs text-slate-400">
                            Rang : {bulletin.classement.rang}/{bulletin.classement.total}
                          </p>
                        )}
                      </div>
                    )}
                    {bulletin && (
                      <button onClick={() => setExpandedEnfant(isExpanded ? null : e.matricule)}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                      </button>
                    )}
                  </div>

                  {bulletin && isExpanded && (
                    <div className="border-t border-slate-100">
                      <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Performance globale</span>
                          <span className="font-bold">{Math.round((bulletin.moyenneGenerale / 20) * 100)}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all"
                            style={{
                              width: `${(bulletin.moyenneGenerale / 20) * 100}%`,
                              background: bulletin.moyenneGenerale >= 14
                                ? 'linear-gradient(90deg,#8b5cf6,#6d28d9)'
                                : bulletin.moyenneGenerale >= 10
                                  ? 'linear-gradient(90deg,#34d399,#059669)'
                                  : 'linear-gradient(90deg,#f87171,#ef4444)',
                            }} />
                        </div>
                      </div>

                      {bulletin.resultats?.length > 0 ? (
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Matière</th>
                              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Coeff</th>
                              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Moyenne</th>
                              <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide hidden md:table-cell">Appréciation</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {bulletin.resultats.map((m: any, i: number) => (
                              <tr key={`${e.matricule}-mat-${i}`}
                                className={`hover:bg-slate-50 transition-colors ${m.moyenne < 10 ? 'bg-red-50/30' : ''}`}>
                                <td className="px-5 py-3 font-semibold text-slate-900">{m.cours}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                    ×{m.coefficient ?? 1}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`text-base font-bold ${couleurNote(m.moyenne)}`}>
                                    {m.moyenne}/20
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center hidden md:table-cell">
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    m.moyenne >= 16 ? 'text-violet-600 bg-violet-50'
                                    : m.moyenne >= 14 ? 'text-emerald-600 bg-emerald-50'
                                    : m.moyenne >= 12 ? 'text-blue-600 bg-blue-50'
                                    : m.moyenne >= 10 ? 'text-amber-600 bg-amber-50'
                                    : 'text-red-600 bg-red-50'
                                  }`}>
                                    {m.appreciation}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="border-t-2 border-slate-200 bg-slate-50">
                              <td className="px-5 py-3 font-bold text-slate-700">Moyenne générale</td>
                              <td className="px-4 py-3 text-center text-xs text-amber-600">
                                ×{bulletin.resultats.reduce((s: number, m: any) => s + (m.coefficient ?? 1), 0)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`text-lg font-bold ${couleurNote(bulletin.moyenneGenerale ?? 0)}`}>
                                  {bulletin.moyenneGenerale ?? '—'}/20
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center hidden md:table-cell">
                                <span className="text-sm font-semibold text-violet-600">{bulletin.mention ?? '—'}</span>
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      ) : (
                        <div className="p-8 text-center text-slate-400">
                          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-20" />
                          <p className="text-sm">Aucune note disponible pour ce trimestre</p>
                        </div>
                      )}
                    </div>
                  )}

                  {!bulletin && idTrimestre && (
                    <div className="px-5 pb-5">
                      <p className="text-sm text-slate-400 italic text-center py-2 bg-slate-50 rounded-xl">
                        Cliquez sur "Voir les bulletins" pour charger les notes
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── TAB ABSENCES ── */}
      {tab === 'absences' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total',          value: absences.length,                                              color: 'text-slate-700'  },
              { label: 'Non justifiées', value: absences.filter(a => a.statut === 'non_justifiee').length,   color: 'text-red-600'    },
              { label: 'Retards',        value: absences.filter(a => a.statut === 'retard').length,           color: 'text-amber-600'  },
            ].map(k => (
              <div key={k.label} className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-sm">
                <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{k.label}</p>
              </div>
            ))}
          </div>

          {loadingAbsences ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : absences.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-400 shadow-sm">
              <CheckCircle className="w-10 h-10 mx-auto mb-3 text-emerald-300" />
              <p>Aucune absence enregistrée 🎉</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['Enfant', 'Date', 'Statut', 'Cours', 'Motif'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {absences.map((a: any) => {
                    const s = STATUT_ABSENCE[a.statut as keyof typeof STATUT_ABSENCE] ?? STATUT_ABSENCE.non_justifiee;
                    const StatusIcon = s.icon;
                    return (
                      <tr key={`abs-${a.idAbsence}`} className="hover:bg-slate-50">
                        <td className="px-5 py-3 text-sm font-medium text-slate-900">{a.enfant?.prenom} {a.enfant?.nom}</td>
                        <td className="px-5 py-3 text-sm text-slate-500">{fmtDate(a.date_absence)}</td>
                        <td className="px-5 py-3">
                          <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium w-fit ${s.bg} ${s.text}`}>
                            <StatusIcon className="w-3 h-3" /> {s.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-400">{a.cours_libelle ?? '—'}</td>
                        <td className="px-5 py-3 text-sm text-slate-400">{a.motif ?? '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB PAIEMENTS ── */}
      {tab === 'paiements' && (
        <div className="space-y-5">
          {loadingPaiements ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : paiements.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-400 shadow-sm">
              <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>Aucune information de paiement disponible</p>
              <p className="text-xs mt-2">Vérifiez que l'élève est inscrit pour cette année</p>
            </div>
          ) : (
            paiements.map((p: any, i: number) => (
              <div key={`paie-${p.enfant.matricule}-${i}`} className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{p.enfant.prenom} {p.enfant.nom}</p>
                    <p className="text-xs text-slate-400">{p.inscription?.classe_libelle} · {p.annee?.libelle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Progression</p>
                    <p className="text-lg font-bold text-violet-600">{p.pourcentage ?? 0}%</p>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{
                      width: `${p.pourcentage ?? 0}%`,
                      background: (p.pourcentage ?? 0) >= 100
                        ? 'linear-gradient(90deg,#34d399,#10b981)'
                        : (p.pourcentage ?? 0) >= 50
                          ? 'linear-gradient(90deg,#fbbf24,#f59e0b)'
                          : 'linear-gradient(90deg,#f87171,#ef4444)',
                    }} />
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: 'Total dû', value: fmt(p.total_du   ?? 0), color: 'text-slate-700'   },
                    { label: 'Payé',     value: fmt(p.total_paye ?? 0), color: 'text-emerald-600' },
                    { label: 'Reste',    value: fmt(p.reste      ?? 0), color: (p.reste ?? 0) > 0 ? 'text-red-600' : 'text-emerald-600' },
                  ].map(k => (
                    <div key={k.label} className="bg-slate-50 rounded-xl py-3">
                      <p className={`text-sm font-bold ${k.color}`}>{k.value}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{k.label}</p>
                    </div>
                  ))}
                </div>
                {p.tranches?.length > 0 && (
                  <div className="space-y-2">
                    {p.tranches.map((t: any) => (
                      <div key={`tranche-${t.idTranche}`} className={`flex items-center justify-between px-4 py-2.5 rounded-xl ${
                        t.statut === 'payee' ? 'bg-emerald-50' : t.statut === 'en_retard' ? 'bg-red-50' : 'bg-slate-50'
                      }`}>
                        <div className="flex items-center gap-2">
                          {t.statut === 'payee'
                            ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                            : t.statut === 'en_retard'
                              ? <AlertTriangle className="w-4 h-4 text-red-500" />
                              : <Clock className="w-4 h-4 text-slate-400" />}
                          <span className="text-sm font-medium text-slate-800">{t.libelle}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-700">{fmt(t.montant_du)}</p>
                          {t.date_echeance && (
                            <p className="text-xs text-slate-400">Échéance : {fmtDate(t.date_echeance)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── TAB MESSAGES ── */}
      {tab === 'messages' && (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden flex flex-col shadow-sm" style={{ height: '60vh' }}>
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Administration</p>
              <p className="text-xs text-slate-400">Messagerie école</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {loadingMessages ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Démarrez la conversation avec l'administration</p>
              </div>
            ) : (
              messages.map((m: any) => {
                const isMine = m.direction === 'parent_to_admin';
                return (
                  <div key={`msg-${m.idMessages}`} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    {!isMine && (
                      <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-600 flex-shrink-0 mr-2 mt-1">
                        AD
                      </div>
                    )}
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                      isMine ? 'bg-violet-500 text-white rounded-br-sm' : 'bg-white text-slate-800 rounded-bl-sm shadow-sm'
                    } ${m.optimistic ? 'opacity-70' : ''}`}>
                      <p className="leading-relaxed">{m.information}</p>
                      <p className={`text-[10px] mt-1 ${isMine ? 'text-white/60 text-right' : 'text-slate-400'}`}>
                        {fmtHeure(m.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="px-4 py-3 border-t border-slate-100 bg-white flex gap-2 items-end">
            <textarea
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
              placeholder="Écrire un message… (Entrée pour envoyer)"
              rows={1}
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm resize-none outline-none focus:border-violet-400"
              style={{ minHeight: '40px', maxHeight: '100px' }}
            />
            <button onClick={sendMessage} disabled={sendingMsg || !newMsg.trim() || !idParent}
              className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-50 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
              {sendingMsg ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}