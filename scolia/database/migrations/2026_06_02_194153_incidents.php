<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incidents', function (Blueprint $table) {
            $table->id('idIncident');
            $table->unsignedInteger('matricule');           // Élève concerné
            $table->unsignedInteger('idPers');              // Rapporteur (enseignant/admin)
            $table->string('type', 60);                     // bagarre, insolence, fraude, autre…
            $table->text('description');                    // Détail de l'incident
            $table->date('dateIncident');
            $table->enum('gravite', ['leger', 'moyen', 'grave'])->default('leger');
            $table->unsignedInteger('idAdmin');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incidents');
    }
};