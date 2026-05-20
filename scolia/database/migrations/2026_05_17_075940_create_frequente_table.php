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
        Schema::create('frequente', function (Blueprint $table) {
            $table->unsignedInteger('idFrequente')->primary();
            $table->unsignedInteger('idSalle')->index('lier');
            $table->unsignedInteger('idAcademi')->index('acad');
            $table->unsignedInteger('matricule')->index('freq');
            $table->string('commentaire', 255)->default('RAS');
            $table->integer('idAdmin');
            $table->dateTime('created_at')->useCurrentOnUpdate()->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('frequente');
    }
};
