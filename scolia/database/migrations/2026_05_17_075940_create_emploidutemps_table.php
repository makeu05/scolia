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
        Schema::create('emploidutemps', function (Blueprint $table) {
            $table->unsignedInteger('idTemps')->primary();
            $table->string('jour', 30);
            $table->string('heure', 6);
            $table->unsignedInteger('idClasse');
            $table->unsignedInteger('idCours');
            $table->unsignedInteger('idAdmin');
            $table->dateTime('created_at')->useCurrentOnUpdate()->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('emploidutemps');
    }
};
