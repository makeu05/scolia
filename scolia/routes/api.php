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
use App\Http\Controllers\FicheEnseignantController;
use App\Http\Controllers\PaiementController;
use App\Http\Controllers\ScolariteController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ModeController;
use App\Http\Controllers\PersonneController;
use App\Http\Controllers\NotificationController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmploiDuTempsController;
use App\Http\Controllers\LivresController;
use App\Http\Controllers\MessagesController;

// ── PUBLIC ────────────────────────────────────────────────────────────────────
Route::post('/login',          [AuthController::class, 'login']);
Route::post('/password-reset', [AuthController::class, 'passwordReset']);
Route::get('/villes',          [VilleNaissanceController::class, 'index']);


// ── EMPLOI DU TEMPS ──
Route::apiResource('emploi-du-temps', EmploiDuTempsController::class);
Route::get('/emploi-du-temps/classe/{idClasse}', [EmploiDuTempsController::class, 'parClasse']);

// ── BIBLIOTHÈQUE ──
Route::apiResource('livres', LivresController::class);
Route::get('/livres/stats', [LivresController::class, 'stats']);
Route::get('/specialites', function () {
    return response()->json(\App\Models\Specialite::orderBy('libelle')->get());
});

// ── COMMUNICATION ──
Route::apiResource('messages', MessagesController::class);
Route::post  ('/messages/tous',         [MessagesController::class, 'envoyerATous']);
Route::patch ('/messages/{id}/valider', [MessagesController::class, 'valider']);
Route::get   ('/messages/stats',        [MessagesController::class, 'stats']);
Route::get   ('/messages/parent/{id}',  [MessagesController::class, 'messagesParent']);


