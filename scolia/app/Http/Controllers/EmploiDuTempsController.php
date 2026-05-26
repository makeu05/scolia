<?php

namespace App\Http\Controllers;

use App\Models\EmploiDuTemps;
use Illuminate\Http\Request;

class EmploiDuTempsController extends Controller
{
    // ── GET /api/emplois-du-temps?idClasse= ───────────────────
    public function index(Request $request)
    {
        $query = EmploiDuTemps::with(['classe', 'cours']);

        if ($request->filled('idClasse')) {
            $query->where('idClasse', $request->idClasse);
        }

        $data = $query
            ->orderByRaw("FIELD(jour,'Lundi','Mardi','Mercredi','Jeudi','Vendredi')")
            ->orderBy('heure')
            ->get();

        return response()->json($data);
    }

    // ── GET /api/emplois-du-temps/classe/{idClasse} ───────────
    public function parClasse($idClasse)
    {
        $data = EmploiDuTemps::with(['cours'])
            ->where('idClasse', $idClasse)
            ->orderByRaw("FIELD(jour,'Lundi','Mardi','Mercredi','Jeudi','Vendredi')")
            ->orderBy('heure')
            ->get();

        return response()->json($data);
    }

    // ── POST /api/emplois-du-temps ────────────────────────────
    public function store(Request $request)
    {
        $data = $request->validate([
            'idTemps'  => 'required|integer|unique:emploidutemps,idTemps',
            'jour'     => 'required|string|in:Lundi,Mardi,Mercredi,Jeudi,Vendredi',
            'heure'    => 'required|string|max:6',
            'idClasse' => 'required|integer|exists:classe,idClasse',
            'idCours'  => 'required|integer|exists:cours,idCours',
            'idAdmin'  => 'required|integer',
        ]);

        // Vérifier conflit de créneau
        $conflit = EmploiDuTemps::where('idClasse', $data['idClasse'])
            ->where('jour',  $data['jour'])
            ->where('heure', $data['heure'])
            ->exists();

        if ($conflit) {
            return response()->json([
                'message' => 'Ce créneau est déjà occupé pour cette classe.',
            ], 422);
        }

        $creneau = EmploiDuTemps::create($data);

        return response()->json([
            'message' => 'Créneau ajouté avec succès',
            'creneau' => $creneau->load(['classe', 'cours']),
        ], 201);
    }

    // ── PUT /api/emplois-du-temps/{id} ────────────────────────
    public function update(Request $request, $id)
    {
        $creneau = EmploiDuTemps::findOrFail($id);

        $request->validate([
            'jour'     => 'sometimes|string|in:Lundi,Mardi,Mercredi,Jeudi,Vendredi',
            'heure'    => 'sometimes|string|max:6',
            'idClasse' => 'sometimes|integer|exists:classe,idClasse',
            'idCours'  => 'sometimes|integer|exists:cours,idCours',
        ]);

        $conflit = EmploiDuTemps::where('idClasse', $request->idClasse ?? $creneau->idClasse)
            ->where('jour',  $request->jour  ?? $creneau->jour)
            ->where('heure', $request->heure ?? $creneau->heure)
            ->where('idTemps', '!=', $id)
            ->exists();

        if ($conflit) {
            return response()->json(['message' => 'Créneau déjà occupé.'], 422);
        }

        $creneau->update($request->only(['jour', 'heure', 'idClasse', 'idCours']));

        return response()->json([
            'message' => 'Créneau modifié',
            'creneau' => $creneau->fresh()->load(['classe', 'cours']),
        ]);
    }

    // ── DELETE /api/emplois-du-temps/{id} ─────────────────────
    public function destroy($id)
    {
        EmploiDuTemps::findOrFail($id)->delete();
        return response()->json(['message' => 'Créneau supprimé avec succès']);
    }
}
