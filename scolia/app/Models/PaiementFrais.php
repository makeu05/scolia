<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaiementFrais extends Model
{
    protected $table      = 'paiement_frais';
    protected $primaryKey = 'idPaieFrais';
    protected $fillable   = [
        'matricule', 'idFrais', 'idAca', 'montant_paye',
        'idPaie', 'idPers', 'date_paiement',
        'operation_ID', 'comentaire',
    ];
    protected $casts = ['date_paiement' => 'date'];
 
    public function frais()   { return $this->belongsTo(FraisAnnexe::class, 'idFrais', 'idFrais'); }
    public function eleve()   { return $this->belongsTo(Eleve::class, 'matricule', 'matricule'); }
}