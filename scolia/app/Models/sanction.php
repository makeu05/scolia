<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sanction extends Model
{
    protected $table      = 'sanctions';
    protected $primaryKey = 'idSanction';

    protected $fillable = [
        'idIncident', 'matricule', 'type', 'motif',
        'dateSanction', 'dateExpiration', 'parentNotifie',
        'parentNotifieAt', 'idAdmin',
    ];

    protected $casts = [
        'dateSanction'    => 'date',
        'dateExpiration'  => 'date',
        'parentNotifie'   => 'boolean',
        'parentNotifieAt' => 'datetime',
    ];

    public function incident()
    {
        return $this->belongsTo(Incident::class, 'idIncident', 'idIncident');
    }

    public function eleve()
    {
        return $this->belongsTo(Eleve::class, 'matricule', 'matricule');
    }
}