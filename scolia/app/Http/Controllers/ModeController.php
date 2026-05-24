<?php

namespace App\Http\Controllers;

use App\Models\Mode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ModeController extends Controller
{
    public function index()
    {
        return response()->json(Mode::where('actif', 1)->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'libelle'     => 'required|string|max:100',
            'information' => 'nullable|string',
            'idFondateur' => 'required|integer',
        ]);

        $id = DB::table('Mode')->max('idMode') + 1;

        $mode = Mode::create([
            'idMode'      => $id,
            'libelle'     => $request->libelle,
            'information' => $request->information ?? '',
            'actif'       => 1,
            'idFondateur' => $request->idFondateur,
        ]);

        return response()->json(['message' => 'Mode créé', 'mode' => $mode], 201);
    }

    public function update(Request $request, $id)
    {
        $mode = Mode::findOrFail($id);
        $mode->update($request->only(['libelle', 'information', 'actif']));
        return response()->json(['message' => 'Mode mis à jour', 'mode' => $mode]);
    }

    public function destroy($id)
    {
        $mode = Mode::findOrFail($id);
        if ($mode->paiements()->count() > 0) {
            return response()->json([
                'message' => 'Des paiements sont liés à ce mode'
            ], 422);
        }
        $mode->delete();
        return response()->json(['message' => 'Mode supprimé']);
    }
}