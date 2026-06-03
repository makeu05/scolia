<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pauses_cycle', function (Blueprint $table) {
            $table->id('idPause');
            $table->unsignedInteger('idCycle');
            $table->string('libelle', 60);               // "Pause déjeuner", "Récréation matin"
            $table->string('heureDebut', 6);             // "12:00"
            $table->string('heureFin', 6);               // "13:00"
            // Jours concernés (JSON) ex: ["Lundi","Mardi","Mercredi","Jeudi","Vendredi"]
            $table->json('jours');
            $table->boolean('actif')->default(true);
            $table->unsignedInteger('idAdmin');
            $table->timestamps();
        });
    }
 
    public function down(): void
    {
        Schema::dropIfExists('pauses_cycle');
    }
};
 