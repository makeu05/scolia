<?php

namespace App\Http\Controllers;

use App\Models\Rapport;
use App\Models\Discipline;
use App\Models\Justificatifs;
use Illuminate\Http\Request;

class DisciplineController extends Controller
{
    // ── GET /api/discipline/types ─────────────────────────────
    public function types()
    {
        return response()->json(Discipline::orderBy('points', 'desc')->get());
    }

    // ── GET /api/discipline ───────────────────────────────────
    public function index(Request $request)
    {
        $query = Rapport::with(['eleve', 'personne', 'justificatifs']);

        if ($request->filled('matricule')) {
            $query->where('matricule', $request->matricule);
        }
        if ($request->filled('idAca')) {
            $query->where('idAca', $request->idAca);
        }

        return response()->json(
            $query->orderBy('event_date', 'desc')->get()
        );
    }

    // ── POST /api/discipline ──────────────────────────────────
    public function store(Request $request)
    {
        $data = $request->validate([
            'idRap'       => 'required|integer',
            'libelle'     => 'required|string|max:100',
            'points'      => 'required|integer|min:0',
            'matricule'   => 'required|integer|exists:eleve,matricule',
            'idAca'       => 'required|integer|exists:anneeacademique,idAnnee',
            'commentaire' => 'required|string',
            'event_date'  => 'required|date',
            'idPers'      => 'required|integer|exists:personne,idPers',
        ]);

        $rapport = Rapport::create($data);

        return response()->json([
            'message' => 'Incident disciplinaire enregistré. En attente de validation.',
            'rapport' => $rapport->load(['eleve', 'personne']),
        ], 201);
    }

    // ── GET /api/discipline/{id} ──────────────────────────────
    public function show($id)
    {
        return response()->json(
            Rapport::with(['eleve', 'personne', 'justificatifs'])->findOrFail($id)
        );
    }

    // ── PUT /api/discipline/{id} ──────────────────────────────
    public function update(Request $request, $id)
    {
        $rapport = Rapport::findOrFail($id);

        if ($rapport->justificatifs()->whereNotNull('idDirecteur')->exists()) {
            return response()->json([
                'message' => 'Rapport déjà validé, modification impossible.',
            ], 403);
        }

        $request->validate([
            'libelle'     => 'sometimes|string|max:100',
            'points'      => 'sometimes|integer|min:0',
            'commentaire' => 'sometimes|string',
            'event_date'  => 'sometimes|date',
        ]);

        $rapport->update($request->only(['libelle', 'points', 'commentaire', 'event_date']));

        return response()->json([
            'message' => 'Rapport modifié.',
            'rapport' => $rapport->fresh(),
        ]);
    }

    // ── POST /api/discipline/{id}/valider ─────────────────────
    public function valider(Request $request, $id)
    {
        $rapport = Rapport::findOrFail($id);

        $data = $request->validate([
            'ID'          => 'required|integer',
            'idDirecteur' => 'required|integer',
            'commentaire' => 'required|string',
            'urlDoc'      => 'nullable|string',
        ]);

        $just = Justificatifs::create([
            'ID'          => $data['ID'],
            'idRapport'   => $rapport->idRap,
            'commentaire' => $data['commentaire'],
            'idDirecteur' => $data['idDirecteur'],
            'urlDoc'      => $data['urlDoc'] ?? null,
        ]);

        return response()->json([
            'message'       => 'Rapport validé par le directeur.',
            'justificatif'  => $just,
        ]);
    }

    // ── GET /api/discipline/cumul/{matricule} ─────────────────
    public function cumulPoints($matricule)
    {
        $rapports = Rapport::where('matricule', $matricule)->get();

        return response()->json([
            'matricule'     => $matricule,
            'totalPoints'   => $rapports->sum('points'),
            'nbreIncidents' => $rapports->count(),
            'rapports'      => $rapports,
        ]);
    }

    // ── DELETE /api/discipline/{id} ───────────────────────────
    public function destroy($id)
    {
        $rapport = Rapport::findOrFail($id);
        $rapport->justificatifs()->delete();
        $rapport->delete();

        return response()->json(['message' => 'Rapport supprimé.']);
    }
}
