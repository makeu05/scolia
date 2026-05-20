<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enseignant extends Model {
    protected $table = 'Enseignant';
    protected $primaryKey = 'idEnseignant';
    public $incrementing = false;
    public $timestamps = false;
 
    protected $fillable = [
        'idEnseignant', 'idPers', 'idCours', 'Actif', 'idAdmin',
    ];
 
    public function personne() {
        return $this->belongsTo(Personne::class, 'idPers', 'idPers');
    }
 
    public function cours() {
        return $this->belongsTo(Cours::class, 'idCours', 'idCours');
    }
 
    public function fiches() {
        return $this->hasMany(FicheEnseignant::class, 'idEnseignant', 'idEnseignant');
    }
}