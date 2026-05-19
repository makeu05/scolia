<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmploiDuTemps extends Model {
    protected $table = 'EmploiDuTemps';
    protected $primaryKey = 'idTemps';
    public $incrementing = false;
    public $timestamps = false;
 
    protected $fillable = [
        'idTemps', 'jour', 'heure', 'idClasse', 'idCours', 'idAdmin',
    ];
 
    public function classe() {
        return $this->belongsTo(Classe::class, 'idClasse', 'idClasse');
    }
 
    public function cours() {
        return $this->belongsTo(Cours::class, 'idCours', 'idCours');
    }
}