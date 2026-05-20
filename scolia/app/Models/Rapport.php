<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rapport extends Model {
    protected $table = 'Rapport';
    protected $primaryKey = 'idRap';
    public $incrementing = false;
    public $timestamps = false;
 
    protected $fillable = [
        'idRap', 'libelle', 'points', 'matricule',
        'idAca', 'commentaire', 'event_date', 'idPers',
    ];
 
    public function eleve() {
        return $this->belongsTo(Eleve::class, 'matricule', 'matricule');
    }
}
 