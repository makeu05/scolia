<?php

namespace App\Http\Controllers;

use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SessionController extends Controller
{
    public function index(Request $request)
    {
        $query = Session::with('trimestre');

        if ($request->filled('idTrimestre')) {
            $query->where('idTrimestre', $request->idTrimestre);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'libelle'     => 'required|string|max:255',
            'idTrimestre' => 'required|integer|exists:Trimestre,idTrimes',
            'idPers'      => 'required|integer',
            'description' => 'nullable|string',
        ]);

        $id = DB::table('Session')->max('idSession') + 1;

        $session = Session::create([
            'idSession'   => $id,
            'libelle'     => $request->libelle,
            'description' => $request->description ?? '',
            'idTrimestre' => $request->idTrimestre,
            'idPers'      => $request->idPers,
        ]);

        return response()->json([
            'message' => 'Session créée',
            'session' => $session->load('trimestre')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $session = Session::findOrFail($id);
        $session->update($request->only(['libelle', 'description', 'idTrimestre']));
        return response()->json(['message' => 'Session mise à jour', 'session' => $session]);
    }

    public function destroy($id)
    {
        $session = Session::findOrFail($id);
        if ($session->evaluations()->count() > 0) {
            return response()->json(['message' => 'Des évaluations sont liées à cette session'], 422);
        }
        $session->delete();
        return response()->json(['message' => 'Session supprimée']);
    }
}