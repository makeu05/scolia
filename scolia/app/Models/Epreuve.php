<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Epreuve extends Model {
    protected $table = 'Epreuve';
    protected $primaryKey = 'idEpreuve';
    public $incrementing = false;
    public $timestamps = false;
 
    protected $fillable = [
        'idEpreuve', 'libelle', 'urlDoc', 'auteur', 'idNature', 'idPers',
    ];
 
    public function nature() {
        return $this->belongsTo(NatureEpreuve::class, 'idNature', 'idNature');
    }
 
    public function evaluations() {
        return $this->hasMany(Evaluation::class, 'idEpreuve', 'idEpreuve');
    }
}