<?php

namespace App\Http\Controllers;

use App\Models\Epreuve;
use App\Models\NatureEpreuve;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EpreuveController extends Controller
{
    // ─── INDEX ────────────────────────────────────────────────
    public function index(Request $request)
    {
        $query = Epreuve::with('nature');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('libelle', 'like', "%{$search}%")
                  ->orWhere('auteur', 'like', "%{$search}%");
            });
        }

        if ($request->filled('idPers')) {
            $query->where('idPers', $request->idPers);
        }

        if ($request->filled('idNature')) {
            $query->where('idNature', $request->idNature);
        }

        $epreuves = $query->latest('idEpreuve')->paginate(15);

        return response()->json($epreuves);
    }

    // ─── STORE ────────────────────────────────────────────────
    // ─── STORE ────────────────────────────────────────────────
public function store(Request $request)
{
    $validator = Validator::make($request->all(), [
        'libelle'   => 'required|string|max:255',
        'idNature'  => 'required|exists:natureepreuve,idNature',
        'idPers'    => 'required|integer|exists:Personne,idPers', // ✅ integer au lieu de numeric
        'auteur'    => 'nullable|string|max:100',
        'document'  => 'nullable|file|mimes:pdf|max:12288',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Données de formulaire invalides',
            'errors'  => $validator->errors()
        ], 422);
    }

    $urlDoc = 'INDEFINI';

    if ($request->hasFile('document') && $request->file('document')->isValid()) {
        try {
            if (!Storage::disk('public')->exists('epreuves')) {
                Storage::disk('public')->makeDirectory('epreuves');
            }
            $path = $request->file('document')->store('epreuves', 'public');
            $urlDoc = Storage::url($path);
        } catch (\Exception $e) {
            Log::error("Upload PDF échoué : " . $e->getMessage());
            // On continue sans fichier plutôt que de bloquer
        }
    }

    $epreuve = Epreuve::create([
        'libelle'  => $request->libelle,
        'urlDoc'   => $urlDoc,
        'auteur'   => $request->auteur ?? 'INDEFINI',
        'idNature' => $request->idNature,
        'idPers'   => (int) $request->idPers, // ✅ cast explicite
    ]);

    return response()->json([
        'message' => 'Épreuve créée avec succès',
        'epreuve' => $epreuve->load('nature')
    ], 201);
}

    // ─── SHOW ─────────────────────────────────────────────────
    public function show($id)
    {
        $epreuve = Epreuve::with(['nature', 'evaluations.eleve'])->findOrFail($id);
        return response()->json($epreuve);
    }

    // ─── UPDATE ───────────────────────────────────────────────
    public function update(Request $request, $id)
    {
        $epreuve = Epreuve::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'libelle'  => 'sometimes|string|max:255',
            'idNature' => 'sometimes|exists:natureepreuve,idNature',
            'auteur'   => 'nullable|string|max:100',
            'document' => 'nullable|file|mimes:pdf|max:12288',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Modification invalide',
                'errors'  => $validator->errors()
            ], 422);
        }

        if ($request->hasFile('document')) {
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

    // ─── DESTROY ──────────────────────────────────────────────
    public function destroy($id)
    {
        $epreuve = Epreuve::findOrFail($id);

        if ($epreuve->evaluations()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer : des évaluations sont liées à cette épreuve.'
            ], 422);
        }

        if ($epreuve->urlDoc && $epreuve->urlDoc !== 'INDEFINI') {
            $oldPath = str_replace('/storage/', '', $epreuve->urlDoc);
            Storage::disk('public')->delete($oldPath);
        }

        $epreuve->delete();

        return response()->json(['message' => 'Épreuve supprimée avec succès']);
    }
}