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
        Schema::create('evaluation', function (Blueprint $table) {
            $table->unsignedInteger('idEval')->primary();
            $table->float('note')->default(0);
            $table->string('appreciation', 255);
            $table->unsignedInteger('matricule')->index('matr');
            $table->unsignedInteger('idEpreuve')->index('epre');
            $table->unsignedInteger('idCours')->index('matiere');
            $table->unsignedInteger('idSession')->index('session');
            $table->unsignedInteger('idPers');
            $table->dateTime('created_at')->useCurrentOnUpdate()->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluation');
    }
};
