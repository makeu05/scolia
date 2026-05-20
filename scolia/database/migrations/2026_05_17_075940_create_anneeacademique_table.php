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
        Schema::create('anneeacademique', function (Blueprint $table) {
            $table->unsignedInteger('idAnnee')->primary();
            $table->string('libelle', 200);
            $table->string('periode', 255);
            $table->date('created_at');
            $table->unsignedInteger('idAdmin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anneeacademique');
    }
};
