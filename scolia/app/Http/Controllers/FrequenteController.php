<?php

namespace App\Http\Controllers;

use App\Models\Frequente;
use App\Models\Eleve;
use Illuminate\Http\Request;
use App\Services\NotificationService;
use Illuminate\Support\Facades\DB;

class FrequenteController extends Controller
{
    // Liste des élèves inscrits — filtrable par classe et année
    public function index(Request $request)
{
    $query = Frequente::with(['eleve', 'salle.classe', 'anneeAcademique']);

    // ✅ Filtrer par année
    if ($request->filled('idAca')) {
        $query->where('idAcademi', $request->idAca);
    }
    if ($request->filled('search')) {
        $s = $request->search;
        $query->whereHas('eleve', fn($q) =>
            $q->where('nom', 'like', "%$s%")
              ->orWhere('prenom', 'like', "%$s%")
              ->orWhere('matricule', 'like', "%$s%")
        );
    }

    return response()->json($query->paginate(15));
}

    // Inscrire un élève dans une classe
    public function store(Request $request)
    {
        $request->validate([
            'matricule'   => 'required|integer|exists:Eleve,matricule',
            'idSalle'     => 'required|integer|exists:Salle,idSalle',
            'idAcademi'   => 'required|integer|exists:AnneeAcademique,idAnnee',
            'commentaire' => 'nullable|string|max:255',
            'idAdmin'     => 'required|integer',
        ]);

        // Vérifier si l'élève est déjà inscrit pour cette année
        $exists = Frequente::where('matricule', $request->matricule)
            ->where('idAcademi', $request->idAcademi)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Cet élève est déjà inscrit pour cette année académique'
            ], 422);
        }

        $id = DB::table('Frequente')->max('idFrequente') + 1;

        $frequente = Frequente::create([
            'idFrequente' => $id,
            'idSalle'     => $request->idSalle,
            'idAcademi'   => $request->idAcademi,
            'matricule'   => $request->matricule,
            'commentaire' => $request->commentaire ?? 'RAS',
            'idAdmin'     => $request->idAdmin,
        ]);

        NotificationService::inscription(
    "Élève #{$frequente->matricule} inscrit en {$frequente->salle->classe->libelle}",
    '/inscriptions/' . $frequente->idFrequente
);

        return response()->json([
            'message'   => 'Élève inscrit avec succès',
            'frequente' => $frequente->load(['eleve', 'salle.classe', 'anneeAcademique'])
        ], 201);
    }

    // Modifier l'inscription (changer de classe/salle)
    public function update(Request $request, $id)
    {
        $frequente = Frequente::findOrFail($id);

        $request->validate([
            'idSalle'     => 'sometimes|integer|exists:Salle,idSalle',
            'commentaire' => 'nullable|string|max:255',
        ]);

        $frequente->update($request->only(['idSalle', 'commentaire']));

        return response()->json([
            'message'   => 'Inscription mise à jour',
            'frequente' => $frequente->load(['eleve', 'salle.classe', 'anneeAcademique'])
        ]);
    }

    // Supprimer une inscription
    public function destroy($id)
    {
        Frequente::findOrFail($id)->delete();
        return response()->json(['message' => 'Inscription supprimée']);
    }

    // Élèves d'une classe pour une année — utilisé dans saisie notes
   public function elevesByClasse(Request $request)
{
    // ✅ Lire depuis query string (GET) sans validate() qui cause le 422
    $idClasse = $request->query('idClasse');
 
    if (!$idClasse) {
        return response()->json(['message' => 'idClasse requis'], 422);
    }
 
    try {
        $eleves = DB::table('frequente')
            ->join('salle',           'frequente.idSalle',   '=', 'salle.idSalle')
            ->join('eleve',           'frequente.matricule', '=', 'eleve.matricule')
            ->join('anneeacademique', 'frequente.idAcademi', '=', 'anneeacademique.idAnnee')
            ->where('salle.idClasse', $idClasse)
            ->select(
                'frequente.idFrequente',
                'frequente.matricule',
                'frequente.commentaire',
                'eleve.nom',
                'eleve.prenom',
                'eleve.sexe',
                'eleve.photoURL',
                'eleve.actif',
                'salle.idSalle',
                'salle.libelle as salle_libelle',
                'anneeacademique.idAnnee',
                'anneeacademique.libelle as annee_libelle'
            )
            ->orderBy('eleve.nom')
            ->get()
            ->map(fn($row) => [
                'idFrequente' => $row->idFrequente,
                'matricule'   => $row->matricule,
                'commentaire' => $row->commentaire,
                'eleve' => [
                    'matricule' => $row->matricule,
                    'nom'       => $row->nom,
                    'prenom'    => $row->prenom,
                    'sexe'      => $row->sexe ?? null,
                    'photoURL'     => $row->photoURL ?? null,
                    'actif'     => $row->actif,
                ],
                'salle' => [
                    'idSalle' => $row->idSalle,
                    'libelle' => $row->salle_libelle,
                ],
                'anneeAcademique' => [
                    'idAnnee' => $row->idAnnee,
                    'libelle' => $row->annee_libelle,
                ],
            ]);
 
        return response()->json($eleves);
 
    } catch (\Exception $e) {
        return response()->json(['message' => 'Erreur : ' . $e->getMessage()], 500);
    }
}
 
    /**
 * Afficher une inscription spécifique (détail)
 */
/**
 * Afficher une inscription spécifique (détail)
 */
public function show($id)
{
    $inscription = \App\Models\Frequente::with([
        'eleve:matricule,nom,prenom,sexe,photoURL,actif',
        'salle.classe',
        'anneeAcademique'
    ])->findOrFail($id);

    return response()->json($inscription);
}
}