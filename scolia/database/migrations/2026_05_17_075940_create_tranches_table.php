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
        Schema::create('tranches', function (Blueprint $table) {
            $table->unsignedInteger('idTranche')->primary();
            $table->string('libelle', 255);
            $table->float('montant')->unsigned()->default(0);
            $table->char('delai_mois', 2);
            $table->char('delai_jour', 2);
            $table->unsignedInteger('idScolarite');
            $table->unsignedTinyInteger('actif')->default(1);
            $table->unsignedInteger('idFondateur');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tranches');
    }
};
