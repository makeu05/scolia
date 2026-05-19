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
        Schema::create('eleve', function (Blueprint $table) {
            $table->unsignedInteger('matricule')->primary();
            $table->string('nom', 60);
            $table->string('prenom', 60);
            $table->date('dateNaissance');
            $table->string('lieuNaissance', 30);
            $table->unsignedSmallInteger('sexe')->default(0)->comment('0 = fille, 1 = garcon, 2 = autres');
            $table->string('langue', 30)->default('NON DEFINI');
            $table->string('photoURL', 255)->default('INDEFINI');
            $table->unsignedTinyInteger('actif')->default(0);
            $table->unsignedInteger('idVilleNaissance')->index('lieunaiss');
            $table->unsignedInteger('idAdmin');
            $table->dateTime('created_at')->useCurrentOnUpdate()->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('eleve');
    }
};
