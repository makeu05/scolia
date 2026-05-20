<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Eleve extends Model {
    protected $table = 'Eleve';
    protected $primaryKey = 'matricule';
    public $incrementing = false;
    public $timestamps = false;
 
    protected $fillable = [
        'matricule', 'nom', 'prenom', 'dateNaissance', 'lieuNaissance',
        'sexe', 'langue', 'photoURL', 'actif', 'idVilleNaissance', 'idAdmin',
    ];
 
    public function villeNaissance() {
        return $this->belongsTo(VilleNaissance::class, 'idVilleNaissance', 'idVille');
    }
 
    public function parents() {
        return $this->hasMany(Parents::class, 'matricule', 'matricule');
    }
 
    public function frequente() {
        return $this->hasMany(Frequente::class, 'matricule', 'matricule');
    }
 
    public function evaluations() {
        return $this->hasMany(Evaluation::class, 'matricule', 'matricule');
    }
 
    public function paiements() {
        return $this->hasMany(Paiement::class, 'matricule', 'matricule');
    }
 
    public function rapports() {
        return $this->hasMany(Rapport::class, 'matricule', 'matricule');
    }
}