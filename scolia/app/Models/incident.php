<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Incident extends Model
{
    protected $table      = 'incidents';
    protected $primaryKey = 'idIncident';

    protected $fillable = [
        'matricule', 'idPers', 'type', 'description',
        'dateIncident', 'gravite', 'idAdmin',
    ];

    protected $casts = [
        'dateIncident' => 'date',
    ];

    public function eleve()
    {
        return $this->belongsTo(Eleve::class, 'matricule', 'matricule');
    }

    public function rapporteur()
    {
        return $this->belongsTo(Personne::class, 'idPers', 'idPers');
    }

    public function sanctions()
    {
        return $this->hasMany(Sanction::class, 'idIncident', 'idIncident');
    }
}