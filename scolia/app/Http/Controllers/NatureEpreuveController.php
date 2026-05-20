<?php

namespace App\Http\Controllers;

use App\Models\NatureEpreuve;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NatureEpreuveController extends Controller
{
    public function index()
    {
        return response()->json(NatureEpreuve::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'libelle'     => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $id = DB::table('NatureEpreuve')->max('idNature') + 1;

        $nature = NatureEpreuve::create([
            'idNature'    => $id,
            'libelle'     => $request->libelle,
            'description' => $request->description ?? '',
        ]);

        return response()->json(['message' => 'Nature créée', 'nature' => $nature], 201);
    }

    public function update(Request $request, $id)
    {
        $nature = NatureEpreuve::findOrFail($id);
        $nature->update($request->only(['libelle', 'description']));
        return response()->json(['message' => 'Nature mise à jour', 'nature' => $nature]);
    }

    public function destroy($id)
    {
        $nature = NatureEpreuve::findOrFail($id);
        if ($nature->epreuves()->count() > 0) {
            return response()->json(['message' => 'Des épreuves sont liées à cette nature'], 422);
        }
        $nature->delete();
        return response()->json(['message' => 'Nature supprimée']);
    }
}