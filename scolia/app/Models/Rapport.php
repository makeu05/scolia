<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rapport extends Model
{
    protected $table      = 'rapport';
    protected $primaryKey = 'idRap';
    public $incrementing  = false;
    public $timestamps    = false;

    protected $fillable = [
        'idRap', 'libelle', 'points', 'matricule',
        'idAca', 'commentaire', 'event_date', 'idPers',
    ];

    protected $casts = ['event_date' => 'date', 'points' => 'integer'];

    public function eleve()
    {
        return $this->belongsTo(Eleve::class, 'matricule', 'matricule');
    }

    public function personne()
    {
        return $this->belongsTo(Personne::class, 'idPers', 'idPers');
    }

    public function justificatifs()
    {
        return $this->hasMany(Justificatifs::class, 'idRapport', 'idRap');
    }
}
