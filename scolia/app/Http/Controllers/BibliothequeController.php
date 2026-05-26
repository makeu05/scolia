<?php

namespace App\Http\Controllers;

use App\Models\Livres;
use App\Models\Specialite;
use Illuminate\Http\Request;

class BibliothequeController extends Controller
{
    // ── GET /api/bibliotheque ─────────────────────────────────
    public function index(Request $request)
    {
        $query = Livres::with('specialite');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('titre',    'like', "%$s%")
                  ->orWhere('auteurs', 'like', "%$s%");
            });
        }

        if ($request->filled('idSpecialite')) {
            $query->where('idSpecialite', $request->idSpecialite);
        }

        if ($request->get('paginate') === 'false') {
            return response()->json($query->orderBy('titre')->get());
        }

        return response()->json($query->orderBy('titre')->paginate(15));
    }

    // ── POST /api/bibliotheque ────────────────────────────────
    public function store(Request $request)
    {
        $data = $request->validate([
            'titre'          => 'required|string|max:255',
            'auteurs'        => 'required|string|max:255',
            'prix'           => 'required|numeric|min:0',
            'idSpecialite'   => 'required|integer|exists:specialite,idSpecialite',
            'edition'        => 'nullable|string|max:255',
            'annee_parution' => 'nullable|date',
            'idAdmin'        => 'required|integer',
        ]);

        // ✅ ID généré côté backend — évite le dépassement INT depuis JS
        $data['idLivre'] = (Livres::max('idLivre') ?? 0) + 1;
        $data['edition'] = $data['edition'] ?? 'INDEFINI';

        $livre = Livres::create($data);

        return response()->json([
            'message' => 'Livre ajouté avec succès.',
            'livre'   => $livre->load('specialite'),
        ], 201);
    }

    // ── GET /api/bibliotheque/{id} ────────────────────────────
    public function show($id)
    {
        return response()->json(
            Livres::with('specialite')->findOrFail($id)
        );
    }

    // ── PUT /api/bibliotheque/{id} ────────────────────────────
    public function update(Request $request, $id)
    {
        $livre = Livres::findOrFail($id);

        $request->validate([
            'titre'          => 'sometimes|string|max:255',
            'auteurs'        => 'sometimes|string|max:255',
            'prix'           => 'sometimes|numeric|min:0',
            'idSpecialite'   => 'sometimes|integer|exists:specialite,idSpecialite',
            'edition'        => 'nullable|string|max:255',
            'annee_parution' => 'nullable|date',
        ]);

        $livre->update($request->only([
            'titre', 'auteurs', 'prix',
            'idSpecialite', 'edition', 'annee_parution',
        ]));

        return response()->json([
            'message' => 'Livre mis à jour.',
            'livre'   => $livre->fresh()->load('specialite'),
        ]);
    }

    // ── DELETE /api/bibliotheque/{id} ─────────────────────────
    public function destroy($id)
    {
        Livres::findOrFail($id)->delete();
        return response()->json(['message' => 'Livre supprimé avec succès.']);
    }

    // ── GET /api/specialites ──────────────────────────────────
    public function specialites()
    {
        return response()->json(Specialite::orderBy('libelle')->get());
    }
}
