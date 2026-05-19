<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mode extends Model {
    protected $table = 'Mode';
    protected $primaryKey = 'idMode';
    public $incrementing = false;
    public $timestamps = false;
 
    protected $fillable = [
        'idMode', 'libelle', 'information', 'actif', 'idFondateur',
    ];
}
 