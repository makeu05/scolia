<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $table = 'Notifications';

    protected $fillable = [
        'type', 'titre', 'message',
        'icone', 'couleur', 'lien',
        'lue', 'idAdmin',
    ];

    protected $casts = [
        'lue' => 'boolean',
    ];
}