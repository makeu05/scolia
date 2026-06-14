<?php
// php artisan make:migration add_chat_fields_to_messages
// php artisan migrate --path=database/migrations/TIMESTAMP_add_chat_fields_to_messages.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            // Expéditeur : idPers de celui qui envoie (admin OU parent)
            // idExp_Pers existe déjà

            // Destinataire explicite (admin ou parent)
            $table->unsignedInteger('idDest_Pers')->nullable()->after('idParent');

            // Direction : admin_to_parent | parent_to_admin
            $table->enum('direction', ['admin_to_parent', 'parent_to_admin'])
                  ->default('admin_to_parent')->after('idDest_Pers');

            // Lu par le destinataire
            $table->boolean('lu')->default(false)->after('valider');
            $table->timestamp('lu_at')->nullable()->after('lu');

            // Index pour le chat (conversation entre admin et parent)
            $table->index(['idParent', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn(['idDest_Pers', 'direction', 'lu', 'lu_at']);
        });
    }
};