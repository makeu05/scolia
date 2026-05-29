<?php

namespace App\Http\Controllers;

use App\Models\EmploiDuTemps;
use App\Models\Classe;
use App\Models\Cours;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EmploiDuTempsController extends Controller
{
    // Jours de la semaine
    const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    public function index(Request $request)
    {
        $query = EmploiDuTemps::with(['classe.cycle', 'cours.enseignant.personne']);

        if ($request->filled('idClasse')) {
            $query->where('idClasse', $request->idClasse);
        }
        if ($request->filled('jour')) {
            $query->where('jour', $request->jour);
        }

        $emplois = $query->orderByRaw("FIELD(jour, 'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi')")
                         ->orderBy('heure')
                         ->get();

        // Organiser par jour pour affichage grille
        if ($request->get('format') === 'grille') {
            $grille = [];
            foreach (self::JOURS as $jour) {
                $grille[$jour] = $emplois->where('jour', $jour)->values();
            }
            return response()->json($grille);
        }

        return response()->json($emplois);
    }

    public function store(Request $request)
    {
        $request->validate([
            'jour'     => 'required|string|in:Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi',
            'heure'    => 'required|string|max:6',
            'idClasse' => 'required|integer|exists:Classe,idClasse',
            'idCours'  => 'required|integer|exists:Cours,idCours',
            'idAdmin'  => 'required|integer',
        ]);

        // Vérifier conflit horaire (même classe, même jour, même heure)
        $conflit = EmploiDuTemps::where('idClasse', $request->idClasse)
            ->where('jour', $request->jour)
            ->where('heure', $request->heure)
            ->exists();

        if ($conflit) {
            return response()->json([
                'message' => 'Créneau déjà occupé pour cette classe à cet horaire'
            ], 422);
        }

        $emploi = DB::transaction(function () use ($request) {
            $id = DB::table('EmploiDuTemps')->lockForUpdate()->max('idTemps') + 1;
            return EmploiDuTemps::create([
                'idTemps'  => $id,
                'jour'     => $request->jour,
                'heure'    => $request->heure,
                'idClasse' => $request->idClasse,
                'idCours'  => $request->idCours,
                'idAdmin'  => $request->idAdmin,
            ]);
        });

        return response()->json([
            'message' => 'Créneau ajouté',
            'emploi'  => $emploi->load(['classe', 'cours.enseignant.personne']),
        ], 201);
    }

    public function show($id)
    {
        return response()->json(
            EmploiDuTemps::with(['classe.cycle', 'cours.enseignant.personne'])->findOrFail($id)
        );
    }

    public function update(Request $request, $id)
    {
        $emploi = EmploiDuTemps::findOrFail($id);

        $request->validate([
            'jour'     => 'sometimes|string|in:Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi',
            'heure'    => 'sometimes|string|max:6',
            'idCours'  => 'sometimes|integer|exists:Cours,idCours',
            'idClasse' => 'sometimes|integer|exists:Classe,idClasse',
        ]);

        $emploi->update($request->only(['jour', 'heure', 'idCours', 'idClasse']));

        return response()->json([
            'message' => 'Créneau mis à jour',
            'emploi'  => $emploi->fresh()->load(['classe', 'cours.enseignant.personne']),
        ]);
    }

    public function destroy($id)
    {
        EmploiDuTemps::findOrFail($id)->delete();
        return response()->json(['message' => 'Créneau supprimé']);
    }

    // Emploi du temps d'une classe formaté pour affichage
    public function parClasse($idClasse)
    {
        $emplois = EmploiDuTemps::with(['cours.enseignant.personne'])
            ->where('idClasse', $idClasse)
            ->orderByRaw("FIELD(jour, 'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi')")
            ->orderBy('heure')
            ->get();

        $grille = [];
        foreach (self::JOURS as $jour) {
            $grille[$jour] = $emplois->where('jour', $jour)->values();
        }

        return response()->json([
            'idClasse' => $idClasse,
            'classe'   => Classe::with('cycle')->find($idClasse),
            'grille'   => $grille,
            'total'    => $emplois->count(),
        ]);
    }
}