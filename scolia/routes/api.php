<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Eleve\EleveController;
use App\Http\Controllers\VilleNaissanceController;
use App\Http\Controllers\ParentsController;
use App\Http\Controllers\EnseignantController;
use App\Http\Controllers\CycleController;
use App\Http\Controllers\ClasseController;
use App\Http\Controllers\CoursController;
use App\Http\Controllers\AnneeAcademiqueController;
use App\Http\Controllers\TrimestreController;
use App\Http\Controllers\NatureEpreuveController;
use App\Http\Controllers\EpreuveController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\SalleController;
use App\Http\Controllers\FrequenteController;
// ── Modules BAALAWE LIONEL ────────────────────────────────────
use App\Http\Controllers\BibliothequeController;
use App\Http\Controllers\DisciplineController;
use App\Http\Controllers\EmploiDuTempsController;
use App\Http\Controllers\MessageController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SpecialiteController;


Route::post('/login',    [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout',   [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/me',        [AuthController::class, 'me'])->middleware('auth:sanctum');
Route::get('/villes',    [VilleNaissanceController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {

    // ─── Élèves ───────────────────────────────────────────────
    Route::get('/eleves',                             [EleveController::class, 'index']);
    Route::post('/eleves',                            [EleveController::class, 'store']);
    Route::get('/eleves/{matricule}',                 [EleveController::class, 'show']);
    Route::put('/eleves/{matricule}',                 [EleveController::class, 'update']);
    Route::patch('/eleves/{matricule}/archiver',      [EleveController::class, 'archiver']);
    Route::patch('/eleves/{matricule}/reactiver',     [EleveController::class, 'reactiver']);
    Route::get('/eleves/{matricule}/parents',         [ParentsController::class, 'index']);
    Route::post('/eleves/{matricule}/parents',        [ParentsController::class, 'store']);
    Route::delete('/eleves/{matricule}/parents/{idParent}', [ParentsController::class, 'destroy']);

    // ─── Enseignants ──────────────────────────────────────────
    Route::get('/enseignants',                        [EnseignantController::class, 'index']);
    Route::post('/enseignants',                       [EnseignantController::class, 'store']);
    Route::get('/enseignants/{idEnseignant}',         [EnseignantController::class, 'show']);
    Route::put('/enseignants/{idEnseignant}',         [EnseignantController::class, 'update']);
    Route::patch('/enseignants/{idEnseignant}/desactiver', [EnseignantController::class, 'desactiver']);
    Route::patch('/enseignants/{idEnseignant}/reactiver',  [EnseignantController::class, 'reactiver']);

    // ─── Cycles ───────────────────────────────────────────────
    Route::get('/cycles',              [CycleController::class, 'index']);
    Route::post('/cycles',             [CycleController::class, 'store']);
    Route::get('/cycles/{idCycle}',    [CycleController::class, 'show']);
    Route::put('/cycles/{idCycle}',    [CycleController::class, 'update']);
    Route::delete('/cycles/{idCycle}', [CycleController::class, 'destroy']);

    // ─── Classes ──────────────────────────────────────────────
    Route::get('/classes',               [ClasseController::class, 'index']);
    Route::post('/classes',              [ClasseController::class, 'store']);
    Route::get('/classes/{idClasse}',    [ClasseController::class, 'show']);
    Route::put('/classes/{idClasse}',    [ClasseController::class, 'update']);
    Route::delete('/classes/{idClasse}', [ClasseController::class, 'destroy']);

    // ─── Cours ────────────────────────────────────────────────
    Route::get('/cours',               [CoursController::class, 'index']);
    Route::post('/cours',              [CoursController::class, 'store']);
    Route::get('/cours/{idCours}',     [CoursController::class, 'show']);
    Route::put('/cours/{idCours}',     [CoursController::class, 'update']);
    Route::delete('/cours/{idCours}',  [CoursController::class, 'destroy']);

    // ─── Années académiques ───────────────────────────────────
    Route::get('/annees',              [AnneeAcademiqueController::class, 'index']);
    Route::post('/annees',             [AnneeAcademiqueController::class, 'store']);
    Route::get('/annees/{idAnnee}',    [AnneeAcademiqueController::class, 'show']);
    Route::put('/annees/{idAnnee}',    [AnneeAcademiqueController::class, 'update']);
    Route::delete('/annees/{idAnnee}', [AnneeAcademiqueController::class, 'destroy']);

    // ─── Trimestres ───────────────────────────────────────────
    Route::get('/trimestres',               [TrimestreController::class, 'index']);
    Route::post('/trimestres',              [TrimestreController::class, 'store']);
    Route::delete('/trimestres/{idTrimes}', [TrimestreController::class, 'destroy']);

    // ─── Natures d'épreuve ────────────────────────────────────
    Route::get('/natures',          [NatureEpreuveController::class, 'index']);
    Route::post('/natures',         [NatureEpreuveController::class, 'store']);
    Route::put('/natures/{id}',     [NatureEpreuveController::class, 'update']);
    Route::delete('/natures/{id}',  [NatureEpreuveController::class, 'destroy']);

    // ─── Épreuves ─────────────────────────────────────────────
    Route::get('/epreuves',         [EpreuveController::class, 'index']);
    Route::post('/epreuves',        [EpreuveController::class, 'store']);
    Route::get('/epreuves/{id}',    [EpreuveController::class, 'show']);
    Route::put('/epreuves/{id}',    [EpreuveController::class, 'update']);
    Route::delete('/epreuves/{id}', [EpreuveController::class, 'destroy']);

    // ─── Sessions ─────────────────────────────────────────────
    Route::get('/sessions',         [SessionController::class, 'index']);
    Route::post('/sessions',        [SessionController::class, 'store']);
    Route::put('/sessions/{id}',    [SessionController::class, 'update']);
    Route::delete('/sessions/{id}', [SessionController::class, 'destroy']);

    // ─── Évaluations / Notes ──────────────────────────────────
    Route::get('/evaluations',               [EvaluationController::class, 'index']);
    Route::post('/evaluations',              [EvaluationController::class, 'store']);
    Route::post('/evaluations/bulk',         [EvaluationController::class, 'storeBulk']);
    Route::put('/evaluations/{id}',          [EvaluationController::class, 'update']);
    Route::delete('/evaluations/{id}',       [EvaluationController::class, 'destroy']);
    Route::get('/evaluations/moyenne/{matricule}',  [EvaluationController::class, 'moyenneEleve']);
    Route::get('/evaluations/bulletin/{matricule}', [EvaluationController::class, 'bulletin']);
    Route::get('/evaluations/classement',           [EvaluationController::class, 'classement']);

    // ─── Salles ───────────────────────────────────────────────
    Route::get('/salles',         [SalleController::class, 'index']);
    Route::post('/salles',        [SalleController::class, 'store']);
    Route::get('/salles/{id}',    [SalleController::class, 'show']);
    Route::put('/salles/{id}',    [SalleController::class, 'update']);
    Route::delete('/salles/{id}', [SalleController::class, 'destroy']);

    // ─── Inscriptions ─────────────────────────────────────────
    Route::get('/inscriptions',              [FrequenteController::class, 'index']);
    Route::post('/inscriptions',             [FrequenteController::class, 'store']);
    Route::put('/inscriptions/{id}',         [FrequenteController::class, 'update']);
    Route::delete('/inscriptions/{id}',      [FrequenteController::class, 'destroy']);
    Route::get('/inscriptions/eleves-classe',[FrequenteController::class, 'elevesByClasse']);

    // ════════════════════════════════════════════════════════════
    //  MODULES BAALAWE LIONEL
    // ════════════════════════════════════════════════════════════

    // ─── Bibliothèque ─────────────────────────────────────────
    Route::get('/specialites',          [BibliothequeController::class, 'specialites']);
    Route::get('/bibliotheque',         [BibliothequeController::class, 'index']);
    Route::post('/bibliotheque',        [BibliothequeController::class, 'store']);
    Route::get('/bibliotheque/{id}',    [BibliothequeController::class, 'show']);
    Route::put('/bibliotheque/{id}',    [BibliothequeController::class, 'update']);
    Route::delete('/bibliotheque/{id}', [BibliothequeController::class, 'destroy']);

    // ─── Discipline ───────────────────────────────────────────
    Route::get('/discipline/types',              [DisciplineController::class, 'types']);
    Route::get('/discipline/cumul/{matricule}',  [DisciplineController::class, 'cumulPoints']);
    Route::get('/discipline',                    [DisciplineController::class, 'index']);
    Route::post('/discipline',                   [DisciplineController::class, 'store']);
    Route::get('/discipline/{id}',               [DisciplineController::class, 'show']);
    Route::put('/discipline/{id}',               [DisciplineController::class, 'update']);
    Route::post('/discipline/{id}/valider',      [DisciplineController::class, 'valider']);
    Route::delete('/discipline/{id}',            [DisciplineController::class, 'destroy']);

    // ─── Emploi du temps ──────────────────────────────────────
    Route::get('/emplois-du-temps/classe/{idClasse}', [EmploiDuTempsController::class, 'parClasse']);
    Route::get('/emplois-du-temps',                   [EmploiDuTempsController::class, 'index']);
    Route::post('/emplois-du-temps',                  [EmploiDuTempsController::class, 'store']);
    Route::put('/emplois-du-temps/{id}',              [EmploiDuTempsController::class, 'update']);
    Route::delete('/emplois-du-temps/{id}',           [EmploiDuTempsController::class, 'destroy']);

    // ─── Communication (simulé — sans API Alanya) ─────────────
    Route::get('/messages',                   [MessageController::class, 'index']);
    Route::post('/messages/diffusion',        [MessageController::class, 'diffusion']);
    Route::post('/messages',                  [MessageController::class, 'store']);
    Route::get('/messages/{id}',              [MessageController::class, 'show']);
    Route::patch('/messages/{id}/valider',    [MessageController::class, 'valider']);

    Route::get('/specialites',          [SpecialiteController::class, 'index']);
    Route::post('/specialites',         [SpecialiteController::class, 'store']);
    Route::put('/specialites/{id}',     [SpecialiteController::class, 'update']);
    Route::delete('/specialites/{id}',  [SpecialiteController::class, 'destroy']);

});
