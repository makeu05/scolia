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
        Schema::create('epreuve', function (Blueprint $table) {
            $table->unsignedInteger('idEpreuve')->primary();
            $table->string('libelle', 255);
            $table->string('urlDoc', 255)->default('INDEFINI');
            $table->string('auteur', 255)->default('INDEFINI');
            $table->unsignedInteger('idNature')->index('natu');
            $table->unsignedInteger('idPers');
            $table->dateTime('created_at')->useCurrentOnUpdate()->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('epreuve');
    }
};
