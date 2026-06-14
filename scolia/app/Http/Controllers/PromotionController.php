<?php
// app/Http/Controllers/PromotionController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PromotionController extends Controller
{
    /**
     * Prévisualiser les promotions possibles pour une année
     * GET /api/promotions/preview?idAcaSource=X&idAcaCible=Y
     */
    public function preview(Request $request)
    {
        $request->validate([
            'idAcaSource' => 'required|integer', // année qu'on clôture
            'idAcaCible'  => 'required|integer', // nouvelle année
        ]);

        $idAcaSource = $request->idAcaSource;
        $idAcaCible  = $request->idAcaCible;

        // 1. Récupérer tous les élèves inscrits dans l'année source
        $inscrits = DB::table('frequente')
            ->join('salle',  'frequente.idSalle',  '=', 'salle.idSalle')
            ->join('classe', 'salle.idClasse',      '=', 'classe.idClasse')
            ->join('eleve',  'frequente.matricule', '=', 'eleve.matricule')
            ->where('frequente.idAcademi', $idAcaSource)
            ->select(
                'eleve.matricule', 'eleve.nom', 'eleve.prenom', 'eleve.sexe',
                'classe.idClasse', 'classe.libelle as classe_actuelle',
                'classe.idCycle',  'classe.ordre',
                'salle.idSalle',   'salle.libelle as salle_actuelle',
            )
            ->get();

        $resultats = [];

        foreach ($inscrits as $eleve) {
            // 2. Calculer la moyenne annuelle (tous trimestres)
            $sessions = DB::table('session')
                ->join('trimestre', 'session.idTrimestre', '=', 'trimestre.idTrimes')
                ->where('trimestre.idAca', $idAcaSource)
                ->pluck('session.idSession');

            $moyenne = null;
            if ($sessions->count() > 0) {
                $evals = DB::table('evaluation')
                    ->join('cours', 'evaluation.idCours', '=', 'cours.idCours')
                    ->where('evaluation.matricule', $eleve->matricule)
                    ->whereIn('evaluation.idSession', $sessions)
                    ->select('evaluation.note', 'cours.coefficient')
                    ->get();

                if ($evals->count() > 0) {
                    $totalPondere = 0;
                    $totalCoeff   = 0;

                    // Grouper par cours pour calculer la moyenne par matière
                    $parCours = DB::table('evaluation')
                        ->join('cours', 'evaluation.idCours', '=', 'cours.idCours')
                        ->where('evaluation.matricule', $eleve->matricule)
                        ->whereIn('evaluation.idSession', $sessions)
                        ->select('evaluation.idCours', DB::raw('AVG(evaluation.note) as moy'), 'cours.coefficient')
                        ->groupBy('evaluation.idCours', 'cours.coefficient')
                        ->get();

                    foreach ($parCours as $c) {
                        $totalPondere += $c->moy * $c->coefficient;
                        $totalCoeff   += $c->coefficient;
                    }

                    $moyenne = $totalCoeff > 0 ? round($totalPondere / $totalCoeff, 2) : null;
                }
            }

            // 3. Chercher la classe supérieure (même cycle, ordre + 1)
            $classeSuperieure = null;
            $sallesDisponibles = [];

            if ($moyenne !== null && $moyenne >= 10) {
                // Trouver l'ordre suivant dans le même cycle
                $ordreMax = DB::table('classe')
                    ->where('idCycle', $eleve->idCycle)
                    ->max('ordre');

                if ($eleve->ordre < $ordreMax) {
                    $classesSupOrdre = DB::table('classe')
                        ->where('idCycle', $eleve->idCycle)
                        ->where('ordre', $eleve->ordre + 1)
                        ->get();

                    if ($classesSupOrdre->count() > 0) {
                        // Prendre la première classe disponible par défaut
                        $classeSuperieure = $classesSupOrdre->first();

                        // Récupérer les salles de cette classe dans la nouvelle année
                        $sallesDisponibles = DB::table('salle')
                            ->where('idClasse', $classeSuperieure->idClasse)
                            ->get(['idSalle', 'libelle'])
                            ->toArray();
                    }
                }
            }

            // 4. Statut de la promotion
            $statut = 'non_eligible'; // moyenne < 10 ou pas de notes
            if ($moyenne !== null && $moyenne >= 10) {
                if (!$classeSuperieure) {
                    $statut = 'fin_cycle'; // dernière classe du cycle
                } else {
                    $statut = 'eligible';
                }
            }

            $resultats[] = [
                'matricule'          => $eleve->matricule,
                'nom'                => $eleve->nom,
                'prenom'             => $eleve->prenom,
                'sexe'               => $eleve->sexe,
                'classe_actuelle'    => $eleve->classe_actuelle,
                'idClasse_actuelle'  => $eleve->idClasse,
                'idCycle'            => $eleve->idCycle,
                'ordre_actuel'       => $eleve->ordre,
                'moyenne_annuelle'   => $moyenne,
                'statut'             => $statut,
                'classe_superieure'  => $classeSuperieure,
                'salles_disponibles' => $sallesDisponibles,
                'idSalle_cible'      => $sallesDisponibles[0]->idSalle ?? null,
            ];
        }

        // Trier : éligibles en premier, puis fin_cycle, puis non_éligibles
        usort($resultats, function ($a, $b) {
            $ordre = ['eligible' => 0, 'fin_cycle' => 1, 'non_eligible' => 2];
            $oa = $ordre[$a['statut']] ?? 3;
            $ob = $ordre[$b['statut']] ?? 3;
            if ($oa !== $ob) return $oa - $ob;
            return ($b['moyenne_annuelle'] ?? 0) <=> ($a['moyenne_annuelle'] ?? 0);
        });

        $stats = [
            'total'        => count($resultats),
            'eligibles'    => count(array_filter($resultats, fn($r) => $r['statut'] === 'eligible')),
            'fin_cycle'    => count(array_filter($resultats, fn($r) => $r['statut'] === 'fin_cycle')),
            'non_eligibles'=> count(array_filter($resultats, fn($r) => $r['statut'] === 'non_eligible')),
        ];

        return response()->json([
            'stats'     => $stats,
            'resultats' => $resultats,
        ]);
    }

    /**
     * Appliquer les promotions
     * POST /api/promotions/appliquer
     */
    public function appliquer(Request $request)
    {
        $request->validate([
            'idAcaCible'   => 'required|integer',
            'idAdmin'      => 'required|integer',
            'promotions'   => 'required|array',
            'promotions.*.matricule' => 'required|integer',
            'promotions.*.idSalle'   => 'required|integer',
        ]);

        $idAcaCible = $request->idAcaCible;
        $promus     = 0;
        $erreurs    = [];

        DB::transaction(function () use ($request, $idAcaCible, &$promus, &$erreurs) {
            foreach ($request->promotions as $p) {
                try {
                    // Vérifier que l'élève n'est pas déjà inscrit cette année
                    $dejaInscrit = DB::table('frequente')
                        ->where('matricule', $p['matricule'])
                        ->where('idAcademi', $idAcaCible)
                        ->exists();

                    if ($dejaInscrit) {
                        $erreurs[] = "Élève #{$p['matricule']} déjà inscrit pour cette année";
                        continue;
                    }

                    // Vérifier que la salle existe
                    $salle = DB::table('salle')->where('idSalle', $p['idSalle'])->first();
                    if (!$salle) {
                        $erreurs[] = "Salle #{$p['idSalle']} introuvable";
                        continue;
                    }

                    // Inscrire dans la nouvelle classe/salle
                    $idFrequente = (DB::table('frequente')->max('idFrequente') ?? 0) + 1;
                    DB::table('frequente')->insert([
                        'idFrequente' => $idFrequente,
                        'matricule'   => $p['matricule'],
                        'idSalle'     => $p['idSalle'],
                        'idAcademi'   => $idAcaCible,
                        'idAdmin'     => $request->idAdmin,
                        'created_at'  => now(),
                    ]);

                    $promus++;
                } catch (\Exception $e) {
                    $erreurs[] = "Erreur élève #{$p['matricule']} : {$e->getMessage()}";
                }
            }
        });

        return response()->json([
            'message' => "$promus élève(s) promu(s) avec succès",
            'promus'  => $promus,
            'erreurs' => $erreurs,
        ], $promus > 0 ? 200 : 422);
    }
}