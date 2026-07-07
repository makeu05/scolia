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
    'sexe', 'langue', 'photoURL', 'actif', 'idAdmin',
    // ✅ Ajouter ces lignes
    'religion',
    'situation_familiale',
    'contact_urgence_nom',
    'contact_urgence_tel',
    'contact_urgence_lien',
    'tuteur_nom',
    'tuteur_tel',
    'tuteur_profession',
    'region'
];
 
 
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
    public function sante()
{
    return $this->hasOne(EleveSante::class, 'matricule', 'matricule');
}

public function scolariteAnterieure()
{
    return $this->hasMany(EleveScolariteAnterieure::class, 'matricule', 'matricule');
}
}