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
        Schema::create('admin', function (Blueprint $table) {
            $table->unsignedInteger('ID')->primary();
            $table->string('nom', 100)->default('Root');
            $table->string('username', 50);
            $table->string('password', 255);
            $table->unsignedTinyInteger('actif')->default(1);
            $table->unsignedSmallInteger('typeAdmin')->comment('0 = root, 1 = Admin, 2 = Fondateur, 3 = Directeur');
            $table->string('mobile', 15);
            $table->string('alanyaID', 15);
            $table->dateTime('created_at')->useCurrentOnUpdate()->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin');
    }
};
