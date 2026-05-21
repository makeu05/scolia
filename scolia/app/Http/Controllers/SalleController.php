<?php

namespace App\Http\Controllers;

use App\Models\Salle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SalleController extends Controller
{
    public function index(Request $request)
    {
        $query = Salle::with('classe.cycle');

        if ($request->filled('idClasse')) {
            $query->where('idClasse', $request->idClasse);
        }
        if ($request->filled('actif')) {
            $query->where('actif', $request->actif);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'libelle'  => 'required|string|max:30',
            'position' => 'nullable|string|max:100',
            'surface'  => 'required|string|max:30',
            'idClasse' => 'required|integer|exists:Classe,idClasse',
            'idAdmin'  => 'required|integer',
        ]);

        $id = DB::table('Salle')->max('idSalle') + 1;

        $salle = Salle::create([
            'idSalle'  => $id,
            'libelle'  => $request->libelle,
            'position' => $request->position ?? 'NON DEFINI',
            'surface'  => $request->surface,
            'idClasse' => $request->idClasse,
            'actif'    => 1,
            'idAdmin'  => $request->idAdmin,
        ]);

        return response()->json([
            'message' => 'Salle créée',
            'salle'   => $salle->load('classe')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $salle = Salle::findOrFail($id);
        $salle->update($request->only(['libelle', 'position', 'surface', 'idClasse', 'actif']));
        return response()->json(['message' => 'Salle mise à jour', 'salle' => $salle->load('classe')]);
    }

    public function destroy($id)
    {
        $salle = Salle::findOrFail($id);
        if ($salle->frequentes()->count() > 0) {
            return response()->json(['message' => 'Des élèves sont inscrits dans cette salle'], 422);
        }
        $salle->delete();
        return response()->json(['message' => 'Salle supprimée']);
    }

    public function show($id)
{
    $salle = Salle::with('classe')->findOrFail($id);

    return response()->json($salle);
}
}