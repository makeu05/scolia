<?php

namespace App\Http\Controllers;

use App\Models\Specialite;
use Illuminate\Http\Request;

class SpecialiteController extends Controller
{
    // GET /api/specialites
    public function index()
    {
        return response()->json(Specialite::orderBy('libelle')->get());
    }

    // POST /api/specialites
    public function store(Request $request)
    {
        $data = $request->validate([
            'libelle' => 'required|string|max:100|unique:specialite,libelle',
            'idAdmin' => 'required|integer',
        ]);

        $data['idSpecialite'] = Specialite::max('idSpecialite') + 1;

        $spec = Specialite::create($data);

        return response()->json([
            'message'    => 'Spécialité ajoutée avec succès.',
            'specialite' => $spec,
        ], 201);
    }

    // PUT /api/specialites/{id}
    public function update(Request $request, $id)
    {
        $spec = Specialite::findOrFail($id);

        $request->validate([
            'libelle' => 'required|string|max:100|unique:specialite,libelle,' . $id . ',idSpecialite',
        ]);

        $spec->update(['libelle' => $request->libelle]);

        return response()->json([
            'message'    => 'Spécialité modifiée.',
            'specialite' => $spec,
        ]);
    }

    // DELETE /api/specialites/{id}
    public function destroy($id)
    {
        $spec = Specialite::findOrFail($id);

        // Vérifier qu'aucun livre n'utilise cette spécialité
        if ($spec->livres()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer : des livres utilisent cette spécialité.',
            ], 422);
        }

        $spec->delete();

        return response()->json(['message' => 'Spécialité supprimée.']);
    }
}
