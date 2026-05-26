<?php

namespace App\Http\Controllers;

use App\Models\Scolarite;
use App\Models\Tranches;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScolariteController extends Controller
{
    public function index()
    {
        return response()->json(
            Scolarite::with(['cycle', 'tranches'])->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'inscription' => 'required|numeric|min:0',
            'pension'     => 'required|numeric|min:0',
            'nbreTranche' => 'required|integer|min:1|max:12',
            'description' => 'nullable|string',
            'idCycle'     => 'required|integer|exists:Cycle,idCycle',
            'idFondateur' => 'required|integer',
        ]);

        // Un seul tarif par cycle
        $exists = Scolarite::where('idCycle', $request->idCycle)->exists();
        if ($exists) {
            return response()->json([
                'message' => 'Un tarif existe déjà pour ce cycle'
            ], 422);
        }

        $id = DB::table('Scolarite')->max('idScolarite') + 1;

        $scolarite = Scolarite::create([
            'idScolarite' => $id,
            'inscription' => $request->inscription,
            'pension'     => $request->pension,
            'nbreTranche' => $request->nbreTranche,
            'description' => $request->description ?? '',
            'idCycle'     => $request->idCycle,
            'idFondateur' => $request->idFondateur,
        ]);

        return response()->json([
            'message'    => 'Scolarité créée',
            'scolarite'  => $scolarite->load(['cycle', 'tranches'])
        ], 201);
    }

    public function show($id)
    {
        return response()->json(
            Scolarite::with(['cycle', 'tranches'])->findOrFail($id)
        );
    }

    public function update(Request $request, $id)
    {
        $scolarite = Scolarite::findOrFail($id);
        $scolarite->update($request->only([
            'inscription', 'pension', 'nbreTranche', 'description'
        ]));
        return response()->json([
            'message'   => 'Scolarité mise à jour',
            'scolarite' => $scolarite->load(['cycle', 'tranches'])
        ]);
    }

    // Ajouter une tranche à une scolarité
    public function storeTranche(Request $request, $idScolarite)
    {
        $request->validate([
            'libelle'    => 'required|string|max:255',
            'montant'    => 'required|numeric|min:0',
            'delai_mois' => 'required|string|max:2',
            'delai_jour' => 'required|string|max:2',
            'idFondateur'=> 'required|integer',
        ]);

        $id = DB::table('Tranches')->max('idTranche') + 1;

        $tranche = Tranches::create([
            'idTranche'   => $id,
            'libelle'     => $request->libelle,
            'montant'     => $request->montant,
            'delai_mois'  => $request->delai_mois,
            'delai_jour'  => $request->delai_jour,
            'idScolarite' => $idScolarite,
            'actif'       => 1,
            'idFondateur' => $request->idFondateur,
        ]);

        return response()->json([
            'message' => 'Tranche ajoutée',
            'tranche' => $tranche
        ], 201);
    }

    public function deleteTranche($idTranche)
    {
        Tranches::findOrFail($idTranche)->delete();
        return response()->json(['message' => 'Tranche supprimée']);
    }
}