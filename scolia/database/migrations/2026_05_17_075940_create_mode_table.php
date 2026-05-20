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
        Schema::create('mode', function (Blueprint $table) {
            $table->unsignedInteger('idMode')->primary();
            $table->string('libelle', 100)->default('INDEFINI');
            $table->tinyText('information');
            $table->unsignedTinyInteger('actif')->default(1);
            $table->unsignedInteger('idFondateur');
            $table->dateTime('created_at')->useCurrentOnUpdate()->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mode');
    }
};
