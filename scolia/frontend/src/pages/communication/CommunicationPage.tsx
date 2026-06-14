// src/pages/communication/CommunicationPage.tsx — Interface chat bidirectionnelle

import { useEffect, useState, useRef, useCallback } from "react";
import {
  MessageSquare, Send, Users, Search,
  CheckCircle, Clock, ArrowLeft, User, Phone,
} from "lucide-react";
import { authFetch, getUser } from "../../service/auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "À l'instant";
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function fmtHeure(d: string) {
  return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

const GRADIENTS = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#f6d365,#fda085)",
];

export default function CommunicationPage() {
  const user          = getUser();
  const isAdmin       = ['root', 'admin', 'directeur', 'fondateur'].includes(user?.role ?? '');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── État conversations (admin) ─────────────────────────────────────────────
  const [conversations, setConversations] = useState<any[]>([]);
  const [convLoading, setConvLoading]     = useState(true);
  const [searchConv, setSearchConv]       = useState('');

  // ── État chat ouvert ───────────────────────────────────────────────────────
  const [activeConv, setActiveConv]       = useState<any>(null);
  const [messages, setMessages]           = useState<any[]>([]);
  const [msgLoading, setMsgLoading]       = useState(false);
  const [newMsg, setNewMsg]               = useState('');
  const [sending, setSending]             = useState(false);
  const [dernierMsg, setDernierMsg]       = useState<string | null>(null);

  // ── État message collectif ─────────────────────────────────────────────────
  const [showCollectif, setShowCollectif] = useState(false);
  const [collectifForm, setCollectifForm] = useState({
    objet: '', information: '', type_message: '1', AnneeAcade: '',
  });
  const [annees, setAnnees]               = useState<any[]>([]);
  const [stats, setStats]                 = useState<any>(null);
  const [sendingCollectif, setSendingCollectif] = useState(false);

  // ── Parent : son idParent ──────────────────────────────────────────────────
  const [monIdParent, setMonIdParent]     = useState<number | null>(null);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    authFetch(`${API}/annees`).then(r => r.json()).then(d => {
      const list = Array.isArray(d) ? d : (d.data ?? []);
      setAnnees(list);
      if (list.length > 0) setCollectifForm(f => ({ ...f, AnneeAcade: String(list[list.length - 1].idAnnee) }));
    });
    authFetch(`${API}/messages/stats`).then(r => r.json()).then(setStats).catch(() => {});

    if (isAdmin) {
      loadConversations();
    } else {
      // Parent : récupérer son idParent
      authFetch(`${API}/parent/enfants`).then(r => r.json()).then(d => {
        const list = Array.isArray(d) ? d : (d.data ?? []);
        // L'idParent est lié à l'utilisateur connecté via personne
        authFetch(`${API}/me`).then(r => r.json()).then(me => {
          // Chercher l'idParent de cette personne
          authFetch(`${API}/parent/mon-id`).then(r => r.json()).then(p => {
            setMonIdParent(p.idParent);
            setActiveConv({ idParent: p.idParent, nom: me.name ?? me.nom ?? 'Moi', prenom: '' });
          }).catch(() => {
            // Fallback : utiliser idPers du user
            setMonIdParent(me.idPers ?? 1);
            setActiveConv({ idParent: me.idPers ?? 1, nom: 'Administration', prenom: '' });
          });
        });
      });
    }
  }, []);

  // Ouvrir une conversation → charger les messages + démarrer polling
  useEffect(() => {
    if (!activeConv) return;
    loadMessages();
    startPolling();
    return () => stopPolling();
  }, [activeConv?.idParent]);

  // Scroll vers le bas à chaque nouveau message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Conversations ─────────────────────────────────────────────────────────
  const loadConversations = async () => {
    setConvLoading(true);
    try {
      const res  = await authFetch(`${API}/messages/conversations`);
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch { }
    finally { setConvLoading(false); }
  };

  // ── Messages d'une conversation ───────────────────────────────────────────
  const loadMessages = async (depuis?: string) => {
    if (!activeConv) return;
    if (!depuis) setMsgLoading(true);
    try {
      const url = `${API}/messages/conversation/${activeConv.idParent}${depuis ? `?depuis=${encodeURIComponent(depuis)}` : ''}`;
      const res  = await authFetch(url);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      if (depuis && list.length > 0) {
        setMessages(prev => [...prev, ...list]);
        setDernierMsg(list[list.length - 1].created_at);
      } else if (!depuis) {
        setMessages(list);
        if (list.length > 0) setDernierMsg(list[list.length - 1].created_at);
      }
    } catch { }
    finally { setMsgLoading(false); }
  };

  // ── Polling toutes les 3 secondes ─────────────────────────────────────────
  const startPolling = useCallback(() => {
    stopPolling();
    pollingRef.current = setInterval(() => {
      if (dernierMsg) loadMessages(dernierMsg);
    }, 3000);
  }, [activeConv?.idParent, dernierMsg]);

  const stopPolling = () => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
  };

  // Redémarrer le polling quand dernierMsg change
  useEffect(() => {
    if (activeConv) { stopPolling(); startPolling(); }
    return stopPolling;
  }, [dernierMsg]);

  // ── Envoyer un message ────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!newMsg.trim() || !activeConv) return;
    setSending(true);
    const contenu = newMsg.trim();
    setNewMsg('');

    // Optimistic UI
    const optimistic = {
      idMessages:  Date.now(),
      information: contenu,
      direction:   isAdmin ? 'admin_to_parent' : 'parent_to_admin',
      created_at:  new Date().toISOString(),
      optimistic:  true,
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const idPers = Number(localStorage.getItem('idPers') ?? 1);
      const endpoint = isAdmin ? `${API}/messages` : `${API}/messages/parent`;
      await authFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idParent:    activeConv.idParent,
          information: contenu,
          idExp_Pers:  idPers,
          AnneeAcade:  collectifForm.AnneeAcade || String(new Date().getFullYear()),
        }),
      });
      // Recharger pour avoir le vrai message
      await loadMessages();
      if (isAdmin) loadConversations();
    } catch {
      setMessages(prev => prev.filter(m => !m.optimistic));
    } finally {
      setSending(false);
    }
  };

  // ── Envoyer message collectif ─────────────────────────────────────────────
  const handleCollectif = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingCollectif(true);
    try {
      const idPers = Number(localStorage.getItem('idPers') ?? 1);
      await authFetch(`${API}/messages/tous`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...collectifForm, idExp_Pers: idPers, idAdmin: 1 }),
      });
      setShowCollectif(false);
      setCollectifForm(f => ({ ...f, objet: '', information: '' }));
      loadConversations();
      authFetch(`${API}/messages/stats`).then(r => r.json()).then(setStats);
    } catch { alert('Erreur envoi collectif'); }
    finally { setSendingCollectif(false); }
  };

  const convFiltrees = conversations.filter(c => {
    if (!searchConv) return true;
    const q = searchConv.toLowerCase();
    return `${c.prenom} ${c.nom}`.toLowerCase().includes(q) || c.mobile?.includes(searchConv);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // RENDU PARENT (vue simplifiée)
  // ─────────────────────────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
        <div className="card overflow-hidden flex flex-col" style={{ height: '70vh' }}>
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Administration</p>
              <p className="text-white/60 text-xs">École</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {msgLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Démarrez la conversation avec l'administration</p>
              </div>
            ) : (
              messages.map((m: any) => {
                const isMine = m.direction === 'parent_to_admin';
                return (
                  <div key={m.idMessages} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                      isMine
                        ? 'bg-violet-500 text-white rounded-br-sm'
                        : 'bg-white text-slate-800 rounded-bl-sm shadow-sm'
                    }`}>
                      <p>{m.information}</p>
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

          {/* Input */}
          <div className="px-4 py-3 border-t border-slate-100 bg-white flex gap-2">
            <input
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
              placeholder="Écrire un message…"
              className="input flex-1"
            />
            <button onClick={handleSend} disabled={sending || !newMsg.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-50 transition-all flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDU ADMIN (vue liste + chat)
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Bannière */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)', boxShadow: '0 4px 24px rgba(240,147,251,0.4)' }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-pink-100" />
              <p className="text-pink-100 text-xs font-semibold uppercase tracking-wider">Messagerie scolaire</p>
            </div>
            <h1 className="text-white text-2xl font-bold" style={{ letterSpacing: '-0.03em' }}>Communication</h1>
            <p className="text-pink-100/70 text-sm mt-1">
              {stats?.non_lus ?? 0} non lu{(stats?.non_lus ?? 0) > 1 ? 's' : ''} · {conversations.length} conversation{conversations.length > 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={() => setShowCollectif(v => !v)}
            className="flex items-center gap-2 bg-white text-pink-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-pink-50 transition-all"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
            <Users className="w-4 h-4" /> {showCollectif ? 'Annuler' : 'Message collectif'}
          </button>
        </div>
      </div>

      {/* Message collectif */}
      {showCollectif && (
        <div className="card p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Envoyer à tous les parents</h3>
          <form onSubmit={handleCollectif} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Type</label>
                <select value={collectifForm.type_message}
                  onChange={e => setCollectifForm(f => ({ ...f, type_message: e.target.value }))}
                  className="input w-full">
                  <option value="1">Tous les parents</option>
                  <option value="2">Rappel paiement</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Objet</label>
                <input required value={collectifForm.objet}
                  onChange={e => setCollectifForm(f => ({ ...f, objet: e.target.value }))}
                  placeholder="Objet du message" className="input w-full" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Message *</label>
              <textarea required value={collectifForm.information} rows={3}
                onChange={e => setCollectifForm(f => ({ ...f, information: e.target.value }))}
                placeholder="Contenu…" className="input w-full resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={sendingCollectif}
                className="btn-primary gap-2" style={{ background: 'linear-gradient(135deg,#f093fb,#f5576c)' }}>
                <Send className="w-4 h-4" />
                {sendingCollectif ? 'Envoi…' : 'Envoyer à tous'}
              </button>
              <button type="button" onClick={() => setShowCollectif(false)} className="btn-secondary">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Zone principale : liste conversations + chat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ height: '65vh' }}>

        {/* ── Colonne gauche : conversations ── */}
        <div className="card overflow-hidden flex flex-col">
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={searchConv} onChange={e => setSearchConv(e.target.value)}
                placeholder="Chercher un parent…" className="input pl-9 text-sm w-full" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {convLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-3 flex gap-3">
                  <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3 rounded w-2/3" />
                    <div className="skeleton h-2.5 rounded w-full" />
                  </div>
                </div>
              ))
            ) : convFiltrees.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Aucune conversation
              </div>
            ) : (
              convFiltrees.map((c, i) => (
                <button key={c.idParent}
                  onClick={() => { setActiveConv(c); setMessages([]); }}
                  className={`w-full text-left p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors ${
                    activeConv?.idParent === c.idParent ? 'bg-violet-50 border-r-2 border-violet-500' : ''
                  }`}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: GRADIENTS[i % GRADIENTS.length] }}>
                    {c.prenom?.[0]}{c.nom?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900 truncate">{c.prenom} {c.nom}</p>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">{timeAgo(c.dernierMessage)}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{c.dernier_contenu ?? '…'}</p>
                  </div>
                  {c.nonLus > 0 && (
                    <span className="w-5 h-5 rounded-full bg-violet-500 text-white text-[10px] flex items-center justify-center flex-shrink-0 font-bold">
                      {c.nonLus}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Colonne droite : chat ── */}
        <div className="md:col-span-2 card overflow-hidden flex flex-col">
          {!activeConv ? (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center space-y-3">
                <MessageSquare className="w-12 h-12 mx-auto opacity-20" />
                <p className="text-sm">Sélectionnez une conversation</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header chat */}
              <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
                <button onClick={() => setActiveConv(null)} className="md:hidden p-1 hover:bg-slate-200 rounded-lg">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600 flex-shrink-0">
                  {activeConv.prenom?.[0]}{activeConv.nom?.[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{activeConv.prenom} {activeConv.nom}</p>
                  {activeConv.mobile && (
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {activeConv.mobile}
                    </p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {msgLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Démarrez la conversation</p>
                  </div>
                ) : (
                  messages.map((m: any) => {
                    const isMine = m.direction === 'admin_to_parent';
                    return (
                      <div key={m.idMessages} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        {!isMine && (
                          <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-bold text-violet-600 flex-shrink-0 mr-2 mt-1">
                            {activeConv.prenom?.[0]}{activeConv.nom?.[0]}
                          </div>
                        )}
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                          isMine
                            ? 'bg-violet-500 text-white rounded-br-sm'
                            : 'bg-white text-slate-800 rounded-bl-sm shadow-sm'
                        } ${m.optimistic ? 'opacity-70' : ''}`}>
                          <p className="leading-relaxed">{m.information}</p>
                          <div className={`flex items-center gap-1 justify-end mt-1 ${isMine ? 'text-white/60' : 'text-slate-400'}`}>
                            <span className="text-[10px]">{fmtHeure(m.created_at)}</span>
                            {isMine && (
                              m.lu
                                ? <CheckCircle className="w-3 h-3 text-white/80" />
                                : <Clock className="w-3 h-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-slate-100 bg-white flex gap-2 items-end">
                <textarea
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
                  placeholder="Écrire un message… (Entrée pour envoyer)"
                  rows={1}
                  className="input flex-1 resize-none text-sm"
                  style={{ minHeight: '40px', maxHeight: '100px' }}
                />
                <button onClick={handleSend} disabled={sending || !newMsg.trim()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-50 transition-all flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
                  {sending
                    ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <Send className="w-4 h-4 text-white" />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}