// src/pages/classes/ClasseDetails.tsx

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit, Users, BookOpen, Award, ChevronRight, UserCheck, Printer, Download } from "lucide-react";
import PageLayout from "../../components/layout/PageLayout";
import { getClasse } from "../../service/classe_service";
import { authFetch } from "../../service/auth";

const API    = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
const SERVER = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:8000';

const getPhotoUrl = (url?: string) => {
  if (!url || url === 'INDEFINI') return null;
  if (url.startsWith('http')) return url;
  return `${SERVER}/storage/${url}`;
};

export default function ClasseDetails() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const printRef   = useRef<HTMLDivElement>(null);

  const [classe, setClasse]   = useState<any>(null);
  const [eleves, setEleves]   = useState<any[]>([]);
  const [cours, setCours]     = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<"eleves" | "cours">("eleves");
  const [search, setSearch]   = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      getClasse(Number(id)),
      authFetch(`${API}/inscriptions/eleves-classe?idClasse=${id}`).then(r => r.json()),
      authFetch(`${API}/cours?idClasse=${id}&paginate=false`).then(r => r.json()),
    ])
      .then(([cl, el, co]) => {
        setClasse(cl);
        setEleves(Array.isArray(el) ? el : (el.data ?? []));
        setCours(Array.isArray(co) ? co : (co.data ?? []));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  // ── Impression ─────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const now      = new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' });
    const annee    = eleves[0]?.anneeAcademique?.libelle ?? '';
    const salle    = eleves[0]?.salle?.libelle ?? '';
    const elevesFiltered = elevesFiltres;

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8"/>
        <title>Liste élèves — ${classe?.libelle}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 12px; color: #1a1a1a; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1a3a5c; padding-bottom: 12px; }
          .header h1 { font-size: 18px; color: #1a3a5c; font-weight: bold; }
          .header h2 { font-size: 14px; margin-top: 4px; }
          .meta { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 11px; color: #555; }
          .badge { display: inline-block; background: #e8f0fe; color: #1a3a5c; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; }
          thead tr { background: #1a3a5c; color: white; }
          thead th { padding: 8px 10px; text-align: left; font-size: 11px; font-weight: 600; }
          tbody tr:nth-child(even) { background: #f8fafc; }
          tbody tr:hover { background: #eef2ff; }
          tbody td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
          .num { width: 30px; text-align: center; color: #94a3b8; font-weight: bold; }
          .photo { width: 36px; height: 36px; border-radius: 6px; object-fit: cover; }
          .avatar { width: 36px; height: 36px; border-radius: 6px; background: #e8f0fe; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #1a3a5c; font-size: 12px; }
          .nom { font-weight: 600; }
          .mat { color: #64748b; font-size: 11px; }
          .sexe-M { color: #3b82f6; }
          .sexe-F { color: #ec4899; }
          .signature { margin-top: 40px; display: flex; justify-content: space-between; }
          .signature div { text-align: center; }
          .signature .line { border-top: 1px solid #1a3a5c; width: 180px; margin: 0 auto; padding-top: 6px; font-size: 11px; color: #555; }
          .footer { margin-top: 20px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>LISTE DES ÉLÈVES</h1>
          <h2>${classe?.libelle ?? ''} ${salle ? '— ' + salle : ''} ${classe?.cycle?.libelle ? '| ' + classe.cycle.libelle : ''}</h2>
        </div>

        <div class="meta">
          <span>Année académique : <strong>${annee || '—'}</strong></span>
          <span>Total élèves : <span class="badge">${elevesFiltered.length}</span></span>
          <span>Imprimé le : <strong>${now}</strong></span>
        </div>

        <table>
          <thead>
            <tr>
              <th class="num">#</th>
              <th style="width:44px">Photo</th>
              <th>Nom & Prénom</th>
              <th>Matricule</th>
              <th>Sexe</th>
              <th>Date de naissance</th>
              <th>Salle</th>
            </tr>
          </thead>
          <tbody>
            ${elevesFiltered.map((e: any, i: number) => {
              const nom    = e.eleve?.nom    ?? '—';
              const prenom = e.eleve?.prenom ?? '';
              const sexe   = e.eleve?.sexe;
              const photo  = getPhotoUrl(e.eleve?.photo ?? e.eleve?.photoURL);
              const dob    = e.eleve?.dateNaissance
                ? new Date(e.eleve.dateNaissance).toLocaleDateString('fr-FR')
                : '—';
              return `
                <tr>
                  <td class="num">${i + 1}</td>
                  <td>
                    ${photo
                      ? `<img src="${photo}" class="photo" />`
                      : `<div class="avatar">${prenom?.[0] ?? ''}${nom?.[0] ?? ''}</div>`}
                  </td>
                  <td><span class="nom">${nom} ${prenom}</span></td>
                  <td><span class="mat">${e.matricule}</span></td>
                  <td class="${sexe === 1 ? 'sexe-M' : 'sexe-F'}">${sexe === 1 ? 'M' : 'F'}</td>
                  <td>${dob}</td>
                  <td>${e.salle?.libelle ?? '—'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="signature">
          <div><div class="line">Le Directeur</div></div>
          <div><div class="line">Le Professeur Principal</div></div>
        </div>

        <div class="footer">
          Document généré par Scolia — ${now}
        </div>

        <script>window.onload = () => { window.print(); }</script>
      </body>
      </html>
    `;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="space-y-3 w-full max-w-md px-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-2xl" />
        ))}
      </div>
    </div>
  );

  if (!classe) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <p className="text-red-600">Classe introuvable</p>
    </div>
  );

  const totalCoeff    = cours.reduce((s: number, c: any) => s + (Number(c.coefficient) || 1), 0);
  const elevesFiltres = search
    ? eleves.filter((e: any) => {
        const nom    = `${e.eleve?.nom ?? ''} ${e.eleve?.prenom ?? ''}`.toLowerCase();
        const mat    = String(e.matricule);
        return nom.includes(search.toLowerCase()) || mat.includes(search);
      })
    : eleves;

  return (
    <PageLayout
      title={classe.libelle}
      subtitle={classe.cycle?.libelle ?? "—"}
      backTo="/classes"
      actions={
        <div className="flex gap-2">
          {tab === "eleves" && eleves.length > 0 && (
            <button
              onClick={handlePrint}
              className="btn-secondary gap-2"
            >
              <Printer className="w-4 h-4" /> Imprimer la liste
            </button>
          )}
          <button
            onClick={() => navigate(`/classes/${id}/modifier`)}
            className="btn-secondary gap-2"
          >
            <Edit className="w-4 h-4" /> Modifier
          </button>
        </div>
      }
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Élèves inscrits",    value: eleves.length,                             icon: Users,     bg: "bg-violet-50",  color: "text-violet-600"  },
          { label: "Cours",              value: cours.length,                              icon: BookOpen,  bg: "bg-blue-50",    color: "text-blue-600"    },
          { label: "Total coefficients", value: totalCoeff,                                icon: Award,     bg: "bg-amber-50",   color: "text-amber-600"   },
          { label: "Cours actifs",       value: cours.filter((c: any) => c.actif).length,  icon: UserCheck, bg: "bg-emerald-50", color: "text-emerald-600" },
        ].map(kpi => (
          <div key={kpi.label} className="card p-4">
            <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <p className="text-lg font-bold text-slate-900" style={{ letterSpacing: "-0.02em" }}>{kpi.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
        {([
          { id: "eleves", label: `Élèves (${eleves.length})`, icon: Users    },
          { id: "cours",  label: `Cours (${cours.length})`,   icon: BookOpen },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB ÉLÈVES ── */}
      {tab === "eleves" && (
        <>
          {/* Recherche */}
          {eleves.length > 0 && (
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher un élève par nom ou matricule…"
                className="input flex-1"
              />
              {search && (
                <span className="text-xs text-slate-400">
                  {elevesFiltres.length} résultat{elevesFiltres.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}

          <div className="card overflow-hidden" ref={printRef}>
            {eleves.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-slate-400 gap-3">
                <Users className="w-12 h-12 opacity-20" />
                <p className="text-sm">Aucun élève inscrit dans cette classe</p>
                <button onClick={() => navigate("/inscriptions/ajouter")}
                  className="btn-secondary text-xs py-1.5 px-4 mt-1">
                  Inscrire un élève
                </button>
              </div>
            ) : elevesFiltres.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-slate-400 gap-2">
                <Users className="w-8 h-8 opacity-20" />
                <p className="text-sm">Aucun élève trouvé pour "{search}"</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3 w-10">#</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">Élève</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">Matricule</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3 hidden md:table-cell">Sexe</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3 hidden md:table-cell">Salle</th>
                    <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3 hidden md:table-cell">Année</th>
                    <th className="w-10 px-3 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {elevesFiltres.map((e: any, i: number) => {
                    const nom    = e.eleve?.nom    ?? "—";
                    const prenom = e.eleve?.prenom ?? "";
                    const mat    = e.matricule;
                    const sexe   = e.eleve?.sexe;
                    const photo  = getPhotoUrl(e.eleve?.photoURL);
                    return (
                      <tr key={mat} onClick={() => navigate(`/eleves/${mat}`)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors">
                        <td className="px-5 py-3 text-xs text-slate-400 font-bold">{i + 1}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            {/* Photo ou avatar */}
                            {photo ? (
                              <img src={photo} alt={nom}
                                className="w-8 h-8 rounded-xl object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-xs font-bold text-violet-600 flex-shrink-0">
                                {prenom?.[0]}{nom?.[0]}
                              </div>
                            )}
                            <span className="text-sm font-medium text-slate-900">
                              {nom} {prenom}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-500">{mat}</td>
                        <td className="px-5 py-3 hidden md:table-cell">
                          <span className={`text-xs font-medium ${sexe === 1 ? 'text-blue-500' : 'text-pink-500'}`}>
                            {sexe === 1 ? 'Garçon' : 'Fille'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-500 hidden md:table-cell">
                          {e.salle?.libelle ?? "—"}
                        </td>
                        <td className="px-5 py-3 text-sm text-slate-500 hidden md:table-cell">
                          {e.anneeAcademique?.libelle ?? "—"}
                        </td>
                        <td className="px-3 py-3">
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-100 bg-slate-50">
                    <td colSpan={7} className="px-5 py-3 text-xs text-slate-400">
                      {elevesFiltres.length} élève{elevesFiltres.length > 1 ? 's' : ''} affiché{elevesFiltres.length > 1 ? 's' : ''}
                      {search && ` sur ${eleves.length} au total`}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </>
      )}

      {/* ── TAB COURS ── */}
      {tab === "cours" && (
        <div className="card overflow-hidden">
          {cours.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-slate-400 gap-3">
              <BookOpen className="w-12 h-12 opacity-20" />
              <p className="text-sm">Aucun cours pour cette classe</p>
              <button onClick={() => navigate("/cours/nouveau")}
                className="btn-secondary text-xs py-1.5 px-4 mt-1">
                Ajouter un cours
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">Matière</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3 hidden md:table-cell">Enseignant</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">Coeff.</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">Note max</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-5 py-3">Statut</th>
                  <th className="w-10 px-3 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {cours.map((c: any) => (
                  <tr key={c.idCours} onClick={() => navigate(`/cours/${c.idCours}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                        </div>
                        <span className="text-sm font-medium text-slate-900">{c.libelle}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500 hidden md:table-cell">
                      {c.enseignant?.personne
                        ? `${c.enseignant.personne.prenom} ${c.enseignant.personne.nom}`
                        : <span className="text-slate-300 italic text-xs">Non assigné</span>}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm font-medium text-amber-600">×{c.coefficient ?? 1}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500">{c.note ?? 20}/20</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        c.actif ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                      }`}>
                        {c.actif ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-100 bg-slate-50">
                  <td className="px-5 py-3 text-xs font-semibold text-slate-500" colSpan={2}>Total coefficients</td>
                  <td className="px-5 py-3">
                    <span className="text-sm font-bold text-amber-600">×{totalCoeff}</span>
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      )}
    </PageLayout>
  );
}