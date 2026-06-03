<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activites', function (Blueprint $table) {
            $table->id('idActivite');
            $table->string('libelle', 100);
            $table->enum('categorie', [
                'sport', 'musique', 'theatre', 'club',
                'sortie_scolaire', 'voyage', 'autre'
            ]);
            $table->text('description')->nullable();
            $table->string('lieu', 150)->nullable();
            // Scope : classe spécifique ou toute l'école (null = toutes classes)
            $table->unsignedInteger('idClasse')->nullable();
            // Pour sortie/voyage : dates ponctuelles
            $table->date('dateDebut')->nullable();
            $table->date('dateFin')->nullable();
            // Pour activités récurrentes hebdo : jour + heures
            $table->string('jourHebdo', 20)->nullable();  // "Samedi"
            $table->string('heureDebut', 6)->nullable();
            $table->string('heureFin', 6)->nullable();
            $table->boolean('actif')->default(true);
            $table->unsignedInteger('idAdmin');
            $table->timestamps();
        });
    }
 
    public function down(): void
    {
        Schema::dropIfExists('activites');
    }
};
