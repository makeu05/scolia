<?php

namespace App\Http\Controllers;

use App\Models\Cours;
use Illuminate\Http\Request;

class CoursController extends Controller
{
    public function index(Request $request)
{
    $query = Cours::with(['classe', 'enseignant.personne']);  // ← ajoute enseignant.personne

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
        'libelle'     => 'required|string|max:255',
        'note'        => 'nullable|numeric|min:0',
        'coefficient' => 'nullable|numeric|min:0',
        'description' => 'nullable|string',
        'idClasse'    => 'required|integer|exists:Classe,idClasse',  // ← ajoute
        'idAdmin'     => 'required|integer',
    ]);

    $data['actif'] = 1;
    $data['idLivre'] = $data['idLivre'] ?? 1;
    $cours = Cours::create($data);

    return response()->json([
        'message' => 'Cours créé',
        'cours'   => $cours,
    ], 201);
}

    public function show($idCours)
    {
        $cours = Cours::findOrFail($idCours);
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
        ]);

        $cours->update($request->only([
            'libelle', 'coefficient', 'description', 'actif'
        ]));

        return response()->json([
            'message' => 'Cours mis à jour',
            'cours'   => $cours,
        ]);
    }

    public function destroy($idCours)
    {
        $cours = Cours::findOrFail($idCours);
        $cours->delete();
        return response()->json(['message' => 'Cours supprimé']);
    }
}