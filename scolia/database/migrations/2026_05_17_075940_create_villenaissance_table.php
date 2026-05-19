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
        Schema::create('villenaissance', function (Blueprint $table) {
            $table->unsignedInteger('idVille')->primary();
            $table->string('libelle', 100)->default('Autres');
            $table->unsignedTinyInteger('actif')->default(1);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('villenaissance');
    }
};
