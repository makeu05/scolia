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
        Schema::create('personne', function (Blueprint $table) {
            $table->unsignedInteger('idPers')->primary();
            $table->string('nom', 255);
            $table->string('prenom', 255);
            $table->date('dateNaissance');
            $table->string('lieuNaissance', 100)->default('INDEFINI');
            $table->string('mobile', 15)->default('000');
            $table->string('phone', 15)->default('000');
            $table->unsignedSmallInteger('typePersonne')->comment('1 = Enseignant, 2 = Administratif, 3 = Scolarite, 4 = Parents, 5 = Autres');
            $table->string('username', 100);
            $table->string('password', 100);
            $table->string('alanyaID', 15)->nullable();
            $table->unsignedInteger('idAdmin');
            $table->dateTime('created_at')->useCurrentOnUpdate()->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personne');
    }
};
