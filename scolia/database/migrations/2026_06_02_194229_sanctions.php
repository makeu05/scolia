<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sanctions', function (Blueprint $table) {
            $table->id('idSanction');
            $table->unsignedBigInteger('idIncident');        // Sanction liée à un incident
            $table->unsignedInteger('matricule');            // Élève sanctionné
            $table->enum('type', [
                'avertissement',
                'blame',
                'convocation_parent',
                'exclusion_temporaire',
                'exclusion_definitive',
                'autre'
            ]);
            $table->text('motif');
            $table->date('dateSanction');
            $table->date('dateExpiration')->nullable();      // Pour les exclusions temporaires
            $table->boolean('parentNotifie')->default(false);
            $table->timestamp('parentNotifieAt')->nullable();
            $table->unsignedInteger('idAdmin');
            $table->timestamps();

            $table->foreign('idIncident')->references('idIncident')->on('incidents')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sanctions');
    }
};