// ── ROUTES PROTÉGÉES ─────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Années & trimestres — tous les rôles connectés
    Route::apiResource('annees',     AnneeAcademiqueController::class);
    Route::apiResource('trimestres', TrimestreController::class);

    // Parent — ses enfants
    Route::get('/parent/enfants', [ParentsController::class, 'mesEnfants']);

    // Fiches enseignants — DÉPLACÉ ici (était public, c'est un bug)
    Route::apiResource('fiches-enseignants', FicheEnseignantController::class);
     Route::get('/inscriptions/eleves-classe', [FrequenteController::class, 'elevesByClasse']);


    // ── ROOT + ADMIN + DIRECTEUR ──────────────────────────────
    Route::middleware('role:root,admin,directeur')->group(function () {
        Route::apiResource('eleves',       EleveController::class);
        Route::apiResource('enseignants',  EnseignantController::class);
        Route::apiResource('inscriptions', FrequenteController::class);
        Route::get('/inscriptions/eleves-classe', [FrequenteController::class, 'elevesByClasse']);
        Route::apiResource('classes',      ClasseController::class);
        Route::apiResource('cycles',       CycleController::class);
        Route::apiResource('salles',       SalleController::class);
        Route::apiResource('cours',        CoursController::class);
        Route::apiResource('sessions',     SessionController::class);
        Route::apiResource('epreuves',     EpreuveController::class);
        Route::apiResource('natures',      NatureEpreuveController::class);
        Route::patch('/eleves/{matricule}/archiver', [EleveController::class, 'archiver']);
         Route::patch('/eleves/{matricule}/reactiver', [EleveController::class, 'reactiver']);
         Route::patch('/enseignants/{idEnseignant}/desactiver', [EnseignantController::class, 'desactiver']);
         Route::patch('/enseignants/{idEnseignant}/reactiver', [EnseignantController::class, 'reactiver']);
        Route::get('/eleves/{matricule}/parents',         [ParentsController::class, 'index']);
Route::post('/eleves/{matricule}/parents',        [ParentsController::class, 'store']);
Route::delete('/eleves/{matricule}/parents/{id}', [ParentsController::class, 'destroy']);

Route::get('/notifications',              [NotificationController::class, 'index']);
    Route::get('/notifications/polling',      [NotificationController::class, 'polling']);
    Route::patch('/notifications/{id}/lue',   [NotificationController::class, 'marquerLue']);
    Route::patch('/notifications/lues/tout',  [NotificationController::class, 'marquerToutesLues']);
    Route::delete('/notifications/{id}',      [NotificationController::class, 'destroy']);
    Route::delete('/notifications/lues/tout', [NotificationController::class, 'supprimerLues']);
        // Dans api.php
Route::get('/personnes', [PersonneController::class, 'index']);
    });

    // ── FONDATEUR + ROOT + ADMIN + DIRECTEUR ─────────────────────────────────
    Route::middleware('role:root,fondateur,admin,directeur')->group(function () {

        // Paiements
        Route::get('/paiements',                   [PaiementController::class, 'index']);
        Route::post('/paiements',                  [PaiementController::class, 'store']);
        Route::get('/paiements/dashboard',         [PaiementController::class, 'dashboard']);
        Route::get('/paiements/stats',             [PaiementController::class, 'stats']);
        Route::get('/paiements/par-classe',        [PaiementController::class, 'parClasse']);
        Route::get('/paiements/suivi/{matricule}', [PaiementController::class, 'suiviEleve']);
        Route::get('/paiements/{id}',              [PaiementController::class, 'show']);
        Route::put('/paiements/{id}',              [PaiementController::class, 'update']);
        Route::delete('/paiements/{id}',           [PaiementController::class, 'destroy']);

        // Scolarités
        Route::get('/scolarites',                    [ScolariteController::class, 'index']);
        Route::post('/scolarites',                   [ScolariteController::class, 'store']);
        Route::get('/scolarites/{id}',               [ScolariteController::class, 'show']);
        Route::put('/scolarites/{id}',               [ScolariteController::class, 'update']);
        Route::post('/scolarites/{id}/tranches',     [ScolariteController::class, 'storeTranche']);
        Route::delete('/scolarites/tranches/{id}',   [ScolariteController::class, 'deleteTranche']);

        // Modes de paiement
        Route::get('/modes',        [ModeController::class, 'index']);
        Route::post('/modes',       [ModeController::class, 'store']);
        Route::put('/modes/{id}',   [ModeController::class, 'update']);
        Route::delete('/modes/{id}',[ModeController::class, 'destroy']);
    });

    // ── ENSEIGNANT — saisie notes ─────────────────────────────────────────────
    Route::middleware('role:enseignant,root,admin,directeur')->group(function () {
        Route::post('/evaluations/bulk', [EvaluationController::class, 'storeBulk']);
        Route::post('/evaluations',      [EvaluationController::class, 'store']);
        Route::put('/evaluations/{id}',  [EvaluationController::class, 'update']);
        Route::delete('/evaluations/{id}', [EvaluationController::class, 'destroy']);
        Route::get('/evaluations',       [EvaluationController::class, 'index']);
    });

    // ── NOTES — lecture pour tous les rôles connectés ─────────────────────────
    Route::middleware('role:root,admin,directeur,enseignant,fondateur,parent')->group(function () {
        Route::get('/evaluations/moyenne/{matricule}',  [EvaluationController::class, 'moyenneEleve']);
        Route::get('/evaluations/bulletin/{matricule}', [EvaluationController::class, 'bulletin']);
        Route::get('/evaluations/classement',           [EvaluationController::class, 'classement']);
    });

   
    Route::prefix('admin')->group(function () {

        Route::get('/utilisateurs', [UserController::class, 'index']);
        Route::post('/utilisateurs', [UserController::class, 'store']);
        Route::get('/utilisateurs/{id}', [UserController::class, 'show']);
        Route::put('/utilisateurs/{id}', [UserController::class, 'update']);
        Route::put('/utilisateurs/{id}/toggle-actif', [UserController::class, 'toggleActif']);
        Route::post('/utilisateurs/{id}/reset-password', [UserController::class, 'resetPassword']);
        Route::delete('/utilisateurs/{id}', [UserController::class, 'destroy']); // optionnel
    });
     // ── PARENT — seulement ses enfants ────────────────────────
   
});


