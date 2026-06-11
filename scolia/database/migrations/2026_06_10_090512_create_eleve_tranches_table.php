<?php
// php artisan make:migration create_eleve_tranches_table
// php artisan migrate --path=database/migrations/2026_06_10_create_eleve_tranches_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('eleve_tranches', function (Blueprint $table) {
            $table->id('idEleveTranche');
            $table->unsignedInteger('matricule');       // Élève
            $table->unsignedInteger('idTranche');       // Tranche du cycle
            $table->unsignedInteger('idAca');           // Année académique
            $table->double('montant_paye')->default(0); // Ce qu'il a payé sur cette tranche
            $table->unsignedInteger('idPaie')->nullable(); // Dernier paiement lié
            $table->enum('statut', [
                'en_attente',  // pas encore due
                'due',         // échéance atteinte
                'partielle',   // paiement partiel
                'payee',       // soldée
                'en_retard',   // échéance dépassée non payée
            ])->default('en_attente');
            $table->date('date_paiement')->nullable();
            $table->boolean('alerte_envoyee')->default(false);
            $table->timestamps();

            $table->unique(['matricule', 'idTranche', 'idAca']); // une seule ligne par élève/tranche/année
            $table->index(['matricule', 'idAca']);
            $table->index(['statut']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eleve_tranches');
    }
};