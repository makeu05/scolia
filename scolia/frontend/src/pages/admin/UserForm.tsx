import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, Eye, EyeOff, Shield } from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import { authFetch } from "../../service/auth";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

const ROLES = [
  { value: "root",       label: "Root",       desc: "Accès total au système",             color: "border-red-200 bg-red-50/50 text-red-700" },
  { value: "admin",      label: "Admin",      desc: "Gestion complète de l'école",        color: "border-blue-200 bg-blue-50/50 text-blue-700" },
  { value: "fondateur",  label: "Fondateur",  desc: "Accès finance et paramètres",        color: "border-amber-200 bg-amber-50/50 text-amber-700" },
  { value: "directeur",  label: "Directeur",  desc: "Gestion pédagogique et discipline",  color: "border-violet-200 bg-violet-50/50 text-violet-700" },
  { value: "enseignant", label: "Enseignant", desc: "Saisie de notes et cours",           color: "border-emerald-200 bg-emerald-50/50 text-emerald-700" },
  { value: "parent",     label: "Parent",     desc: "Consultation uniquement",            color: "border-pink-200 bg-pink-50/50 text-pink-700" },
];

export default function UserForm() {
  const navigate  = useNavigate();
  const { id }    = useParams<{ id: string }>();
  const isEdit    = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const [form, setForm] = useState({
    nom: "", prenom: "", username: "", password: "",
    role: "admin", mobile: "", dateNaissance: "",
    lieuNaissance: "", type: "admin",
  });

  useEffect(() => {
    if (!isEdit || !id) return;
    setLoading(true);
    authFetch(`${API}/admin/utilisateurs/${id}`)
      .then(r => r.json())
      .then(data => {
        setForm({
          nom: data.nom?.split(" ")[0] || data.nom || "",
          prenom: data.nom?.includes(" ") ? data.nom.split(" ").slice(1).join(" ") : "",
          username: data.username || "",
          password: "",
          role: data.role || "admin",
          mobile: data.mobile || "",
          dateNaissance: data.dateNaissance || "",
          lieuNaissance: "",
          type: data.source || "admin",
        });
      })
      .catch(() => setError("Impossible de charger l'utilisateur"))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const update = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const payload = {
        nom: form.nom,
        prenom: form.type === "personne" ? form.prenom : undefined,
        username: form.username,
        password: form.password || undefined,
        role: form.role,
        mobile: form.mobile,
        dateNaissance: form.type === "personne" ? form.dateNaissance : undefined,
        lieuNaissance: form.type === "personne" ? "INDEFINI" : undefined,
      };

      const res = await authFetch(
        isEdit ? `${API}/admin/utilisateurs/${id}` : `${API}/admin/utilisateurs`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Erreur lors de la sauvegarde");
      }
      navigate("/admin/utilisateurs");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="space-y-3 w-full max-w-md px-6">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <PageLayout
      title={isEdit ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
      subtitle={isEdit ? `ID #${id}` : "Créer un compte d'accès au système"}
      backTo="/admin/utilisateurs"
    >
      {error && <div className="alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-4xl">

        {/* Colonne gauche — type + rôle */}
        <div className="lg:col-span-1 space-y-5">

          {/* Type de compte */}
          <div className="card p-5">
            <h3 className="section-title mb-3">Type de compte</h3>
            <div className="space-y-2">
              {[
                { value: "admin",   label: "Administrateur", desc: "Accès via table Admin" },
                { value: "personne",label: "Enseignant / Parent", desc: "Accès via table Personne" },
              ].map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => update("type", t.value)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                    form.type === t.value
                      ? "border-[#0f1f3d] bg-[#0f1f3d]/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                    form.type === t.value ? "border-[#0f1f3d] bg-[#0f1f3d]" : "border-slate-300"
                  }`} />
                  <div>
                    <p className={`text-sm font-medium ${form.type === t.value ? "text-[#0f1f3d]" : "text-slate-700"}`}>
                      {t.label}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Rôle */}
          <div className="card p-5">
            <h3 className="section-title mb-3">Rôle</h3>
            <div className="space-y-2">
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => update("role", r.value)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    form.role === r.value ? r.color : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-none">{r.label}</p>
                    <p className="text-xs opacity-70 mt-0.5 truncate">{r.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Colonne droite — infos */}
        <div className="lg:col-span-2 space-y-5">

          <div className="card p-5 space-y-4">
            <h3 className="section-title">Informations personnelles</h3>

            <div className={`grid gap-4 ${form.type === "personne" ? "grid-cols-2" : "grid-cols-1"}`}>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Nom *</label>
                <input
                  required value={form.nom}
                  onChange={e => update("nom", e.target.value)}
                  placeholder="BELVA"
                  className="input"
                />
              </div>
              {form.type === "personne" && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Prénom *</label>
                  <input
                    required value={form.prenom}
                    onChange={e => update("prenom", e.target.value)}
                    placeholder="Makeu"
                    className="input"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Téléphone</label>
              <input
                type="tel" value={form.mobile}
                onChange={e => update("mobile", e.target.value)}
                placeholder="699000000"
                className="input"
              />
            </div>

            {form.type === "personne" && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Date de naissance</label>
                <input
                  type="date" value={form.dateNaissance}
                  onChange={e => update("dateNaissance", e.target.value)}
                  className="input"
                />
              </div>
            )}
          </div>

          <div className="card p-5 space-y-4">
            <h3 className="section-title">Identifiants de connexion</h3>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Nom d'utilisateur *</label>
              <input
                required value={form.username}
                onChange={e => update("username", e.target.value)}
                placeholder="admin.ecole"
                className="input"
                autoComplete="off"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                {isEdit ? "Nouveau mot de passe (vide = inchangé)" : "Mot de passe *"}
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={e => update("password", e.target.value)}
                  required={!isEdit}
                  placeholder={isEdit ? "Laisser vide pour ne pas changer" : "••••••••"}
                  className="input pr-11"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="btn-primary flex-1 justify-center py-3 disabled:opacity-60">
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Enregistrement…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {isEdit ? "Enregistrer les modifications" : "Créer l'utilisateur"}
                </span>
              )}
            </button>
            <button type="button" onClick={() => navigate("/admin/utilisateurs")}
              className="btn-secondary px-8">
              Annuler
            </button>
          </div>
        </div>
      </form>
    </PageLayout>
  );
}