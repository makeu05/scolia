<?php

namespace App\Http\Controllers;

use App\Models\Titulaire;
use App\Models\Salle;
use App\Models\Personne;
use Illuminate\Http\Request;

class TitulaireController extends Controller
{
    /**
     * Liste tous les titulaires (avec salle + personne).
     * Filtrable par ?idSalle=X ou ?actif=1
     */
    public function index(Request $request)
    {
        $query = Titulaire::with(['salle.classe', 'personne']);

        if ($request->filled('idSalle')) {
            $query->where('idSalle', $request->idSalle);
        }

        if ($request->filled('actif')) {
            $query->where('actif', $request->actif);
        }

        return response()->json($query->get());
    }

    /**
     * Récupère le titulaire actif d'une salle.
     */
    public function parSalle($idSalle)
    {
        $titulaire = Titulaire::with(['personne', 'salle.classe'])
            ->where('idSalle', $idSalle)
            ->where('actif', 1)
            ->first();

        if (!$titulaire) {
            return response()->json(['message' => 'Aucun titulaire pour cette salle'], 404);
        }

        return response()->json($titulaire);
    }

    /**
     * Affecte un titulaire à une salle.
     * Désactive l'ancien titulaire de la salle s'il existe.
     */
    public function affecter(Request $request)
    {
        $request->validate([
            'idSalle' => 'required|integer|exists:salle,idSalle',
            'idPers'  => 'required|integer|exists:personne,idPers',
            'idAdmin' => 'required|integer',
        ]);

        // Vérifier que la personne est bien un enseignant (typePersonne = 1)
        $personne = Personne::findOrFail($request->idPers);
        if ($personne->typePersonne !== 1) {
            return response()->json([
                'message' => 'Seul un enseignant peut être titulaire d\'une salle',
            ], 422);
        }

        // Vérifier que cet enseignant n'est pas déjà titulaire d'une autre salle
        $dejaAffecte = Titulaire::where('idPers', $request->idPers)
            ->where('actif', 1)
            ->where('idSalle', '!=', $request->idSalle)
            ->exists();

        if ($dejaAffecte) {
            return response()->json([
                'message' => 'Cet enseignant est déjà titulaire d\'une autre salle',
            ], 422);
        }

        // Désaffecter l'ancien titulaire actif de cette salle
        Titulaire::where('idSalle', $request->idSalle)
            ->where('actif', 1)
            ->update(['actif' => 0]);

        // Créer ou réactiver
        $existing = Titulaire::where('idSalle', $request->idSalle)
            ->where('idPers', $request->idPers)
            ->first();

        if ($existing) {
            $existing->update(['actif' => 1]);
            $titulaire = $existing->fresh()->load(['personne', 'salle.classe']);
        } else {
            $titulaire = Titulaire::create([
                'idSalle' => $request->idSalle,
                'idPers'  => $request->idPers,
                'actif'   => 1,
                'idAdmin' => $request->idAdmin,
            ]);
            $titulaire->load(['personne', 'salle.classe']);
        }

        return response()->json([
            'message'   => 'Titulaire affecté avec succès',
            'titulaire' => $titulaire,
        ], 201);
    }

    /**
     * Désaffecte le titulaire d'une salle.
     */
    public function desaffecter($idSalle)
    {
        $updated = Titulaire::where('idSalle', $idSalle)
            ->where('actif', 1)
            ->update(['actif' => 0]);

        if (!$updated) {
            return response()->json(['message' => 'Aucun titulaire actif à désaffecter'], 404);
        }

        return response()->json(['message' => 'Titulaire désaffecté avec succès']);
    }

    /**
     * Enseignants disponibles pour être titulaire
     * (actifs, pas déjà titulaires d'une autre salle,
     *  ou déjà titulaire de CETTE salle pour le montrer présélectionné).
     */
    public function enseignantsDisponibles($idSalle)
    {
        $enseignants = Personne::where('typePersonne', 1)
            ->get()
            ->filter(function ($p) use ($idSalle) {
                // Accepter si pas titulaire actif ailleurs
                $titulaireActif = Titulaire::where('idPers', $p->idPers)
                    ->where('actif', 1)
                    ->first();

                // Disponible si pas titulaire, ou si titulaire de cette salle
                return !$titulaireActif || $titulaireActif->idSalle == $idSalle;
            })
            ->map(function ($p) use ($idSalle) {
                $titulaireIci = Titulaire::where('idPers', $p->idPers)
                    ->where('idSalle', $idSalle)
                    ->where('actif', 1)
                    ->exists();

                return [
                    'idPers'    => $p->idPers,
                    'nom'       => $p->nom,
                    'prenom'    => $p->prenom,
                    'mobile'    => $p->mobile,
                    'titulaire' => $titulaireIci,
                ];
            })
            ->values();

        return response()->json($enseignants);
    }

    /**
     * Historique des titulaires d'une salle (actifs + inactifs).
     */
    public function historique($idSalle)
    {
        $historique = Titulaire::with('personne')
            ->where('idSalle', $idSalle)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($historique);
    }
}