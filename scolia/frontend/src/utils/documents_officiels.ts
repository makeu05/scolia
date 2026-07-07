// src/utils/documents_officiels.ts
// Carte d'étudiant + Certificat de scolarité (HTML + window.print())
// QR code via la lib 'qrcode' (npm i qrcode)

import QRCode from 'qrcode';

const SERVER = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:8000';

function getPhotoUrl(url?: string): string | null {
  if (!url || url === 'INDEFINI') return null;
  if (url.startsWith('http')) return url;
  return `${SERVER}/storage/${url}`;
}

function getLogoUrl(etab?: any): string | null {
  if (!etab) return null;
  if (etab.logo_url) return etab.logo_url;
  if (etab.logo && etab.logo !== 'INDEFINI') {
    return etab.logo.startsWith('http') ? etab.logo : `${SERVER}/storage/${etab.logo}`;
  }
  return null;
}

// Génère un QR code en dataURL (base64) pour injection dans <img>
async function genererQR(contenu: string): Promise<string> {
  try {
    return await QRCode.toDataURL(contenu, {
      width: 200,
      margin: 1,
      color: { dark: '#0f1f3d', light: '#ffffff' },
    });
  } catch {
    return '';
  }
}

// ══════════════════════════════════════════════════════════════
//  CARTE D'ÉTUDIANT — format badge (85.6 × 54 mm, carte bancaire)
// ══════════════════════════════════════════════════════════════
export async function imprimerCarteEtudiant(eleve: any, etab: any, infos?: {
  classe?: string; annee?: string;
}) {
  const photo = getPhotoUrl(eleve.photoURL);
  const logo  = getLogoUrl(etab);
  const initiales = `${eleve.prenom?.[0] ?? ''}${eleve.nom?.[0] ?? ''}`.toUpperCase();

  // QR contient le matricule + une URL de vérification
  const urlVerif = `${SERVER.replace(':8000', ':5173')}/verify/${eleve.matricule}`;
  const qrData   = await genererQR(`SCOLIA|${eleve.matricule}|${eleve.nom} ${eleve.prenom}|${urlVerif}`);

  const nomEcole = etab?.nom ?? 'Établissement Scolaire';
  const ville    = etab?.ville ?? '';
  const annee    = infos?.annee ?? '';
  const classe   = infos?.classe ?? '';

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
  <title>Carte étudiant — ${eleve.nom} ${eleve.prenom}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background:#e5e7eb; padding:20px; display:flex; flex-direction:column; align-items:center; gap:16px; }

    .card {
      width: 340px; height: 214px;   /* ratio carte bancaire */
      border-radius: 14px; overflow:hidden; position:relative;
      background: linear-gradient(135deg, #0f1f3d 0%, #1a3a5c 55%, #2563eb 100%);
      color:#fff; box-shadow: 0 8px 30px rgba(15,31,61,0.35);
    }
    .card-dots {
      position:absolute; inset:0; opacity:0.08;
      background-image: radial-gradient(circle, #fff 1px, transparent 1px);
      background-size: 14px 14px;
    }
    .card-header {
      display:flex; align-items:center; gap:8px;
      padding:10px 14px 6px; position:relative; z-index:1;
    }
    .card-logo { width:30px; height:30px; border-radius:7px; object-fit:contain; background:rgba(255,255,255,0.15); padding:2px; }
    .card-logo-fallback { width:30px; height:30px; border-radius:7px; background:rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; font-size:14px; }
    .card-ecole { font-size:10px; font-weight:700; line-height:1.15; letter-spacing:0.01em; }
    .card-type { font-size:7px; opacity:0.65; text-transform:uppercase; letter-spacing:0.1em; margin-top:1px; }

    .card-body { display:flex; gap:12px; padding:4px 14px; position:relative; z-index:1; }
    .card-photo { width:66px; height:80px; border-radius:8px; object-fit:cover; border:2px solid rgba(255,255,255,0.4); flex-shrink:0; }
    .card-photo-fallback { width:66px; height:80px; border-radius:8px; background:rgba(255,255,255,0.15); display:flex; align-items:center; justify-content:center; font-size:26px; font-weight:800; border:2px solid rgba(255,255,255,0.3); flex-shrink:0; }
    .card-info { flex:1; min-width:0; padding-top:2px; }
    .card-nom { font-size:13px; font-weight:800; line-height:1.2; text-transform:uppercase; }
    .card-prenom { font-size:11px; font-weight:500; opacity:0.9; margin-bottom:5px; }
    .card-row { font-size:8.5px; opacity:0.85; margin-top:2px; display:flex; gap:4px; }
    .card-row b { opacity:0.6; font-weight:600; min-width:38px; }

    .card-footer {
      position:absolute; bottom:0; left:0; right:0; z-index:1;
      display:flex; align-items:flex-end; justify-content:space-between;
      padding:6px 14px 8px;
    }
    .card-mat { font-size:11px; font-weight:800; letter-spacing:0.05em; font-family:'Courier New',monospace; }
    .card-mat-label { font-size:6.5px; opacity:0.55; text-transform:uppercase; letter-spacing:0.1em; }
    .card-qr { width:46px; height:46px; border-radius:6px; background:#fff; padding:3px; }

    .actions { display:flex; gap:10px; }
    .btn { padding:8px 18px; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; }
    .btn-print { background:#2563eb; color:#fff; }
    .btn-close { background:#e5e7eb; color:#374151; }

    @media print {
      body { background:#fff; padding:0; }
      .actions { display:none; }
      .card { box-shadow:none; page-break-inside:avoid; margin:20px auto; }
    }
  </style></head><body>

  <div class="card">
    <div class="card-dots"></div>

    <div class="card-header">
      ${logo
        ? `<img src="${logo}" class="card-logo" />`
        : `<div class="card-logo-fallback">🎓</div>`}
      <div>
        <div class="card-ecole">${nomEcole}</div>
        <div class="card-type">Carte d'étudiant${ville ? ' · ' + ville : ''}</div>
      </div>
    </div>

    <div class="card-body">
      ${photo
        ? `<img src="${photo}" class="card-photo" />`
        : `<div class="card-photo-fallback">${initiales}</div>`}
      <div class="card-info">
        <div class="card-nom">${eleve.nom ?? ''}</div>
        <div class="card-prenom">${eleve.prenom ?? ''}</div>
        <div class="card-row"><b>Classe</b> ${classe || '—'}</div>
        <div class="card-row"><b>Année</b> ${annee || '—'}</div>
        <div class="card-row"><b>Né(e) le</b> ${eleve.dateNaissance ? new Date(eleve.dateNaissance).toLocaleDateString('fr-FR') : '—'}</div>
      </div>
    </div>

    <div class="card-footer">
      <div>
        <div class="card-mat-label">Matricule</div>
        <div class="card-mat">${eleve.matricule}</div>
      </div>
      ${qrData ? `<img src="${qrData}" class="card-qr" />` : ''}
    </div>
  </div>

  <div class="actions">
    <button class="btn btn-print" onclick="window.print()">🖨 Imprimer la carte</button>
    <button class="btn btn-close" onclick="window.close()">Fermer</button>
  </div>

  </body></html>`;

  const win = window.open('', '_blank', 'width=500,height=450');
  if (win) { win.document.write(html); win.document.close(); }
}

// ══════════════════════════════════════════════════════════════
//  CERTIFICAT DE SCOLARITÉ — A4 portrait, en-tête bilingue
// ══════════════════════════════════════════════════════════════
export function imprimerCertificatScolarite(eleve: any, etab: any, infos?: {
  classe?: string; annee?: string;
}) {
  const logo  = getLogoUrl(etab);
  const now   = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

  const nomEcole   = etab?.nom ?? 'Établissement Scolaire';
  const ville      = etab?.ville ?? 'Yaoundé';
  const sexe       = Number(eleve.sexe) === 0 ? 'F' : 'M';
  const neLe       = sexe === 'F' ? 'née le' : 'né le';
  const inscrit    = sexe === 'F' ? 'inscrite' : 'inscrit';
  const eleveMot   = sexe === 'F' ? "l'élève" : "l'élève";
  const dateNaiss  = eleve.dateNaissance ? new Date(eleve.dateNaissance).toLocaleDateString('fr-FR') : '—';
  const classe     = infos?.classe ?? '—';
  const annee      = infos?.annee ?? '—';

  const signataireNom   = etab?.signataire_nom ?? '';
  const signataireTitre = etab?.signataire_titre ?? 'Le Chef d\'établissement';
  const signatureImg    = etab?.signataire_signature && etab.signataire_signature !== 'INDEFINI'
    ? `${SERVER}/storage/${etab.signataire_signature}` : null;

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
  <title>Certificat de scolarité — ${eleve.nom} ${eleve.prenom}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: 'Times New Roman', Georgia, serif; color:#1a1a1a; background:#e5e7eb; }
    .page {
      width: 210mm; min-height: 297mm; margin: 0 auto; background:#fff;
      padding: 18mm 20mm; position:relative;
    }

    /* En-tête bilingue officiel */
    .entete-bilingue { display:flex; justify-content:space-between; font-size:10px; text-align:center; margin-bottom:6px; }
    .entete-bilingue .col { width:32%; }
    .entete-bilingue .pays { font-weight:bold; font-size:11px; }
    .entete-bilingue .devise { font-style:italic; font-size:9px; margin-top:2px; }
    .entete-bilingue .etoile { font-size:9px; margin-top:2px; }
    .entete-center { text-align:center; }
    .entete-center img { width:70px; height:70px; object-fit:contain; }
    .entete-center .logo-fallback { width:70px; height:70px; margin:0 auto; display:flex; align-items:center; justify-content:center; font-size:36px; border:2px solid #1a3a5c; border-radius:50%; }

    .ministere { text-align:center; font-size:9px; margin:3px 0; }

    .separator { border-top:2px solid #1a3a5c; margin:10px 0 4px; }
    .separator-thin { border-top:1px solid #999; margin:0 0 20px; }

    /* Bloc établissement */
    .etab-bloc { text-align:center; margin-bottom:24px; }
    .etab-nom { font-size:20px; font-weight:bold; color:#0f1f3d; text-transform:uppercase; letter-spacing:0.02em; }
    .etab-infos { font-size:10px; color:#555; margin-top:4px; line-height:1.5; }

    /* Titre */
    .titre-doc {
      text-align:center; font-size:22px; font-weight:bold; letter-spacing:0.15em;
      text-transform:uppercase; margin:20px 0 6px; color:#0f1f3d;
      text-decoration:underline; text-underline-offset:6px;
    }
    .ref { text-align:center; font-size:10px; color:#888; margin-bottom:30px; }

    /* Corps */
    .corps { font-size:14px; line-height:2.1; text-align:justify; margin:0 8px; }
    .corps strong { font-weight:bold; }
    .highlight { background:linear-gradient(transparent 60%, #fef08a 60%); padding:0 2px; }

    /* Infos élève encadré */
    .eleve-box {
      border:1px solid #ccc; border-radius:6px; padding:14px 18px; margin:20px 0;
      background:#f8fafc; font-size:13px; line-height:1.9;
    }
    .eleve-box .row { display:flex; }
    .eleve-box .lbl { font-weight:bold; width:150px; color:#555; }

    /* Signature */
    .signature-bloc { margin-top:50px; display:flex; justify-content:flex-end; }
    .signature-inner { text-align:center; width:240px; }
    .signature-lieu { font-size:12px; margin-bottom:6px; }
    .signature-titre { font-size:13px; font-weight:bold; margin-bottom:4px; }
    .signature-img { width:120px; height:60px; object-fit:contain; margin:4px auto; }
    .signature-space { height:60px; }
    .signature-nom { font-size:13px; font-weight:bold; border-top:1px solid #333; padding-top:4px; }

    .footer-doc {
      position:absolute; bottom:14mm; left:20mm; right:20mm;
      text-align:center; font-size:8px; color:#aaa; border-top:1px solid #eee; padding-top:6px;
    }

    .actions { text-align:center; padding:16px; }
    .btn { padding:10px 22px; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; margin:0 6px; font-family:Arial,sans-serif; }
    .btn-print { background:#2563eb; color:#fff; }
    .btn-close { background:#d1d5db; color:#374151; }

    @media print {
      body { background:#fff; }
      .page { margin:0; padding:18mm 20mm; }
      .actions { display:none; }
      @page { size: A4; margin:0; }
    }
  </style></head><body>

  <div class="page">

    <!-- En-tête bilingue -->
    <div class="entete-bilingue">
      <div class="col">
        <div class="pays">${etab?.pays_fr ?? 'République du Cameroun'}</div>
        <div class="devise">${etab?.devise_pays_fr ?? 'Paix - Travail - Patrie'}</div>
        <div class="etoile">**********</div>
      </div>
      <div class="col entete-center">
        ${logo
          ? `<img src="${logo}" />`
          : `<div class="logo-fallback">🎓</div>`}
      </div>
      <div class="col">
        <div class="pays">${etab?.pays_en ?? 'Republic of Cameroon'}</div>
        <div class="devise">${etab?.devise_pays_en ?? 'Peace - Work - Fatherland'}</div>
        <div class="etoile">**********</div>
      </div>
    </div>

    ${etab?.ministere ? `<div class="ministere">${etab.ministere}</div>` : ''}
    ${etab?.delegation ? `<div class="ministere">${etab.delegation}</div>` : ''}

    <div class="separator"></div>
    <div class="separator-thin"></div>

    <!-- Établissement -->
    <div class="etab-bloc">
      <div class="etab-nom">${nomEcole}</div>
      <div class="etab-infos">
        ${etab?.bp ? `BP : ${etab.bp}` : ''}${etab?.telephone ? ` &nbsp;·&nbsp; Tél : ${etab.telephone}` : ''}<br/>
        ${etab?.email ? `Email : ${etab.email}` : ''}${etab?.numero_arrete ? ` &nbsp;·&nbsp; Arrêté N° ${etab.numero_arrete}` : ''}
      </div>
    </div>

    <!-- Titre -->
    <div class="titre-doc">Certificat de Scolarité</div>
    <div class="ref">Année scolaire ${annee}</div>

    <!-- Corps -->
    <div class="corps">
      Je soussigné(e), <strong>${signataireNom || '……………………………'}</strong>,
      <strong>${signataireTitre}</strong> de l'établissement susmentionné, certifie que&nbsp;:
    </div>

    <!-- Encadré élève -->
    <div class="eleve-box">
      <div class="row"><span class="lbl">Nom & Prénom :</span> <strong>${eleve.nom ?? ''} ${eleve.prenom ?? ''}</strong></div>
      <div class="row"><span class="lbl">${neLe} :</span> ${dateNaiss}${eleve.lieuNaissance ? ' à ' + eleve.lieuNaissance : ''}</div>
      <div class="row"><span class="lbl">Matricule :</span> ${eleve.matricule}</div>
      <div class="row"><span class="lbl">Sexe :</span> ${sexe === 'F' ? 'Féminin' : 'Masculin'}</div>
    </div>

    <div class="corps">
      est régulièrement <strong>${inscrit}</strong> dans notre établissement en classe de
      <strong class="highlight">${classe}</strong> au titre de l'année scolaire
      <strong>${annee}</strong>.
      <br/><br/>
      En foi de quoi le présent certificat lui est délivré pour servir et valoir ce que de droit.
    </div>

    <!-- Signature -->
    <div class="signature-bloc">
      <div class="signature-inner">
        <div class="signature-lieu">Fait à ${ville}, le ${now}</div>
        <div class="signature-titre">${signataireTitre}</div>
        ${signatureImg
          ? `<img src="${signatureImg}" class="signature-img" />`
          : `<div class="signature-space"></div>`}
        <div class="signature-nom">${signataireNom || '……………………………'}</div>
      </div>
    </div>

    <div class="footer-doc">
      Document officiel généré par Scolia — ${nomEcole} — ${now}
    </div>
  </div>

  <div class="actions">
    <button class="btn btn-print" onclick="window.print()">🖨 Imprimer le certificat</button>
    <button class="btn btn-close" onclick="window.close()">Fermer</button>
  </div>

  </body></html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (win) { win.document.write(html); win.document.close(); }
}