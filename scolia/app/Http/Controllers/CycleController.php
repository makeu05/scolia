<?php

namespace App\Http\Controllers;

use App\Models\Cycle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CycleController extends Controller
{
    public function index()
    {
        $cycles = Cycle::with('classes')->get();
        return response()->json($cycles);
    }

   public function store(Request $request)
{
   
    $data = $request->validate([
        'libelle'     => 'required|string|max:255',
        'description' => 'nullable|string',
        'idAdmin'     => 'required|integer',
    ]);

    $data['idCycle'] = Cycle::max('idCycle') + 1;
    $cycle = Cycle::create($data);

    return response()->json([
        'message' => 'Cycle créé',
        'cycle' => $cycle
    ], 201);
}

    public function show($idCycle)
    {
        $cycle = Cycle::with(['classes', 'scolarite'])->findOrFail($idCycle);
        return response()->json($cycle);
    }

    public function update(Request $request, $idCycle)
    {
        $cycle = Cycle::findOrFail($idCycle);

        $request->validate([
            'libelle'     => 'sometimes|string|max:255',
            'description' => 'nullable|string',
        ]);

        $cycle->update($request->only(['libelle', 'description']));

        return response()->json(['message' => 'Cycle mis à jour', 'cycle' => $cycle]);
    }

    public function destroy($idCycle)
    {
        $cycle = Cycle::findOrFail($idCycle);

        if ($cycle->classes()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer : des classes sont liées à ce cycle'
            ], 422);
        }

        $cycle->delete();
        return response()->json(['message' => 'Cycle supprimé']);
    }
}