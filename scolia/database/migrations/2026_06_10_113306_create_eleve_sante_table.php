<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('eleve_sante', function (Blueprint $table) {
            $table->id('idSante');
            $table->unsignedInteger('matricule')->unique();
 
            // Infos de base
            $table->enum('groupe_sanguin', ['A+','A-','B+','B-','AB+','AB-','O+','O-','inconnu'])
                  ->default('inconnu');
            $table->boolean('handicap')->default(false);
            $table->string('type_handicap', 150)->nullable();
 
            // Allergies
            $table->text('allergies')->nullable();         // liste libre
 
            // Antécédents médicaux
            $table->text('antecedents')->nullable();
 
            // Traitement en cours
            $table->boolean('traitement_en_cours')->default(false);
            $table->text('details_traitement')->nullable();
 
            // Vaccins (JSON : [{nom, date, rappel}])
            $table->json('vaccins')->nullable();
 
            // Médecin traitant
            $table->string('medecin_nom', 100)->nullable();
            $table->string('medecin_tel', 20)->nullable();
 
            // Assurance maladie
            $table->string('assurance_nom', 100)->nullable();
            $table->string('assurance_numero', 50)->nullable();
 
            $table->timestamps();
        });
    }
 
    public function down(): void { Schema::dropIfExists('eleve_sante'); }
};
