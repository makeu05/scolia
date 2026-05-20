<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class Titulaire extends Model {
    protected $table = 'Titulaire';
    protected $primaryKey = 'idTitulaire';
    public $incrementing = false;
    public $timestamps = false;
 
    protected $fillable = [
        'idTitulaire', 'idPers', 'idSalle', 'actif', 'idAdmin',
    ];
 
    public function personne() {
        return $this->belongsTo(Personne::class, 'idPers', 'idPers');
    }
 
    public function salle() {
        return $this->belongsTo(Salle::class, 'idSalle', 'idSalle');
    }
}