<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VilleNaissance extends Model
{
    protected $table = 'VilleNaissance';
    protected $primaryKey = 'idVille';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'idVille',
        'libelle',
        'actif',
    ];

    public function eleves()
    {
        return $this->hasMany(Eleve::class, 'idVilleNaissance', 'idVille');
    }
}