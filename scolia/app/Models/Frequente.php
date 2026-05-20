<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Frequente extends Model {
    protected $table = 'Frequente';
    protected $primaryKey = 'idFrequente';
    public $incrementing = false;
    public $timestamps = false;
 
    protected $fillable = [
        'idFrequente', 'idSalle', 'idAcademi', 'matricule', 'commentaire', 'idAdmin',
    ];
 
    public function eleve() {
        return $this->belongsTo(Eleve::class, 'matricule', 'matricule');
    }
 
    public function salle() {
        return $this->belongsTo(Salle::class, 'idSalle', 'idSalle');
    }
 
    public function anneeAcademique() {
        return $this->belongsTo(AnneeAcademique::class, 'idAcademi', 'idAnnee');
    }
}