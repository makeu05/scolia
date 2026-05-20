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
        Schema::create('livres', function (Blueprint $table) {
            $table->unsignedInteger('idLivre')->primary();
            $table->string('titre', 255);
            $table->string('auteurs', 255)->default('INDEFINI');
            $table->float('prix')->unsigned()->default(0);
            $table->unsignedInteger('idSpecialite')->index('special');
            $table->string('edition', 255)->default('INDEFINI');
            $table->date('annee_parution')->nullable();
            $table->unsignedInteger('idAdmin');
            $table->dateTime('created_at')->useCurrentOnUpdate()->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('livres');
    }
};
