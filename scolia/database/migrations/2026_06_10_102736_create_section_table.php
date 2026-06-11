<?php
 
// ══════════════════════════════════════════════════════════════
// MIGRATION 1 : Table section
// php artisan make:migration create_section_table
// ══════════════════════════════════════════════════════════════
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
 
return new class extends Migration {
    public function up(): void
    {
        Schema::create('section', function (Blueprint $table) {
            $table->id('idSection');
            $table->string('libelle', 60);          // "Anglophone", "Francophone"
            $table->string('description', 255)->nullable();
            $table->boolean('actif')->default(true);
            $table->unsignedInteger('idAdmin');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('section'); }
};