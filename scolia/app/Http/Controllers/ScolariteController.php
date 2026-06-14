<?php

namespace App\Http\Controllers;

use App\Models\Scolarite;
use App\Models\Tranches;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScolariteController extends Controller
{
    // ── INDEX ─────────────────────────────────────────────────────────────────
    public function index()
    {
        return response()->json(
            Scolarite::with(['cycle', 'tranches'])->get()
        );
    }

    // ── STORE — FIX race condition ─────────────────────────────────────────────
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
                'message' => 'Un tarif de scolarité existe déjà pour ce cycle. Modifiez-le plutôt.',
            ], 422);
        }

        $scolarite = DB::transaction(function () use ($request) {
            // FIX: lockForUpdate() pour éviter la race condition
            $id = DB::table('Scolarite')->lockForUpdate()->max('idScolarite') + 1;

            return Scolarite::create([
                'idScolarite' => $id,
                'inscription' => $request->inscription,
                'pension'     => $request->pension,
                'nbreTranche' => $request->nbreTranche,
                'description' => $request->description ?? '',
                'idCycle'     => $request->idCycle,
                'idFondateur' => $request->idFondateur,
            ]);
        });

        return response()->json([
            'message'   => 'Scolarité créée avec succès',
            'scolarite' => $scolarite->load(['cycle', 'tranches']),
        ], 201);
    }

    // ── SHOW ──────────────────────────────────────────────────────────────────
    public function show($id)
    {
        return response()->json(
            Scolarite::with(['cycle', 'tranches'])->findOrFail($id)
        );
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────
    public function update(Request $request, $id)
    {
        $scolarite = Scolarite::findOrFail($id);

        $request->validate([
            'inscription' => 'sometimes|numeric|min:0',
            'pension'     => 'sometimes|numeric|min:0',
            'nbreTranche' => 'sometimes|integer|min:1|max:12',
            'description' => 'nullable|string',
        ]);

        $scolarite->update($request->only([
            'inscription', 'pension', 'nbreTranche', 'description',
        ]));

        return response()->json([
            'message'   => 'Scolarité mise à jour',
            'scolarite' => $scolarite->load(['cycle', 'tranches']),
        ]);
    }

    // ── STORE TRANCHE — FIX race condition ────────────────────────────────────
    public function storeTranche(Request $request, $idScolarite)
    {
        // Vérifier que la scolarité existe
        Scolarite::findOrFail($idScolarite);

        $request->validate([
            'libelle'     => 'required|string|max:255',
            'montant'     => 'required|numeric|min:0',
            'delai_mois'  => 'required|string|max:2',
            'delai_jour'  => 'required|string|max:2',
            'idFondateur' => 'required|integer',
        ]);

        $tranche = DB::transaction(function () use ($request, $idScolarite) {
            // FIX: lockForUpdate() pour éviter la race condition
            $id = DB::table('Tranches')->lockForUpdate()->max('idTranche') + 1;

            return Tranches::create([
                'idTranche'   => $id,
                'libelle'     => $request->libelle,
                'montant'     => $request->montant,
                'delai_mois'  => $request->delai_mois,
                'delai_jour'  => $request->delai_jour,
                'idScolarite' => $idScolarite,
                'actif'       => 1,
                'idFondateur' => $request->idFondateur,
            ]);
        });

        return response()->json([
            'message' => 'Tranche ajoutée avec succès',
            'tranche' => $tranche,
        ], 201);
    }

    // ── DELETE TRANCHE ────────────────────────────────────────────────────────
    public function deleteTranche($idTranche)
    {
        Tranches::findOrFail($idTranche)->delete();
        return response()->json(['message' => 'Tranche supprimée']);
    }
}