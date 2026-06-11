<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Classe → idSection (nullable)
        Schema::table('classe', function (Blueprint $table) {
            $table->unsignedBigInteger('idSection')->nullable()->after('idCycle');
        });
 
        // Scolarite → idSection (nullable, prioritaire sur idCycle si présent)
        Schema::table('Scolarite', function (Blueprint $table) {
            $table->unsignedBigInteger('idSection')->nullable()->after('idCycle');
        });
    }
    public function down(): void
    {
        Schema::table('classe',    fn($t) => $t->dropColumn('idSection'));
        Schema::table('Scolarite', fn($t) => $t->dropColumn('idSection'));
    }
};
