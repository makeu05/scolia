<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rapport', function (Blueprint $table) {

            $table->string('idRap')->primary();

            $table->string('libelle');

            $table->integer('points')->default(0);

            $table->string('matricule');

            $table->string('idAca')->nullable();

            $table->text('commentaire')->nullable();

            $table->date('event_date');

            $table->string('idPers');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rapport');
    }
};