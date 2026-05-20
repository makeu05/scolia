<?php

namespace App\Http\Controllers;

use App\Models\Classe;
use Illuminate\Http\Request;

class ClasseController extends Controller
{
    public function index(Request $request)
    {
       $query = Classe::with('cycle')->withCount('cours');

        if ($request->filled('idCycle')) {
            $query->where('idCycle', $request->idCycle);
        }

        if ($request->filled('search')) {
            $query->where('libelle', 'like', '%' . $request->search . '%');
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'libelle' => 'required|string|max:100',
            'idCycle' => 'required|integer|exists:Cycle,idCycle',
            'idAdmin' => 'required|integer',
        ]);

        $data['idClasse'] = (Classe::max('idClasse') ?? 0) + 1;
        $classe = Classe::create($data);

        return response()->json([
            'message' => 'Classe créée',
            'classe'  => $classe->load('cycle'),
        ], 201);
    }

    public function show($idClasse)
    {
        $classe = Classe::with('cycle')->findOrFail($idClasse);
        return response()->json($classe);
    }

    public function update(Request $request, $idClasse)
    {
        $classe = Classe::findOrFail($idClasse);

        $request->validate([
            'libelle' => 'sometimes|string|max:100',
            'idCycle' => 'sometimes|integer|exists:Cycle,idCycle',
        ]);

        $classe->update($request->only(['libelle', 'idCycle']));

        return response()->json([
            'message' => 'Classe mise à jour',
            'classe'  => $classe->load('cycle'),
        ]);
    }

    public function destroy($idClasse)
    {
        $classe = Classe::findOrFail($idClasse);
        $classe->delete();
        return response()->json(['message' => 'Classe supprimée']);
    }
}