// src/data/cameroun.ts
// Régions et villes du Cameroun (liste statique frontend)

export interface RegionCmr {
  id: string;
  nom: string;
  villes: string[];
}

export const REGIONS_CAMEROUN: RegionCmr[] = [
  {
    id: "AD", nom: "Adamaoua",
    villes: ["Ngaoundéré", "Tibati", "Meiganga", "Banyo", "Tignère", "Mbé", "Dir"],
  },
  {
    id: "CE", nom: "Centre",
    villes: ["Yaoundé", "Mbalmayo", "Bafia", "Obala", "Mfou", "Akonolinga", "Nanga-Eboko", "Eséka", "Ntui", "Monatélé", "Ngoumou"],
  },
  {
    id: "ES", nom: "Est",
    villes: ["Bertoua", "Batouri", "Abong-Mbang", "Yokadouma", "Bélabo", "Doumé", "Garoua-Boulaï", "Lomié"],
  },
  {
    id: "EN", nom: "Extrême-Nord",
    villes: ["Maroua", "Kousséri", "Mokolo", "Yagoua", "Kaélé", "Mora", "Waza", "Guider", "Mindif"],
  },
  {
    id: "LT", nom: "Littoral",
    villes: ["Douala", "Nkongsamba", "Édéa", "Loum", "Mbanga", "Manjo", "Dizangué", "Yabassi"],
  },
  {
    id: "NO", nom: "Nord",
    villes: ["Garoua", "Guider", "Figuil", "Pitoa", "Lagdo", "Poli", "Tcholliré", "Rey-Bouba"],
  },
  {
    id: "NW", nom: "Nord-Ouest",
    villes: ["Bamenda", "Kumbo", "Ndop", "Wum", "Mbengwi", "Fundong", "Nkambé", "Batibo", "Bali"],
  },
  {
    id: "OU", nom: "Ouest",
    villes: ["Bafoussam", "Dschang", "Mbouda", "Bandjoun", "Foumban", "Bafang", "Foumbot", "Bangangté", "Baham", "Bandja"],
  },
  {
    id: "SU", nom: "Sud",
    villes: ["Ebolowa", "Kribi", "Sangmélima", "Ambam", "Djoum", "Mvangan", "Campo", "Lolodorf", "Akom II"],
  },
  {
    id: "SW", nom: "Sud-Ouest",
    villes: ["Buea", "Limbe", "Kumba", "Tiko", "Mamfe", "Mutengene", "Muyuka", "Idenau", "Eyumojock"],
  },
];

// Helper : trouver les villes d'une région par son id
export function villesDeRegion(idRegion: string): string[] {
  return REGIONS_CAMEROUN.find(r => r.id === idRegion)?.villes ?? [];
}

// Helper : trouver la région d'une ville (utile en édition)
export function regionDeVille(ville: string): string {
  const r = REGIONS_CAMEROUN.find(reg => reg.villes.includes(ville));
  return r?.id ?? "";
}
