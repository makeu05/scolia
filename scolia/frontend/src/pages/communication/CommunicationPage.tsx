// src/pages/communication/CommunicationPage.tsx
import { useEffect, useState, useCallback } from "react";
import { MessageSquare, Send, Users, User, CheckCircle, Clock, Search, Plus } from "lucide-react";
import { authFetch, getUser } from "../../service/auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
const TOKEN = () => localStorage.getItem("token") ?? "";

const TYPE_LABELS: Record<number, { label: string; color: string; gradient: string }> = {
  0: { label: "Individuel",       color: "text-blue-700",    gradient: "linear-gradient(135deg,#4facfe,#00f2fe)" },
  1: { label: "Tous les parents", color: "text-purple-700",  gradient: "linear-gradient(135deg,#667eea,#764ba2)" },
  2: { label: "Paiements",        color: "text-amber-700",   gradient: "linear-gradient(135deg,#f6d365,#fda085)" },
};

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h/24)}j`;
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#f6d365,#fda085)",
];

export default function CommunicationPage() {
  const user = getUser();
  const [messages, setMessages]   = useState<any[]>([]);
  const [parents, setParents]     = useState<any[]>([]);
  const [stats, setStats]         = useState<any>(null);
  const [annees, setAnnees]       = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [mounted, setMounted]     = useState(false);
  const [search, setSearch]       = useState("");
  const [showForm, setShowForm]   = useState(false);
  const [tab, setTab]             = useState<"tous" | "enattente" | "valides">("tous");

  const [form, setForm] = useState({
    objet: "", information: "", type_message: "0",
    idParent: "", AnneeAcade: "", idExp_Pers: "1",
  });

  useEffect(() => {
    setMounted(true);
    // Charger années
    fetch(`${API}/annees`, { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json()).then(d => {
        const list = Array.isArray(d) ? d : (d.data ?? []);
        setAnnees(list);
        if (list.length > 0) setForm(f => ({ ...f, AnneeAcade: String(list[list.length-1].idAnnee) }));
      }).catch(() => {});
    // Charger stats
    fetch(`${API}/messages/stats`, { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json()).then(setStats).catch(() => {});
    // Charger parents pour select
    fetch(`${API}/personnes?typePersonne=4&limit=50`, { headers: { Authorization: `Bearer ${TOKEN()}` } })
      .then(r => r.json()).then(d => setParents(Array.isArray(d) ? d : (d.data ?? []))).catch(() => {});
  }, []);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (tab === "enattente") params.append("valider", "0");
      if (tab === "valides") params.append("valider", "1");
      const d = await fetch(`${API}/messages?${params}`, { headers: { Authorization: `Bearer ${TOKEN()}` } }).then(r => r.json());
      setMessages(d.data ?? d);
    } catch { setMessages([]); }
    finally { setLoading(false); }
  }, [search, tab]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isCollectif = form.type_message !== "0";
      const url = isCollectif ? `${API}/messages/tous` : `${API}/messages`;
      await authFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, idAdmin: "1" }),
      });
      setShowForm(false);
      setForm({ objet: "", information: "", type_message: "0", idParent: "", AnneeAcade: form.AnneeAcade, idExp_Pers: "1", });
      fetchMessages();
    } catch { alert("Erreur lors de l'envoi"); }
  };

  const handleValider = async (id: number) => {
    await authFetch(`${API}/messages/${id}/valider`, { method: "PATCH" });
    fetchMessages();
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Bannière */}
      <div className={`rounded-2xl p-5 relative overflow-hidden transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
        style={{ background: "linear-gradient(135deg,#f093fb 0%,#f5576c 100%)", boxShadow: "0 4px 24px rgba(240,147,251,0.4)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(255,255,255,0.2) 0%,transparent 70%)" }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-pink-100" />
              <p className="text-pink-100 text-xs font-semibold uppercase tracking-wider">Messagerie scolaire</p>
            </div>
            <h1 className="text-white text-2xl font-bold" style={{ letterSpacing: "-0.03em" }}>Communication</h1>
            <p className="text-pink-100/70 text-sm mt-1">
              {stats?.en_attente ?? 0} en attente · {stats?.valides ?? 0} validé{(stats?.valides ?? 0) > 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 bg-white text-pink-600 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-pink-50 transition-all active:scale-[0.97]"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
            <Send className="w-4 h-4" /> {showForm ? "Annuler" : "Nouveau message"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
        {[
          { label: "Total messages",  value: stats?.total ?? 0,       gradient: "linear-gradient(135deg,#f093fb,#f5576c)", shadow: "rgba(240,147,251,0.3)" },
          { label: "En attente",      value: stats?.en_attente ?? 0,  gradient: "linear-gradient(135deg,#f6d365,#fda085)", shadow: "rgba(246,211,101,0.3)" },
          { label: "Validés",         value: stats?.valides ?? 0,     gradient: "linear-gradient(135deg,#43e97b,#38f9d7)", shadow: "rgba(67,233,123,0.3)" },
          { label: "Collectifs",      value: stats?.collectifs ?? 0,  gradient: "linear-gradient(135deg,#667eea,#764ba2)", shadow: "rgba(102,126,234,0.3)" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 animate-fade-in relative overflow-hidden"
            style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)", transition: "all 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${s.shadow}`; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(15,31,61,0.06)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: s.gradient }} />
            <p className="text-2xl font-bold text-slate-900 mt-2" style={{ letterSpacing: "-0.02em" }}>{s.value}</p>
            <p className="text-xs text-slate-400 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Formulaire nouveau message */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-fade-in"
          style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
          <h3 className="text-sm font-bold text-slate-900 mb-4">Nouveau message</h3>
          <form onSubmit={handleSend} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Type *</label>
                <select required value={form.type_message} onChange={e => setForm({ ...form, type_message: e.target.value })}
                  className="input appearance-none">
                  <option value="0">Individuel (un parent)</option>
                  <option value="1">Tous les parents</option>
                  <option value="2">Parents — rappel paiement</option>
                </select>
              </div>
              {form.type_message === "0" && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Parent *</label>
                  <select required value={form.idParent} onChange={e => setForm({ ...form, idParent: e.target.value })}
                    className="input appearance-none">
                    <option value="">Choisir un parent…</option>
                    {parents.map(p => (
                      <option key={p.idPers} value={p.idPers}>{p.prenom} {p.nom}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Année académique *</label>
                <select value={form.AnneeAcade} onChange={e => setForm({ ...form, AnneeAcade: e.target.value })}
                  className="input appearance-none">
                  {annees.map(a => <option key={a.idAnnee} value={a.idAnnee}>{a.libelle}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Objet *</label>
              <input required value={form.objet} onChange={e => setForm({ ...form, objet: e.target.value })}
                placeholder="Objet du message" className="input" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">Message *</label>
              <textarea required value={form.information} onChange={e => setForm({ ...form, information: e.target.value })}
                rows={4} placeholder="Contenu du message…" className="input resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary gap-2"
                style={{ background: "linear-gradient(135deg,#f093fb,#f5576c)" }}>
                <Send className="w-4 h-4" />
                {form.type_message === "0" ? "Envoyer au parent" : "Envoyer à tous les parents"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs + Recherche */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl">
          {[
            { id: "tous",       label: "Tous" },
            { id: "enattente",  label: "En attente" },
            { id: "valides",    label: "Validés" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                tab === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher dans les messages…" className="input pl-10" />
        </div>
      </div>

      {/* Liste messages */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)
        ) : messages.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-100"
            style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg,#f093fb,#f5576c)" }}>
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <p className="text-slate-500 font-medium">Aucun message trouvé</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const typeInfo = TYPE_LABELS[msg.type_message] ?? TYPE_LABELS[0];
            return (
              <div key={msg.idMessages} className="bg-white rounded-2xl border border-slate-100 p-4 animate-fade-in"
                style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length] }}>
                    {msg.type_message === 0 ? <User className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-slate-900 text-sm">{msg.objet}</p>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                        style={{ background: typeInfo.gradient }}>
                        {typeInfo.label}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        msg.valider ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {msg.valider ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {msg.valider ? "Validé" : "En attente"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{msg.information}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {msg.expediteur ? `${msg.expediteur.prenom} ${msg.expediteur.nom}` : "Système"} · {timeAgo(msg.created_at)}
                    </p>
                  </div>
                  {!msg.valider && (
                    <button onClick={() => handleValider(msg.idMessages)}
                      className="btn-secondary text-xs py-1.5 px-3 flex-shrink-0 gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                      <CheckCircle className="w-3.5 h-3.5" /> Valider
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}