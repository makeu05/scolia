<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Classe;
use App\Models\Scolarite;

class Cycle extends Model {
    protected $table = 'Cycle';
    protected $primaryKey = 'idCycle';
    public $incrementing = false;
    public $timestamps = false;
 
    protected $fillable = [
        'idCycle', 'libelle', 'description', 'idAdmin',
    ];
 
    public function classes() {
        return $this->hasMany(Classe::class, 'idCycle', 'idCycle');
    }
 
    public function scolarite() {
        return $this->hasOne(Scolarite::class, 'idCycle', 'idCycle');
    }
}