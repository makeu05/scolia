<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Classe extends Model {
    protected $table = 'Classe';
    protected $primaryKey = 'idClasse';
    public $incrementing = false;
    public $timestamps = false;
 
    protected $fillable = [
        'idClasse', 'libelle', 'idCycle', 'idAdmin',
    ];
 
    public function cycle() {
        return $this->belongsTo(Cycle::class, 'idCycle', 'idCycle');
    }
 
    public function cours() {
        return $this->hasMany(Cours::class, 'idClasse', 'idClasse');
    }
 
    public function salles() {
        return $this->hasMany(Salle::class, 'idClasse', 'idClasse');
    }
 
    public function emploiDuTemps() {
        return $this->hasMany(EmploiDuTemps::class, 'idClasse', 'idClasse');
    }
}