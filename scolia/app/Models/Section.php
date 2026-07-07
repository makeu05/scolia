<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

namespace App\Models;
use Illuminate\Database\Eloquent\Model;
 
class Section extends Model
{
    protected $table      = 'section';
    protected $primaryKey = 'idSection';
    protected $fillable   = ['libelle', 'description', 'actif', 'idAdmin'];
    protected $casts      = ['actif' => 'boolean'];
 
    public function classes()
    {
        return $this->hasMany(Classe::class, 'idSection', 'idSection');
    }
 
    public function scolarites()
    {
        return $this->hasMany(Scolarite::class, 'idSection', 'idSection');
    }

}