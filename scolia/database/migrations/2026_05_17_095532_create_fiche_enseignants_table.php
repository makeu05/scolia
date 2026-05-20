<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
{
    Schema::create('fiche_enseignants', function (Blueprint $table) {
        $table->id('idRap');

        $table->unsignedBigInteger('idEnseignant');
        $table->string('libelle', 100);
        $table->unsignedInteger('points');

        $table->unsignedBigInteger('idAdministratif');
        $table->unsignedBigInteger('idAca');

        $table->text('commentaire');

        $table->date('event_date');

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fiche_enseignants');
    }
};
