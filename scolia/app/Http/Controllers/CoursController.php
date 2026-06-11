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
            $query->where('Cours.idClasse', $request->idClasse);
        }

        if ($request->filled('search')) {
            $query->where('Cours.libelle', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('idPers')) {
            // Join Enseignant pour filtrer par enseignant connecté
            $query->join('Enseignant', 'Enseignant.idCours', '=', 'Cours.idCours')
                  ->where('Enseignant.idPers', $request->idPers)
                  ->select('Cours.*'); // ✅ évite ambiguïté sur actif, idCours, etc.

            // Filtre actif APRÈS le join, préfixé
            if ($request->filled('actif')) {
                $query->where('Cours.actif', $request->actif);
            }
        } else {
            // Sans join, pas d'ambiguïté
            if ($request->filled('actif')) {
                $query->where('actif', $request->actif);
            }
        }

        // ✅ paginate=false → tout retourner sans limite
        if ($request->get('paginate') === 'false') {
            return response()->json($query->get());
        }

        // ✅ per_page paramétrable, défaut 100
        $perPage = (int) $request->get('per_page', 100);
        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'libelle'     => 'required|string|max:255',
            'note'        => 'nullable|numeric|min:0',
            'coefficient' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'idClasse'    => 'required|integer|exists:Classe,idClasse',
            'idAdmin'     => 'required|integer',
            'idLivre'     => 'nullable|integer',
        ]);

        $data['actif']   = 1;
        $data['idLivre'] = $data['idLivre'] ?? 1;

        $cours = Cours::create($data);

        return response()->json([
            'message' => 'Cours créé avec succès',
            'cours'   => $cours,
        ], 201);
    }

    public function show($idCours)
    {
        $cours = Cours::with(['classe', 'enseignant.personne'])->findOrFail($idCours);
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

    // Affecter un enseignant à un cours
public function affecter(Request $request, $idCours)
{
    $request->validate([
        'idEnseignant' => 'required|integer|exists:Enseignant,idEnseignant',
    ]);

    $cours = Cours::findOrFail($idCours);

    // Vérifier que l'enseignant n'est pas déjà affecté à un autre cours
    // dans la même classe
    $autreAffectation = \App\Models\Enseignant::where('idEnseignant', $request->idEnseignant)
        ->where('idCours', '!=', $idCours)
        ->whereHas('cours', function($q) use ($cours) {
            $q->where('idClasse', $cours->idClasse);
        })
        ->exists();

    if ($autreAffectation) {
        return response()->json([
            'message' => 'Cet enseignant est déjà affecté à un autre cours dans cette classe'
        ], 422);
    }

    // Désaffecter l'ancien enseignant du cours si existant
    \App\Models\Enseignant::where('idCours', $idCours)
        ->update(['idCours' => null]);

    // Affecter le nouvel enseignant
    \App\Models\Enseignant::where('idEnseignant', $request->idEnseignant)
        ->update(['idCours' => $idCours]);

    return response()->json([
        'message' => 'Enseignant affecté avec succès',
        'cours'   => $cours->fresh()->load(['classe', 'enseignant.personne']),
    ]);
}

// Désaffecter l'enseignant d'un cours
public function desaffecter($idCours)
{
    \App\Models\Enseignant::where('idCours', $idCours)
        ->update(['idCours' => null]);

    return response()->json(['message' => 'Enseignant désaffecté']);
}

public function enseignantsDisponibles($idCours)
{
    $cours = Cours::findOrFail($idCours);

    // Enseignants actifs non affectés à un cours de cette classe
    // OU déjà affectés à ce cours spécifique (pour le montrer comme sélectionné)
    $enseignants = \App\Models\Enseignant::with('personne')
        ->where('Actif', 1)
        ->where(function($q) use ($idCours, $cours) {
            $q->whereNull('idCours')
              ->orWhere('idCours', $idCours)
              ->orWhereHas('cours', function($q2) use ($cours) {
                  $q2->where('idClasse', '!=', $cours->idClasse);
              });
        })
        ->get()
        ->map(fn($e) => [
            'idEnseignant' => $e->idEnseignant,
            'nom'          => $e->personne?->nom,
            'prenom'       => $e->personne?->prenom,
            'affecte'      => $e->idCours == $idCours,
        ]);

    return response()->json($enseignants);
}
}