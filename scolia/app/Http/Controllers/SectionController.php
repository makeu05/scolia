<?php
namespace App\Http\Controllers;

use App\Models\Section;
use Illuminate\Http\Request;

class SectionController extends Controller
{
    public function index()
{
    $sections = Section::withCount(['classes', 'scolarites'])
        ->with(['classes:idClasse,libelle,idSection'])
        ->get();

    return response()->json($sections);
}

    public function store(Request $request)
    {
        $request->validate([
            'libelle'     => 'required|string|max:60|unique:section,libelle',
            'description' => 'nullable|string',
            'idAdmin'     => 'required|integer',
        ]);

        $section = Section::create($request->only(['libelle', 'description', 'idAdmin']));
        return response()->json(['message' => 'Section créée', 'section' => $section], 201);
    }

    public function update(Request $request, $id)
    {
        $section = Section::findOrFail($id);
        $section->update($request->only(['libelle', 'description', 'actif']));
        return response()->json(['message' => 'Section mise à jour', 'section' => $section->fresh()]);
    }

    public function destroy($id)
    {
        Section::findOrFail($id)->delete();
        return response()->json(['message' => 'Section supprimée']);
    }
}