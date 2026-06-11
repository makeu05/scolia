<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
 
class FraisAnnexe extends Model
{
    protected $table      = 'frais_annexe';
    protected $primaryKey = 'idFrais';
    protected $fillable   = [
        'libelle', 'type', 'montant', 'description',
        'idCycle', 'idClasse', 'idSection', 'idAca',
        'obligatoire', 'actif', 'idAdmin',
    ];
    protected $casts = ['obligatoire' => 'boolean', 'actif' => 'boolean'];
}