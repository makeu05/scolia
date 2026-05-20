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
        Schema::create('natureepreuve', function (Blueprint $table) {
            $table->unsignedInteger('idNature')->primary();
            $table->string('libelle', 255)->default('INDEFINI')->comment('Controle Continu, Examen, Devoir Mercredi, Devoir Week End');
            $table->tinyText('description')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('natureepreuve');
    }
};
