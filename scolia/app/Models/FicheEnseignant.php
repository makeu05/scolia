<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class FicheEnseignant extends Model {
    protected $table = 'FicheEnseignant';
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
}