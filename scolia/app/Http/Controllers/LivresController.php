<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Livres;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LivresController extends Controller
{
    /**
     * GET /api/livres
     */
    public function index(): JsonResponse
    {
        $livres = Livres::with('specialite')->get();

        return response()->json([
            'success' => true,
            'data' => $livres
        ]);
    }

    /**
     * POST /api/livres
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'idLivre'         => 'required|integer|unique:Livres,idLivre',
            'titre'           => 'required|string|max:255',
            'auteurs'         => 'required|string|max:255',
            'prix'            => 'required|numeric',
            'idSpecialite'    => 'required|integer|exists:Specialite,idSpecialite',
            'edition'         => 'required|string|max:255',
            'annee_parution'  => 'required|date',
            'idAdmin'         => 'required|integer'
        ]);

        $livre = Livres::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Livre ajouté avec succès.',
            'data' => $livre->load('specialite')
        ], 201);
    }

    /**
     * GET /api/livres/{id}
     */
    public function show(int $id): JsonResponse
    {
        $livre = Livres::with('specialite')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $livre
        ]);
    }

    /**
     * PUT /api/livres/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $livre = Livres::findOrFail($id);

        $validated = $request->validate([
            'titre'           => 'sometimes|string|max:255',
            'auteurs'         => 'sometimes|string|max:255',
            'prix'            => 'sometimes|numeric',
            'idSpecialite'    => 'sometimes|integer|exists:Specialite,idSpecialite',
            'edition'         => 'sometimes|string|max:255',
            'annee_parution'  => 'sometimes|date',
            'idAdmin'         => 'sometimes|integer'
        ]);

        $livre->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Livre modifié avec succès.',
            'data' => $livre->load('specialite')
        ]);
    }

    /**
     * DELETE /api/livres/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $livre = Livres::findOrFail($id);

        $livre->delete();

        return response()->json([
            'success' => true,
            'message' => 'Livre supprimé avec succès.'
        ]);
    }
}