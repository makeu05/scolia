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
        Schema::create('salle', function (Blueprint $table) {
            $table->unsignedInteger('idSalle')->primary();
            $table->string('libelle', 30);
            $table->string('position', 100)->default('NON DEFINI');
            $table->string('surface', 30);
            $table->unsignedInteger('idClasse');
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
        Schema::dropIfExists('salle');
    }
};
