<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Trimestre extends Model {
    protected $table = 'Trimestre';
    protected $primaryKey = 'idTrimes';
    public $incrementing = false;
    public $timestamps = false;
 
    protected $fillable = [
        'idTrimes', 'libelle', 'periode', 'idAca', 'idAdmin',
    ];
 
    public function anneeAcademique() {
        return $this->belongsTo(AnneeAcademique::class, 'idAca', 'idAnnee');
    }
 
    public function sessions() {
        return $this->hasMany(Session::class, 'idTrimestre', 'idTrimes');
    }
}