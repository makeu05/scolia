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
        Schema::create('trimestre', function (Blueprint $table) {
            $table->unsignedInteger('idTrimes')->primary();
            $table->string('libelle', 255);
            $table->string('periode', 255);
            $table->unsignedInteger('idAca');
            $table->integer('idAdmin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trimestre');
    }
};
