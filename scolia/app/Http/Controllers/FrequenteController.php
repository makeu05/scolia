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
        $query = Frequente::with([
            'eleve',
            'salle.classe.cycle',
            'anneeAcademique'
        ]);

        if ($request->filled('idAcademi')) {
            $query->where('idAcademi', $request->idAcademi);
        }

        if ($request->filled('idClasse')) {
            $query->whereHas('salle', function ($q) use ($request) {
                $q->where('idClasse', $request->idClasse);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('eleve', function ($q) use ($search) {
                $q->where('nom', 'like', "%$search%")
                  ->orWhere('prenom', 'like', "%$search%")
                  ->orWhere('matricule', 'like', "%$search%");
            });
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
        $request->validate([
            'idClasse'  => 'required|integer',
            'idAcademi' => 'required|integer',
        ]);

        $eleves = DB::table('Frequente')
            ->join('Eleve', 'Frequente.matricule', '=', 'Eleve.matricule')
            ->join('Salle', 'Frequente.idSalle', '=', 'Salle.idSalle')
            ->where('Salle.idClasse', $request->idClasse)
            ->where('Frequente.idAcademi', $request->idAcademi)
            ->where('Eleve.actif', 1)
            ->select(
                'Eleve.matricule',
                'Eleve.nom',
                'Eleve.prenom',
                'Eleve.sexe',
                'Salle.libelle as salle',
                'Frequente.idFrequente',
                'Frequente.commentaire'
            )
            ->orderBy('Eleve.nom')
            ->get();

        return response()->json($eleves);
    }

    /**
 * Afficher une inscription spécifique (détail)
 */
public function show($id)
{
    $inscription = \App\Models\Frequente::with([
        'eleve' => function($q) {
            $q->select('matricule', 'nom', 'prenom', 'sexe', 'photoURL', 'actif');
        },
        'classe' => function($q) {
            $q->select('idClasse', 'libelle', 'idCycle');
        },
        'salle',
        'anneeAcademique'
    ])->findOrFail($id);

    return response()->json([
        'success' => true,
        'data' => $inscription
    ]);
}
}