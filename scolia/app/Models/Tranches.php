<?php

namespace App\Models;
use App\Models\Scolarite;
use Illuminate\Database\Eloquent\Model;

class Tranches extends Model {
    protected $table = 'Tranches';
    protected $primaryKey = 'idTranche';
    public $incrementing = false;
    public $timestamps = false;
 
    protected $fillable = [
        'idTranche', 'libelle', 'montant', 'delai_mois',
        'delai_jour', 'idScolarite', 'actif', 'idFondateur',
    ];
 
    public function scolarite() {
        return $this->belongsTo(Scolarite::class, 'idScolarite', 'idScolarite');
    }
}