<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('paiement_frais', function (Blueprint $table) {
            $table->id('idPaieFrais');
            $table->unsignedInteger('matricule');
            $table->unsignedBigInteger('idFrais');
            $table->unsignedInteger('idAca');
            $table->double('montant_paye');
            $table->unsignedInteger('idPaie')->nullable();  // Lié au paiement généré
            $table->unsignedInteger('idPers');               // Encaisseur
            $table->date('date_paiement');
            $table->string('operation_ID', 30)->default('INDEFINI');
            $table->string('comentaire', 255)->nullable();
            $table->timestamps();
 
            $table->unique(['matricule', 'idFrais', 'idAca']); // un seul paiement par frais/année
        });
    }
    public function down(): void { Schema::dropIfExists('paiement_frais'); }
};
