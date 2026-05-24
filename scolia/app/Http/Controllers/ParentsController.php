<?php

namespace App\Http\Controllers;

use App\Models\Parents;
use App\Models\Personne;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class ParentsController extends Controller
{
    // ─── Liste des parents d'un élève ────────────────────────
    public function index($matricule)
    {
        $parents = Parents::with('personne')
                          ->where('matricule', $matricule)
                          ->get();

        return response()->json($parents);
    }

    // ─── Ajouter un parent à un élève ────────────────────────
    public function store(Request $request, $matricule)
{
    $request->validate([
        'existant'    => 'required|boolean',
        'idAdmin'     => 'required|integer',
        // Si existant
        'idPers'      => 'required_if:existant,true|integer|exists:Personne,idPers',
        // Si nouveau
        'nom'         => 'required_if:existant,false|string|max:100',
        'prenom'      => 'required_if:existant,false|string|max:100',
        'mobile'      => 'required_if:existant,false|string|max:15',
        'phone'       => 'nullable|string|max:15',
        'typePersonne'=> 'required_if:existant,false|integer|in:4,5',
    ]);

    DB::beginTransaction();
    try {
        $idPers = null;

        if ($request->existant) {
            // Lier une personne existante
            $idPers = $request->idPers;

            // Vérifier que ce parent n'est pas déjà lié
            $deja = \App\Models\Parents::where('matricule', $matricule)
                ->where('idPers', $idPers)
                ->exists();

            if ($deja) {
                return response()->json([
                    'message' => 'Cette personne est déjà liée à cet élève'
                ], 422);
            }

        } else {
            // Créer une nouvelle Personne
            $idPers = DB::table('Personne')->max('idPers') + 1;

            Personne::create([
                'idPers'       => $idPers,
                'nom'          => strtoupper($request->nom),
                'prenom'       => $request->prenom,
                'dateNaissance'=> '2000-01-01',
                'lieuNaissance'=> 'INDEFINI',
                'mobile'       => $request->mobile,
                'phone'        => $request->phone ?? '000',
                'typePersonne' => $request->typePersonne,
                'username'     => strtolower($request->prenom . '.' . $request->nom . $idPers),
                'password'     => Hash::make('parent1234'),
                'idAdmin'      => $request->idAdmin,
            ]);
        }

        // Créer le lien Parent
        $idParent = DB::table('Parents')->max('idParent') + 1;

        $parent = \App\Models\Parents::create([
            'idParent'  => $idParent,
            'idPers'    => $idPers,
            'matricule' => $matricule,
        ]);

        DB::commit();

        return response()->json([
            'message' => 'Parent ajouté avec succès',
            'parent'  => $parent->load('personne'),
        ], 201);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json(['message' => 'Erreur : ' . $e->getMessage()], 500);
    }
}

    // ─── Supprimer le lien parent-élève ──────────────────────
    public function destroy($matricule, $idParent)
    {
        $parent = Parents::where('idParent', $idParent)
                         ->where('matricule', $matricule)
                         ->firstOrFail();

        $parent->delete();

        return response()->json([
            'message' => 'Parent retiré avec succès',
        ]);
    }
    public function mesEnfants(Request $request)
    {
        $user = $request->user();

        // Récupérer l'idPers depuis le token
        // Le user connecté est une Personne avec typePersonne=4
        $idPers = $user->idPers;

        $enfants = DB::table('Parents')
            ->join('Eleve', 'Parents.matricule', '=', 'Eleve.matricule')
            ->where('Parents.idPers', $idPers)
            ->select(
                'Eleve.matricule',
                'Eleve.nom',
                'Eleve.prenom',
                'Eleve.sexe',
                'Eleve.photoURL',
                'Eleve.actif',
            )
            ->get();

        return response()->json($enfants);
    }
}