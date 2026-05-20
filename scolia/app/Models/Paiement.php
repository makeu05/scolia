<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Paiement extends Model {
    protected $table = 'Paiement';
    protected $primaryKey = 'idPaie';
    public $incrementing = false;
    public $timestamps = false;
 
    protected $fillable = [
        'idPaie', 'matricule', 'idAca', 'montant', 'url',
        'comentaire', 'idMode', 'operation_ID', 'idPers', 'datePaie',
    ];
 
    public function eleve() {
        return $this->belongsTo(Eleve::class, 'matricule', 'matricule');
    }
 
    public function anneeAcademique() {
        return $this->belongsTo(AnneeAcademique::class, 'idAca', 'idAnnee');
    }
 
    public function mode() {
        return $this->belongsTo(Mode::class, 'idMode', 'idMode');
    }
}