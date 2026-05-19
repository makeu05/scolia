<?php

namespace App\Http\Controllers;

use App\Models\Parents;
use App\Models\Personne;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

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
        $data = $request->validate([
            'idPers'        => 'nullable|integer|exists:Personne,idPers',
            'nom'           => 'required_without:idPers|string|max:255',
            'prenom'        => 'required_without:idPers|string|max:255',
            'dateNaissance' => 'nullable|date',
            'lieuNaissance' => 'nullable|string|max:100',
            'mobile'        => 'nullable|string|max:15',
            'phone'         => 'nullable|string|max:15',
            'typePersonne'  => 'nullable|integer',
            'idAdmin'       => 'required|integer',
        ]);

        // Si idPers fourni → lier une personne existante
        // Sinon → créer une nouvelle personne
        if (!empty($data['idPers'])) {
            $idPers = $data['idPers'];
        } else {
            $personne = Personne::create([
                'idPers'        => Personne::max('idPers') + 1,
                'nom'           => $data['nom'],
                'prenom'        => $data['prenom'],
                'dateNaissance' => $data['dateNaissance'] ?? now()->toDateString(),
                'lieuNaissance' => $data['lieuNaissance'] ?? 'INDEFINI',
                'mobile'        => $data['mobile'] ?? '000',
                'phone'         => $data['phone'] ?? '000',
                'typePersonne'  => $data['typePersonne'] ?? 4, // 4 = Parents
                'username'      => strtolower($data['nom'] . '.' . $data['prenom']),
                'password'      => Hash::make('password'),
                'idAdmin'       => $data['idAdmin'],
            ]);
            $idPers = $personne->idPers;
        }

        // Vérifier si le lien parent-élève existe déjà
        $existe = Parents::where('idPers', $idPers)
                         ->where('matricule', $matricule)
                         ->exists();

        if ($existe) {
            return response()->json([
                'message' => 'Ce parent est déjà lié à cet élève'
            ], 409);
        }

        $parent = Parents::create([
            'idParent' => Parents::max('idParent') + 1,
            'idPers'   => $idPers,
            'matricule' => $matricule,
            'idAdmin'  => $data['idAdmin'],
        ]);

        return response()->json([
            'message' => 'Parent ajouté avec succès',
            'parent'  => $parent->load('personne'),
        ], 201);
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
}