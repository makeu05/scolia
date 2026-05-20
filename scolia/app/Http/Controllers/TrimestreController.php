<?php

namespace App\Http\Controllers;

use App\Models\Trimestre;
use Illuminate\Http\Request;

class TrimestreController extends Controller
{
    public function index(Request $request)
    {
        $query = Trimestre::with('anneeAcademique');

        if ($request->filled('idAca')) {
            $query->where('idAca', $request->idAca);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'libelle' => 'required|string|max:255',
            'periode' => 'required|string|max:255',
            'idAca'   => 'required|integer|exists:AnneeAcademique,idAnnee',
            'idAdmin' => 'required|integer',
        ]);

        $data['idTrimes'] = (Trimestre::max('idTrimes') ?? 0) + 1;

        $trimestre = Trimestre::create($data);

        return response()->json([
            'message'   => 'Trimestre créé',
            'trimestre' => $trimestre->load('anneeAcademique'),
        ], 201);
    }

    public function destroy($idTrimes)
    {
        $trimestre = Trimestre::findOrFail($idTrimes);

        if ($trimestre->sessions()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer : des sessions sont liées'
            ], 422);
        }

        $trimestre->delete();
        return response()->json(['message' => 'Trimestre supprimé']);
    }
}