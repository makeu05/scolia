<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnneeAcademique extends Model {
    protected $table = 'AnneeAcademique';
    protected $primaryKey = 'idAnnee';
    public $incrementing = false;
    public $timestamps = false;
 
    protected $fillable = [
        'idAnnee', 'libelle', 'periode', 'created_at', 'idAdmin',
    ];
 
    public function trimestres() {
        return $this->hasMany(Trimestre::class, 'idAca', 'idAnnee');
    }
 
    public function frequente() {
        return $this->hasMany(Frequente::class, 'idAcademi', 'idAnnee');
    }
 
    public function paiements() {
        return $this->hasMany(Paiement::class, 'idAca', 'idAnnee');
    }
}