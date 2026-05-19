<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Table modes de paiement
        if (!Schema::hasTable('modes_paiement')) {
            Schema::create('modes_paiement', function (Blueprint $table) {
                $table->id();
                $table->string('libelle', 50)->unique();
                $table->timestamps();
            });
        }

        // Table scolarités (sans clé étrangère pour l'instant)
        if (!Schema::hasTable('scolarites')) {
            Schema::create('scolarites', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('eleve_id');
                $table->unsignedBigInteger('annee_academique_id');
                $table->unsignedInteger('montant_total');
                $table->unsignedInteger('montant_paye')->default(0);
                $table->enum('statut', ['en_regle', 'en_retard', 'exonere'])->default('en_retard');
                $table->date('date_limite')->nullable();
                $table->timestamps();

                $table->unique(['eleve_id', 'annee_academique_id']);
                $table->index('statut');
                $table->index('eleve_id');
            });
        }

        // Table paiements (sans clé étrangère pour l'instant)
        if (!Schema::hasTable('paiements')) {
            Schema::create('paiements', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('scolarite_id');
                $table->unsignedBigInteger('mode_paiement_id');
                $table->unsignedBigInteger('enregistre_par');
                $table->unsignedInteger('montant');
                $table->date('date_paiement');
                $table->string('reference', 100)->nullable();
                $table->string('numero_recu', 20)->unique();
                $table->text('notes')->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->index('date_paiement');
                $table->index('scolarite_id');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('paiements');
        Schema::dropIfExists('scolarites');
        Schema::dropIfExists('modes_paiement');
    }
};