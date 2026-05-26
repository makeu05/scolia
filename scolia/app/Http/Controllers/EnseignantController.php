<?php

namespace App\Http\Controllers;

use App\Models\Enseignant;
use App\Models\Personne;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class EnseignantController extends Controller
{
    // Liste avec filtres + pagination
    // ─── index ───────────────────────────────────────────────
public function index(Request $request)
{
    $query = Enseignant::with(['personne', 'cours.classe'])
    ->join('Personne', 'Enseignant.idPers', '=', 'Personne.idPers')
    ->select('Enseignant.*');

    if ($request->filled('idCours')) {
        $query->where('Enseignant.idCours', $request->idCours);
    }

    if ($request->filled('actif')) {
        $query->where('Enseignant.Actif', $request->actif);
    }

    if ($request->filled('search')) {
        $search = $request->search;
        $query->where(function ($q) use ($search) {
            $q->where('Personne.nom', 'like', "%$search%")
              ->orWhere('Personne.prenom', 'like', "%$search%");
        });
    }

    return response()->json($query->paginate(15));
}

// ─── show ────────────────────────────────────────────────
public function show($idEnseignant)
{
    $enseignant = Enseignant::with([
        'personne',
        'cours.classe',  // ← ajoute .classe
        'fiches'         // ← ajoute fiches
    ])->findOrFail($idEnseignant);

    return response()->json($enseignant);
}

    // Créer personne + enseignant en transaction
    public function store(Request $request)
    {
        $request->validate([
            'idPers'        => 'required|integer|unique:Personne,idPers',
            'nom'           => 'required|string|max:255',
            'prenom'        => 'required|string|max:255',
            'dateNaissance' => 'required|date',
            'lieuNaissance' => 'required|string|max:100',
            'mobile'        => 'required|string|max:15',
            'phone'         => 'nullable|string|max:15',
            'username'      => 'required|string|max:100|unique:Personne,username',
            'password'      => 'required|string|min:6',
            'idCours'       => 'required|integer|exists:Cours,idCours',
            'idAdmin'       => 'required|integer',
        ]);

        DB::beginTransaction();
        try {
            $personne = Personne::create([
                'idPers'        => $request->idPers,
                'nom'           => $request->nom,
                'prenom'        => $request->prenom,
                'dateNaissance' => $request->dateNaissance,
                'lieuNaissance' => $request->lieuNaissance,
                'mobile'        => $request->mobile,
                'phone'         => $request->phone ?? '000',
                'typePersonne'  => 1,
                'username'      => $request->username,
                'password'      => Hash::make($request->password),
                'alanyaID'      => $request->alanyaID ?? null,
                'idAdmin'       => $request->idAdmin,
            ]);

            $idEnseignant = DB::table('Enseignant')->max('idEnseignant') + 1;

            $enseignant = Enseignant::create([
                'idEnseignant' => $idEnseignant,
                'idPers'       => $personne->idPers,
                'idCours'      => $request->idCours,
                'Actif'        => 1,
                'idAdmin'      => $request->idAdmin,
            ]);

            DB::commit();

            return response()->json([
                'message'    => 'Enseignant créé avec succès',
                'enseignant' => $enseignant->load(['personne', 'cours']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur : ' . $e->getMessage()], 500);
        }
    }

  

    // Modifier personne + enseignant
    public function update(Request $request, $idEnseignant)
    {
        $enseignant = Enseignant::findOrFail($idEnseignant);

        $request->validate([
            'nom'           => 'sometimes|string|max:255',
            'prenom'        => 'sometimes|string|max:255',
            'dateNaissance' => 'sometimes|date',
            'lieuNaissance' => 'sometimes|string|max:100',
            'mobile'        => 'sometimes|string|max:15',
            'phone'         => 'nullable|string|max:15',
            'username'      => 'sometimes|string|max:100|unique:Personne,username,' . $enseignant->idPers . ',idPers',
            'idCours'       => 'sometimes|integer|exists:Cours,idCours',
        ]);

        DB::beginTransaction();
        try {
            // Mise à jour Personne
            $personneData = $request->only([
                'nom', 'prenom', 'dateNaissance',
                'lieuNaissance', 'mobile', 'phone', 'username'
            ]);

            if ($request->filled('password')) {
                $personneData['password'] = Hash::make($request->password);
            }

            Personne::where('idPers', $enseignant->idPers)->update($personneData);

            // Mise à jour Enseignant
            if ($request->filled('idCours')) {
                $enseignant->update(['idCours' => $request->idCours]);
            }

            DB::commit();

            return response()->json([
                'message'    => 'Enseignant mis à jour',
                'enseignant' => $enseignant->fresh()->load(['personne', 'cours']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur : ' . $e->getMessage()], 500);
        }
    }

    // Désactiver un enseignant
    public function desactiver($idEnseignant)
    {
        $enseignant = Enseignant::findOrFail($idEnseignant);
        $enseignant->update(['Actif' => 0]);

        return response()->json(['message' => 'Enseignant désactivé']);
    }

    // Réactiver un enseignant
    public function reactiver($idEnseignant)
    {
        $enseignant = Enseignant::findOrFail($idEnseignant);
        $enseignant->update(['Actif' => 1]);

        return response()->json(['message' => 'Enseignant réactivé']);
    }

    public function search(Request $request)
{
    $search = $request->get('search');

    $query = Enseignant::with('personne')
        ->join('Personne', 'Enseignant.idPers', '=', 'Personne.idPers')
        ->select('Enseignant.*');

    if ($search) {
        $query->where(function ($q) use ($search) {
            $q->where('Personne.nom', 'like', "%$search%")
              ->orWhere('Personne.prenom', 'like', "%$search%");
        });
    }

    return response()->json(
        $query->limit(10)->get()
    );
}
}