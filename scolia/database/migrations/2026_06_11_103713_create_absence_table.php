<?php
// php artisan make:migration create_absence_table
// php artisan migrate --path=database/migrations/TIMESTAMP_create_absence_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('absence', function (Blueprint $table) {
            $table->id('idAbsence');
            $table->unsignedInteger('matricule');
            $table->unsignedInteger('idAca');
            $table->date('date_absence');

            // Type : journee = absence toute la journée, seance = absence à un cours
            $table->enum('mode', ['journee', 'seance'])->default('journee');

            // Statut
            $table->enum('statut', [
                'non_justifiee',
                'justifiee',
                'retard',
            ])->default('non_justifiee');

            // Cours concerné (null = absence journée)
            $table->unsignedInteger('idCours')->nullable();

            // Motif et justificatif
            $table->string('motif', 255)->nullable();
            $table->string('justificatif_url', 255)->nullable(); // fichier uploadé

            // Nombre d'heures (pour les séances)
            $table->unsignedSmallInteger('nb_heures')->default(1);

            // Parent notifié ?
            $table->boolean('parent_notifie')->default(false);
            $table->timestamp('parent_notifie_at')->nullable();

            // Qui a saisi
            $table->unsignedInteger('idPers');

            $table->timestamps();

            $table->index(['matricule', 'idAca']);
            $table->index(['date_absence']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('absence');
    }
};