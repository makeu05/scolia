<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Personne extends Model {
    protected $table = 'Personne';
    protected $primaryKey = 'idPers';
    public $incrementing = false;
    public $timestamps = false;
 
    protected $fillable = [
        'idPers', 'nom', 'prenom', 'dateNaissance', 'lieuNaissance',
        'mobile', 'phone', 'typePersonne', 'username', 'password',
        'alanyaID', 'idAdmin',
    ];
 
    public function enseignant() {
        return $this->hasOne(Enseignant::class, 'idPers', 'idPers');
    }
 
    public function parents() {
        return $this->hasMany(Parents::class, 'idPers', 'idPers');
    }
}