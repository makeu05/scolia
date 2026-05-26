<?php

namespace App\Http\Controllers;

use App\Models\FicheEnseignant;
use App\Models\Enseignant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FicheEnseignantController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = FicheEnseignant::with(['enseignant.personne', 'anneeAcademique']);

        if ($request->filled('idEnseignant')) {
            $query->where('idEnseignant', $request->idEnseignant);
        }

        if ($request->filled('idAca')) {
            $query->where('idAca', $request->idAca);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('libelle', 'like', "%$search%")
                  ->orWhereHas('enseignant.personne', function ($p) use ($search) {
                      $p->where('nom', 'like', "%$search%")
                        ->orWhere('prenom', 'like', "%$search%");
                  });
            });
        }

        return response()->json($query->paginate(15));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'idEnseignant'   => 'required|integer|exists:Enseignant,idEnseignant',
            'libelle'        => 'required|string|max:255',
            'points'         => 'nullable|numeric',
            'idAdministratif'=> 'required|integer',
            'idAca'          => 'required|integer|exists:AnneeAcademique,idAnnee',
            'commentaire'    => 'nullable|string',
            'event_date'     => 'required|date',
        ]);

        $fiche = FicheEnseignant::create($data);

        return response()->json([
            'message' => 'Fiche enseignant créée avec succès',
            'fiche'   => $fiche->load(['enseignant.personne', 'anneeAcademique'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $fiche = FicheEnseignant::with(['enseignant.personne', 'anneeAcademique'])
                    ->findOrFail($id);

        return response()->json($fiche);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $fiche = FicheEnseignant::findOrFail($id);

        $data = $request->validate([
            'libelle'        => 'sometimes|string|max:255',
            'points'         => 'nullable|numeric',
            'idAdministratif'=> 'sometimes|integer',
            'idAca'          => 'sometimes|integer|exists:AnneeAcademique,idAnnee',
            'commentaire'    => 'nullable|string',
            'event_date'     => 'sometimes|date',
        ]);

        $fiche->update($data);

        return response()->json([
            'message' => 'Fiche mise à jour avec succès',
            'fiche'   => $fiche->fresh()->load(['enseignant.personne', 'anneeAcademique'])
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $fiche = FicheEnseignant::findOrFail($id);
        $fiche->delete();

        return response()->json([
            'message' => 'Fiche supprimée avec succès'
        ]);
    }

    /**
     * Lister toutes les fiches d'un enseignant spécifique
     */
   public function fichesByEnseignant($idEnseignant)
{
    $fiches = FicheEnseignant::with(['anneeAcademique'])
        ->where('idEnseignant', (int)$idEnseignant)
        ->orderBy('event_date', 'desc')
        ->get();

    return response()->json($fiches);
}
    }
