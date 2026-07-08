// À AJOUTER dans src/utils/documents_officiels.ts
// (ou créer un fichier séparé src/utils/bulletin_print.ts)

// ══════════════════════════════════════════════════════════════
//  BULLETIN DE NOTES — A4 portrait, en-tête établissement bilingue
// ══════════════════════════════════════════════════════════════
export function imprimerBulletin(bulletin: any, etab?: any) {
  const SERVER = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:8000';

  const getLogoUrl = (e?: any): string | null => {
    if (!e) return null;
    if (e.logo_url) return e.logo_url;
    if (e.logo && e.logo !== 'INDEFINI') {
      return e.logo.startsWith('http') ? e.logo : `${SERVER}/storage/${e.logo}`;
    }
    return null;
  };

  const logo     = getLogoUrl(etab);
  const now      = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const nomEcole = etab?.nom ?? 'SCOLIA';
  const ville    = etab?.ville ?? 'Yaoundé';

  const eleve      = bulletin.eleve ?? {};
  const classe     = bulletin.classe ?? {};
  const trimestre  = bulletin.trimestre ?? {};
  const matieres   = bulletin.resultats ?? bulletin.matieres ?? [];
  const moyenneGen = bulletin.moyenneGenerale ?? 0;
  const moyClasse  = bulletin.moyenneClasse ?? null;
  const mention    = bulletin.mention ?? '';
  const rang       = bulletin.classement?.rang ?? bulletin.rang ?? '—';
  const effectif   = bulletin.classement?.total ?? bulletin.effectif ?? '—';
  const annee      = classe.annee ?? '';

  const sexe   = Number(eleve.sexe) === 0 ? 'F' : 'M';
  const neLe   = sexe === 'F' ? 'née le' : 'né le';

  // Lignes du tableau des matières
  const rows = matieres.map((r: any) => {
    const matiere = r.libelle ?? r.cours ?? '—';
    const coeff   = r.coefficient ?? 1;
    const moy     = Number(r.moyenne ?? 0);
    const total   = (moy * coeff).toFixed(2);
    const moyCl   = r.moyenne_classe != null ? Number(r.moyenne_classe).toFixed(2) : '—';
    const ens     = r.enseignant ? `${r.enseignant.prenom ?? ''} ${r.enseignant.nom ?? ''}`.trim() : '';
    const couleur = moy >= 10 ? '#047857' : '#b91c1c';
    return `
      <tr>
        <td class="mat">${matiere}${ens ? `<span class="ens">${ens}</span>` : ''}</td>
        <td class="c">${coeff}</td>
        <td class="c" style="color:${couleur};font-weight:bold">${moy.toFixed(2)}</td>
        <td class="c">${total}</td>
        <td class="c">${moyCl}</td>
        <td class="appr">${r.appreciation ?? ''}</td>
      </tr>`;
  }).join('');

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
  <title>Bulletin — ${eleve.nom ?? ''} ${eleve.prenom ?? ''}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Times New Roman', Georgia, serif; color:#1a1a1a; background:#e5e7eb; }
    .page { width:210mm; min-height:297mm; margin:0 auto; background:#fff; padding:16mm 18mm; position:relative; }

    /* En-tête bilingue */
    .entete { display:flex; justify-content:space-between; font-size:9px; text-align:center; margin-bottom:6px; }
    .entete .col { width:32%; }
    .entete .pays { font-weight:bold; font-size:10px; }
    .entete .devise { font-style:italic; font-size:8px; margin-top:2px; }
    .entete-center img { width:60px; height:60px; object-fit:contain; }
    .entete-center .logo-fb { width:60px; height:60px; margin:0 auto; display:flex; align-items:center; justify-content:center; font-size:30px; border:2px solid #1a3a5c; border-radius:50%; }
    .ministere { text-align:center; font-size:8px; margin:2px 0; }

    .sep { border-top:2px solid #1a3a5c; margin:8px 0 3px; }
    .sep-thin { border-top:1px solid #999; margin:0 0 14px; }

    .etab-nom { text-align:center; font-size:18px; font-weight:bold; color:#0f1f3d; text-transform:uppercase; }
    .etab-sub { text-align:center; font-size:9px; color:#555; margin-top:2px; }

    .titre { text-align:center; font-size:18px; font-weight:bold; letter-spacing:0.12em; text-transform:uppercase; margin:16px 0 4px; color:#0f1f3d; text-decoration:underline; text-underline-offset:5px; }
    .periode { text-align:center; font-size:11px; color:#555; margin-bottom:18px; }

    /* Infos élève */
    .infos { display:flex; justify-content:space-between; border:1px solid #ccc; border-radius:6px; padding:10px 16px; margin-bottom:16px; background:#f8fafc; font-size:12px; }
    .infos .bloc p { margin:2px 0; }
    .infos .lbl { color:#666; font-size:10px; }
    .infos .val { font-weight:bold; font-size:13px; }
    .infos .right { text-align:right; }

    /* Tableau notes */
    table.notes { width:100%; border-collapse:collapse; margin-bottom:16px; font-size:11px; }
    table.notes thead tr { background:#0f1f3d; color:#fff; }
    table.notes th { padding:7px 8px; text-align:center; font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:0.03em; }
    table.notes th:first-child { text-align:left; }
    table.notes td { border:1px solid #cbd5e1; padding:6px 8px; }
    table.notes td.c { text-align:center; }
    table.notes td.mat { font-weight:600; }
    table.notes td.mat .ens { display:block; font-size:8px; color:#888; font-weight:normal; font-style:italic; }
    table.notes td.appr { font-size:10px; font-style:italic; color:#555; }
    table.notes tbody tr:nth-child(even) { background:#f8fafc; }

    /* Synthèse */
    .synthese { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; gap:16px; }
    .stats { flex:1; font-size:11px; }
    .stats .row { display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px dotted #ddd; }
    .stats .row b { color:#0f1f3d; }
    .moy-box { border:2px solid #0f1f3d; border-radius:8px; padding:12px 24px; text-align:center; min-width:150px; }
    .moy-box .lbl { font-size:9px; text-transform:uppercase; letter-spacing:0.1em; color:#666; }
    .moy-box .val { font-size:34px; font-weight:bold; color:#0f1f3d; line-height:1.1; margin:4px 0; }
    .moy-box .mention { font-size:11px; font-weight:600; color:#1a3a5c; }

    /* Signatures */
    .signatures { display:flex; justify-content:space-between; margin-top:36px; gap:24px; }
    .sign { flex:1; text-align:center; }
    .sign .line { height:50px; border-bottom:1.5px solid #333; margin-bottom:6px; }
    .sign p { font-size:11px; font-weight:600; }
    .sign .sub { font-size:9px; color:#888; font-weight:normal; }

    .footer { position:absolute; bottom:10mm; left:18mm; right:18mm; text-align:center; font-size:8px; color:#aaa; border-top:1px solid #eee; padding-top:5px; }

    .actions { text-align:center; padding:16px; }
    .btn { padding:10px 22px; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; margin:0 6px; font-family:Arial,sans-serif; }
    .btn-print { background:#1a3a5c; color:#fff; }
    .btn-close { background:#d1d5db; color:#374151; }

    @media print {
      body { background:#fff; }
      .page { margin:0; padding:16mm 18mm; }
      .actions { display:none; }
      @page { size:A4 portrait; margin:0; }
    }
  </style></head><body>

  <div class="page">
    <!-- En-tête bilingue -->
    <div class="entete">
      <div class="col">
        <div class="pays">${etab?.pays_fr ?? 'République du Cameroun'}</div>
        <div class="devise">${etab?.devise_pays_fr ?? 'Paix - Travail - Patrie'}</div>
      </div>
      <div class="col entete-center">
        ${logo ? `<img src="${logo}" />` : `<div class="logo-fb">🎓</div>`}
      </div>
      <div class="col">
        <div class="pays">${etab?.pays_en ?? 'Republic of Cameroon'}</div>
        <div class="devise">${etab?.devise_pays_en ?? 'Peace - Work - Fatherland'}</div>
      </div>
    </div>
    ${etab?.ministere ? `<div class="ministere">${etab.ministere}</div>` : ''}

    <div class="sep"></div>
    <div class="sep-thin"></div>

    <div class="etab-nom">${nomEcole}</div>
    <div class="etab-sub">
      ${etab?.bp ? `BP : ${etab.bp}` : ''}${etab?.telephone ? ` · Tél : ${etab.telephone}` : ''}${etab?.email ? ` · ${etab.email}` : ''}
    </div>

    <div class="titre">Bulletin de Notes</div>
    <div class="periode">${trimestre.libelle ?? ''} — Année scolaire ${annee}</div>

    <!-- Infos élève -->
    <div class="infos">
      <div class="bloc">
        <p><span class="lbl">Élève :</span> <span class="val">${eleve.nom ?? ''} ${eleve.prenom ?? ''}</span></p>
        <p><span class="lbl">Matricule :</span> ${eleve.matricule ?? ''}</p>
        <p><span class="lbl">${neLe} :</span> ${eleve.dateNaissance ? new Date(eleve.dateNaissance).toLocaleDateString('fr-FR') : '—'}</p>
      </div>
      <div class="bloc right">
        <p><span class="lbl">Classe :</span> <span class="val">${classe.libelle ?? '—'}</span></p>
        <p><span class="lbl">Rang :</span> <strong>${rang} / ${effectif}</strong></p>
        <p><span class="lbl">Effectif :</span> ${effectif}</p>
      </div>
    </div>

    <!-- Tableau notes -->
    <table class="notes">
      <thead>
        <tr>
          <th>Matière</th>
          <th>Coeff.</th>
          <th>Moyenne</th>
          <th>Total</th>
          <th>Moy. Classe</th>
          <th>Appréciation</th>
        </tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="6" style="text-align:center;padding:20px;color:#999">Aucune note pour ce trimestre</td></tr>'}</tbody>
    </table>

    <!-- Synthèse -->
    <div class="synthese">
      <div class="stats">
        <div class="row"><span>Nombre de matières</span><b>${matieres.length}</b></div>
        <div class="row"><span>Moyenne de la classe</span><b>${moyClasse != null ? Number(moyClasse).toFixed(2) : '—'}</b></div>
        <div class="row"><span>Rang</span><b>${rang} / ${effectif}</b></div>
      </div>
      <div class="moy-box">
        <div class="lbl">Moyenne Générale</div>
        <div class="val">${Number(moyenneGen).toFixed(2)}</div>
        <div class="mention">${mention}</div>
      </div>
    </div>

    <!-- Signatures -->
    <div class="signatures">
      <div class="sign"><div class="line"></div><p>Le Titulaire</p><p class="sub">Signature</p></div>
      <div class="sign"><div class="line"></div><p>${etab?.signataire_titre ?? 'Le Directeur'}</p><p class="sub">Signature et cachet</p></div>
      <div class="sign"><div class="line"></div><p>Le Parent / Tuteur</p><p class="sub">Signature</p></div>
    </div>

    <div class="footer">Document généré par Scolia — ${nomEcole} — ${now}</div>
  </div>

  <div class="actions">
    <button class="btn btn-print" onclick="window.print()">🖨 Imprimer le bulletin</button>
    <button class="btn btn-close" onclick="window.close()">Fermer</button>
  </div>

  </body></html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (win) { win.document.write(html); win.document.close(); }
}