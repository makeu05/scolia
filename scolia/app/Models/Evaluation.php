<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Evaluation extends Model {
    protected $table = 'Evaluation';
    protected $primaryKey = 'idEval';
    public $incrementing = false;
    public $timestamps = false;
 
    protected $fillable = [
        'idEval', 'note', 'appreciation', 'matricule',
        'idEpreuve', 'idCours', 'idSession', 'idPers',
    ];
 
    public function eleve() {
        return $this->belongsTo(Eleve::class, 'matricule', 'matricule');
    }
 
    public function cours() {
        return $this->belongsTo(Cours::class, 'idCours', 'idCours');
    }
 
    public function epreuve() {
        return $this->belongsTo(Epreuve::class, 'idEpreuve', 'idEpreuve');
    }
 
    public function session() {
        return $this->belongsTo(Session::class, 'idSession', 'idSession');
    }
}