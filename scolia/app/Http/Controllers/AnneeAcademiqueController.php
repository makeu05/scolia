<?php

namespace App\Http\Controllers;

use App\Models\AnneeAcademique;
use Illuminate\Http\Request;

class AnneeAcademiqueController extends Controller
{
    public function index()
    {
        $annees = AnneeAcademique::with('trimestres')
                                 ->orderBy('idAnnee', 'desc')
                                 ->get();
        return response()->json($annees);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'libelle' => 'required|string|max:200',
            'periode' => 'required|string|max:255',
            'idAdmin' => 'required|integer',
        ]);

        $data['idAnnee']     = (AnneeAcademique::max('idAnnee') ?? 0) + 1;
        $data['created_at']  = now()->toDateString();

        $annee = AnneeAcademique::create($data);

        return response()->json([
            'message' => 'Année académique créée',
            'annee'   => $annee,
        ], 201);
    }

    public function show($idAnnee)
    {
        $annee = AnneeAcademique::with('trimestres')->findOrFail($idAnnee);
        return response()->json($annee);
    }

    public function update(Request $request, $idAnnee)
    {
        $annee = AnneeAcademique::findOrFail($idAnnee);

        $request->validate([
            'libelle' => 'sometimes|string|max:200',
            'periode' => 'sometimes|string|max:255',
        ]);

        $annee->update($request->only(['libelle', 'periode']));

        return response()->json([
            'message' => 'Année académique mise à jour',
            'annee'   => $annee,
        ]);
    }

    public function destroy($idAnnee)
    {
        $annee = AnneeAcademique::findOrFail($idAnnee);

        if ($annee->trimestres()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer : des trimestres sont liés'
            ], 422);
        }

        $annee->delete();
        return response()->json(['message' => 'Année académique supprimée']);
    }
}