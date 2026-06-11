<?php
// app/Models/EleveTranche.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EleveTranche extends Model
{
    protected $table      = 'eleve_tranches';
    protected $primaryKey = 'idEleveTranche';

    protected $fillable = [
        'matricule', 'idTranche', 'idAca',
        'montant_paye', 'idPaie', 'statut',
        'date_paiement', 'alerte_envoyee',
    ];

    protected $casts = [
        'date_paiement'  => 'date',
        'alerte_envoyee' => 'boolean',
    ];

    public function tranche()
    {
        return $this->belongsTo(Tranches::class, 'idTranche', 'idTranche');
    }

    public function eleve()
    {
        return $this->belongsTo(Eleve::class, 'matricule', 'matricule');
    }

    public function paiement()
    {
        return $this->belongsTo(Paiement::class, 'idPaie', 'idPaie');
    }
}