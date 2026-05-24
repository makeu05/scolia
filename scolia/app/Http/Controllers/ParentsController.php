<?php

namespace App\Http\Controllers;

use App\Models\Parents;
use App\Models\Personne;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class ParentsController extends Controller
{
    // Liste des parents d'un élève
    public function index($matricule)
    {
        $parents = Parents::with('personne')
                          ->where('matricule', $matricule)
                          ->get();

        return response()->json($parents);
    }

    // Ajouter un parent à un élève
    public function store(Request $request, $matricule)
    {
        $request->validate([
            'existant'     => 'required|boolean',
            'idAdmin'      => 'required|integer',
            'idPers'       => 'required_if:existant,true|integer',
            'nom'          => 'required_if:existant,false|string|max:100',
            'prenom'       => 'required_if:existant,false|string|max:100',
            'mobile'       => 'required_if:existant,false|string|max:15',
            'typePersonne' => 'required_if:existant,false|integer|in:4',
        ]);

        DB::beginTransaction();
        try {
            $idPers = null;

            if ($request->existant) {
                $idPers = $request->idPers;
            } else {
                // Créer nouvelle personne (parent)
                $idPers = DB::table('Personne')->max('idPers') + 1;

                Personne::create([
                    'idPers'        => $idPers,
                    'nom'           => strtoupper($request->nom),
                    'prenom'        => $request->prenom,
                    'dateNaissance' => '2000-01-01',
                    'lieuNaissance' => 'INDEFINI',
                    'mobile'        => $request->mobile,
                    'phone'         => $request->mobile ?? '000',
                    'typePersonne'  => 4, // Parent
                    'username'      => strtolower($request->prenom . '.' . $request->nom),
                    'password'      => Hash::make('parent1234'),
                    'idAdmin'       => $request->idAdmin,
                ]);
            }

            // Créer le lien
            $idParent = DB::table('Parents')->max('idParent') + 1;

            $parent = Parents::create([
                'idParent'  => $idParent,
                'idPers'    => $idPers,
                'matricule' => $matricule,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Parent ajouté avec succès',
                'parent'  => $parent->load('personne')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur : ' . $e->getMessage()], 500);
        }
    }

    // Récupérer les enfants du parent connecté
  public function mesEnfants(Request $request)
{
    // Le token est sur User — récupérer l'email/username
    $token = $request->bearerToken();
    $pat = \Laravel\Sanctum\PersonalAccessToken::findToken($token);

    if (!$pat) {
        return response()->json(['message' => 'Token invalide'], 401);
    }

    // Récupérer le User depuis le token
    $user = \App\Models\User::find($pat->tokenable_id);

    if (!$user) {
        return response()->json(['message' => 'Utilisateur introuvable'], 401);
    }

    // Extraire le username (email = username@scolia.local)
    $username = str_replace('@scolia.local', '', $user->email);

    // Trouver la Personne par username
    $personne = \App\Models\Personne::where('username', $username)
                                    ->where('typePersonne', 4)
                                    ->first();

    if (!$personne) {
        return response()->json(['message' => 'Compte parent introuvable'], 404);
    }

    $idPers = $personne->idPers;

    $enfants = DB::table('Parents')
        ->join('Eleve', 'Parents.matricule', '=', 'Eleve.matricule')
        ->leftJoin('Frequente', 'Eleve.matricule', '=', 'Frequente.matricule')
        ->leftJoin('Salle', 'Frequente.idSalle', '=', 'Salle.idSalle')
        ->leftJoin('Classe', 'Salle.idClasse', '=', 'Classe.idClasse')
        ->where('Parents.idPers', $idPers)
        ->select(
            'Eleve.matricule', 'Eleve.nom', 'Eleve.prenom',
            'Eleve.sexe', 'Eleve.photoURL', 'Eleve.actif',
            'Classe.libelle as classe'
        )
        ->distinct()
        ->orderBy('Eleve.nom')
        ->get();

    return response()->json([
        'success' => true,
        'total'   => $enfants->count(),
        'data'    => $enfants,
    ]);
}
}