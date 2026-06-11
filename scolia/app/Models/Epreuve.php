<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Epreuve extends Model
{
    protected $table = 'Epreuve'; // Conforme à ton fichier SQL
    protected $primaryKey = 'idEpreuve';
    
    // ACTIVATION DE L'AUTO-INCREMENT
    public $incrementing = true; 
    protected $keyType = 'int';
    
    public $timestamps = false;

    protected $fillable = [
        // On retire 'idEpreuve' d'ici car c'est MySQL qui le génère desormais
        'libelle',
        'urlDoc',
        'auteur',
        'idNature',
        'idPers',
    ];

    public function nature()
    {
        return $this->belongsTo(NatureEpreuve::class, 'idNature', 'idNature');
    }

    public function evaluations()
    {
        return $this->hasMany(Evaluation::class, 'idEpreuve', 'idEpreuve');
    }
}