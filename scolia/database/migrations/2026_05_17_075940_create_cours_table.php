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
        Schema::create('cours', function (Blueprint $table) {

            // Clé primaire
            $table->unsignedInteger('idCours')->primary();

            // Informations du cours
            $table->string('libelle', 255);

            $table->float('note')
                  ->unsigned()
                  ->default(0);

            $table->float('coefficient')
                  ->unsigned()
                  ->default(1);

            $table->text('description')
                  ->nullable();

            // Relations
            $table->unsignedInteger('idClasse');

            $table->unsignedInteger('idLivre')
                  ->nullable();

            // Statut
            $table->unsignedTinyInteger('actif')
                  ->default(1);

            // Admin créateur
            $table->unsignedInteger('idAdmin');

            // Date création
            $table->dateTime('created_at')
                  ->useCurrent();

            // Index
            $table->index('idClasse');
            $table->index('idLivre');
            $table->index('idAdmin');

            // Foreign keys (optionnel si tes tables existent déjà)
            /*
            $table->foreign('idClasse')
                  ->references('idClasse')
                  ->on('classe');

            $table->foreign('idAdmin')
                  ->references('idAdmin')
                  ->on('admin');
            */
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cours');
    }
};