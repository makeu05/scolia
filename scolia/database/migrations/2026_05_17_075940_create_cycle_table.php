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
        Schema::create('cycle', function (Blueprint $table) {
            $table->unsignedInteger('idCycle')->primary();
            $table->string('libelle', 255);
            $table->tinyText('description');
            $table->unsignedInteger('idAdmin');
            $table->dateTime('created')->useCurrentOnUpdate()->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cycle');
    }
};
