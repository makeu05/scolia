// src/utils/impression.ts
// Fonctions d'impression PDF pour enseignants et utilisateurs

const SERVER = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:8000';

function getPhotoUrl(url?: string): string | null {
  if (!url || url === 'INDEFINI') return null;
  if (url.startsWith('http')) return url;
  return `${SERVER}/storage/${url}`;
}

function entete(titre: string, sous_titre: string, total: number, ecole?: any): string {
  const now = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  return `
    <div class="header">
      <h1>${ecole?.ecole_nom ?? 'SCOLIA'}</h1>
      <h2>${titre}</h2>
      <p class="sous-titre">${sous_titre} · ${total} membre(s) · Imprimé le ${now}</p>
    </div>
  `;
}

const CSS = `
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #1a1a1a; padding: 16px; }
  .header { text-align:center; border-bottom: 2px solid #1a3a5c; padding-bottom: 10px; margin-bottom: 14px; }
  .header h1 { font-size:16px; color:#1a3a5c; font-weight:bold; }
  .header h2 { font-size:13px; margin-top:3px; color:#333; }
  .sous-titre { font-size:10px; color:#888; margin-top:4px; }
  table { width:100%; border-collapse:collapse; }
  thead tr { background:#1a3a5c; color:white; }
  thead th { padding:7px 10px; text-align:left; font-size:10px; font-weight:600; letter-spacing:.04em; text-transform:uppercase; }
  tbody tr:nth-child(even) { background:#f8fafc; }
  tbody tr { border-bottom: 1px solid #e2e8f0; }
  tbody td { padding:6px 10px; vertical-align:middle; }
  .avatar { width:32px; height:32px; border-radius:6px; object-fit:cover; }
  .avatar-init { width:32px; height:32px; border-radius:6px; background:#667eea; color:white; font-weight:bold; font-size:12px; display:inline-flex; align-items:center; justify-content:center; }
  .badge { display:inline-block; padding:2px 8px; border-radius:99px; font-size:10px; font-weight:bold; }
  .badge-actif { background:#dcfce7; color:#16a34a; }
  .badge-inactif { background:#fee2e2; color:#dc2626; }
  .signature { margin-top:32px; display:flex; justify-content:space-between; }
  .signature div { text-align:center; font-size:10px; color:#555; }
  .signature .line { border-top:1px solid #1a3a5c; width:120px; margin:0 auto 4px; }
  .footer { margin-top:16px; text-align:center; font-size:9px; color:#aaa; border-top:1px solid #eee; padding-top:8px; }
  @media print { body { padding: 8px; } }
`;

// ── Impression liste enseignants ──────────────────────────────────────────────
export function imprimerEnseignants(enseignants: any[], ecole?: any) {
  const now = new Date().toLocaleDateString('fr-FR');
  const rows = enseignants.map((e, i) => {
    const photo = getPhotoUrl(e.personne?.photoURL);
    const initiales = `${e.personne?.prenom?.[0] ?? ''}${e.personne?.nom?.[0] ?? ''}`;
    return `
      <tr>
        <td>${i + 1}</td>
        <td>
          ${photo
            ? `<img src="${photo}" class="avatar" />`
            : `<span class="avatar-init">${initiales}</span>`}
        </td>
        <td><strong>${e.personne?.prenom ?? ''} ${e.personne?.nom ?? ''}</strong></td>
        <td>${e.cours?.libelle ?? '—'}</td>
        <td>${e.cours?.classe?.libelle ?? '—'}</td>
        <td>${e.personne?.mobile ?? '—'}</td>
        <td><span class="badge ${e.Actif ? 'badge-actif' : 'badge-inactif'}">${e.Actif ? 'Actif' : 'Inactif'}</span></td>
      </tr>
    `;
  }).join('');

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
    <title>Liste des enseignants</title>
    <style>${CSS}</style></head><body>
    ${entete('LISTE DES ENSEIGNANTS', 'Corps enseignant', enseignants.length, ecole)}
    <table>
      <thead><tr>
        <th>#</th><th>Photo</th><th>Nom & Prénom</th>
        <th>Cours</th><th>Classe</th><th>Mobile</th><th>Statut</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="signature">
      <div><div class="line"></div>Le Directeur</div>
      <div><div class="line"></div>Le Responsable RH</div>
    </div>
    <div class="footer">Document généré par Scolia — ${now}</div>
    <script>window.onload = () => window.print();</script>
  </body></html>`;

  const win = window.open('', '_blank');
  if (win) { win.document.write(html); win.document.close(); }
}

// ── Impression liste utilisateurs / administration ────────────────────────────
export function imprimerUtilisateurs(users: any[], ecole?: any) {
  const now = new Date().toLocaleDateString('fr-FR');

  const ROLE_LABELS: Record<string, string> = {
    root: 'Root', admin: 'Admin', directeur: 'Directeur',
    fondateur: 'Fondateur', enseignant: 'Enseignant', parent: 'Parent',
  };

  const rows = users.map((u, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><span class="avatar-init">${u.nom?.[0]?.toUpperCase() ?? '?'}</span></td>
      <td><strong>${u.nom}</strong></td>
      <td>@${u.username}</td>
      <td>${ROLE_LABELS[u.role] ?? u.role}</td>
      <td>${u.source === 'admin' ? 'Administrateur' : 'Personnel'}</td>
      <td>${u.mobile ?? '—'}</td>
      <td><span class="badge ${u.actif ? 'badge-actif' : 'badge-inactif'}">${u.actif ? 'Actif' : 'Désactivé'}</span></td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
    <title>Liste du personnel administratif</title>
    <style>${CSS}</style></head><body>
    ${entete('LISTE DU PERSONNEL', 'Administration & Enseignants', users.length, ecole)}
    <table>
      <thead><tr>
        <th>#</th><th>Avatar</th><th>Nom</th>
        <th>Username</th><th>Rôle</th><th>Type</th><th>Mobile</th><th>Statut</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="signature">
      <div><div class="line"></div>Le Directeur</div>
      <div><div class="line"></div>Le Fondateur</div>
    </div>
    <div class="footer">Document généré par Scolia — ${now}</div>
    <script>window.onload = () => window.print();</script>
  </body></html>`;

  const win = window.open('', '_blank');
  if (win) { win.document.write(html); win.document.close(); }
}