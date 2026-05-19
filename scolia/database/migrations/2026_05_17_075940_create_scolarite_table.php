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
        Schema::create('scolarite', function (Blueprint $table) {
            $table->unsignedInteger('idScolarite')->primary();
            $table->float('inscription')->unsigned();
            $table->float('pension')->unsigned();
            $table->unsignedSmallInteger('nbreTranche')->default(3);
            $table->tinyText('description');
            $table->unsignedInteger('idCycle');
            $table->unsignedInteger('idFondateur');
            $table->dateTime('created_at')->useCurrentOnUpdate()->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scolarite');
    }
};
