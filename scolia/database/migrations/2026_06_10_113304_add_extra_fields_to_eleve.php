<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('eleve', function (Blueprint $table) {
            // Infos personnelles
            $table->string('religion', 50)->nullable()->after('langue');
            $table->enum('situation_familiale', [
                'deux_parents', 'pere_seul', 'mere_seule',
                'orphelin_pere', 'orphelin_mere', 'orphelin_total',
                'tuteur', 'autre'
            ])->nullable()->after('religion');
 
            // Contact urgence
            $table->string('contact_urgence_nom', 100)->nullable()->after('situation_familiale');
            $table->string('contact_urgence_tel', 20)->nullable()->after('contact_urgence_nom');
            $table->string('contact_urgence_lien', 50)->nullable()->after('contact_urgence_tel'); // père, mère, tuteur...
 
            // Tuteur légal (si différent des parents)
            $table->string('tuteur_nom', 100)->nullable()->after('contact_urgence_lien');
            $table->string('tuteur_tel', 20)->nullable()->after('tuteur_nom');
            $table->string('tuteur_profession', 100)->nullable()->after('tuteur_tel');
        });
    }
 
    public function down(): void
    {
        Schema::table('eleve', function (Blueprint $table) {
            $table->dropColumn([
                'religion', 'situation_familiale',
                'contact_urgence_nom', 'contact_urgence_tel', 'contact_urgence_lien',
                'tuteur_nom', 'tuteur_tel', 'tuteur_profession',
            ]);
        });
    }
};
 