<?php

namespace App\Http\Controllers;

use App\Models\Epreuve;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class EpreuveController extends Controller
{
    public function index(Request $request)
    {
        $query = Epreuve::with(['nature']);

        if ($request->filled('idNature')) {
            $query->where('idNature', $request->idNature);
        }
        if ($request->filled('search')) {
            $query->where('libelle', 'like', '%' . $request->search . '%');
        }

        return response()->json($query->paginate(15));
    }

    public function store(Request $request)
    {
        $request->validate([
            'libelle'  => 'required|string|max:255',
            'idNature' => 'required|integer|exists:NatureEpreuve,idNature',
            'idPers'   => 'required|integer',
            'auteur'   => 'nullable|string|max:255',
            'document' => 'nullable|file|mimes:pdf|max:10240', // 10MB max
        ]);

        $urlDoc = 'INDEFINI';

        if ($request->hasFile('document')) {
            $path   = $request->file('document')->store('epreuves', 'public');
            $urlDoc = Storage::url($path);
        }

        $id = DB::table('Epreuve')->max('idEpreuve') + 1;

        $epreuve = Epreuve::create([
            'idEpreuve' => $id,
            'libelle'   => $request->libelle,
            'urlDoc'    => $urlDoc,
            'auteur'    => $request->auteur ?? 'INDEFINI',
            'idNature'  => $request->idNature,
            'idPers'    => $request->idPers,
        ]);

        return response()->json([
            'message' => 'Épreuve créée',
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
            'auteur'   => 'nullable|string|max:255',
            'idNature' => 'sometimes|integer|exists:NatureEpreuve,idNature',
            'document' => 'nullable|file|mimes:pdf|max:10240',
        ]);

        $data = $request->only(['libelle', 'auteur', 'idNature']);

        if ($request->hasFile('document')) {
            // Supprimer l'ancien fichier si existant
            if ($epreuve->urlDoc && $epreuve->urlDoc !== 'INDEFINI') {
                $oldPath = str_replace('/storage/', '', $epreuve->urlDoc);
                Storage::disk('public')->delete($oldPath);
            }

            $path         = $request->file('document')->store('epreuves', 'public');
            $data['urlDoc'] = Storage::url($path);
        }

        $epreuve->update($data);

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
                'message' => 'Des évaluations sont liées à cette épreuve'
            ], 422);
        }

        // Supprimer le fichier PDF si existant
        if ($epreuve->urlDoc && $epreuve->urlDoc !== 'INDEFINI') {
            $oldPath = str_replace('/storage/', '', $epreuve->urlDoc);
            Storage::disk('public')->delete($oldPath);
        }

        $epreuve->delete();
        return response()->json(['message' => 'Épreuve supprimée']);
    }
}