<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Specialite extends Model
{
    protected $table      = 'specialite';
    protected $primaryKey = 'idSpecialite';
    public $incrementing  = false;
    public $timestamps    = false;

    protected $fillable = ['idSpecialite', 'libelle', 'idAdmin'];

    public function livres()
    {
        return $this->hasMany(Livres::class, 'idSpecialite', 'idSpecialite');
    }
}
