<?php

namespace App\Http\Controllers;

use App\Models\Epreuve;
use App\Models\NatureEpreuve;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class EpreuveController extends Controller
{
    public function index(Request $request)
    {
        $query = Epreuve::with('nature');

        if ($request->filled('search')) {
            $query->where('libelle', 'like', '%' . $request->search . '%')
                  ->orWhere('auteur', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('idNature')) {
            $query->where('idNature', $request->idNature);
        }

        $epreuves = $query->latest('idEpreuve')->paginate(15);

        return response()->json($epreuves);
    }

    public function store(Request $request)
    {
        $request->validate([
            'libelle'   => 'required|string|max:255',
            'idNature'  => 'required|exists:natureepreuve,idNature',
            'idPers'    => 'required|integer|exists:personne,idPers',
            'auteur'    => 'nullable|string|max:100',
            'document'  => 'nullable|file|mimes:pdf|max:10240', // 10MB
        ]);

        $urlDoc = 'INDEFINI';

        if ($request->hasFile('document')) {
            $path = $request->file('document')->store('epreuves', 'public');
            $urlDoc = Storage::url($path);
        }

        $epreuve = Epreuve::create([
            'libelle'  => $request->libelle,
            'urlDoc'   => $urlDoc,
            'auteur'   => $request->auteur ?? 'INDEFINI',
            'idNature' => $request->idNature,
            'idPers'   => $request->idPers,
        ]);

        return response()->json([
            'message' => 'Épreuve créée avec succès',
            'epreuve' => $epreuve->load('nature')
        ], 201);
    }

    public function show($id)
    {
        $epreuve = Epreuve::with(['nature', 'evaluations.eleve'])->findOrFail($id);
        return response()->json($epreuve);
    }

    public function update(Request $request, $id)
    {
        $epreuve = Epreuve::findOrFail($id);

        $request->validate([
            'libelle'  => 'sometimes|string|max:255',
            'idNature' => 'sometimes|exists:natureepreuve,idNature',
            'auteur'   => 'nullable|string|max:100',
            'document' => 'nullable|file|mimes:pdf|max:10240',
        ]);

        if ($request->hasFile('document')) {
            // Suppression ancien fichier
            if ($epreuve->urlDoc && $epreuve->urlDoc !== 'INDEFINI') {
                $oldPath = str_replace('/storage/', '', $epreuve->urlDoc);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('document')->store('epreuves', 'public');
            $epreuve->urlDoc = Storage::url($path);
        }

        $epreuve->update($request->only(['libelle', 'idNature', 'auteur']));

        return response()->json([
            'message' => 'Épreuve mise à jour',
            'epreuve' => $epreuve->load('nature')
        ]);
    }

    public function destroy($id)
    {
        $epreuve = Epreuve::findOrFail($id);

        if ($epreuve->evaluations()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer : des évaluations sont liées à cette épreuve.'
            ], 422);
        }

        // Supprimer le fichier
        if ($epreuve->urlDoc && $epreuve->urlDoc !== 'INDEFINI') {
            $oldPath = str_replace('/storage/', '', $epreuve->urlDoc);
            Storage::disk('public')->delete($oldPath);
        }

        $epreuve->delete();

        return response()->json(['message' => 'Épreuve supprimée avec succès']);
    }
}