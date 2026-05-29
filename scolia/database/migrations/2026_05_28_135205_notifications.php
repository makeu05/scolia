<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('Notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type');         // paiement, inscription, note, alerte
            $table->string('titre');
            $table->text('message');
            $table->string('icone')->default('🔔');
            $table->string('couleur')->default('blue'); // blue, green, red, yellow
            $table->string('lien')->nullable();          // route frontend
            $table->boolean('lue')->default(false);
            $table->integer('idAdmin')->unsigned();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Notifications');
    }
};

