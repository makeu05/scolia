<?php
// php artisan make:migration create_paiement_tranches_table

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paiement_tranches', function (Blueprint $table) {
            $table->id('idPaieTranche');

            // Élève + année concernés
            $table->unsignedInteger('matricule');
            $table->unsignedInteger('idAca');           // Année académique

            // Tranche concernée
            $table->unsignedInteger('idTranche');
            $table->unsignedInteger('idScolarite');     // Pour accès rapide

            // Numéro d'ordre (1, 2, 3...) pour validation séquentielle
            $table->unsignedSmallInteger('ordre');

            // Statut
            $table->enum('statut', [
                'en_attente',   // pas encore due
                'due',          // échéance atteinte, pas encore payée
                'payee',        // payée
                'en_retard',    // échéance dépassée, pas payée
            ])->default('en_attente');

            // Montant dû pour cette tranche
            $table->double('montant_du');

            // Montant effectivement payé (peut être partiel)
            $table->double('montant_paye')->default(0);

            // Date d'échéance calculée
            $table->date('date_echeance');

            // Paiement lié (null si pas encore payé)
            $table->unsignedInteger('idPaie')->nullable();

            // Date effective du paiement
            $table->date('date_paiement')->nullable();

            // Qui a encaissé
            $table->unsignedInteger('idPers')->nullable();

            // Alerte envoyée ?
            $table->boolean('alerte_envoyee')->default(false);
            $table->timestamp('alerte_envoyee_at')->nullable();

            $table->timestamps();

            // Index pour recherches fréquentes
            $table->index(['matricule', 'idAca']);
            $table->index(['statut', 'date_echeance']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paiement_tranches');
    }
};