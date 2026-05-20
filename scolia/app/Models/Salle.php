<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Salle extends Model {
    protected $table = 'Salle';
    protected $primaryKey = 'idSalle';
    public $incrementing = false;
    public $timestamps = false;
 
    protected $fillable = [
        'idSalle', 'libelle', 'position', 'surface', 'idClasse', 'actif', 'idAdmin',
    ];
 
    public function classe() {
        return $this->belongsTo(Classe::class, 'idClasse', 'idClasse');
    }
 
    public function frequente() {
        return $this->hasMany(Frequente::class, 'idSalle', 'idSalle');
    }
 
    public function titulaire() {
        return $this->hasOne(Titulaire::class, 'idSalle', 'idSalle');
    }
}