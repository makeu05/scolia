<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use App\Models\Cours;
use App\Models\Frequente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EvaluationController extends Controller
{
    // Notes d'un cours pour une session donnée
    public function index(Request $request)
    {
        $request->validate([
            'idCours'   => 'required|integer',
            'idSession' => 'required|integer',
        ]);

        $evaluations = Evaluation::with(['eleve', 'epreuve.nature'])
            ->where('idCours', $request->idCours)
            ->where('idSession', $request->idSession)
            ->get();

        return response()->json($evaluations);
    }

    // Saisir une note
    public function store(Request $request)
    {
        $request->validate([
            'matricule'  => 'required|integer|exists:Eleve,matricule',
            'idEpreuve'  => 'required|integer|exists:Epreuve,idEpreuve',
            'idCours'    => 'required|integer|exists:Cours,idCours',
            'idSession'  => 'required|integer|exists:Session,idSession',
            'idPers'     => 'required|integer',
            'note'       => 'required|numeric|min:0|max:20',
            'appreciation' => 'nullable|string|max:255',
        ]);

        // Vérifier doublon
        $exists = Evaluation::where('matricule', $request->matricule)
            ->where('idEpreuve', $request->idEpreuve)
            ->where('idCours', $request->idCours)
            ->where('idSession', $request->idSession)
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Une note existe déjà pour cet élève/épreuve/cours/session'], 422);
        }

        $id = DB::table('Evaluation')->max('idEval') + 1;

        $eval = Evaluation::create([
            'idEval'       => $id,
            'note'         => $request->note,
            'appreciation' => $request->appreciation ?? $this->getAppreciation($request->note),
            'matricule'    => $request->matricule,
            'idEpreuve'    => $request->idEpreuve,
            'idCours'      => $request->idCours,
            'idSession'    => $request->idSession,
            'idPers'       => $request->idPers,
        ]);

        return response()->json([
            'message' => 'Note enregistrée',
            'evaluation' => $eval->load(['eleve', 'epreuve'])
        ], 201);
    }

    // Modifier une note
    public function update(Request $request, $id)
    {
        $eval = Evaluation::findOrFail($id);

        $request->validate([
            'note'        => 'sometimes|numeric|min:0|max:20',
            'appreciation' => 'nullable|string|max:255',
        ]);

        $note = $request->note ?? $eval->note;

        $eval->update([
            'note'         => $note,
            'appreciation' => $request->appreciation ?? $this->getAppreciation($note),
        ]);

        return response()->json(['message' => 'Note modifiée', 'evaluation' => $eval]);
    }

    public function destroy($id)
    {
        Evaluation::findOrFail($id)->delete();
        return response()->json(['message' => 'Note supprimée']);
    }

    // Saisie en masse pour un cours + session (tableau de notes)
    public function storeBulk(Request $request)
    {
        $request->validate([
            'idCours'    => 'required|integer|exists:Cours,idCours',
            'idSession'  => 'required|integer|exists:Session,idSession',
            'idEpreuve'  => 'required|integer|exists:Epreuve,idEpreuve',
            'idPers'     => 'required|integer',
            'notes'      => 'required|array',
            'notes.*.matricule' => 'required|integer|exists:Eleve,matricule',
            'notes.*.note'      => 'required|numeric|min:0|max:20',
        ]);

        $created = 0;
        $updated = 0;
        $lastId  = DB::table('Evaluation')->max('idEval') ?? 0;

        DB::beginTransaction();
        try {
            foreach ($request->notes as $item) {
                $existing = Evaluation::where('matricule', $item['matricule'])
                    ->where('idEpreuve', $request->idEpreuve)
                    ->where('idCours', $request->idCours)
                    ->where('idSession', $request->idSession)
                    ->first();

                if ($existing) {
                    $existing->update([
                        'note'         => $item['note'],
                        'appreciation' => $this->getAppreciation($item['note']),
                    ]);
                    $updated++;
                } else {
                    $lastId++;
                    Evaluation::create([
                        'idEval'       => $lastId,
                        'note'         => $item['note'],
                        'appreciation' => $this->getAppreciation($item['note']),
                        'matricule'    => $item['matricule'],
                        'idEpreuve'    => $request->idEpreuve,
                        'idCours'      => $request->idCours,
                        'idSession'    => $request->idSession,
                        'idPers'       => $request->idPers,
                    ]);
                    $created++;
                }
            }

            DB::commit();
            return response()->json([
                'message' => "$created note(s) créée(s), $updated mise(s) à jour"
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur : ' . $e->getMessage()], 500);
        }
    }

    // Moyenne d'un élève pour un trimestre
    public function moyenneEleve(Request $request, $matricule)
    {
        $request->validate([
            'idTrimestre' => 'required|integer',
        ]);

        // Sessions du trimestre
        $sessions = DB::table('Session')
            ->where('idTrimestre', $request->idTrimestre)
            ->pluck('idSession');

        // Notes groupées par cours
        $evaluations = Evaluation::with(['cours'])
            ->where('matricule', $matricule)
            ->whereIn('idSession', $sessions)
            ->get();

        $parCours = $evaluations->groupBy('idCours');
        $resultats = [];
        $totalPondere = 0;
        $totalCoeff   = 0;

        foreach ($parCours as $idCours => $notes) {
            $cours       = $notes->first()->cours;
            $coefficient = $cours->coefficient ?? 1;
            $moyenne     = $notes->avg('note');

            $totalPondere += $moyenne * $coefficient;
            $totalCoeff   += $coefficient;

            $resultats[] = [
                'idCours'      => $idCours,
                'cours'        => $cours->libelle,
                'coefficient'  => $coefficient,
                'moyenne'      => round($moyenne, 2),
                'appreciation' => $this->getAppreciation($moyenne),
                'notes'        => $notes->map(fn($e) => [
                    'note'       => $e->note,
                    'idEpreuve'  => $e->idEpreuve,
                ]),
            ];
        }

        $moyenneGenerale = $totalCoeff > 0
            ? round($totalPondere / $totalCoeff, 2)
            : 0;

        return response()->json([
            'matricule'       => $matricule,
            'idTrimestre'     => $request->idTrimestre,
            'resultats'       => $resultats,
            'moyenneGenerale' => $moyenneGenerale,
            'mention'         => $this->getMention($moyenneGenerale),
        ]);
    }

    // Bulletin complet d'un élève (toutes les infos pour le PDF)
    public function bulletin($matricule, Request $request)
    {
        $request->validate([
            'idTrimestre' => 'required|integer',
        ]);

        $eleve = \App\Models\Eleve::findOrFail($matricule);

        // Classe de l'élève via Frequente
        $frequente = DB::table('Frequente')
            ->join('Salle', 'Frequente.idSalle', '=', 'Salle.idSalle')
            ->join('Classe', 'Salle.idClasse', '=', 'Classe.idClasse')
            ->join('AnneeAcademique', 'Frequente.idAcademi', '=', 'AnneeAcademique.idAnnee')
            ->where('Frequente.matricule', $matricule)
            ->select('Classe.*', 'AnneeAcademique.libelle as annee')
            ->latest('AnneeAcademique.idAnnee')
            ->first();

        $trimestre = DB::table('Trimestre')
            ->where('idTrimes', $request->idTrimestre)
            ->first();

        // Sessions du trimestre
        $sessions = DB::table('Session')
            ->where('idTrimestre', $request->idTrimestre)
            ->pluck('idSession');

        // Notes de l'élève
        $evaluations = Evaluation::with(['cours', 'epreuve.nature'])
            ->where('matricule', $matricule)
            ->whereIn('idSession', $sessions)
            ->get();

        // Calcul moyennes par cours
        $parCours     = $evaluations->groupBy('idCours');
        $resultats    = [];
        $totalPondere = 0;
        $totalCoeff   = 0;

        foreach ($parCours as $idCours => $notes) {
            $cours       = $notes->first()->cours;
            $coefficient = $cours->coefficient ?? 1;
            $moyenne     = $notes->avg('note');

            $totalPondere += $moyenne * $coefficient;
            $totalCoeff   += $coefficient;

            $resultats[] = [
                'cours'       => $cours->libelle,
                'coefficient' => $coefficient,
                'moyenne'     => round($moyenne, 2),
                'appreciation'=> $this->getAppreciation($moyenne),
            ];
        }

        $moyenneGenerale = $totalCoeff > 0
            ? round($totalPondere / $totalCoeff, 2)
            : 0;

        // Classement dans la classe
        $classement = $this->getClassement($matricule, $request->idTrimestre, $frequente?->idClasse);

        return response()->json([
            'eleve'           => $eleve,
            'classe'          => $frequente,
            'trimestre'       => $trimestre,
            'resultats'       => $resultats,
            'moyenneGenerale' => $moyenneGenerale,
            'mention'         => $this->getMention($moyenneGenerale),
            'classement'      => $classement,
        ]);
    }

    // Classement de tous les élèves d'une classe pour un trimestre
    public function classement(Request $request)
    {
        $request->validate([
            'idClasse'    => 'required|integer',
            'idTrimestre' => 'required|integer',
        ]);

        $sessions = DB::table('Session')
            ->where('idTrimestre', $request->idTrimestre)
            ->pluck('idSession');

        // Élèves de la classe via Frequente + Salle
        $matricules = DB::table('Frequente')
            ->join('Salle', 'Frequente.idSalle', '=', 'Salle.idSalle')
            ->where('Salle.idClasse', $request->idClasse)
            ->pluck('Frequente.matricule');

        $moyennes = [];

        foreach ($matricules as $matricule) {
            $evals = Evaluation::with('cours')
                ->where('matricule', $matricule)
                ->whereIn('idSession', $sessions)
                ->get();

            $totalP = 0;
            $totalC = 0;

            foreach ($evals->groupBy('idCours') as $notes) {
                $coeff   = $notes->first()->cours->coefficient ?? 1;
                $totalP += $notes->avg('note') * $coeff;
                $totalC += $coeff;
            }

            $moyennes[] = [
                'matricule' => $matricule,
                'moyenne'   => $totalC > 0 ? round($totalP / $totalC, 2) : 0,
            ];
        }

        // Trier par moyenne décroissante
        usort($moyennes, fn($a, $b) => $b['moyenne'] <=> $a['moyenne']);

        // Ajouter le rang
        foreach ($moyennes as $i => &$m) {
            $m['rang'] = $i + 1;
            $eleve = \App\Models\Eleve::find($m['matricule']);
            $m['nom']    = $eleve?->nom;
            $m['prenom'] = $eleve?->prenom;
        }

        return response()->json($moyennes);
    }

    // Helpers
    private function getAppreciation(float $note): string
    {
        return match (true) {
            $note >= 18 => 'Excellent',
            $note >= 16 => 'Très bien',
            $note >= 14 => 'Bien',
            $note >= 12 => 'Assez bien',
            $note >= 10 => 'Passable',
            $note >= 8  => 'Insuffisant',
            default     => 'Très insuffisant',
        };
    }

    private function getMention(float $moyenne): string
    {
        return match (true) {
            $moyenne >= 16 => 'Félicitations du jury',
            $moyenne >= 14 => 'Compliments du jury',
            $moyenne >= 12 => 'Encouragements du jury',
            $moyenne >= 10 => 'Passable',
            default        => 'Avertissement',
        };
    }

    private function getClassement($matricule, $idTrimestre, $idClasse): array
    {
        if (!$idClasse) return ['rang' => '—', 'total' => '—'];

        $sessions = DB::table('Session')
            ->where('idTrimestre', $idTrimestre)
            ->pluck('idSession');

        $matricules = DB::table('Frequente')
            ->join('Salle', 'Frequente.idSalle', '=', 'Salle.idSalle')
            ->where('Salle.idClasse', $idClasse)
            ->pluck('Frequente.matricule');

        $moyennes = [];
        foreach ($matricules as $m) {
            $evals  = Evaluation::with('cours')
                ->where('matricule', $m)
                ->whereIn('idSession', $sessions)
                ->get();
            $tp = 0; $tc = 0;
            foreach ($evals->groupBy('idCours') as $notes) {
                $coeff = $notes->first()->cours->coefficient ?? 1;
                $tp   += $notes->avg('note') * $coeff;
                $tc   += $coeff;
            }
            $moyennes[$m] = $tc > 0 ? $tp / $tc : 0;
        }

        arsort($moyennes);
        $rang = array_search($matricule, array_keys($moyennes)) + 1;

        return ['rang' => $rang, 'total' => count($moyennes)];
    }
}