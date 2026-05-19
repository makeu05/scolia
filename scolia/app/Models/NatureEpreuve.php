<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NatureEpreuve extends Model {
    protected $table = 'NatureEpreuve';
    protected $primaryKey = 'idNature';
    public $incrementing = false;
    public $timestamps = false;
 
    protected $fillable = [
        'idNature', 'libelle', 'description',
    ];
}
 