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
        Schema::create('messages', function (Blueprint $table) {
            $table->unsignedInteger('idMessages')->default(0)->primary();
            $table->unsignedInteger('idExp_Pers');
            $table->unsignedInteger('idParent')->index('mess');
            $table->string('objet', 255);
            $table->text('information');
            $table->unsignedSmallInteger('type_message')->default(0)->comment('0 = individuel, 1 = tous les parents, 2 = tous les parents pour paiement');
            $table->string('AnneeAcade', 15);
            $table->dateTime('created_at')->useCurrentOnUpdate()->useCurrent();
            $table->unsignedTinyInteger('valider')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
