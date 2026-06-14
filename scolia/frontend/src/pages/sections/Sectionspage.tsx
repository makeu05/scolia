// src/pages/sections/SectionsPage.tsx

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit, Globe2, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { authFetch } from "../../service/auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

const SECTION_GRADIENTS = [
  { gradient: "linear-gradient(135deg,#4facfe,#00f2fe)", shadow: "rgba(79,172,254,0.3)"  },
  { gradient: "linear-gradient(135deg,#43e97b,#38f9d7)", shadow: "rgba(67,233,123,0.3)"  },
  { gradient: "linear-gradient(135deg,#f093fb,#f5576c)", shadow: "rgba(240,147,251,0.3)" },
  { gradient: "linear-gradient(135deg,#f6d365,#fda085)", shadow: "rgba(246,211,101,0.3)" },
  { gradient: "linear-gradient(135deg,#667eea,#764ba2)", shadow: "rgba(102,126,234,0.3)" },
];

interface Section {
  idSection: number;
  libelle: string;
  description?: string;
  actif: boolean;
  classes?: any[];
  scolarites?: any[];
}

export default function SectionsPage() {
  const [sections, setSections]     = useState<Section[]>([]);
  const [loading, setLoading]       = useState(true);
  const [mounted, setMounted]       = useState(false);

  // Formulaire création
  const [showForm, setShowForm]     = useState(false);
  const [libelle, setLibelle]       = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");

  // Édition
  const [editing, setEditing]       = useState<Section | null>(null);
  const [editLibelle, setEditLibelle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/sections`);
      const d   = await res.json();
      setSections(Array.isArray(d) ? d : (d.data ?? []));
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { setMounted(true); load(); }, []);

  // ── Créer ──────────────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const idAdmin = Number(localStorage.getItem("idAdmin") ?? 1);
      const res = await authFetch(`${API}/sections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ libelle, description: description || null, idAdmin }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Erreur création");
      setLibelle(""); setDescription(""); setShowForm(false);
      load();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  // ── Modifier ───────────────────────────────────────────────────────────────
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setEditSaving(true);
    try {
      const res = await authFetch(`${API}/sections/${editing.idSection}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ libelle: editLibelle, description: editDescription || null }),
      });
      if (!res.ok) throw new Error("Erreur modification");
      setEditing(null);
      load();
    } catch (err: any) { alert(err.message); }
    finally { setEditSaving(false); }
  };

  // ── Activer / Désactiver ───────────────────────────────────────────────────
  const handleToggle = async (s: Section) => {
    await authFetch(`${API}/sections/${s.idSection}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actif: !s.actif }),
    });
    load();
  };

  // ── Supprimer ──────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette section ?")) return;
    await authFetch(`${API}/sections/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

      {/* Bannière */}
      <div className={`rounded-2xl p-5 relative overflow-hidden transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
        style={{ background: "linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)", boxShadow: "0 4px 24px rgba(79,172,254,0.4)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Globe2 className="w-4 h-4 text-cyan-100" />
              <p className="text-cyan-100 text-xs font-semibold uppercase tracking-wider">Structure pédagogique</p>
            </div>
            <h1 className="text-white text-2xl font-bold" style={{ letterSpacing: "-0.03em" }}>Sections</h1>
            <p className="text-cyan-100/70 text-sm mt-1">
              {sections.length} section{sections.length > 1 ? "s" : ""} configurée{sections.length > 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 bg-white text-cyan-600 font-semibold text-sm px-5 py-3 rounded-xl hover:bg-cyan-50 transition-all"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
            <Plus className="w-4 h-4" />
            {showForm ? "Annuler" : "Nouvelle section"}
          </button>
        </div>
      </div>

      {/* Formulaire création */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5"
          style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>
          <h3 className="text-sm font-bold text-slate-900 mb-4">Nouvelle section</h3>
          {error && (
            <div className="p-3 mb-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
          )}
          <form onSubmit={handleCreate} className="flex gap-3 flex-wrap items-end">
            <div className="space-y-1 flex-1 min-w-[200px]">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Libellé * <span className="text-slate-400 font-normal normal-case">(ex: Anglophone, Francophone)</span>
              </label>
              <input
                required
                type="text"
                value={libelle}
                onChange={e => setLibelle(e.target.value)}
                placeholder="Ex : Anglophone"
                className="input w-full"
              />
            </div>
            <div className="space-y-1 flex-1 min-w-[200px]">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Description</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Optionnel"
                className="input w-full"
              />
            </div>
            <button type="submit" disabled={saving} className="btn-primary gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Créer
            </button>
          </form>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-36 rounded-2xl" />
          ))}
        </div>
      ) : sections.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <Globe2 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Aucune section configurée</p>
          <p className="text-sm text-slate-400 mt-1">
            Les sections permettent de différencier Anglophone / Francophone avec des scolarités distinctes.
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary mt-4 gap-2">
            <Plus className="w-4 h-4" /> Créer la première section
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((s, i) => {
            const c = SECTION_GRADIENTS[i % SECTION_GRADIENTS.length];
            return (
              <div key={s.idSection}
                className={`bg-white rounded-2xl border overflow-hidden transition-all ${!s.actif ? "opacity-60" : "border-slate-100"}`}
                style={{ boxShadow: "0 2px 8px rgba(15,31,61,0.06)" }}>

                {/* Header */}
                <div className="p-5 text-white relative overflow-hidden" style={{ background: c.gradient }}>
                  <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full"
                    style={{ background: "radial-gradient(circle,rgba(255,255,255,0.15) 0%,transparent 70%)" }} />
                  <div className="relative z-10 flex items-start justify-between">
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                        <Globe2 className="w-5 h-5 text-white" />
                      </div>
                      <p className="font-bold text-lg">{s.libelle}</p>
                      {s.description && (
                        <p className="text-white/70 text-xs mt-0.5">{s.description}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      s.actif ? "bg-white/20 text-white" : "bg-black/20 text-white/70"
                    }`}>
                      {s.actif ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="px-5 py-3 flex gap-6 border-b border-slate-100">
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">{s.classes?.length ?? 0}</p>
                    <p className="text-xs text-slate-400">classe{(s.classes?.length ?? 0) > 1 ? "s" : ""}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">{s.scolarites?.length ?? 0}</p>
                    <p className="text-xs text-slate-400">scolarité{(s.scolarites?.length ?? 0) > 1 ? "s" : ""}</p>
                  </div>
                </div>

                {/* Actions */}
                {editing?.idSection === s.idSection ? (
                  <form onSubmit={handleEdit} className="p-4 space-y-2">
                    <input
                      type="text"
                      value={editLibelle}
                      onChange={e => setEditLibelle(e.target.value)}
                      className="input w-full text-sm"
                      placeholder="Libellé"
                      required
                    />
                    <input
                      type="text"
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      className="input w-full text-sm"
                      placeholder="Description (optionnel)"
                    />
                    <div className="flex gap-2">
                      <button type="submit" disabled={editSaving} className="btn-primary flex-1 text-xs py-2 gap-1">
                        {editSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                        Enregistrer
                      </button>
                      <button type="button" onClick={() => setEditing(null)} className="btn-secondary text-xs py-2">
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="px-5 py-3 flex items-center gap-2">
                    <button
                      onClick={() => { setEditing(s); setEditLibelle(s.libelle); setEditDescription(s.description ?? ""); }}
                      className="p-2 hover:bg-amber-50 rounded-xl text-slate-400 hover:text-amber-600 transition-colors"
                      title="Modifier">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggle(s)}
                      className={`p-2 rounded-xl transition-colors ${
                        s.actif
                          ? "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                          : "hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"
                      }`}
                      title={s.actif ? "Désactiver" : "Activer"}>
                      {s.actif ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(s.idSection)}
                      className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-colors ml-auto"
                      title="Supprimer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}