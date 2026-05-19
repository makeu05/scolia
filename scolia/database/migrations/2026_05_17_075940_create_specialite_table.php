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
        Schema::create('specialite', function (Blueprint $table) {
            $table->unsignedInteger('idSpecialite')->primary();
            $table->string('libelle', 255);
            $table->unsignedInteger('idAdmin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('specialite');
    }
};
