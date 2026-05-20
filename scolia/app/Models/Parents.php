<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Parents extends Model {
    protected $table = 'Parents';
    protected $primaryKey = 'idParent';
    public $incrementing = false;
    public $timestamps = false;
 
    protected $fillable = [
        'idParent', 'idPers', 'matricule', 'idAdmin',
    ];
 
    public function personne() {
        return $this->belongsTo(Personne::class, 'idPers', 'idPers');
    }
 
    public function eleve() {
        return $this->belongsTo(Eleve::class, 'matricule', 'matricule');
    }
}