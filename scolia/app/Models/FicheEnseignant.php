<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class FicheEnseignant extends Model {
    protected $table = 'fiche_enseignants';
    protected $primaryKey = 'idRap';
    public $incrementing = true;
    public $timestamps = false;
 
    protected $fillable = [
        'idEnseignant', 'libelle', 'points', 'idAdministratif',
        'idAca', 'commentaire', 'event_date',
    ];
 
    public function enseignant() {
        return $this->belongsTo(Enseignant::class, 'idEnseignant', 'idEnseignant');
    }
    public function anneeAcademique()
    {
        return $this->belongsTo(AnneeAcademique::class, 'idAca', 'idAnnee');
    }
}