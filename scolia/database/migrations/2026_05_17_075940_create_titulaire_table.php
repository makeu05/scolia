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
        Schema::create('titulaire', function (Blueprint $table) {
            $table->unsignedInteger('idTitulaire')->primary();
            $table->unsignedInteger('idPers');
            $table->unsignedInteger('idSalle');
            $table->unsignedTinyInteger('actif')->default(1);
            $table->unsignedInteger('idAdmin');
            $table->dateTime('created_at')->useCurrentOnUpdate()->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('titulaire');
    }
};
