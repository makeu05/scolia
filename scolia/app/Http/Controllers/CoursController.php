<?php

namespace App\Http\Controllers;

use App\Models\Cours;
use Illuminate\Http\Request;

class CoursController extends Controller
{
    public function index(Request $request)
    {
        $query = Cours::with(['classe', 'enseignant.personne']);

        if ($request->filled('idClasse')) {
            $query->where('idClasse', $request->idClasse);
        }
        if ($request->filled('actif')) {
            $query->where('actif', $request->actif);
        }
        if ($request->filled('search')) {
            $query->where('libelle', 'like', '%' . $request->search . '%');
        }

        if ($request->get('paginate') === 'false') {
            return response()->json($query->get());
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'libelle'      => 'required|string|max:255',
            'note'         => 'nullable|numeric|min:0',
            'coefficient'  => 'nullable|numeric|min:0',
            'description'  => 'nullable|string',
            'idClasse'     => 'required|integer|exists:classe,idClasse',   // ← corrige le nom de table si besoin
            'idAdmin'      => 'required|integer',
            'idLivre'      => 'nullable|integer',
        ]);

        $data['actif'] = 1;
        $data['idLivre'] = $data['idLivre'] ?? 1;

        // Important : on ne passe pas 'idCours' dans $data
        $cours = Cours::create($data);

        return response()->json([
            'message' => 'Cours créé avec succès',
            'cours'   => $cours,
        ], 201);
    }

    public function show($idCours)
    {
        $cours = Cours::with(['classe', 'enseignant.personne'])
                      ->findOrFail($idCours);
        return response()->json($cours);
    }

    public function update(Request $request, $idCours)
    {
        $cours = Cours::findOrFail($idCours);

        $request->validate([
            'libelle'     => 'sometimes|string|max:255',
            'coefficient' => 'sometimes|numeric|min:0',
            'description' => 'nullable|string',
            'actif'       => 'sometimes|boolean',
            'idClasse'    => 'sometimes|integer|exists:Classe,idClasse',
        ]);

        $cours->update($request->only([
            'libelle', 'coefficient', 'description', 'actif', 'idClasse'
        ]));

        return response()->json([
            'message' => 'Cours mis à jour',
            'cours'   => $cours->fresh(),
        ]);
    }

    public function destroy($idCours)
    {
        $cours = Cours::findOrFail($idCours);
        $cours->delete();

        return response()->json(['message' => 'Cours supprimé avec succès']);
    }
}