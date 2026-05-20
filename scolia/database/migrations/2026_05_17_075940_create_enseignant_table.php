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
        Schema::create('enseignant', function (Blueprint $table) {
            $table->unsignedInteger('idEnseignant')->primary();
            $table->unsignedInteger('idPers')->index('enseignant');
            $table->unsignedInteger('idCours')->index('enseigner');
            $table->unsignedTinyInteger('Actif')->default(1);
            $table->unsignedInteger('idAdmin');
            $table->dateTime('created_at')->useCurrentOnUpdate()->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enseignant');
    }
};
