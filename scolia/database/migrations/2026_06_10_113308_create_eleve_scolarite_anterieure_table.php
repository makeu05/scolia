<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('eleve_scolarite_anterieure', function (Blueprint $table) {
            $table->id('idScolariteAnt');
            $table->unsignedInteger('matricule');
 
            // Ancien établissement
            $table->string('etablissement_nom', 150);
            $table->string('etablissement_ville', 100)->nullable();
            $table->string('etablissement_type', 50)->nullable(); // Public, Privé, Mission
            $table->string('classe_precedente', 60)->nullable();  // "CM2", "6ème"
            $table->string('annee_scolaire', 20)->nullable();     // "2023-2024"
 
            // Résultats
            $table->double('moyenne_annuelle')->nullable();
            $table->string('appreciation', 100)->nullable();       // "Passable", "Bien"
            $table->boolean('redoublant')->default(false);
 
            // Motif de départ
            $table->string('motif_depart', 255)->nullable();
 
            // Bulletins uploadés (JSON : [{nom, path, annee}])
            $table->json('bulletins')->nullable();
 
            $table->timestamps();
 
            $table->index('matricule');
        });
    }
 
    public function down(): void { Schema::dropIfExists('eleve_scolarite_anterieure'); }
};
 