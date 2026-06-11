<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('frais_annexe', function (Blueprint $table) {
            $table->id('idFrais');
            $table->string('libelle', 100);           // "Frais d'examen", "Tenue scolaire"
            $table->enum('type', [
                'examen', 'tenue', 'transport',
                'inscription_examen', 'assurance', 'autre'
            ]);
            $table->double('montant');
            $table->text('description')->nullable();
 
            // Scope d'application (null = toute l'école)
            $table->unsignedInteger('idCycle')->nullable();
            $table->unsignedInteger('idClasse')->nullable();
            $table->unsignedBigInteger('idSection')->nullable();
 
            // Année académique concernée (null = toutes les années)
            $table->unsignedInteger('idAca')->nullable();
 
            $table->boolean('obligatoire')->default(true);
            $table->boolean('actif')->default(true);
            $table->unsignedInteger('idAdmin');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('frais_annexe'); }
};