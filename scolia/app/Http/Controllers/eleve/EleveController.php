<?php

namespace App\Http\Controllers\Eleve;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

use App\Models\Eleve;
use App\Models\Personne;
use App\Models\Ville;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EleveController extends Controller
{
    // ─── Liste avec filtres + pagination ─────────────────────
    public function index(Request $request)
    {
        $query = Eleve::with('villeNaissance');

        // Filtre par classe
        if ($request->filled('idClasse')) {
            $query->whereHas('frequente', function ($q) use ($request) {
                $q->whereHas('salle', function ($q2) use ($request) {
                    $q2->where('idClasse', $request->idClasse);
                });
            });
        }

        // Filtre par cycle
        if ($request->filled('idCycle')) {
            $query->whereHas('frequente', function ($q) use ($request) {
                $q->whereHas('salle.classe', function ($q2) use ($request) {
                    $q2->where('idCycle', $request->idCycle);
                });
            });
        }

        // Filtre par statut actif/inactif
        if ($request->filled('actif')) {
            $query->where('actif', $request->actif);
        }

        // Recherche par nom ou prénom
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('nom', 'like', '%' . $request->search . '%')
                  ->orWhere('prenom', 'like', '%' . $request->search . '%');
            });
        }

        $eleves = $query->paginate(15);

        return response()->json($eleves);
    }

    // ─── Créer un élève ──────────────────────────────────────
    public function store(Request $request)
{
    $data = $request->validate([
        'nom'              => 'required|string|max:60',
        'prenom'           => 'required|string|max:60',
        'dateNaissance'    => 'required|date',
        'lieuNaissance'    => 'required|string|max:30',
        'sexe'             => 'required|integer|in:0,1,2',
        'langue'           => 'nullable|string|max:30',
        'idVilleNaissance' => 'required|integer',
        'idAdmin'          => 'required|integer',
        'photo'            => 'nullable|image|max:2048',
    ]);

    // Générer le matricule automatiquement : AAAA + séquence 4 chiffres
    $annee      = date('Y');
    $dernierMat = DB::table('Eleve')
        ->where('matricule', 'like', $annee . '%')
        ->max('matricule');

    $sequence  = $dernierMat ? intval(substr((string)$dernierMat, 4)) + 1 : 1;
    $matricule = intval($annee . str_pad($sequence, 4, '0', STR_PAD_LEFT));

    // Upload photo
    if ($request->hasFile('photo')) {
        $path             = $request->file('photo')->store('photos/eleves', 'public');
        $data['photoURL'] = $path;
    } else {
        $data['photoURL'] = 'INDEFINI';
    }

    $data['matricule'] = $matricule;
    $data['actif']     = 1;
    $data['nom']       = strtoupper($data['nom']);

    $eleve = Eleve::create($data);

    
    NotificationService::eleve(
    "Nouvel élève ajouté : {$eleve->prenom} {$eleve->nom} (#{$eleve->matricule})",
    '/eleves/' . $eleve->matricule
);
    return response()->json([
        'message' => 'Élève créé avec succès',
        'eleve'   => $eleve,
    ], 201);

}
    // ─── Détail d'un élève ───────────────────────────────────
    public function show($matricule)
    {
        $eleve = Eleve::with(['villeNaissance', 'parents.personne'])
                      ->findOrFail($matricule);

        return response()->json($eleve);
    }

    // ─── Modifier un élève ───────────────────────────────────
    public function update(Request $request, $matricule)
    {
        $eleve = Eleve::findOrFail($matricule);

        $data = $request->validate([
            'nom'             => 'sometimes|string|max:60',
            'prenom'          => 'sometimes|string|max:60',
            'dateNaissance'   => 'sometimes|date',
            'lieuNaissance'   => 'sometimes|string|max:30',
            'sexe'            => 'sometimes|integer|in:0,1,2',
            'langue'          => 'nullable|string|max:30',
            'idVilleNaissance' => 'sometimes|integer',
            'photo'           => 'nullable|image|max:2048',
        ]);

        // Upload nouvelle photo
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('photos/eleves', 'public');
            $data['photoURL'] = $path;
        }

        $eleve->update($data);

        return response()->json([
            'message' => 'Élève mis à jour',
            'eleve'   => $eleve,
        ]);
    }

    // ─── Archiver un élève (soft delete) ─────────────────────
    public function archiver($matricule)
    {
        $eleve = Eleve::findOrFail($matricule);
        $eleve->update(['actif' => 0]);

        return response()->json([
            'message' => 'Élève archivé avec succès',
        ]);
    }

    // ─── Réactiver un élève ──────────────────────────────────
    public function reactiver($matricule)
    {
        $eleve = Eleve::findOrFail($matricule);
        $eleve->update(['actif' => 1]);

        return response()->json([
            'message' => 'Élève réactivé avec succès',
        ]);
    }

    public function destroy($matricule)
    {
        $eleve = Eleve::findOrFail($matricule);
        $eleve->delete();

        return response()->json([
            'message' => 'Élève supprimé avec succès',
        ]);
    }
}