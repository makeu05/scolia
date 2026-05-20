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
        Schema::create('paiement', function (Blueprint $table) {
            $table->unsignedInteger('idPaie')->primary();
            $table->unsignedInteger('matricule')->index('enf');
            $table->unsignedInteger('idAca')->index('anneepaie');
            $table->float('montant');
            $table->string('url', 255)->default('INDEFINI');
            $table->string('comentaire', 255)->default('INDEFINI');
            $table->unsignedInteger('idMode')->default(0)->index('via');
            $table->string('operation_ID', 30)->default('INDEFINI');
            $table->unsignedInteger('idPers');
            $table->date('datePaie');
            $table->dateTime('dateEnregistrer')->useCurrentOnUpdate()->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('paiement');
    }
};
