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
        Schema::table('emploidutemps', function (Blueprint $table) {
            $table->string('heureFin', 6)->nullable()->after('heure');
            $table->unsignedInteger('idSalle')->nullable()->after('heureFin');
            // type : cours (défaut) | pause | activite | special
            $table->enum('type', ['cours', 'pause', 'activite', 'special'])
                  ->default('cours')->after('idSalle');
            // Libellé libre pour pause/activite/special (ex: "Déjeuner", "Football")
            $table->string('libelle', 100)->nullable()->after('type');
            // Pour activités : description courte
            $table->string('description', 255)->nullable()->after('libelle');
            // idCours devient nullable (pas de cours pour une pause)
            $table->unsignedInteger('idCours')->nullable()->change();
        });
    }
 
    public function down(): void
    {
        Schema::table('emploidutemps', function (Blueprint $table) {
            $table->dropColumn(['heureFin', 'idSalle', 'type', 'libelle', 'description']);
            $table->unsignedInteger('idCours')->nullable(false)->change();
        });
    }
};
